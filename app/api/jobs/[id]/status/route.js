import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { cookies } from 'next/headers';
import { canCreateJob } from '@/utils/policy';

const prisma = new PrismaClient();

// PATCH - Update job status
export async function PATCH(request, { params }) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from token
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: token.value },
          { email: token.value }
        ]
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const jobId = params.id;
    const { status } = await request.json();

    // Validate status
    const validStatuses = ['draft', 'active', 'paused', 'closed', 'expired'];
    if (!validStatuses.includes(status)) {
      return NextResponse.json({ error: 'Invalid status' }, { status: 400 });
    }

    // Check if job exists and user has permission to update it
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        postedBy: {
          select: {
            id: true,
            parentUserId: true
          }
        }
      }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Check permissions
    const canUpdate = 
      job.postedById === user.id || // Job owner
      (user.role === 'employer_admin' && job.postedBy.parentUserId === user.id); // Main employer managing sub-user's job

    if (!canUpdate) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // If activating the job, enforce policy to prevent unverified accounts publishing placement jobs or fees
    if (status === 'active') {
      const verifiedDoc = await prisma.verificationDocument.findFirst({ where: { userId: user.id, status: 'verified' } });
      const decision = canCreateJob({ user, verified: !!verifiedDoc, activeCount: 0, jobData: { hasPlacementFee: job.hasPlacementFee, isPlacement: job.isPlacement } });
      if (!decision.allowed) {
        return NextResponse.json({ error: decision.message || 'Not allowed to publish job' }, { status: 403 });
      }
    }

    // Update job status
    const updatedJob = await prisma.job.update({
      where: { id: jobId },
      data: { 
        status,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({
      success: true,
      job: updatedJob,
      message: `Job status updated to ${status}`
    });

  } catch (error) {
    console.error('Error updating job status:', error);
    return NextResponse.json(
      { error: 'Failed to update job status' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}

// DELETE - Delete a job
export async function DELETE(request, { params }) {
  try {
    const cookieStore = cookies();
    const token = cookieStore.get('auth-token');
    
    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Get user from token
    const user = await prisma.user.findFirst({
      where: {
        OR: [
          { id: token.value },
          { email: token.value }
        ]
      }
    });

    if (!user) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const jobId = params.id;

    // Check if job exists and user has permission to delete it
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        postedBy: {
          select: {
            id: true,
            parentUserId: true
          }
        },
        _count: {
          select: {
            applications: true
          }
        }
      }
    });

    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    // Check permissions
    const canDelete = 
      job.postedById === user.id || // Job owner
      (user.role === 'employer_admin' && job.postedBy.parentUserId === user.id); // Main employer managing sub-user's job

    if (!canDelete) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Check if job has applications
    if (job._count.applications > 0) {
      return NextResponse.json({ 
        error: 'Cannot delete job with existing applications. Please close the job instead.' 
      }, { status: 400 });
    }

    // Delete the job
    await prisma.job.delete({
      where: { id: jobId }
    });

    return NextResponse.json({
      success: true,
      message: 'Job deleted successfully'
    });

  } catch (error) {
    console.error('Error deleting job:', error);
    return NextResponse.json(
      { error: 'Failed to delete job' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}