import { NextRequest, NextResponse } from 'next/server';
import { verifyToken, getUserFromRequest } from '@/utils/auth';
import { prisma, handlePrismaError } from '@/utils/db';

export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { resumeId, jobId, scanType = 'manual', customCriteria = {} } = await request.json();

    if (!resumeId || !jobId) {
      return NextResponse.json({ 
        error: 'Resume ID and Job ID are required' 
      }, { status: 400 });
    }

    // Get resume and job data
    const [resume, job] = await Promise.all([
      prisma.parsedResume.findUnique({
        where: { id: resumeId },
        include: { user: true }
      }),
      prisma.job.findUnique({
        where: { id: jobId },
        include: { scanCriteria: true }
      })
    ]);

    if (!resume) {
      return NextResponse.json({ error: 'Resume not found' }, { status: 404 });
    }

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Check permissions
    if (user.role === 'job_seeker' && resume.userId !== user.id) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Get or create scan criteria
    let criteria = job.scanCriteria;
    if (!criteria) {
      criteria = await prisma.jobScanCriteria.create({
        data: {
          jobId: job.id,
          skillsWeight: customCriteria.skillsWeight || 30,
          experienceWeight: customCriteria.experienceWeight || 25,
          educationWeight: customCriteria.educationWeight || 20,
          keywordWeight: customCriteria.keywordWeight || 15,
          locationWeight: customCriteria.locationWeight || 10,
          mustHaveSkills: job.requiredSkills || [],
          niceToHaveSkills: job.preferredSkills || [],
          minExperienceYears: extractMinExperience(job.experienceLevel),
          enableAIScanning: scanType === 'ai'
        }
      });
    }

    // Perform the scan
    const scanResult = await performResumeJobScan(resume, job, criteria, scanType);

    // Save scan result
    const savedResult = await prisma.resumeScanResult.create({
      data: {
        resumeId: resume.id,
        jobId: job.id,
        scanType: scanType,
        overallMatch: scanResult.overallMatch,
        skillsMatch: scanResult.skillsMatch,
        experienceMatch: scanResult.experienceMatch,
        educationMatch: scanResult.educationMatch,
        keywordMatch: scanResult.keywordMatch,
        matchedSkills: scanResult.matchedSkills,
        missingSkills: scanResult.missingSkills,
        experienceGap: scanResult.experienceGap,
        salaryFit: scanResult.salaryFit,
        locationFit: scanResult.locationFit,
        aiRecommendation: scanResult.aiRecommendation,
        aiReasoning: scanResult.aiReasoning,
        aiKeyPoints: scanResult.aiKeyPoints || [],
        customCriteria: customCriteria,
        scanSettings: {
          weights: {
            skills: criteria.skillsWeight,
            experience: criteria.experienceWeight,
            education: criteria.educationWeight,
            keyword: criteria.keywordWeight,
            location: criteria.locationWeight
          }
        }
      }
    });

    return NextResponse.json({
      success: true,
      scanResult: {
        id: savedResult.id,
        ...scanResult,
        resumeInfo: {
          id: resume.id,
          fileName: resume.originalFileName,
          candidateName: resume.personalInfo?.name || 'Unknown',
          email: resume.personalInfo?.email,
          experienceYears: resume.totalExperienceYears,
          experienceLevel: resume.experienceLevel
        },
        jobInfo: {
          id: job.id,
          title: job.title,
          company: job.company?.name || job.companyName,
          location: job.location,
          experienceLevel: job.experienceLevel
        }
      }
    });

  } catch (error) {
    console.error('Resume scanning error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const resumeId = searchParams.get('resumeId');
    const jobId = searchParams.get('jobId');
    const limit = parseInt(searchParams.get('limit')) || 10;

    let where = {};
    
    if (resumeId) where.resumeId = resumeId;
    if (jobId) where.jobId = jobId;

    // Filter by user permissions
    if (user.role === 'job_seeker') {
      where.resume = { userId: user.id };
    }

    const scanResults = await prisma.resumeScanResult.findMany({
      where,
      include: {
        resume: {
          include: { user: true }
        },
        job: {
          include: { company: true }
        }
      },
      orderBy: {
        overallMatch: 'desc'
      },
      take: limit
    });

    return NextResponse.json({
      success: true,
      scanResults: scanResults.map(result => ({
        id: result.id,
        overallMatch: result.overallMatch,
        skillsMatch: result.skillsMatch,
        experienceMatch: result.experienceMatch,
        educationMatch: result.educationMatch,
        keywordMatch: result.keywordMatch,
        matchedSkills: result.matchedSkills,
        missingSkills: result.missingSkills,
        experienceGap: result.experienceGap,
        salaryFit: result.salaryFit,
        locationFit: result.locationFit,
        aiRecommendation: result.aiRecommendation,
        aiReasoning: result.aiReasoning,
        aiKeyPoints: result.aiKeyPoints,
        scanDate: result.scanDate,
        scanType: result.scanType,
        resumeInfo: {
          id: result.resume.id,
          fileName: result.resume.originalFileName,
          candidateName: result.resume.personalInfo?.name || result.resume.user.fullName || 'Unknown',
          email: result.resume.personalInfo?.email || result.resume.user.email,
          experienceYears: result.resume.totalExperienceYears,
          experienceLevel: result.resume.experienceLevel,
          qualityScore: result.resume.resumeQualityScore
        },
        jobInfo: {
          id: result.job.id,
          title: result.job.title,
          company: result.job.company?.name || 'Unknown Company',
          location: result.job.location,
          experienceLevel: result.job.experienceLevel
        }
      }))
    });

  } catch (error) {
    console.error('Get scan results error:', error);
    return NextResponse.json({
      success: false,
      error: 'Internal server error',
      details: error.message
    }, { status: 500 });
  }
}

