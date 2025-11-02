import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/utils/auth';
import { prisma } from '@/utils/db';

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    if (user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Access denied' }, { status: 403 });
    }

    const q = new URL(request.url).searchParams.get('q') || '';
    const where = q ? {
      OR: [
        { filename: { contains: q, mode: 'insensitive' } },
        { category: { contains: q, mode: 'insensitive' } }
      ]
    } : {};

    const docs = await prisma.verificationDocument.findMany({
      where,
      include: { user: { select: { id: true, email: true, fullName: true } } },
      orderBy: { uploadedAt: 'desc' },
      take: 200
    });

    return NextResponse.json({ success: true, documents: docs });
  } catch (error) {
    console.error('Error listing verification documents:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
