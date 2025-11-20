import { NextResponse } from 'next/server';
import { prisma } from '@/utils/db';
import { getUserFromRequest } from '@/utils/auth';
import { USER_ROLES } from '@/utils/roleSystem';

function getOwnerId(dbUser) {
  if (!dbUser) return null;
  if (dbUser.role === USER_ROLES.SUB_USER && dbUser.parentUser) return dbUser.parentUser.id;
  return dbUser.id;
}

export async function PUT(request, { params }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const dbUser = await prisma.user.findUnique({ where: { id: user.id }, include: { parentUser: true } });
    const ownerId = getOwnerId(dbUser);

    const { id } = params;
    const body = await request.json();

    // Ensure the rep belongs to this employer
    const existing = await prisma.authorizedRepresentative.findUnique({ where: { id } });
    if (!existing || existing.userId !== ownerId) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    const updated = await prisma.authorizedRepresentative.update({ where: { id }, data: body });
    return NextResponse.json({ success: true, representative: updated });
  } catch (err) {
    console.error('Update rep error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    const dbUser = await prisma.user.findUnique({ where: { id: user.id }, include: { parentUser: true } });
    const ownerId = getOwnerId(dbUser);

    const { id } = params;
    const existing = await prisma.authorizedRepresentative.findUnique({ where: { id } });
    if (!existing || existing.userId !== ownerId) return NextResponse.json({ error: 'Not found' }, { status: 404 });

    await prisma.authorizedRepresentative.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete rep error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
