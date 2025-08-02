import { NextResponse } from 'next/server';
import { verifyToken, getUserFromRequest } from '../../../../../utils/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request, { params }) {
  try {
    const user = await getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { error: 'Authentication required' },
        { status: 401 }
      );
    }

    const { id: jobId } = await params;
    
    // Find the job and verify ownership
    const job = await prisma.job.findUnique({
      where: { id: jobId },
      include: {
        company: true,
        applicationForm: true,
      }
    });

    if (!job) {
      return NextResponse.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Check if user owns this job or has permission
    if (job.postedById !== user.id && !['super_admin'].includes(user.role)) {
      return NextResponse.json(
        { error: 'Unauthorized to publish this job' },
        { status: 403 }
      );
    }

    // Publish the job
    const publishedJob = await prisma.job.update({
      where: { id: jobId },
      data: {
        status: 'active',
        postedAt: new Date(),
      }
    });

    // Log the publication
    console.log(`🚀 Job published: ${publishedJob.title} (${publishedJob.id}) by ${session.user.email}`);

    // TODO: Send notifications to subscribers
    // TODO: Index for search
    // TODO: Generate QR code if requested
    // TODO: Create social media template if requested

    return NextResponse.json({
      success: true,
      message: 'Job published successfully',
      job: {
        id: publishedJob.id,
        slug: publishedJob.slug,
        title: publishedJob.title,
        status: publishedJob.status,
        postedAt: publishedJob.postedAt,
      }
    });

  } catch (error) {
    console.error('Error publishing job:', error);
    
    return NextResponse.json(
      { error: 'Failed to publish job' },
      { status: 500 }
    );
  } finally {
    await prisma.$disconnect();
  }
}
