import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../../../../utils/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request, { params }) {
  try {
    const userFromToken = getUserFromRequest(request);
    if (!userFromToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companyId, reviewId } = await params;
    const userId = userFromToken.id;
    const { reason, details } = await request.json();

    if (!reason) {
      return NextResponse.json({ error: 'Reason is required' }, { status: 400 });
    }

    const validReasons = ['spam', 'inappropriate', 'fake', 'offensive', 'other'];
    if (!validReasons.includes(reason)) {
      return NextResponse.json({ error: 'Invalid reason' }, { status: 400 });
    }

    // Check if user already reported this review
    const existingReport = await prisma.reviewReport.findUnique({
      where: {
        reviewId_userId: {
          reviewId,
          userId,
        },
      },
    });

    if (existingReport) {
      return NextResponse.json({ error: 'You have already reported this review' }, { status: 400 });
    }

    // Create the report
    await prisma.reviewReport.create({
      data: {
        reviewId,
        userId,
        reason,
        details,
        status: 'pending',
      },
    });

    // Update report count on the review
    const reportCount = await prisma.reviewReport.count({
      where: { reviewId },
    });

    await prisma.companyReview.update({
      where: { id: reviewId },
      data: { reportCount },
    });

    // If report count is high, flag the review for moderation
    if (reportCount >= 3) {
      await prisma.companyReview.update({
        where: { id: reviewId },
        data: { status: 'flagged' },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error reporting review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
