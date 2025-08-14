import { verifyToken, getUserFromRequest } from '@/utils/auth';
import JobApplicationService from '@/utils/jobApplicationService';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only employers and admins can update application status
    if (!['employer', 'admin', 'super_admin'].includes(user.role)) {
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');

    if (!applicationId) {
      return Response.json({ error: 'Application ID required' }, { status: 400 });
    }

    const { status, ...updateData } = await request.json();

    if (!status) {
      return Response.json({ error: 'Status is required' }, { status: 400 });
    }

    // Validate status
    const validStatuses = ['received', 'under_review', 'interview_scheduled', 'hired', 'rejected'];
    if (!validStatuses.includes(status)) {
      return Response.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Check if user has permission to update this application
    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            company: true
          }
        }
      }
    });

    if (!application) {
      return Response.json({ error: 'Application not found' }, { status: 404 });
    }

    // Check if user is authorized for this company's applications
    if (user.role === 'employer') {
      const userCompany = await prisma.company.findFirst({
        where: { userId: user.id }
      });

      if (!userCompany || userCompany.id !== application.job.companyId) {
        return Response.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    // Update application status and send email
    const updatedApplication = await JobApplicationService.updateApplicationStatus(
      applicationId,
      status,
      updateData,
      user.id
    );

    return Response.json({
      success: true,
      message: 'Application status updated successfully',
      application: updatedApplication
    });

  } catch (error) {
    console.error('Error updating application status:', error);
    return Response.json(
      { error: 'Failed to update application status' },
      { status: 500 }
    );
  }
}

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const applicationId = searchParams.get('applicationId');
    const action = searchParams.get('action');

    if (!applicationId) {
      return Response.json({ error: 'Application ID required' }, { status: 400 });
    }

    // Get application history
    if (action === 'history') {
      const history = await JobApplicationService.getApplicationHistory(applicationId);
      return Response.json(history);
    }

    // Get application details
    const application = await prisma.jobApplication.findUnique({
      where: { id: applicationId },
      include: {
        job: {
          include: {
            company: true
          }
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            createdAt: true
          }
        },
        statusHistory: {
          include: {
            changedByUser: {
              select: {
                fullName: true,
                email: true
              }
            }
          },
          orderBy: { createdAt: 'desc' }
        }
      }
    });

    if (!application) {
      return Response.json({ error: 'Application not found' }, { status: 404 });
    }

    // Check permissions
    if (user.role === 'job_seeker' && application.userId !== user.id) {
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }

    if (user.role === 'employer') {
      const userCompany = await prisma.company.findFirst({
        where: { userId: user.id }
      });

      if (!userCompany || userCompany.id !== application.job.companyId) {
        return Response.json({ error: 'Access denied' }, { status: 403 });
      }
    }

    return Response.json(application);

  } catch (error) {
    console.error('Error fetching application:', error);
    return Response.json(
      { error: 'Failed to fetch application' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const action = searchParams.get('action');
    const applicationId = searchParams.get('applicationId');

    // Send custom email
    if (action === 'send-email') {
      const { subject, content } = await request.json();

      if (!subject || !content) {
        return Response.json({ error: 'Subject and content are required' }, { status: 400 });
      }

      const result = await JobApplicationService.sendCustomEmail(
        applicationId,
        subject,
        content,
        user.id
      );

      return Response.json(result);
    }

    // Bulk update applications
    if (action === 'bulk-update') {
      const { applicationIds, status, ...updateData } = await request.json();

      if (!applicationIds || !Array.isArray(applicationIds) || !status) {
        return Response.json({ error: 'Application IDs and status are required' }, { status: 400 });
      }

      const result = await JobApplicationService.bulkUpdateApplications(
        applicationIds,
        status,
        updateData,
        user.id
      );

      return Response.json(result);
    }

    return Response.json({ error: 'Invalid action' }, { status: 400 });

  } catch (error) {
    console.error('Error processing application action:', error);
    return Response.json(
      { error: 'Failed to process action' },
      { status: 500 }
    );
  }
}
