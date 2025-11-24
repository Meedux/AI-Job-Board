import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/utils/auth';
import { listPendingImports } from '@/utils/jobImportManager';

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!['super_admin', 'employer_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    // Query params
    const url = new URL(request.url);
    const limit = parseInt(url.searchParams.get('limit') || '50', 10);
    const offset = parseInt(url.searchParams.get('offset') || '0', 10);

    const items = await listPendingImports({ limit, offset });

    return NextResponse.json({ success: true, items });
  } catch (err) {
    console.error('[jobs/imports] error', err);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
