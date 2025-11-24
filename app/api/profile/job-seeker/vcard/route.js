import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
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

    const fullName = user.fullName || user.nickname || 'Candidate';
    const email = user.email || '';
    const phone = user.phone || '';
    const org = user.companyName || '';
    const url = `${process.env.NEXT_PUBLIC_APP_URL || 'https://example.com'}/profile/${userId}`;

    const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${fullName}\nORG:${org}\nTEL:${phone}\nEMAIL:${email}\nURL:${url}\nEND:VCARD`;

    const uploadsDir = path.join(process.cwd(), 'public', 'uploads', 'vcards');
    if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

    const filename = `vcard-${userId}-${Date.now()}.vcf`;
    const filePath = path.join(uploadsDir, filename);
    fs.writeFileSync(filePath, vcard);

    const dbPath = `/uploads/vcards/${filename}`;
    const updated = await prisma.user.update({ where: { id: userId }, data: { vcardUrl: dbPath } });

    return NextResponse.json({ success: true, vcard: updated.vcardUrl });
  } catch (error) {
    console.error('[PROFILE_VCARD] Error generating vCard:', error);
    return NextResponse.json({ error: 'Failed to generate vCard' }, { status: 500 });
  }
}
