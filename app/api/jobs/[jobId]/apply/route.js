import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserFromRequest } from '@/utils/auth';

const prisma = new PrismaClient();

// POST /api/jobs/[jobId]/apply
export async function POST(request, { params }) {
  const user = getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Authentication required' }, { status: 401 });
  }
  const { jobId } = params;
  if (!jobId) {
    return NextResponse.json({ error: 'Job ID missing' }, { status: 400 });
  }

  try {
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) {
      return NextResponse.json({ error: 'Job not found' }, { status: 404 });
    }

    if (job.applicationMethod && job.applicationMethod !== 'internal') {
      return NextResponse.json({ error: 'This job uses external or email application method' }, { status: 400 });
    }

    // Prevent duplicate application
    const existing = await prisma.jobApplication.findUnique({ where: { jobId_applicantId: { jobId, applicantId: user.id } } });
    if (existing) {
      return NextResponse.json({ error: 'Already applied' }, { status: 409 });
    }

    const body = await request.json().catch(() => ({}));
    const { formId, applicationData, coverLetter, resumeUrl } = body;

    const created = await prisma.jobApplication.create({
      data: {
        jobId,
        applicantId: user.id,
        formId: formId || null,
        applicationData: applicationData || null,
        coverLetter: coverLetter || null,
        resumeUrl: resumeUrl || null,
        status: 'pending',
        stage: 'new',
        source: 'direct'
      }
    });

    // Increment applications count on job
    await prisma.job.update({ where: { id: jobId }, data: { applicationsCount: { increment: 1 } } });

    return NextResponse.json({ success: true, applicationId: created.id });
  } catch (e) {
    console.error('[JOB_APPLY] Error applying:', e);
    return NextResponse.json({ error: 'Failed to apply' }, { status: 500 });
  }
}
