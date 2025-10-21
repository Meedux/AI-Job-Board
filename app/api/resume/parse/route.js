import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserFromRequest } from '@/utils/auth';
import { prisma, handlePrismaError } from '@/utils/db';
import { put } from '@vercel/blob';
import fs from 'fs';
import path from 'path';
import { promisify } from 'util';

const unlink = promisify(fs.unlink);

export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const formData = await request.formData();
    const file = formData.get('file');
    const applicationId = formData.get('applicationId') || null;
    
    if (!file) {
      return NextResponse.json({ error: 'No file provided' }, { status: 400 });
    }

    // Validate file type
    const allowedTypes = ['application/pdf', 'application/vnd.openxmlformats-officedocument.wordprocessingml.document', 'application/msword', 'text/plain'];
    if (!allowedTypes.includes(file.type)) {
      return NextResponse.json({ 
        error: 'Invalid file type. Only PDF, DOC, DOCX, and TXT files are supported.' 
      }, { status: 400 });
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      return NextResponse.json({ 
        error: 'File size too large. Maximum size is 10MB.' 
      }, { status: 400 });
    }

    // Create temporary file for processing
    const bytes = await file.arrayBuffer();
    const buffer = Buffer.from(bytes);

    // Generate unique filename for blob storage
    const timestamp = Date.now();
    const fileExtension = file.name.split('.').pop();
    const fileName = `temp_resume_${user.id}_${timestamp}.${fileExtension}`;

    // Upload to Vercel Blob for processing
    const blob = await put(fileName, file, {
      access: 'public',
      contentType: file.type,
    });

    let parsedData = null;
    let textContent = '';
    let parsingError = null;

    try {
      // Parse based on file type using simple text extraction
      if (file.type === 'application/pdf') {
        // For now, we'll inform users that PDF parsing requires manual text entry
        // This can be enhanced later with proper PDF libraries
        textContent = "PDF parsing temporarily unavailable. Please convert to text or Word format.";
        parsedData = { text: textContent, requiresManualEntry: true };

      } else if (file.type.includes('word') || file.name.endsWith('.docx')) {
        // For Word docs, we'll also require manual entry for now
        textContent = "Word document parsing temporarily unavailable. Please convert to text format.";
        parsedData = { text: textContent, requiresManualEntry: true };

      } else if (file.type === 'text/plain') {
        textContent = buffer.toString('utf-8');
        parsedData = { text: textContent };
      } else {
        throw new Error('Unsupported file type. Please use text files for now.');
      }

      // Extract structured information from parsed data or text
      const structuredData = extractStructuredData(parsedData, textContent);

      // Calculate quality scores
      const qualityScore = calculateQualityScore(structuredData);
      const completenessScore = calculateCompletenessScore(structuredData);

      // Save parsed resume to database
      const parsedResume = await prisma.parsedResume.create({
        data: {
          userId: user.id,
          applicationId: applicationId,
          originalFileName: file.name,
          fileUrl: blob.url, // Use blob URL instead of local path
          fileSize: file.size,
          fileType: file.type,
          parsingStatus: 'completed',
          rawParsedData: parsedData,
          structuredData: structuredData,
          personalInfo: structuredData.personalInfo,
          summary: structuredData.summary,
          experience: structuredData.experience,
          education: structuredData.education,
          skills: structuredData.skills || [],
          certifications: structuredData.certifications,
          languages: structuredData.languages,
          projects: structuredData.projects,
          awards: structuredData.awards,
          references: structuredData.references,
          totalExperienceYears: structuredData.totalExperienceYears,
          experienceLevel: structuredData.experienceLevel,
          resumeQualityScore: qualityScore,
          completenessScore: completenessScore
        }
      });

      // Clean up temp file
      try {
        await unlink(tempFilePath);
      } catch (err) {
        console.warn('Failed to delete temp file:', err);
      }

      return NextResponse.json({
        success: true,
        parsedResumeId: parsedResume.id,
        structuredData: structuredData,
        qualityScore: qualityScore,
        completenessScore: completenessScore,
        textContent: textContent.substring(0, 1000) // First 1000 chars for preview
      });

    } catch (parseError) {
      parsingError = parseError.message;
      
      // Save failed parsing attempt
      await prisma.parsedResume.create({
        data: {
          userId: user.id,
          applicationId: applicationId,
          originalFileName: file.name,
          fileUrl: `/temp/${path.basename(tempFilePath)}`,
          fileSize: file.size,
          fileType: file.type,
          parsingStatus: 'failed',
          parsingError: parsingError
        }
      });

      // Clean up temp file
      try {
        await unlink(tempFilePath);
      } catch (err) {
        console.warn('Failed to delete temp file:', err);
      }

      return NextResponse.json({
        success: false,
        error: 'Failed to parse resume',
        details: parsingError
      }, { status: 500 });
    }

  } catch (error) {
    console.error('Resume parsing error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

function extractStructuredData(parsedData, textContent) {
  const text = textContent.toLowerCase();
  
  // Extract personal information
  const emailRegex = /[\w\.-]+@[\w\.-]+\.\w+/g;
  const phoneRegex = /[\+]?[1-9]?[\d\s\-\(\)]{10,}/g;
  
  const emails = textContent.match(emailRegex) || [];
  const phones = textContent.match(phoneRegex) || [];
  
  // Extract name (first line or from parsed data)
  let name = '';
  if (parsedData?.name) {
    name = parsedData.name;
  } else {
    const lines = textContent.split('\n').filter(line => line.trim());
    if (lines.length > 0) {
      name = lines[0].trim();
    }
  }

  // Extract skills
  const skillKeywords = [
    'javascript', 'python', 'java', 'react', 'node.js', 'angular', 'vue',
    'html', 'css', 'sql', 'mongodb', 'postgresql', 'aws', 'azure', 'docker',
    'kubernetes', 'git', 'machine learning', 'data science', 'project management',
    'agile', 'scrum', 'leadership', 'communication', 'teamwork'
  ];
  
  const foundSkills = skillKeywords.filter(skill => 
    text.includes(skill.toLowerCase())
  );

  // Extract experience years
  const experienceRegex = /(\d+)[\+]?\s*(?:years?|yrs?)\s*(?:of\s*)?(?:experience|exp)/gi;
  const experienceMatches = textContent.match(experienceRegex);
  let totalExperienceYears = 0;
  
  if (experienceMatches) {
    const years = experienceMatches.map(match => {
      const num = match.match(/\d+/);
      return num ? parseInt(num[0]) : 0;
    });
    totalExperienceYears = Math.max(...years);
  }

  // Determine experience level
  let experienceLevel = 'entry';
  if (totalExperienceYears >= 10) experienceLevel = 'executive';
  else if (totalExperienceYears >= 5) experienceLevel = 'senior';
  else if (totalExperienceYears >= 2) experienceLevel = 'mid';
  else if (totalExperienceYears >= 1) experienceLevel = 'junior';

  // Extract education
  const educationKeywords = ['university', 'college', 'bachelor', 'master', 'phd', 'degree', 'diploma'];
  const educationLines = textContent.split('\n').filter(line => 
    educationKeywords.some(keyword => line.toLowerCase().includes(keyword))
  );

  return {
    personalInfo: {
      name: name,
      email: emails[0] || null,
      phone: phones[0] || null
    },
    summary: parsedData?.summary || extractSummary(textContent),
    experience: parsedData?.experience || extractExperience(textContent),
    education: parsedData?.education || educationLines,
    skills: parsedData?.skills || foundSkills,
    certifications: parsedData?.certifications || [],
    languages: parsedData?.languages || [],
    projects: parsedData?.projects || [],
    awards: parsedData?.awards || [],
    references: parsedData?.references || [],
    totalExperienceYears: totalExperienceYears,
    experienceLevel: experienceLevel
  };
}

function extractSummary(textContent) {
  const lines = textContent.split('\n');
  const summaryKeywords = ['summary', 'objective', 'profile', 'about'];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (summaryKeywords.some(keyword => line.includes(keyword))) {
      // Return next few lines as summary
      return lines.slice(i + 1, i + 4).join(' ').trim();
    }
  }
  
  // Fallback: return first few meaningful lines
  const meaningfulLines = lines.filter(line => line.trim().length > 20);
  return meaningfulLines.slice(0, 2).join(' ').trim();
}

function extractExperience(textContent) {
  const lines = textContent.split('\n');
  const experienceKeywords = ['experience', 'employment', 'work history', 'career'];
  const experiences = [];
  
  for (let i = 0; i < lines.length; i++) {
    const line = lines[i].toLowerCase();
    if (experienceKeywords.some(keyword => line.includes(keyword))) {
      // Extract next several lines as experience entries
      for (let j = i + 1; j < Math.min(i + 10, lines.length); j++) {
        const expLine = lines[j].trim();
        if (expLine.length > 10) {
          experiences.push(expLine);
        }
      }
      break;
    }
  }
  
  return experiences;
}

function calculateQualityScore(structuredData) {
  let score = 0;
  
  // Personal info completeness (20 points)
  if (structuredData.personalInfo?.name) score += 8;
  if (structuredData.personalInfo?.email) score += 6;
  if (structuredData.personalInfo?.phone) score += 6;
  
  // Professional sections (60 points)
  if (structuredData.summary) score += 15;
  if (structuredData.experience?.length > 0) score += 20;
  if (structuredData.education?.length > 0) score += 15;
  if (structuredData.skills?.length > 0) score += 10;
  
  // Additional sections (20 points)
  if (structuredData.certifications?.length > 0) score += 5;
  if (structuredData.languages?.length > 0) score += 5;
  if (structuredData.projects?.length > 0) score += 5;
  if (structuredData.awards?.length > 0) score += 5;
  
  return Math.min(score, 100);
}

function calculateCompletenessScore(structuredData) {
  const requiredFields = [
    'personalInfo.name',
    'personalInfo.email', 
    'summary',
    'experience',
    'education',
    'skills'
  ];
  
  let completedFields = 0;
  
  requiredFields.forEach(field => {
    const fieldParts = field.split('.');
    let value = structuredData;
    
    for (const part of fieldParts) {
      value = value?.[part];
    }
    
    if (value && (Array.isArray(value) ? value.length > 0 : value.toString().trim())) {
      completedFields++;
    }
  });
  
  return Math.round((completedFields / requiredFields.length) * 100);
}
