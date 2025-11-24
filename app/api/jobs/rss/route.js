import { NextResponse } from 'next/server';
import { db } from '@/utils/db';
import { generateRSSFeed } from '@/utils/jobAggregator';

export async function GET(request) {
  try {
    // return latest active jobs (limit configurable)
    const limit = Number(new URL(request.url).searchParams.get('limit')) || 50;
    const jobs = await db.jobs.findMany({ limit, offset: 0, sortBy: 'postedAt', sortOrder: 'desc' });

    const xml = generateRSSFeed(jobs, { title: 'AI-Job-Board — Latest Jobs', link: process.env.NEXT_PUBLIC_SITE_URL || 'https://example.com' });

    return new Response(xml, { status: 200, headers: { 'Content-Type': 'application/rss+xml; charset=utf-8' } });
  } catch (err) {
    console.error('[rss] error', err);
    return NextResponse.json({ error: 'Failed to generate feed' }, { status: 500 });
  }
}
