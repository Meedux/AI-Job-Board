import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../utils/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request) {
  try {
    // Verify user authentication
    const user = getUserFromRequest(request);
    if (!user) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if user is admin
    if (user.role !== 'admin') {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 });
    }

    const reports = await prisma.reviewReport.findMany({
      include: {
        review: {
          include: {
            company: {
              select: {
                id: true,
                name: true,
              },
            },
            user: {
              select: {
                id: true,
                fullName: true,
              },
            },
          },
        },
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    return NextResponse.json(reports);
  } catch (error) {
    console.error('Error fetching reports for admin:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
