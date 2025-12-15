import { NextResponse } from 'next/server';
import { prisma } from '@/utils/db';
import { getUserFromRequest } from '@/utils/auth';
import { canGenerateShortlink } from '@/utils/policy';
import QRCode from 'qrcode';

function randomCode(len = 7) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let out = '';
  for (let i = 0; i < len; i++) out += chars[Math.floor(Math.random() * chars.length)];
  return out;
}

export async function POST(request, { params }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const jobId = params.id;
    const job = await prisma.job.findUnique({ where: { id: jobId }, include: { company: true } });
    if (!job) return NextResponse.json({ error: 'Job not found' }, { status: 404 });

    if (!canGenerateShortlink({ user, job })) {
      return NextResponse.json({ error: 'Insufficient permissions' }, { status: 403 });
    }

    // Generate or reuse shortUrl
    let shortUrl = job.shortUrl;
    if (!shortUrl) {
      let code;
      do { code = randomCode(); } while (await prisma.job.findFirst({ where: { shortUrl: code } }));
      shortUrl = code;
      await prisma.job.update({ where: { id: job.id }, data: { shortUrl } });
    }

    const baseShare = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://jobboard.local'}/j/${shortUrl}`;

    // Generate QR code (data URI)
    const qrDataUrl = await QRCode.toDataURL(baseShare, { margin: 1, width: 240 });

    // Simple social template
    const template = {
      title: job.title,
      company: job.company?.name || 'Hiring Company',
      summary: job.description?.slice(0, 220) + (job.description?.length > 220 ? '…' : ''),
      url: baseShare,
      tags: [job.industry, job.jobType, job.experienceLevel].filter(Boolean),
    };

    return NextResponse.json({ success: true, shortUrl, shareUrl: baseShare, qr: qrDataUrl, template });
  } catch (err) {
    console.error('Job share/create short link error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function GET(request, { params }) {
  try {
    const jobId = params.id;
    const job = await prisma.job.findUnique({ where: { id: jobId } });
    if (!job || !job.shortUrl) return NextResponse.json({ error: 'Share data not found' }, { status: 404 });
    const baseShare = `${process.env.NEXT_PUBLIC_SITE_URL || 'https://jobboard.local'}/j/${job.shortUrl}`;
    return NextResponse.json({ success: true, shortUrl: job.shortUrl, shareUrl: baseShare });
  } catch (err) {
    console.error('Job share fetch error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
