import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../../utils/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function PUT(request, { params }) {
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

    const { reviewId } = await params;
    const { action, notes } = await request.json();

    if (!['approved', 'rejected'].includes(action)) {
      return NextResponse.json({ error: 'Invalid action' }, { status: 400 });
    }

    const updatedReview = await prisma.companyReview.update({
      where: { id: reviewId },
      data: {
        status: action,
        moderationNotes: notes,
        moderatedAt: new Date(),
        moderatedBy: session.user.id,
      },
    });

    return NextResponse.json({ success: true, review: updatedReview });
  } catch (error) {
    console.error('Error moderating review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
