// API Route: /api/subscription/status - Enhanced for Freemium Job Posting
import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/utils/auth';
import { getUserSubscription, checkUserUsageLimits } from '@/utils/newSubscriptionService';

export async function GET(request) {
  console.log('📋 GET /api/subscription/status - Fetching user subscription status');
  
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      console.log('❌ Unauthorized access attempt');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const userId = user.id || user.uid;
    console.log('🔍 Fetching subscription for user:', userId);

    // Get user's current subscription
    const subscription = await getUserSubscription(userId);
    
    if (!subscription) {
      console.log('ℹ️ No subscription found for user (treating as free tier):', userId);

      // Return a default 'free' subscription representation instead of 404
      const defaultUsage = {
        jobPostings: { used: 0, limit: 3 },
        resumeViews: { used: 0, limit: 10 },
        directApplications: { used: 0, limit: 50 },
        aiCredits: { used: 0, limit: 0 }
      };

      return NextResponse.json({
        success: true,
        subscription: {
          id: null,
          userId: userId,
          plan: 'free',
          status: 'active',
          currentPeriodStart: null,
          currentPeriodEnd: null,
          trialEnd: null,
          canceledAt: null,
          usage: defaultUsage,
          createdAt: null,
          updatedAt: null
        }
      });
    }

    // Get current usage limits
    const usageLimits = await Promise.all([
      checkUserUsageLimits(userId, 'job_posting'),
      checkUserUsageLimits(userId, 'resume_view'),
      checkUserUsageLimits(userId, 'direct_application'),
      checkUserUsageLimits(userId, 'ai_usage')
    ]);

    const [jobPostingUsage, resumeViewUsage, directApplicationUsage, aiUsage] = usageLimits;

    console.log('✅ Successfully fetched subscription status for user:', userId);

    return NextResponse.json({
      success: true,
      subscription: {
        id: subscription.id,
        userId: subscription.userId,
        plan: subscription.plan,
        status: subscription.status,
        currentPeriodStart: subscription.currentPeriodStart,
        currentPeriodEnd: subscription.currentPeriodEnd,
        trialEnd: subscription.trialEnd,
        canceledAt: subscription.canceledAt,
        // Usage tracking
        usage: {
          jobPostings: jobPostingUsage,
          resumeViews: resumeViewUsage,
          directApplications: directApplicationUsage,
          aiCredits: aiUsage
        },
        createdAt: subscription.createdAt,
        updatedAt: subscription.updatedAt
      }
    });
  } catch (error) {
    console.error('❌ Error fetching subscription status:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscription status' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  console.log('🗑️ DELETE /api/subscription/status - Canceling subscription');
  
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      console.log('❌ Unauthorized access attempt');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { PrismaClient } = await import('@prisma/client');
    const prisma = new PrismaClient();

    const userId = user.id || user.uid;
    console.log('🔄 Canceling subscription for user:', userId);

    // Cancel subscription
    await prisma.userSubscription.updateMany({
      where: {
        userId: userId,
        status: 'active'
      },
      data: {
        status: 'canceled',
        canceledAt: new Date()
      }
    });

    console.log('✅ Successfully canceled subscription for user:', userId);

    return NextResponse.json({
      success: true,
      message: 'Subscription canceled successfully'
    });
  } catch (error) {
    console.error('❌ Error canceling subscription:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to cancel subscription' },
      { status: 500 }
    );
  }
}
