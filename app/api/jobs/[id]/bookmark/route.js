import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/utils/auth';
import { prisma } from '@/utils/db';

export async function GET(request, { params }) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = params;
  if (!id) return NextResponse.json({ error: 'Job id required' }, { status: 400 });

  try {
    const existing = await prisma.jobBookmark.findFirst({ where: { jobId: id, userId: user.id } });
    return NextResponse.json({ bookmarked: !!existing });
  } catch (e) {
    console.error('[BOOKMARK_GET] Error:', e);
    return NextResponse.json({ error: 'Failed to check bookmark' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = params;
  if (!id) return NextResponse.json({ error: 'Job id required' }, { status: 400 });

  try {
    // prevent duplicates
    const existing = await prisma.jobBookmark.findFirst({ where: { jobId: id, userId: user.id } });
    if (existing) return NextResponse.json({ success: true, message: 'Already bookmarked', id: existing.id });

    const created = await prisma.jobBookmark.create({ data: { jobId: id, userId: user.id } });
    return NextResponse.json({ success: true, id: created.id });
  } catch (e) {
    console.error('[BOOKMARK_POST] Error:', e);
    return NextResponse.json({ error: 'Failed to bookmark' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  const user = await getUserFromRequest(request);
  if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const { id } = params;
  if (!id) return NextResponse.json({ error: 'Job id required' }, { status: 400 });

  try {
    const existing = await prisma.jobBookmark.findFirst({ where: { jobId: id, userId: user.id } });
    if (!existing) return NextResponse.json({ success: true, message: 'Not bookmarked' });

    await prisma.jobBookmark.delete({ where: { id: existing.id } });
    return NextResponse.json({ success: true });
  } catch (e) {
    console.error('[BOOKMARK_DELETE] Error:', e);
    return NextResponse.json({ error: 'Failed to remove bookmark' }, { status: 500 });
  }
}
