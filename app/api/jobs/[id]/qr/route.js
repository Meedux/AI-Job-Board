import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import QRCode from 'qrcode';
import { prisma } from '@/utils/db';
import { getUserFromRequest } from '@/utils/auth';
import { canGenerateShortlink } from '@/utils/policy';

export async function POST(request, { params }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const jobId = params.id;
    if (!jobId) return NextResponse.json({ error: 'Missing job id' }, { status: 400 });

    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

  // Permission: reuse centralized shortlink permission
  if (!canGenerateShortlink({ user, job })) return NextResponse.json({ error: 'Forbidden' }, { status: 403 });

    const token = job.shortUrl;
    if (!token) return NextResponse.json({ error: 'No short link configured for this job' }, { status: 400 });

    const base = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://example.com';
    const url = `${base.replace(/\/$/, '')}/s/${token}`;

    // Generate PNG buffer for QR
    const buffer = await QRCode.toBuffer(url, { type: 'png', width: 800, margin: 1 });

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'qrs');
    // Ensure directory exists
    await fs.promises.mkdir(uploadsDir, { recursive: true });

    const filename = `${jobId}.png`;
    const filePath = path.join(uploadsDir, filename);

    await fs.promises.writeFile(filePath, buffer);

    // Persist path to job
    const updated = await prisma.job.update({ where: { id: jobId }, data: { qrImagePath: `/uploads/qrs/${filename}` } });

    return NextResponse.json({ success: true, qrPath: updated.qrImagePath, url });
  } catch (error) {
    console.error('Error generating QR for job:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
