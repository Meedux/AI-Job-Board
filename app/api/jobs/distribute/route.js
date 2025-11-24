import { NextResponse } from 'next/server';
import { postToLinkedIn, postToFacebook, enqueueJobAlert, prepareGoogleJobsSchema, prepareIndeedSchema } from '@/utils/jobAggregator';
import { prisma } from '@/utils/db';

export async function POST(request) {
  try {
    const body = await request.json();
    const { jobId, postLinkedIn, postFacebook, createAlerts, prepareExternal } = body || {};

    if (!jobId) return NextResponse.json({ error: 'Missing jobId' }, { status: 400 });

    const job = await prisma.job.findUnique({ where: { id: jobId }, include: { company: true } });
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    const results = {};

    if (postLinkedIn) {
      results.linkedIn = await postToLinkedIn(job, {});
    }

    if (postFacebook) {
      results.facebook = await postToFacebook(job, {});
    }

    if (createAlerts) {
      results.alert = await enqueueJobAlert(job);
    }

    if (prepareExternal) {
      results.googleJobs = prepareGoogleJobsSchema(job);
      results.indeedSchema = prepareIndeedSchema(job);
    }

    return NextResponse.json({ success: true, results });
  } catch (err) {
    console.error('[distribute] error', err);
    return NextResponse.json({ error: 'Failed to handle distribution' }, { status: 500 });
  }
}
