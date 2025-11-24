import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserFromRequest } from '@/utils/auth';

const prisma = new PrismaClient();

export async function GET(request) {
  const user = getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  try {
    const bookmarks = await prisma.jobBookmark.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: 'desc' },
      include: { job: { include: { company: true } } }
    });

    const mapped = bookmarks.map(b => ({ id: b.id, job: b.job, createdAt: b.createdAt }));
    return NextResponse.json({ success: true, bookmarks: mapped });
  } catch (e) {
    console.error('[BOOKMARKS_LIST] Error:', e);
    return NextResponse.json({ error: 'Failed to fetch bookmarks' }, { status: 500 });
  }
}
