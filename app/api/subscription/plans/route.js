// API Route: /api/subscription/plans - Enhanced for Freemium Job Posting
import { NextResponse } from 'next/server';
import { PrismaClient } from '@prisma/client';
import { getUserFromRequest } from '@/utils/auth';
import { initializeDefaultPlans, createSubscriptionPayment } from '@/utils/newSubscriptionService';

const prisma = new PrismaClient();

export async function GET(request) {
  console.log('📋 GET /api/subscription/plans - Fetching subscription plans');
  
  try {
    // Initialize default plans if none exist
    const planCount = await prisma.subscriptionPlan.count();
    if (planCount === 0) {
      console.log('🔄 No plans found, initializing default plans...');
      await initializeDefaultPlans();
    }
    
    const plans = await prisma.subscriptionPlan.findMany({
      where: {
        isActive: true
      },
      orderBy: {
        priceMonthly: 'asc'
      }
    });

    console.log(`✅ Found ${plans.length} active subscription plans`);

    // Transform the plans to match the expected field names
    const transformedPlans = plans.map(plan => ({
      id: plan.id,
      name: plan.name,
      description: plan.description,
      plan_type: plan.planType,
      price_monthly: plan.priceMonthly,
      price_yearly: plan.priceYearly,
      currency: plan.currency,
      features: plan.features,
      // Enhanced limits for freemium model
      max_job_postings: plan.maxJobPostings,
      max_featured_jobs: plan.maxFeaturedJobs,
      max_resume_views: plan.maxResumeViews,
      max_direct_applications: plan.maxDirectApplications,
      max_ai_credits: plan.maxAiCredits,
      max_ai_job_matches: plan.maxAiJobMatches,
      priority_support: plan.prioritySupport,
      advanced_analytics: plan.advancedAnalytics,
      custom_branding: plan.customBranding,
      is_active: plan.isActive,
      trial_days: plan.trialDays,
      created_at: plan.createdAt,
      updated_at: plan.updatedAt
    }));

    return NextResponse.json({
      success: true,
      plans: transformedPlans
    });
  } catch (error) {
    console.error('❌ Error fetching subscription plans:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch subscription plans' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  console.log('� POST /api/subscription/plans - Creating subscription payment');
  
  try {
    const { planId, billingCycle = 'monthly' } = await request.json();

    // Get user ID from session
    const user = getUserFromRequest(request);
    if (!user) {
      console.log('❌ Unauthorized access attempt');
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = user.id || user.uid;
    console.log('� Creating subscription payment:', {
      userId,
      planId,
      billingCycle
    });

    // Use subscription service to handle both free and paid plans
    const result = await createSubscriptionPayment(userId, planId, billingCycle);

    if (result.isFree) {
      // Free subscription
      console.log('✅ Free subscription created:', result.subscription.id);
      return NextResponse.json({
        success: true,
        subscription: result.subscription,
        requiresPayment: false,
        message: 'Free subscription activated successfully'
      });
    } else {
      // Paid subscription - return payment intent
      console.log('✅ Payment intent created:', result.paymentIntent.id);
      return NextResponse.json({
        success: true,
        paymentIntent: {
          id: result.paymentIntent.id,
          client_key: result.paymentIntent.attributes.client_key,
          amount: result.paymentIntent.attributes.amount,
          currency: result.paymentIntent.attributes.currency,
          status: result.paymentIntent.attributes.status
        },
        transaction: result.transaction,
        requiresPayment: true
      });
    }
  } catch (error) {
    console.error('❌ Error creating subscription payment:', error);
    return NextResponse.json(
      { error: error.message || 'Failed to create subscription payment' },
      { status: 500 }
    );
  }
}
