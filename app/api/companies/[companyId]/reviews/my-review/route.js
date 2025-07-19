import { NextResponse } from 'next/server';
import { verifyToken } from '../../../../../../utils/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    // Get token from cookies
    const token = request.cookies.get('auth-token')?.value;

    if (!token) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Verify token
    const userFromToken = verifyToken(token);
    if (!userFromToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companyId } = await params;
    const userId = userFromToken.id;

    const review = await prisma.companyReview.findUnique({
      where: {
        companyId_userId: {
          companyId,
          userId,
        },
      },
    });

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Error fetching user review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
