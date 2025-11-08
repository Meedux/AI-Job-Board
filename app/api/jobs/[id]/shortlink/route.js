import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/utils/auth';
import { prisma } from '@/utils/db';
import { canGenerateShortlink } from '@/utils/policy';
import crypto from 'crypto';

function generateToken() {
  // 8 hex chars (~32 bits) - short but reasonably unique; loop check ensures uniqueness
  return crypto.randomBytes(4).toString('hex');
}

export async function POST(request, { params }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const jobId = params.id;
    if (!jobId) return NextResponse.json({ error: 'Missing job id' }, { status: 400 });

    // Fetch job and permission check
    const job = await prisma.job.findUnique({ where: { id: jobId }, include: { postedBy: true } });
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    // Centralized permission check for shortlink generation
    if (!canGenerateShortlink({ user, job })) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // If a shortUrl already exists and client asked to regenerate, allow overwrite
    const body = await request.json().catch(() => ({}));
    const regenerate = !!body.regenerate;

    if (job.shortUrl && !regenerate) {
      const full = `${process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://example.com'}/s/${job.shortUrl}`;
      return NextResponse.json({ success: true, shortToken: job.shortUrl, shortUrl: full });
    }

    // Generate unique token
    let token = generateToken();
    let exists = await prisma.job.findFirst({ where: { shortUrl: token } });
    let attempts = 0;
    while (exists && attempts < 6) {
      token = generateToken();
      exists = await prisma.job.findFirst({ where: { shortUrl: token } });
      attempts++;
    }

    if (exists) {
      return NextResponse.json({ error: 'Failed to generate unique short link' }, { status: 500 });
    }

    // Persist token
    await prisma.job.update({ where: { id: jobId }, data: { shortUrl: token } });

    const full = `${process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://example.com'}/s/${token}`;

    return NextResponse.json({ success: true, shortToken: token, shortUrl: full });
  } catch (error) {
    console.error('Error creating shortlink:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
