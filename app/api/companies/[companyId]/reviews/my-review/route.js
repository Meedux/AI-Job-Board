import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../../../utils/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const userFromToken = getUserFromRequest(request);
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
