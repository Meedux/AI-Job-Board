import { NextResponse } from 'next/server';
import { verifyToken } from '../../../../../../../utils/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request, { params }) {
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

    const { companyId, reviewId } = await params;
    const userId = session.user.id;
    const { voteType } = await request.json();

    if (!['helpful', 'not_helpful'].includes(voteType)) {
      return NextResponse.json({ error: 'Invalid vote type' }, { status: 400 });
    }

    // Check if user already voted on this review
    const existingVote = await prisma.reviewVote.findUnique({
      where: {
        reviewId_userId: {
          reviewId,
          userId,
        },
      },
    });

    if (existingVote) {
      // Update existing vote
      await prisma.reviewVote.update({
        where: {
          reviewId_userId: {
            reviewId,
            userId,
          },
        },
        data: {
          voteType,
        },
      });
    } else {
      // Create new vote
      await prisma.reviewVote.create({
        data: {
          reviewId,
          userId,
          voteType,
        },
      });
    }

    // Update helpful votes count on the review
    const helpfulVotes = await prisma.reviewVote.count({
      where: {
        reviewId,
        voteType: 'helpful',
      },
    });

    await prisma.companyReview.update({
      where: { id: reviewId },
      data: { helpfulVotes },
    });

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error voting on review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
