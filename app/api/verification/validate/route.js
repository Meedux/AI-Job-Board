import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/utils/auth';
import { validateCompliance } from '@/utils/validators';

// POST: validate identifiers/licenses
// Body: { tin?, birFormCode?, doleLicense?, dmwLicense?, subtype?, dmwType? }
export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const body = await request.json();
    const result = validateCompliance(body || {});
    return NextResponse.json({ success: true, ...result });
  } catch (err) {
    console.error('Compliance validate error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
