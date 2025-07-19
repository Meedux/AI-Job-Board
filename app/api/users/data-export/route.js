import { NextResponse } from 'next/server';
import { verifyToken } from '../../../../utils/auth';

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

export async function POST(request) {
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

    const userId = userFromToken.id;

    // Fetch all user data
    const userData = await prisma.user.findUnique({
      where: { id: userId },
      include: {
        postedJobs: true,
        applications: {
          include: {
            job: {
              include: {
                company: true,
              },
            },
          },
        },
        subscriptions: {
          include: {
            plan: true,
          },
        },
        credits: true,
        transactions: true,
        activities: true,
        preferences: true,
        notificationSettings: true,
        companyReviews: {
          include: {
            company: true,
          },
        },
        reviewReports: true,
        reviewVotes: true,
        deletionRequests: true,
        dataProcessingLogs: true,
      },
    });

    if (!userData) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    // Remove sensitive fields
    const exportData = {
      ...userData,
      password: undefined, // Remove password hash
      id: undefined, // Remove internal ID
      createdAt: userData.createdAt?.toISOString(),
      updatedAt: userData.updatedAt?.toISOString(),
      dateOfBirth: userData.dateOfBirth?.toISOString(),
      applications: userData.applications.map(app => ({
        ...app,
        appliedAt: app.appliedAt?.toISOString(),
        createdAt: app.createdAt?.toISOString(),
        updatedAt: app.updatedAt?.toISOString(),
        job: {
          ...app.job,
          postedAt: app.job.postedAt?.toISOString(),
          expiresAt: app.job.expiresAt?.toISOString(),
          createdAt: app.job.createdAt?.toISOString(),
          updatedAt: app.job.updatedAt?.toISOString(),
        },
      })),
      subscriptions: userData.subscriptions.map(sub => ({
        ...sub,
        currentPeriodStart: sub.currentPeriodStart?.toISOString(),
        currentPeriodEnd: sub.currentPeriodEnd?.toISOString(),
        trialEnd: sub.trialEnd?.toISOString(),
        canceledAt: sub.canceledAt?.toISOString(),
        lastResetAt: sub.lastResetAt?.toISOString(),
        createdAt: sub.createdAt?.toISOString(),
        updatedAt: sub.updatedAt?.toISOString(),
      })),
      credits: userData.credits.map(credit => ({
        ...credit,
        lastUsedAt: credit.lastUsedAt?.toISOString(),
        expiresAt: credit.expiresAt?.toISOString(),
        createdAt: credit.createdAt?.toISOString(),
        updatedAt: credit.updatedAt?.toISOString(),
      })),
      transactions: userData.transactions.map(trans => ({
        ...trans,
        refundedAt: trans.refundedAt?.toISOString(),
        createdAt: trans.createdAt?.toISOString(),
        updatedAt: trans.updatedAt?.toISOString(),
      })),
      activities: userData.activities.map(activity => ({
        ...activity,
        createdAt: activity.createdAt?.toISOString(),
      })),
      preferences: userData.preferences ? {
        ...userData.preferences,
        createdAt: userData.preferences.createdAt?.toISOString(),
        updatedAt: userData.preferences.updatedAt?.toISOString(),
      } : null,
      notificationSettings: userData.notificationSettings ? {
        ...userData.notificationSettings,
        createdAt: userData.notificationSettings.createdAt?.toISOString(),
        updatedAt: userData.notificationSettings.updatedAt?.toISOString(),
      } : null,
      companyReviews: userData.companyReviews.map(review => ({
        ...review,
        moderatedAt: review.moderatedAt?.toISOString(),
        createdAt: review.createdAt?.toISOString(),
        updatedAt: review.updatedAt?.toISOString(),
      })),
      reviewReports: userData.reviewReports.map(report => ({
        ...report,
        createdAt: report.createdAt?.toISOString(),
      })),
      reviewVotes: userData.reviewVotes.map(vote => ({
        ...vote,
        createdAt: vote.createdAt?.toISOString(),
      })),
      deletionRequests: userData.deletionRequests.map(req => ({
        ...req,
        requestedAt: req.requestedAt?.toISOString(),
        processedAt: req.processedAt?.toISOString(),
        finalDeletionDate: req.finalDeletionDate?.toISOString(),
        createdAt: req.createdAt?.toISOString(),
        updatedAt: req.updatedAt?.toISOString(),
      })),
      dataProcessingLogs: userData.dataProcessingLogs.map(log => ({
        ...log,
        createdAt: log.createdAt?.toISOString(),
      })),
      exportedAt: new Date().toISOString(),
    };

    // Log the data export
    await prisma.dataProcessingLog.create({
      data: {
        userId,
        action: 'data_export',
        details: { exportSize: JSON.stringify(exportData).length },
        ipAddress: request.headers.get('x-forwarded-for') || request.headers.get('x-real-ip') || 'unknown',
        userAgent: request.headers.get('user-agent'),
      },
    });

    // Create JSON blob and return as download
    const jsonData = JSON.stringify(exportData, null, 2);
    
    return new NextResponse(jsonData, {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Content-Disposition': `attachment; filename="${userData.email}-data-export.json"`,
      },
    });
  } catch (error) {
    console.error('Error exporting data:', error);
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 });
  }
}