async function performResumeJobScan(resume, job, criteria, scanType) {
  const result = {
    overallMatch: 0,
    skillsMatch: 0,
    experienceMatch: 0,
    educationMatch: 0,
    keywordMatch: 0,
    matchedSkills: [],
    missingSkills: [],
    experienceGap: null,
    salaryFit: null,
    locationFit: null,
    aiRecommendation: null,
    aiReasoning: null,
    aiKeyPoints: []
  };

  // Skills matching
  const resumeSkills = (resume.skills || []).map(s => s.toLowerCase());
  const requiredSkills = (criteria.mustHaveSkills || []).map(s => s.toLowerCase());
  const preferredSkills = (criteria.niceToHaveSkills || []).map(s => s.toLowerCase());
  const allJobSkills = [...requiredSkills, ...preferredSkills];

  result.matchedSkills = resumeSkills.filter(skill => 
    allJobSkills.some(jobSkill => skill.includes(jobSkill) || jobSkill.includes(skill))
  );

  result.missingSkills = requiredSkills.filter(skill => 
    !resumeSkills.some(resumeSkill => resumeSkill.includes(skill) || skill.includes(resumeSkill))
  );

  if (allJobSkills.length > 0) {
    result.skillsMatch = Math.round((result.matchedSkills.length / allJobSkills.length) * 100);
  }

  // Experience matching
  const jobMinExperience = criteria.minExperienceYears || 0;
  const resumeExperience = resume.totalExperienceYears || 0;
  
  if (resumeExperience >= jobMinExperience) {
    result.experienceMatch = Math.min(100, 80 + (resumeExperience - jobMinExperience) * 5);
  } else {
    result.experienceGap = jobMinExperience - resumeExperience;
    result.experienceMatch = Math.max(0, 80 - (result.experienceGap * 20));
  }

  // Education matching
  const resumeEducation = resume.education || [];
  const jobEducationReq = criteria.requiredEducation || '';
  
  if (resumeEducation.length > 0) {
    if (jobEducationReq) {
      const hasRequiredEducation = resumeEducation.some(edu => 
        edu.toLowerCase().includes(jobEducationReq.toLowerCase())
      );
      result.educationMatch = hasRequiredEducation ? 100 : 60;
    } else {
      result.educationMatch = 80; // Has education, no specific requirement
    }
  } else {
    result.educationMatch = jobEducationReq ? 20 : 60;
  }

  // Keyword matching
  const resumeText = [
    resume.summary || '',
    (resume.experience || []).join(' '),
    (resume.skills || []).join(' ')
  ].join(' ').toLowerCase();

  const keywords = criteria.keywordPhrases || [];
  const matchedKeywords = keywords.filter(keyword => 
    resumeText.includes(keyword.toLowerCase())
  );

  if (keywords.length > 0) {
    result.keywordMatch = Math.round((matchedKeywords.length / keywords.length) * 100);
  } else {
    result.keywordMatch = 50; // Default if no keywords specified
  }

  // Location matching
  const resumeLocation = resume.personalInfo?.location || '';
  const jobLocation = job.location || '';
  
  if (job.remoteType === 'full') {
    result.locationFit = true;
  } else if (resumeLocation && jobLocation) {
    result.locationFit = resumeLocation.toLowerCase().includes(jobLocation.toLowerCase()) ||
                        jobLocation.toLowerCase().includes(resumeLocation.toLowerCase());
  } else {
    result.locationFit = null; // Unknown
  }

  // Calculate overall match using weighted scores
  const weights = {
    skills: criteria.skillsWeight / 100,
    experience: criteria.experienceWeight / 100,
    education: criteria.educationWeight / 100,
    keyword: criteria.keywordWeight / 100,
    location: criteria.locationWeight / 100
  };

  result.overallMatch = Math.round(
    result.skillsMatch * weights.skills +
    result.experienceMatch * weights.experience +
    result.educationMatch * weights.education +
    result.keywordMatch * weights.keyword +
    (result.locationFit ? 100 : 50) * weights.location
  );

  // AI recommendations
  if (scanType === 'ai' && criteria.enableAIScanning) {
    if (result.overallMatch >= 80) {
      result.aiRecommendation = 'recommend';
      result.aiReasoning = 'Strong match across multiple criteria with minimal gaps.';
      result.aiKeyPoints = [
        `${result.matchedSkills.length} relevant skills matched`,
        `Experience level: ${resume.experienceLevel}`,
        'High compatibility score'
      ];
    } else if (result.overallMatch >= 60) {
      result.aiRecommendation = 'maybe';
      result.aiReasoning = 'Good potential but may need additional evaluation.';
      result.aiKeyPoints = [
        `${result.missingSkills.length} skills gap identified`,
        `Experience: ${resumeExperience}/${jobMinExperience} years`,
        'Consider for interview'
      ];
    } else {
      result.aiRecommendation = 'reject';
      result.aiReasoning = 'Significant gaps in required qualifications.';
      result.aiKeyPoints = [
        'Major skills mismatch',
        'Experience requirements not met',
        'Low overall compatibility'
      ];
    }
  }

  return result;
}

function extractMinExperience(experienceLevel) {
  switch (experienceLevel?.toLowerCase()) {
    case 'entry': return 0;
    case 'junior': return 1;
    case 'mid': case 'middle': return 3;
    case 'senior': return 5;
    case 'executive': case 'lead': return 8;
    default: return 0;
  }
}
