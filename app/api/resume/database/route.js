import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserFromRequest } from '@/utils/auth';
import { prisma, handlePrismaError } from '@/utils/db';

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only employers and admins can search resume database
    if (!['employer_admin', 'super_admin', 'sub_user'].includes(user.role)) {
      return NextResponse.json({ 
        error: 'Access denied. Only employers can access resume database.' 
      }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    
    // Search parameters
    const searchTerm = searchParams.get('search') || '';
    const skills = searchParams.get('skills')?.split(',').filter(Boolean) || [];
    const experienceLevel = searchParams.get('experienceLevel');
    const minExperience = searchParams.get('minExperience') ? parseInt(searchParams.get('minExperience')) : null;
    const maxExperience = searchParams.get('maxExperience') ? parseInt(searchParams.get('maxExperience')) : null;
    const location = searchParams.get('location');
    const education = searchParams.get('education');
    const minQualityScore = searchParams.get('minQualityScore') ? parseInt(searchParams.get('minQualityScore')) : null;
    const tags = searchParams.get('tags')?.split(',').filter(Boolean) || [];
    const availability = searchParams.get('availability');
    const sortBy = searchParams.get('sortBy') || 'created_at';
    const sortOrder = searchParams.get('sortOrder') || 'desc';
    const page = parseInt(searchParams.get('page')) || 1;
    const limit = parseInt(searchParams.get('limit')) || 20;
    const searchType = searchParams.get('searchType') || 'basic'; // basic, power, ai

    // Build where clause
    let where = {
      parsingStatus: 'completed'
    };

    // Text search across multiple fields
    if (searchTerm) {
      where.OR = [
        {
          personalInfo: {
            path: ['name'],
            string_contains: searchTerm
          }
        },
        {
          summary: {
            contains: searchTerm,
            mode: 'insensitive'
          }
        },
        {
          skills: {
            hasSome: [searchTerm]
          }
        }
      ];
    }

    // Skills filter
    if (skills.length > 0) {
      where.skills = {
        hasSome: skills
      };
    }

    // Experience level filter
    if (experienceLevel) {
      where.experienceLevel = experienceLevel;
    }

    // Experience years range
    if (minExperience !== null || maxExperience !== null) {
      where.totalExperienceYears = {};
      if (minExperience !== null) where.totalExperienceYears.gte = minExperience;
      if (maxExperience !== null) where.totalExperienceYears.lte = maxExperience;
    }

    // Location filter
    if (location) {
      where.personalInfo = {
        ...where.personalInfo,
        path: ['location'],
        string_contains: location
      };
    }

    // Education filter
    if (education) {
      where.education = {
        path: '$',
        array_contains: [education]
      };
    }

    // Quality score filter
    if (minQualityScore !== null) {
      where.resumeQualityScore = {
        gte: minQualityScore
      };
    }

    // Build orderBy
    let orderBy = {};
    switch (sortBy) {
      case 'quality_score':
        orderBy.resumeQualityScore = sortOrder;
        break;
      case 'experience':
        orderBy.totalExperienceYears = sortOrder;
        break;
      case 'name':
        orderBy = {
          personalInfo: {
            path: ['name'],
            sort: sortOrder
          }
        };
        break;
      default:
        orderBy.createdAt = sortOrder;
    }

    // Get total count
    const totalCount = await prisma.parsedResume.count({ where });

    // Get paginated results
    const resumes = await prisma.parsedResume.findMany({
      where,
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
            location: true,
            profilePicture: true,
            createdAt: true
          }
        },
        scanResults: {
          select: {
            id: true,
            overallMatch: true,
            jobId: true,
            scanDate: true
          },
          orderBy: {
            overallMatch: 'desc'
          },
          take: 1
        }
      },
      orderBy,
      skip: (page - 1) * limit,
      take: limit
    });

    // Format results for frontend
    const formattedResumes = resumes.map(resume => ({
      id: resume.id,
      fileName: resume.originalFileName,
      uploadDate: resume.createdAt,
      personalInfo: {
        name: resume.personalInfo?.name || resume.user.fullName || 'Unknown',
        email: resume.personalInfo?.email || resume.user.email,
        phone: resume.personalInfo?.phone || resume.user.phone,
        location: resume.personalInfo?.location || resume.user.location
      },
      summary: resume.summary,
      experience: {
        years: resume.totalExperienceYears,
        level: resume.experienceLevel,
        positions: resume.experience || []
      },
      education: resume.education || [],
      skills: resume.skills || [],
      certifications: resume.certifications || [],
      languages: resume.languages || [],
      projects: resume.projects || [],
      awards: resume.awards || [],
      qualityScore: resume.resumeQualityScore,
      completenessScore: resume.completenessScore,
      availability: availability, // This would come from user preferences
      tags: [], // This would come from employer tagging system
      lastActive: resume.user.createdAt, // Placeholder
      profilePicture: resume.user.profilePicture,
      topMatch: resume.scanResults[0] ? {
        jobId: resume.scanResults[0].jobId,
        matchScore: resume.scanResults[0].overallMatch,
        scanDate: resume.scanResults[0].scanDate
      } : null
    }));

    // Add AI-powered recommendations for premium search
    if (searchType === 'ai' && searchTerm) {
      // This would integrate with OpenAI or similar service
      // For now, we'll add smart ranking based on multiple factors
      formattedResumes.sort((a, b) => {
        const scoreA = calculateAIScore(a, searchTerm, skills);
        const scoreB = calculateAIScore(b, searchTerm, skills);
        return scoreB - scoreA;
      });
    }

    return NextResponse.json({
      success: true,
      data: {
        resumes: formattedResumes,
        pagination: {
          page,
          limit,
          totalCount,
          totalPages: Math.ceil(totalCount / limit),
          hasNext: page < Math.ceil(totalCount / limit),
          hasPrev: page > 1
        },
        searchType,
        filters: {
          searchTerm,
          skills,
          experienceLevel,
          minExperience,
          maxExperience,
          location,
          education,
          minQualityScore
        }
      }
    });

  } catch (error) {
    console.error('Resume database search error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only employers can perform bulk operations
    if (!['employer_admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json({ 
        error: 'Access denied' 
      }, { status: 403 });
    }

    const { action, resumeIds, jobId } = await request.json();

    switch (action) {
      case 'bulk_scan':
        if (!jobId || !resumeIds?.length) {
          return NextResponse.json({ 
            error: 'Job ID and resume IDs are required for bulk scan' 
          }, { status: 400 });
        }

        const scanPromises = resumeIds.map(resumeId => 
          fetch(`${process.env.NEXTAUTH_URL}/api/resume/scan`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ resumeId, jobId, scanType: 'ai' })
          })
        );

        const scanResults = await Promise.allSettled(scanPromises);
        
        return NextResponse.json({
          success: true,
          results: scanResults.map((result, index) => ({
            resumeId: resumeIds[index],
            success: result.status === 'fulfilled',
            error: result.status === 'rejected' ? result.reason : null
          }))
        });

      case 'export':
        const resumes = await prisma.parsedResume.findMany({
          where: {
            id: { in: resumeIds },
            parsingStatus: 'completed'
          },
          include: {
            user: true
          }
        });

        // Create export data
        const exportData = resumes.map(resume => ({
          name: resume.personalInfo?.name || resume.user.fullName,
          email: resume.personalInfo?.email || resume.user.email,
          phone: resume.personalInfo?.phone || resume.user.phone,
          experience_years: resume.totalExperienceYears,
          experience_level: resume.experienceLevel,
          skills: resume.skills?.join(', '),
          quality_score: resume.resumeQualityScore,
          upload_date: resume.createdAt
        }));

        return NextResponse.json({
          success: true,
          exportData,
          count: exportData.length
        });

      default:
        return NextResponse.json({ 
          error: 'Invalid action' 
        }, { status: 400 });
    }

  } catch (error) {
    console.error('Bulk operation error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

function calculateAIScore(resume, searchTerm, skills) {
  let score = 0;
  
  // Base quality score (40% weight)
  score += (resume.qualityScore || 50) * 0.4;
  
  // Skills relevance (30% weight)
  const matchedSkills = skills.filter(skill => 
    resume.skills.some(resumeSkill => 
      resumeSkill.toLowerCase().includes(skill.toLowerCase())
    )
  );
  score += (matchedSkills.length / Math.max(skills.length, 1)) * 30;
  
  // Search term relevance (20% weight)
  if (searchTerm) {
    const resumeText = [
      resume.personalInfo.name || '',
      resume.summary || '',
      resume.skills.join(' ')
    ].join(' ').toLowerCase();
    
    if (resumeText.includes(searchTerm.toLowerCase())) {
      score += 20;
    }
  }
  
  // Experience relevance (10% weight)
  score += Math.min((resume.experience.years || 0) * 2, 10);
  
  return score;
}
