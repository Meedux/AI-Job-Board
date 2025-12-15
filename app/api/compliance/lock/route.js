import { NextResponse } from 'next/server';
import { getUserFromRequest, sanitizeInput } from '@/utils/auth';
import { USER_ROLES } from '@/utils/roleSystem';
import { lockAccount } from '@/utils/complianceService';
import { prisma } from '@/utils/db';

const canLock = (user) => user && [USER_ROLES.SUPER_ADMIN, USER_ROLES.OWNER, USER_ROLES.MAIN_ADMIN].includes(user.role);

export async function GET(request) {
  const user = await getUserFromRequest(request);
  if (!canLock(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const locks = await prisma.accountLock.findMany({
    where: { unlockedAt: null },
    orderBy: { lockedAt: 'desc' }
  });

  return NextResponse.json({ locks });
}

export async function POST(request) {
  const user = await getUserFromRequest(request);
  if (!canLock(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const targetUserId = body.userId;
  if (!targetUserId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const lock = await lockAccount(targetUserId, sanitizeInput(body.reason || 'manual lock'), body.severity || 'high', body.metadata || {});
  return NextResponse.json({ lock }, { status: 201 });
}

export async function PATCH(request) {
  const user = await getUserFromRequest(request);
  if (!canLock(user)) {
    return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
  }

  const body = await request.json();
  const targetUserId = body.userId;
  if (!targetUserId) {
    return NextResponse.json({ error: 'userId required' }, { status: 400 });
  }

  const updated = await prisma.accountLock.update({
    where: { userId: targetUserId },
    data: {
      unlockedAt: new Date(),
      expiresAt: new Date()
    }
  }).catch(() => null);

  await prisma.user.update({ where: { id: targetUserId }, data: { accountStatus: 'active' } }).catch(() => null);

  return NextResponse.json({ unlocked: !!updated });
}
