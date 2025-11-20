import { NextResponse } from 'next/server';
import { prisma } from '@/utils/db';
import { getUserFromRequest } from '@/utils/auth';
import { USER_ROLES } from '@/utils/roleSystem';

// GET: list representatives for the current employer (root account)
export async function GET(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { id: user.id }, include: { parentUser: true } });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    const ownerId = dbUser.role === USER_ROLES.SUB_USER && dbUser.parentUser ? dbUser.parentUser.id : dbUser.id;
    const reps = await prisma.authorizedRepresentative.findMany({ where: { userId: ownerId }, orderBy: { createdAt: 'desc' } });
    return NextResponse.json({ success: true, representatives: reps });
  } catch (err) {
    console.error('List reps error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST: add representative to current employer
export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { id: user.id }, include: { parentUser: true } });
    const ownerId = dbUser && dbUser.role === USER_ROLES.SUB_USER && dbUser.parentUser ? dbUser.parentUser.id : user.id;

    const body = await request.json();
    const { name, email, designation = null, phone = null } = body || {};
    if (!name || !email) return NextResponse.json({ error: 'name and email required' }, { status: 400 });

    const created = await prisma.authorizedRepresentative.create({
      data: { userId: ownerId, name, email, designation, phone }
    });
    return NextResponse.json({ success: true, representative: created });
  } catch (err) {
    console.error('Create rep error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
