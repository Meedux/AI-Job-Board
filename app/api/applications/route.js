import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import jwt from 'jsonwebtoken';
import { createNotification } from '@/utils/notificationService';
import emailItService from '@/utils/emailItService';

const prisma = new PrismaClient();
// Using EmailIt service for notifications

export async function POST(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.id;
    
    // Handle multipart form data
    const formData = await request.formData();
    const jobId = formData.get('jobId');

    console.log('📝 Application API - FormData keys:', Array.from(formData.keys()));
    console.log('📝 Application API - jobId from formData:', jobId);
    console.log('📝 Application API - jobId type:', typeof jobId);

    if (!jobId) {
      console.error('❌ Application API - No jobId provided in form data');
      return NextResponse.json({ error: 'Job ID is required' }, { status: 400 });
    }

    // Validate jobId as string (cuid/uuid format)
    const jobIdStr = String(jobId).trim();
    if (!jobIdStr || jobIdStr.length < 5) {
      console.error('❌ Application API - Invalid jobId format:', jobId);
      return NextResponse.json({ error: 'Invalid job ID format' }, { status: 400 });
    }

    console.log('📝 Application API - Using jobId as string:', jobIdStr);

    // Check if job exists
    const job = await prisma.job.findUnique({
      where: { id: jobIdStr },
      include: {
        company: true,
        postedBy: true
      }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Check if user already applied for this job
    const existingApplication = await prisma.jobApplication.findFirst({
      where: {
        jobId: jobIdStr,
        applicantId: userId
      }
    });

    if (existingApplication) {
      return NextResponse.json({ 
        error: 'You have already applied for this job' 
      }, { status: 409 });
    }

    // Extract form fields
    const applicationData = {};
    const fileData = {};

    for (const [key, value] of formData.entries()) {
      if (key.startsWith('file_')) {
        // Handle file uploads
        const fieldName = key.replace('file_', '');
        if (value instanceof File && value.size > 0) {
          // In a real application, you would upload files to cloud storage
          // For now, we'll just store the filename
          fileData[fieldName] = {
            filename: value.name,
            size: value.size,
            type: value.type
          };
        }
      } else if (key !== 'jobId') {
        // Handle regular form fields
        try {
          // Try to parse as JSON (for arrays like checkboxes)
          applicationData[key] = JSON.parse(value);
        } catch {
          // If not JSON, store as string
          applicationData[key] = value;
        }
      }
    }

    // Create the application
    const application = await prisma.jobApplication.create({
      data: {
        jobId: jobIdStr,
        applicantId: userId,
        applicationData: JSON.stringify(applicationData),
        fileData: JSON.stringify(fileData),
        status: 'pending',
        appliedAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        applicant: {
          select: {
            id: true,
            email: true,
            firstName: true,
            lastName: true,
            fullName: true
          }
        }
      }
    });

    // Increment application count for the job
    await prisma.job.update({
      where: { id: jobIdStr },
      data: { 
        applicationsCount: { increment: 1 },
        updatedAt: new Date()
      }
    });

    // Send notifications to employer
    try {
      // Create in-app notification for employer
      await createNotification({
        type: 'JOB_APPLICATION',
        title: 'New Job Application',
        message: `${application.applicant.fullName || application.applicant.firstName + ' ' + application.applicant.lastName} applied for "${job.title}"`,
        category: 'JOB',
        priority: 'MEDIUM',
        userId: job.postedById,
        metadata: {
          jobId: job.id,
          jobTitle: job.title,
          applicantId: application.applicantId,
          applicantName: application.applicant.fullName || application.applicant.firstName + ' ' + application.applicant.lastName,
          applicationId: application.id
        }
      });

      // Send email notification to employer using EmailIt
      const applicantName = application.applicant.fullName || application.applicant.firstName + ' ' + application.applicant.lastName;
      await emailItService.sendApplicationNotification(
        job.postedBy.email, 
        job.title, 
        applicantName
      );

      console.log('Employer notifications sent successfully');
    } catch (notificationError) {
      console.error('Error sending employer notifications:', notificationError);
      // Don't fail the application submission if notifications fail
    }

    return NextResponse.json({
      success: true,
      message: 'Application submitted successfully',
      application: {
        id: application.id,
        jobId: application.jobId,
        status: application.status,
        appliedAt: application.appliedAt
      }
    });

  } catch (error) {
    console.error('Error submitting application:', error);
    
    if (error.code === 'P2002') {
      return NextResponse.json(
        { error: 'You have already applied for this job' },
        { status: 409 }
      );
    }

    return NextResponse.json(
      { error: 'Failed to submit application' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.id;
    const { searchParams } = new URL(request.url);
    const jobId = searchParams.get('jobId');
    const status = searchParams.get('status');
    const page = parseInt(searchParams.get('page') || '1');
    const limit = parseInt(searchParams.get('limit') || '10');

    const skip = (page - 1) * limit;

    let where = {};

    if (jobId) {
      // Get applications for a specific job (for employers)
      const job = await prisma.job.findFirst({
        where: { 
          id: jobId,
          postedById: userId 
        }
      });

      if (!job) {
        return NextResponse.json({ error: 'Job not found or unauthorized' }, { status: 404 });
      }

      where.jobId = jobId;
    } else {
      // Get user's own applications (for job seekers)
      where.applicantId = userId;
    }

    if (status) {
      where.status = status;
    }

    const [applications, totalCount] = await Promise.all([
      prisma.jobApplication.findMany({
        where,
        select: {
          id: true,
          jobId: true,
          applicantId: true,
          applicationData: true,
          fileData: true,
          status: true,
          appliedAt: true,
          updatedAt: true,
          job: {
            select: {
              id: true,
              title: true,
              company: {
                select: {
                  name: true
                }
              },
              location: true,
              jobType: true
            }
          },
          applicant: {
            select: {
              id: true,
              fullName: true,
              email: true
            }
          }
        },
        orderBy: { appliedAt: 'desc' },
        skip,
        take: limit
      }),
      prisma.jobApplication.count({ where })
    ]);

    // Parse JSON fields
    const parsedApplications = applications.map(app => ({
      ...app,
      applicationData: JSON.parse(app.applicationData || '{}'),
      fileData: JSON.parse(app.fileData || '{}')
    }));

    const totalPages = Math.ceil(totalCount / limit);

    return NextResponse.json({
      success: true,
      applications: parsedApplications,
      pagination: {
        currentPage: page,
        totalPages,
        totalCount,
        hasNext: page < totalPages,
        hasPrev: page > 1
      }
    });

  } catch (error) {
    console.error('Error fetching applications:', error);
    return NextResponse.json(
      { error: 'Failed to fetch applications' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const cookieStore = await cookies();
    const token = cookieStore.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
    }

    let decoded;
    try {
      decoded = jwt.verify(token, process.env.JWT_SECRET);
    } catch (error) {
      return NextResponse.json({ error: 'Invalid token' }, { status: 401 });
    }

    const userId = decoded.id;
    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('id');

    if (!applicationId) {
      return NextResponse.json({ error: 'Application ID is required' }, { status: 400 });
    }

    const updateData = await request.json();

    // Check if user has permission to update this application
    const application = await prisma.jobApplication.findFirst({
      where: { id: applicationId },
      include: {
        job: {
          select: { postedById: true }
        }
      }
    });

    if (!application) {
      return NextResponse.json({ error: 'Application not found' }, { status: 404 });
    }

    // Only job poster can update application status
    if (application.job.postedById !== userId) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 403 });
    }

    // Update the application
    const updatedApplication = await prisma.jobApplication.update({
      where: { id: applicationId },
      data: {
        status: updateData.status,
        notes: updateData.notes || null,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      message: 'Application updated successfully',
      application: {
        id: updatedApplication.id,
        status: updatedApplication.status,
        updatedAt: updatedApplication.updatedAt
      }
    });

  } catch (error) {
    console.error('Error updating application:', error);
    return NextResponse.json(
      { error: 'Failed to update application' },
      { status: 500 }
    );
  }
}
