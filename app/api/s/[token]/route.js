import { NextResponse } from 'next/server';
import { prisma } from '@/utils/db';

export async function GET(request, { params }) {
  try {
    const token = params.token;
    if (!token) return NextResponse.json({ error: 'Missing token' }, { status: 400 });

    const job = await prisma.job.findFirst({ where: { shortUrl: token }, include: { company: true } });
    if (!job) return NextResponse.json({ error: 'Short link not found' }, { status: 404 });

    // Redirect to canonical job page
    const base = process.env.NEXT_PUBLIC_SITE_URL || process.env.SITE_URL || 'https://example.com';
    const target = new URL(`/jobs/${job.slug}`, base);
    return NextResponse.redirect(target);
  } catch (error) {
    console.error('Error resolving shortlink:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
