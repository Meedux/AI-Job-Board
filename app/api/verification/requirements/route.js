import { NextResponse } from 'next/server';
import { prisma } from '@/utils/db';
import { getUserFromRequest } from '@/utils/auth';

// GET: returns required documents for the current user's employer type
export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

    const dbUser = await prisma.user.findUnique({ where: { id: user.id }, include: { employerTypeUser: true } });
    if (!dbUser) return NextResponse.json({ error: 'User not found' }, { status: 404 });

    // Determine employer type by user's employerTypeId
    if (!dbUser.employerTypeId) {
      return NextResponse.json({ success: true, employerType: null, requirements: [] });
    }

    const reqs = await prisma.employerTypeRequirement.findMany({
      where: { employerTypeId: dbUser.employerTypeId },
      orderBy: [{ provider: 'asc' }, { code: 'asc' }]
    });

    return NextResponse.json({ success: true, employerType: dbUser.employerTypeUser, requirements: reqs });
  } catch (err) {
    console.error('Fetch verification requirements error', err);
    return NextResponse.json({ error: 'Server error' }, { status: 500 });
  }
}
