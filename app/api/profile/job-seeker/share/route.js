import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import QRCode from 'qrcode';
import path from 'path';
import fs from 'fs';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const data = await request.json().catch(() => ({}));
    const { userId } = data;
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // create a short share token
    const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
    let slug = '';
    for (let i = 0; i < 8; i++) slug += chars[Math.floor(Math.random() * chars.length)];

    const baseShare = `${process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'}/profile/${userId}?s=${slug}`;

    // persist shareableLink on user
    await prisma.user.update({ where: { id: userId }, data: { shareableLink: baseShare } });

    // generate QR data url
    const qrDataUrl = await QRCode.toDataURL(baseShare, { margin: 1, width: 240 });

    return NextResponse.json({ success: true, shareUrl: baseShare, qr: qrDataUrl });
  } catch (e) {
    console.error('[PROFILE_SHARE] Error:', e);
    return NextResponse.json({ error: 'Failed to generate share' }, { status: 500 });
  }
}
