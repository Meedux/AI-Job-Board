import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserFromRequest } from '@/utils/auth';

const prisma = new PrismaClient();

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
              skills: true,
              location: true,
              phone: true,
              dateOfBirth: true,
              age: true
            }
          },
          job: {
            select: {
              id: true,
              title: true,
              location: true,
              company: true
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

    // Process applications to parse JSON fields and add computed properties
    const processedApplications = applications.map(app => ({
      ...app,
      // Parse JSON fields if they exist
      applicationData: app.applicationData ? (typeof app.applicationData === 'string' ? JSON.parse(app.applicationData) : app.applicationData) : {},
      fileData: app.fileData ? (typeof app.fileData === 'string' ? JSON.parse(app.fileData) : app.fileData) : {},
      // Ensure resume URL is available for the frontend
      resumeUrl: app.resumeUrl || (app.fileData && typeof app.fileData === 'string' ? JSON.parse(app.fileData)?.resume?.url : app.fileData?.resume?.url)
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
  } finally {
    await prisma.$disconnect();
  }
}

export async function PATCH(request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user || !['employer_admin', 'super_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { applicationId, status, stage, priority, rating, notes, feedback } = await request.json();

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
            email: true
          }
        },
        job: {
          select: {
            id: true,
            title: true
          }
        }
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

    return NextResponse.json(updatedApplication);

  } catch (error) {
    console.error('ATS application update error:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
