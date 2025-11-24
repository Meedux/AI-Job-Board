import { NextResponse } from 'next/server';
import { crawlUrls, normalizeJobData } from '@/utils/jobAggregator';
import { persistImportedJobs } from '@/utils/jobImportManager';
import { getUserFromRequest } from '@/utils/auth';

export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    // Only allow authorized roles (super admin / employer admin) to persist imports
    if (!['super_admin', 'employer_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const body = await request.json();
    const urls = body.urls || [];
    if (!Array.isArray(urls) || urls.length === 0) {
      return NextResponse.json({ error: 'Missing urls array' }, { status: 400 });
    }

    const raw = await crawlUrls(urls);
    const normalized = raw.map(n => normalizeJobData(n));

    const results = await persistImportedJobs(normalized, { createdById: user.id });

    return NextResponse.json({ success: true, count: results.length, results });
  } catch (err) {
    console.error('[aggregate/run] error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
