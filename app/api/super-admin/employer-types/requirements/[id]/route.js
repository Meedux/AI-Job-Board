import { NextResponse } from 'next/server';
import { prisma } from '@/utils/db';
import { getUserFromRequest } from '@/utils/auth';
import { USER_ROLES } from '@/utils/roleSystem';

export async function PUT(request, { params }) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== USER_ROLES.SUPER_ADMIN) {
      return NextResponse.json({ error: 'Super admin access required' }, { status: 403 });
    }
    const { id } = params;
    const body = await request.json();
    const updated = await prisma.employerTypeRequirement.update({ where: { id }, data: body });
    return NextResponse.json({ success: true, requirement: updated });
  } catch (err) {
    console.error('Update requirement error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

export async function DELETE(request, { params }) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== USER_ROLES.SUPER_ADMIN) {
      return NextResponse.json({ error: 'Super admin access required' }, { status: 403 });
    }
    const { id } = params;
    await prisma.employerTypeRequirement.delete({ where: { id } });
    return NextResponse.json({ success: true });
  } catch (err) {
    console.error('Delete requirement error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
