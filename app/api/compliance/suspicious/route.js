import { NextResponse } from 'next/server';
import { prisma } from '@/utils/db';
import { getUserFromRequest, sanitizeInput } from '@/utils/auth';
import { USER_ROLES } from '@/utils/roleSystem';
import { recordSuspiciousActivity } from '@/utils/complianceService';

const canView = (user) => user && [USER_ROLES.SUPER_ADMIN, USER_ROLES.OWNER, USER_ROLES.MAIN_ADMIN].includes(user.role);

export async function GET(request) {
  const user = await getUserFromRequest(request);
  if (!canView(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const items = await prisma.suspiciousActivity.findMany({
    orderBy: { createdAt: 'desc' },
    take: 200
  });

  return NextResponse.json({ suspicious: items });
}

export async function POST(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const body = await request.json();
  const activity = await recordSuspiciousActivity({
    userId: body.userId || user.id || null,
    type: sanitizeInput(body.type || 'unknown'),
    severity: body.severity || 'medium',
    description: sanitizeInput(body.description || ''),
    detectedBy: body.detectedBy || 'manual',
    metadata: body.metadata || {}
  });

  return NextResponse.json({ activity }, { status: 201 });
}
