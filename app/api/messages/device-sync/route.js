import { NextResponse } from 'next/server';
import { prisma } from '@/utils/db';
import { getUserFromRequest } from '@/utils/auth';
import crypto from 'crypto';

export async function POST(request) {
  const user = await getUserFromRequest(request);
  if (!user) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  const qrToken = crypto.randomUUID();
  const expiresAt = new Date(Date.now() + 30 * 60 * 1000);
  const session = await prisma.deviceSyncSession.create({
    data: {
      userId: user.id,
      qrToken,
      status: 'pending',
      expiresAt
    }
  });

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000';
  const syncUrl = `${baseUrl}/workspace/sync?token=${qrToken}`;

  return NextResponse.json({ session, syncUrl });
}

export async function PATCH(request) {
  const body = await request.json();
  const { token, consent, deviceInfo, simNumber } = body;
  if (!token) {
    return NextResponse.json({ error: 'Token required' }, { status: 400 });
  }

  const session = await prisma.deviceSyncSession.findUnique({ where: { qrToken: token } });
  if (!session) {
    return NextResponse.json({ error: 'Not found' }, { status: 404 });
  }

  if (session.expiresAt && new Date(session.expiresAt) < new Date()) {
    return NextResponse.json({ error: 'Expired' }, { status: 410 });
  }

  const updated = await prisma.deviceSyncSession.update({
    where: { id: session.id },
    data: {
      status: consent ? 'approved' : 'rejected',
      consentAt: consent ? new Date() : session.consentAt,
      approvedAt: consent ? new Date() : session.approvedAt,
      deviceInfo: deviceInfo || session.deviceInfo,
      simNumber: simNumber || session.simNumber
    }
  });

  return NextResponse.json({ session: updated });
}
