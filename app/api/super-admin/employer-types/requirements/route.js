import { NextResponse } from 'next/server';
import { prisma } from '@/utils/db';
import { getUserFromRequest } from '@/utils/auth';
import { USER_ROLES } from '@/utils/roleSystem';

// GET: list requirements (optionally filter by employerTypeId or code)
export async function GET(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== USER_ROLES.SUPER_ADMIN) {
      return NextResponse.json({ error: 'Super admin access required' }, { status: 403 });
    }
    const { searchParams } = new URL(request.url);
    const employerTypeId = searchParams.get('employerTypeId') || null;
    const employerTypeCode = searchParams.get('employerTypeCode') || null;

    let where = {};
    if (employerTypeId) where.employerTypeId = employerTypeId;
    if (employerTypeCode) {
      const et = await prisma.employerType.findUnique({ where: { code: employerTypeCode } });
      if (!et) return NextResponse.json({ error: 'Employer type not found' }, { status: 404 });
      where.employerTypeId = et.id;
    }

    const requirements = await prisma.employerTypeRequirement.findMany({
      where,
      orderBy: [{ provider: 'asc' }, { code: 'asc' }]
    });
    return NextResponse.json({ success: true, requirements });
  } catch (err) {
    console.error('List requirements error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}

// POST: create requirement
export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    if (!user || user.role !== USER_ROLES.SUPER_ADMIN) {
      return NextResponse.json({ error: 'Super admin access required' }, { status: 403 });
    }
    const body = await request.json();
    const { employerTypeId, employerTypeCode, provider, code, label, required = true, schema = null, notes = null } = body;

    let etId = employerTypeId;
    if (!etId && employerTypeCode) {
      const et = await prisma.employerType.findUnique({ where: { code: employerTypeCode } });
      if (!et) return NextResponse.json({ error: 'Employer type not found' }, { status: 404 });
      etId = et.id;
    }
    if (!etId || !provider || !code || !label) {
      return NextResponse.json({ error: 'employerTypeId/provider/code/label required' }, { status: 400 });
    }

    const created = await prisma.employerTypeRequirement.create({
      data: { employerTypeId: etId, provider, code, label, required, schema, notes }
    });
    return NextResponse.json({ success: true, requirement: created });
  } catch (err) {
    console.error('Create requirement error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
