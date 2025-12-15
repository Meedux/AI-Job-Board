import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/utils/auth';
import { prisma } from '@/utils/db';

const MATCH_WEIGHTS = {
  requiredSkills: 0.5,
  preferredSkills: 0.15,
  experience: 0.2,
  location: 0.1,
  recency: 0.05
};

function calculateMatchScore(application) {
  const candidateSkills = application.applicant?.skills || [];
  const requiredSkills = application.job?.requiredSkills || [];
  const preferredSkills = application.job?.preferredSkills || [];
  const candidateLocation = application.applicant?.location?.toLowerCase()?.trim();
  const jobLocation = application.job?.location?.toLowerCase()?.trim();
  const experienceYears = application.experienceYears ?? application.applicant?.experienceYears ?? null;
  const minimumExperience = application.job?.minExperienceYears ?? null;

  const requiredScore = requiredSkills.length === 0
    ? 1
    : requiredSkills.filter(skill => candidateSkills.some(candidateSkill => candidateSkill?.toLowerCase() === skill?.toLowerCase())).length / requiredSkills.length;

  const preferredScore = preferredSkills.length === 0
    ? 0.5
    : preferredSkills.filter(skill => candidateSkills.some(candidateSkill => candidateSkill?.toLowerCase() === skill?.toLowerCase())).length / preferredSkills.length;

  let experienceScore = 0.75;
  if (experienceYears !== null) {
    if (!minimumExperience) {
      experienceScore = Math.min(experienceYears / 5, 1);
    } else {
      const ratio = experienceYears / minimumExperience;
      experienceScore = ratio >= 1 ? 1 : Math.max(ratio, 0.25);
    }
  }

  const locationScore = !candidateLocation || !jobLocation
    ? 0.6
    : candidateLocation === jobLocation
      ? 1
      : candidateLocation?.includes(jobLocation) || jobLocation?.includes(candidateLocation)
        ? 0.8
        : 0.4;

  const appliedAt = application.appliedAt ? new Date(application.appliedAt) : null;
  let recencyScore = 0.75;
  if (appliedAt) {
    const daysSince = (Date.now() - appliedAt.getTime()) / (1000 * 60 * 60 * 24);
    if (daysSince <= 7) recencyScore = 1;
    else if (daysSince <= 30) recencyScore = 0.85;
    else if (daysSince <= 90) recencyScore = 0.6;
    else recencyScore = 0.4;
  }

  const weightedScore = (
    requiredScore * MATCH_WEIGHTS.requiredSkills +
    preferredScore * MATCH_WEIGHTS.preferredSkills +
    experienceScore * MATCH_WEIGHTS.experience +
    locationScore * MATCH_WEIGHTS.location +
    recencyScore * MATCH_WEIGHTS.recency
  );

  return Math.round(Math.max(0, Math.min(weightedScore * 100, 100)));
}

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user || !['employer_admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const status = searchParams.get('status');
    const stage = searchParams.get('stage');
    const priority = searchParams.get('priority');
    const rating = searchParams.get('rating');
    const search = searchParams.get('search');
    const tag = searchParams.get('tag');
    const hasResume = searchParams.get('hasResume');
    const appliedFrom = searchParams.get('appliedFrom');
    const appliedTo = searchParams.get('appliedTo');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '20');

    let whereClause = {};

    // Filter by employer's jobs only (unless super admin)
    if (user.role !== 'super_admin') {
      // Get jobs posted by this user or their sub-users
      const baseUserId = user.parentUserId || user.id; // Use parent user ID for sub_users
      
      const employerJobs = await prisma.job.findMany({
        where: { 
          OR: [
            { postedById: user.id }, // Jobs posted by this user
            { postedById: baseUserId }, // Jobs posted by parent user (for sub_users)
            { 
              postedBy: { 
                OR: [
                  { id: user.id },
                  { id: baseUserId },
                  { parentUserId: baseUserId }
                ]
              }
            }
          ]
        },
        select: { id: true }
      });
      
      if (employerJobs.length > 0) {
        whereClause.jobId = { in: employerJobs.map(job => job.id) };
      } else {
        // No jobs found, return empty result
        return NextResponse.json({
          applications: [],
          pagination: {
            page,
            limit,
            total: 0,
            pages: 0
          }
        });
      }
    }

    if (jobId) whereClause.jobId = jobId;
    if (status) whereClause.status = status;
    if (stage) whereClause.stage = stage;
    if (priority) whereClause.priority = priority;
    if (rating) whereClause.rating = Number(rating);
    if (tag) whereClause.tags = { has: tag };
    if (hasResume === 'true') {
      whereClause.OR = [...(whereClause.OR || []), { resumeUrl: { not: null } }, { fileData: { not: null } }];
    }
    if (search) {
      whereClause.AND = [...(whereClause.AND || []), {
        OR: [
          { applicant: { fullName: { contains: search, mode: 'insensitive' } } },
          { applicant: { email: { contains: search, mode: 'insensitive' } } },
          { applicant: { skills: { hasSome: search.split(',').map(value => value.trim()).filter(Boolean) } } },
          { job: { title: { contains: search, mode: 'insensitive' } } }
        ]
      }];
    }
    if (appliedFrom || appliedTo) {
      whereClause.appliedAt = {};
      if (appliedFrom) whereClause.appliedAt.gte = new Date(appliedFrom);
      if (appliedTo) {
        const toDate = new Date(appliedTo);
        toDate.setHours(23, 59, 59, 999);
        whereClause.appliedAt.lte = toDate;
      }
    }

    const [applications, totalCount] = await Promise.all([
      prisma.jobApplication.findMany({
        where: whereClause,
        include: {
          applicant: {
            select: {
              id: true,
              fullName: true,
              firstName: true,
              lastName: true,
              email: true,
              profileVisibility: true,
              profilePicture: true,
              resumeUrl: true,
              dateOfBirth: true,
              age: true,
              skills: true,
              location: true,
              phone: true
            }
          },
          job: {
            select: {
              id: true,
              title: true,
              location: true,
              remoteType: true,
              minExperienceYears: true,
              requiredSkills: true,
              preferredSkills: true,
              company: {
                select: {
                  id: true,
                  name: true,
                  logoUrl: true
                }
              }
            }
          },
          interviews: {
            include: {
              interviewer: {
                select: {
                  id: true,
                  fullName: true,
                  firstName: true,
                  lastName: true,
                  email: true
                }
              }
            },
            orderBy: { scheduledAt: 'desc' }
          }
        },
        orderBy: [
          { priority: 'desc' },
          { appliedAt: 'desc' }
        ],
        skip: (page - 1) * limit,
        take: limit
      }),
      prisma.jobApplication.count({ where: whereClause })
    ]);

    const applicationIds = applications.map(app => app.id);

    let contactRevealMap = new Map();
    if (applicationIds.length > 0) {
      const reveals = await prisma.resumeContactReveal.findMany({
        where: {
          applicationId: { in: applicationIds },
          OR: [
            { revealedBy: user.id },
            user.parentUserId ? { revealedBy: user.parentUserId } : null
          ].filter(Boolean)
        },
        select: {
          applicationId: true,
          revealedBy: true,
          createdAt: true
        }
      });
      contactRevealMap = new Map(reveals.map(reveal => [reveal.applicationId, reveal]));
    }

    // Process applications to parse JSON fields and add computed properties
    const processedApplications = applications.map(app => ({
      ...app,
      // Parse JSON fields if they exist
      applicationData: app.applicationData ? (typeof app.applicationData === 'string' ? JSON.parse(app.applicationData) : app.applicationData) : {},
      fileData: app.fileData ? (typeof app.fileData === 'string' ? JSON.parse(app.fileData) : app.fileData) : {},
      // Ensure resume URL is available for the frontend
      resumeUrl: app.resumeUrl || (app.fileData && typeof app.fileData === 'string' ? JSON.parse(app.fileData)?.resume?.url : app.fileData?.resume?.url),
      jobMatchScore: calculateMatchScore(app),
      contactRevealed: contactRevealMap.has(app.id),
      contactRevealDate: contactRevealMap.get(app.id)?.createdAt || null
    }));

    // Log ATS activity
    await prisma.aTSActivity.create({
      data: {
        userId: user.id,
        activityType: 'applications_viewed',
        entityType: 'job_application',
        entityId: 'multiple',
        description: `Viewed applications dashboard (${applications.length} applications)`,
        metadata: { page, limit, filters: { jobId, status, stage } }
      }
    });

    return NextResponse.json({
      applications: processedApplications,
      pagination: {
        page,
        limit,
        total: totalCount,
        pages: Math.ceil(totalCount / limit)
      }
    });

  } catch (error) {
    console.error('ATS applications error:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

export async function PATCH(request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user || !['employer_admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { applicationId, status, stage, priority, rating, notes, feedback, tags } = await request.json();

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    // Verify user can update this application
    const application = await prisma.jobApplication.findFirst({
      where: {
        id: applicationId,
        job: user.role === 'super_admin' ? undefined : {
          OR: [
            { postedById: user.id },
            { postedById: user.parentUserId || user.id },
            { 
              postedBy: { 
                OR: [
                  { id: user.id },
                  { id: user.parentUserId || user.id },
                  { parentUserId: user.parentUserId || user.id }
                ]
              }
            }
          ]
        }
      },
      include: {
        job: true,
        applicant: true
      }
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    const updateData = {};
    if (status) updateData.status = status;
    if (stage) updateData.stage = stage;
    if (priority) updateData.priority = priority;
    if (rating !== undefined) updateData.rating = rating;
    if (notes !== undefined) updateData.notes = notes;
    if (feedback !== undefined) updateData.feedback = feedback;
    if (tags !== undefined) updateData.tags = tags;

    // Set timestamps based on status changes
    if (status === 'reviewed' && !application.reviewedAt) {
      updateData.reviewedAt = new Date();
    }
    if (status === 'interviewed' && !application.interviewedAt) {
      updateData.interviewedAt = new Date();
    }
    if (['offered', 'hired', 'rejected'].includes(status) && !application.decidedAt) {
      updateData.decidedAt = new Date();
    }

    const updatedApplication = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: updateData,
      include: {
        applicant: {
          select: {
            id: true,
            fullName: true,
            firstName: true,
            lastName: true,
            email: true,
            skills: true,
            location: true,
            phone: true,
            profilePicture: true
          }
        },
        job: {
          select: {
            id: true,
            title: true,
            location: true,
            requiredSkills: true,
            preferredSkills: true,
            minExperienceYears: true,
            remoteType: true
          }
        }
      }
    });

    const matchScore = calculateMatchScore(updatedApplication);
    const revealRecord = await prisma.resumeContactReveal.findFirst({
      where: {
        applicationId,
        OR: [
          { revealedBy: user.id },
          user.parentUserId ? { revealedBy: user.parentUserId } : null
        ].filter(Boolean)
      }
    });

    // Log ATS activity
    await prisma.aTSActivity.create({
      data: {
        userId: user.id,
        activityType: 'application_updated',
        entityType: 'job_application',
        entityId: applicationId,
        description: `Updated application for ${updatedApplication.applicant.firstName} ${updatedApplication.applicant.lastName} - ${updatedApplication.job.title}`,
        metadata: { 
          previousStatus: application.status,
          newStatus: status,
          changes: updateData
        }
      }
    });

    return NextResponse.json({
      ...updatedApplication,
      jobMatchScore: matchScore,
      contactRevealed: Boolean(revealRecord),
      contactRevealDate: revealRecord?.createdAt || null
    });

  } catch (error) {
    console.error('ATS application update error:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}
