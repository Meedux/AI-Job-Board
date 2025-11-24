import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/utils/auth';
import { rejectImport } from '@/utils/jobImportManager';

export async function POST(request, { params }) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (!['super_admin', 'employer_admin'].includes(user.role)) {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const id = params?.id;
    if (!id) return NextResponse.json({ error: 'Missing id' }, { status: 400 });

    const body = await request.json();
    const reason = body?.reason || null;

    const result = await rejectImport(id, user.id, reason);
    return NextResponse.json({ success: true, result });
  } catch (err) {
    console.error('[jobs/imports/reject] error', err);
    return NextResponse.json({ error: err?.message || 'Internal server error' }, { status: 500 });
  }
}
