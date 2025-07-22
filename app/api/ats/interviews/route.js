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
    const status = searchParams.get('status');
    const upcoming = searchParams.get('upcoming') === 'true';

    // Build where clause based on user role
    let whereClause = {};
    
    if (user.role === 'employer_admin') {
      // For employer admin, filter by jobs they posted
      const baseUserId = user.parentUserId || user.id;
      whereClause.application = {
        job: {
          OR: [
            { postedById: user.id },
            { postedById: baseUserId }
          ]
        }
      };
    }
    // Super admin can see all interviews (no additional filter needed)

    // Add filters
    if (status && status !== 'all') {
      whereClause.status = status;
    }
    
    if (upcoming) {
      whereClause.scheduledAt = {
        gte: new Date()
      };
    }

    const interviews = await prisma.aTSInterview.findMany({
      where: whereClause,
      include: {
        application: {
          include: {
            applicant: {
              select: {
                id: true,
                email: true,
                fullName: true
              }
            },
            job: {
              select: {
                id: true,
                title: true,
                company: {
                  select: {
                    name: true
                  }
                }
              }
            }
          }
        },
        interviewer: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      },
      orderBy: {
        scheduledAt: 'asc'
      }
    });

    // Transform the data for frontend consumption
    const transformedInterviews = interviews.map(interview => ({
      id: interview.id,
      title: interview.title,
      description: interview.description,
      type: interview.type,
      status: interview.status,
      scheduledAt: interview.scheduledAt,
      duration: interview.duration,
      location: interview.location,
      notes: interview.notes,
      rating: interview.rating,
      feedback: interview.feedback,
      candidate: {
        id: interview.application.applicant.id,
        name: interview.application.applicant.fullName || interview.application.applicant.email,
        email: interview.application.applicant.email,
        // Extract phone from application data if available
        phone: interview.application.applicationData ? 
               JSON.parse(interview.application.applicationData).phone || null : null
      },
      position: interview.application.job.title,
      company: interview.application.job.company?.name || 'Unknown Company',
      interviewer: {
        id: interview.interviewer.id,
        name: interview.interviewer.fullName || interview.interviewer.email,
        email: interview.interviewer.email
      },
      applicationId: interview.applicationId
    }));

    return NextResponse.json({
      interviews: transformedInterviews,
      total: transformedInterviews.length
    });

  } catch (error) {
    console.error('Error fetching interviews:', error);
    return NextResponse.json(
      { error: 'Failed to fetch interviews' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user || (user.role !== 'employer_admin' && user.role !== 'sub_user')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      applicationId,
      title,
      description,
      type = 'in_person',
      scheduledAt,
      duration = 60,
      location,
      notes,
      interviewerId
    } = body;

    if (!applicationId || !title || !scheduledAt) {
      return NextResponse.json(
        { error: 'Application ID, title, and scheduled time are required' },
        { status: 400 }
      );
    }

    // Verify the application belongs to jobs posted by this employer
    let employerId = user.id;
    if (user.role === 'sub_user') {
      const parentEmployer = await prisma.user.findFirst({
        where: {
          managedUsers: {
            some: {
              subUserId: user.id
            }
          }
        }
      });
      
      if (!parentEmployer) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
      
      employerId = parentEmployer.id;
    }

    const application = await prisma.jobApplication.findFirst({
      where: {
        id: applicationId,
        job: {
          postedById: employerId
        }
      }
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Create the interview
    const interview = await prisma.aTSInterview.create({
      data: {
        applicationId,
        interviewerId: interviewerId || user.id,
        title,
        description,
        type,
        scheduledAt: new Date(scheduledAt),
        duration,
        location,
        notes,
        status: 'scheduled'
      },
      include: {
        application: {
          include: {
            applicant: {
              select: {
                id: true,
                email: true,
                fullName: true
              }
            },
            job: {
              select: {
                title: true
              }
            }
          }
        },
        interviewer: {
          select: {
            id: true,
            fullName: true,
            email: true
          }
        }
      }
    });

    // Log ATS activity
    await prisma.aTSActivity.create({
      data: {
        userId: user.id,
        activityType: 'interview_scheduled',
        entityType: 'job_application',
        entityId: applicationId,
        description: `Scheduled ${type} interview for ${interview.application.job.title}`,
        metadata: {
          interviewId: interview.id,
          scheduledAt: scheduledAt,
          type: type
        }
      }
    });

    return NextResponse.json({
      success: true,
      interview: {
        id: interview.id,
        title: interview.title,
        type: interview.type,
        scheduledAt: interview.scheduledAt,
        duration: interview.duration,
        candidate: interview.application.applicant.fullName || interview.application.applicant.email,
        position: interview.application.job.title,
        interviewer: interview.interviewer.fullName || interview.interviewer.email
      }
    });

  } catch (error) {
    console.error('Error creating interview:', error);
    return NextResponse.json(
      { error: 'Failed to create interview' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

export async function PUT(request) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user || (user.role !== 'employer_admin' && user.role !== 'sub_user')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { interviewId, ...updateData } = body;

    if (!interviewId) {
      return NextResponse.json(
        { error: 'Interview ID is required' },
        { status: 400 }
      );
    }

    // Verify the interview belongs to this employer
    let employerId = user.id;
    if (user.role === 'sub_user') {
      const parentEmployer = await prisma.user.findFirst({
        where: {
          managedUsers: {
            some: {
              subUserId: user.id
            }
          }
        }
      });
      
      if (!parentEmployer) {
        return NextResponse.json({ error: 'Access denied' }, { status: 403 });
      }
      
      employerId = parentEmployer.id;
    }

    const interview = await prisma.aTSInterview.findFirst({
      where: {
        id: interviewId,
        application: {
          job: {
            postedById: employerId
          }
        }
      }
    });

    if (!interview) {
      return NextResponse.json({ error: 'Interview not found' }, { status: 404 });
    }

    // Update the interview
    const updatedInterview = await prisma.aTSInterview.update({
      where: { id: interviewId },
      data: {
        ...updateData,
        ...(updateData.scheduledAt && { scheduledAt: new Date(updateData.scheduledAt) })
      }
    });

    // Log ATS activity
    await prisma.aTSActivity.create({
      data: {
        userId: user.id,
        activityType: 'interview_updated',
        entityType: 'interview',
        entityId: interviewId,
        description: `Updated interview details`,
        metadata: {
          changes: updateData
        }
      }
    });

    return NextResponse.json({ success: true, interview: updatedInterview });

  } catch (error) {
    console.error('Error updating interview:', error);
    return NextResponse.json(
      { error: 'Failed to update interview' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
