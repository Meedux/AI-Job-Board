import { NextResponse } from 'next/server';
import { crawlUrls, normalizeJobData } from '@/utils/jobAggregator';

export async function POST(request) {
  try {
    const body = await request.json();
    const urls = body.urls || [];

    if (!Array.isArray(urls) || urls.length === 0) return NextResponse.json({ error: 'Missing urls array' }, { status: 400 });

    const jobs = await crawlUrls(urls);

    // Normalize and return
    const normalized = jobs.map(j => normalizeJobData(j));
    return NextResponse.json({ success: true, jobs: normalized });
  } catch (err) {
    console.error('[aggregate] error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
