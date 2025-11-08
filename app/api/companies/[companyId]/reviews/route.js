import { NextResponse } from 'next/server';
import { getUserFromRequest } from '../../../../../utils/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function GET(request, { params }) {
  try {
    const { companyId } = await params;

    // Get reviews with user data (for non-anonymous reviews)
    const reviews = await prisma.companyReview.findMany({
      where: {
        companyId,
        status: 'approved',
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            nickname: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    });

    // Calculate average ratings
    const totalReviews = reviews.length;
    const averageRatings = {
      overall: 0,
      compensation: 0,
      culture: 0,
      management: 0,
      workLifeBalance: 0,
      totalReviews,
    };

    if (totalReviews > 0) {
      averageRatings.overall = reviews.reduce((sum, review) => sum + review.overallRating, 0) / totalReviews;
      averageRatings.compensation = reviews.reduce((sum, review) => sum + review.compensationRating, 0) / totalReviews;
      averageRatings.culture = reviews.reduce((sum, review) => sum + review.cultureRating, 0) / totalReviews;
      averageRatings.management = reviews.reduce((sum, review) => sum + review.managementRating, 0) / totalReviews;
      averageRatings.workLifeBalance = reviews.reduce((sum, review) => sum + review.workLifeBalanceRating, 0) / totalReviews;
    }

    return NextResponse.json({
      reviews,
      averageRatings,
    });
  } catch (error) {
    console.error('Error fetching company reviews:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}

export async function POST(request, { params }) {
  try {
    const userFromToken = getUserFromRequest(request);
    if (!userFromToken) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { companyId } = await params;
    const userId = userFromToken.id;

    const {
      overallRating,
      compensationRating,
      cultureRating,
      managementRating,
      workLifeBalanceRating,
      title,
      comment,
      pros,
      cons,
      position,
      employmentType,
      employmentStatus,
      workDuration,
      isAnonymous,
    } = await request.json();

    // Validate required fields
    if (!overallRating || !compensationRating || !cultureRating || !managementRating || !workLifeBalanceRating) {
      return NextResponse.json({ error: 'All ratings are required' }, { status: 400 });
    }

    // Check if user already has a review for this company
    const existingReview = await prisma.companyReview.findUnique({
      where: {
        companyId_userId: {
          companyId,
          userId,
        },
      },
    });

    if (existingReview) {
      return NextResponse.json({ error: 'You have already reviewed this company' }, { status: 400 });
    }

    // Create the review
    const review = await prisma.companyReview.create({
      data: {
        companyId,
        userId,
        overallRating,
        compensationRating,
        cultureRating,
        managementRating,
        workLifeBalanceRating,
        title,
        comment,
        pros,
        cons,
        position,
        employmentType,
        employmentStatus,
        workDuration,
        isAnonymous,
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        status: 'pending', // Reviews need moderation
      },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            nickname: true,
          },
        },
      },
    });

    return NextResponse.json({ review });
  } catch (error) {
    console.error('Error creating company review:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
