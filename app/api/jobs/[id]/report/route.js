import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/utils/auth';

export async function POST(request, { params }) {
  const { id } = params;
  const user = getUserFromRequest(request);
  const body = await request.json().catch(() => ({}));
  const reason = body.reason || 'No reason provided';

  // Lightweight reporting endpoint — currently logs and acknowledges report.
  // TODO: persist to DB using a JobReport model when schema / migration is available.
  try {
    console.log(`[JOB_REPORT] Job ${id} reported by ${user?.id || 'anonymous'}: ${reason}`);

    return NextResponse.json({ success: true, message: 'Report received' });
  } catch (err) {
    console.error('[JOB_REPORT] Error recording report:', err);
    return NextResponse.json({ error: 'Failed to record report' }, { status: 500 });
  }
}
