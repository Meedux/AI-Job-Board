import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import QRCode from 'qrcode';
import fs from 'fs';
import path from 'path';

const prisma = new PrismaClient();

export async function POST(request) {
  try {
    const data = await request.json().catch(() => ({}));
    const { userId } = data;
    if (!userId) return NextResponse.json({ error: 'userId required' }, { status: 400 });

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const url = user.shareableLink || `${process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'}/profile/${userId}`;

    // generate PNG buffer for QR
    const buffer = await QRCode.toBuffer(url, { type: 'png', width: 800, margin: 1 });

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'profiles');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const filename = `profile-qr-${userId}-${Date.now()}.png`;
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, buffer);

    const dbPath = `/uploads/profiles/${filename}`;
    const updated = await prisma.user.update({ where: { id: userId }, data: { qrImagePath: dbPath } });

    return NextResponse.json({ success: true, qrPath: updated.qrImagePath, url });
  } catch (error) {
    console.error('[PROFILE_QR] Error generating QR:', error);
    return NextResponse.json({ error: 'Failed to generate QR' }, { status: 500 });
  }
}
