// Enhanced Subscription Service for Freemium Job Posting Site
import { prisma } from './db.js';
import { createPaymentIntent, retrievePaymentIntent } from './paymongo.js';

/**
 * Default Subscription Plans for Freemium Job Posting Site
 */
export const DEFAULT_SUBSCRIPTION_PLANS = {
  FREE: {
    name: 'Free',
    description: 'Basic job posting with limited features',
    planType: 'free',
    priceMonthly: 0,
    priceYearly: 0,
    features: {
      jobSearch: true,
      basicFilters: true,
      jobPostingAccess: true,
      resumeSearchAccess: true
    },
    maxJobPostings: 1, // 1 job posting per month
    maxFeaturedJobs: 0,
    maxResumeViews: 5, // 5 resume views per month
    maxDirectApplications: 10, // 10 direct applications per month
    maxAiCredits: 0,
    maxAiJobMatches: 0,
    prioritySupport: false,
    advancedAnalytics: false,
    customBranding: false,
    trialDays: 0
  },
  BASIC: {
    name: 'Basic',
    description: 'Enhanced job posting with more features',
    planType: 'basic',
    priceMonthly: 299,
    priceYearly: 2990, // 2 months free
    features: {
      jobSearch: true,
      advancedFilters: true,
      jobPostingAccess: true,
      resumeSearchAccess: true,
      basicAnalytics: true
    },
    maxJobPostings: 5,
    maxFeaturedJobs: 1,
    maxResumeViews: 50,
    maxDirectApplications: 100,
    maxAiCredits: 10,
    maxAiJobMatches: 20,
    prioritySupport: false,
    advancedAnalytics: false,
    customBranding: false,
    trialDays: 7
  },
  PREMIUM: {
    name: 'Premium',
    description: 'Full-featured plan with AI capabilities',
    planType: 'premium',
    priceMonthly: 599,
    priceYearly: 5990, // 2 months free
    features: {
      jobSearch: true,
      advancedFilters: true,
      jobPostingAccess: true,
      resumeSearchAccess: true,
      aiJobMatching: true,
      prioritySupport: true,
      advancedAnalytics: true
    },
    maxJobPostings: 25,
    maxFeaturedJobs: 5,
    maxResumeViews: 200,
    maxDirectApplications: 500,
    maxAiCredits: 50,
    maxAiJobMatches: 100,
    prioritySupport: true,
    advancedAnalytics: true,
    customBranding: false,
    trialDays: 14
  },
  ENTERPRISE: {
    name: 'Enterprise',
    description: 'Unlimited access for large organizations',
    planType: 'enterprise',
    priceMonthly: 999,
    priceYearly: 9990, // 2 months free
    features: {
      jobSearch: true,
      advancedFilters: true,
      jobPostingAccess: true,
      resumeSearchAccess: true,
      aiJobMatching: true,
      prioritySupport: true,
      advancedAnalytics: true,
      customBranding: true,
      teamManagement: true
    },
    maxJobPostings: 0, // unlimited
    maxFeaturedJobs: 0, // unlimited
    maxResumeViews: 0, // unlimited
    maxDirectApplications: 0, // unlimited
    maxAiCredits: 0, // unlimited
    maxAiJobMatches: 0, // unlimited
    prioritySupport: true,
    advancedAnalytics: true,
    customBranding: true,
    trialDays: 30
  }
};

/**
 * Credit Package Options
 */
export const DEFAULT_CREDIT_PACKAGES = {
  RESUME_CONTACT: [
    {
      name: 'Resume Contact Starter',
      description: 'View 25 resume contacts',
      creditType: 'resume_contact',
      creditAmount: 25,
      price: 199,
      bonusCredits: 5,
      validityDays: 90
    },
    {
      name: 'Resume Contact Pro',
      description: 'View 100 resume contacts',
      creditType: 'resume_contact',
      creditAmount: 100,
      price: 599,
      bonusCredits: 25,
      validityDays: 180
    },
    {
      name: 'Resume Contact Enterprise',
      description: 'View 500 resume contacts',
      creditType: 'resume_contact',
      creditAmount: 500,
      price: 2499,
      bonusCredits: 100,
      validityDays: 365
    }
  ],
  AI_CREDIT: [
    {
      name: 'AI Credit Starter',
      description: '20 AI analysis credits',
      creditType: 'ai_credit',
      creditAmount: 20,
      price: 149,
      bonusCredits: 5,
      validityDays: 90
    },
    {
      name: 'AI Credit Pro',
      description: '100 AI analysis credits',
      creditType: 'ai_credit',
      creditAmount: 100,
      price: 599,
      bonusCredits: 25,
      validityDays: 180
    },
    {
      name: 'AI Credit Enterprise',
      description: '500 AI analysis credits',
      creditType: 'ai_credit',
      creditAmount: 500,
      price: 1999,
      bonusCredits: 100,
      validityDays: 365
    }
  ],
  BUNDLE: [
    {
      name: 'Job Seeker Bundle',
      description: 'Resume contacts + AI credits bundle',
      creditType: 'bundle',
      creditAmount: 1,
      price: 399,
      bonusCredits: 0,
      validityDays: 120,
      bundleConfig: {
        resume_contact: 50,
        ai_credit: 20
      }
    },
    {
      name: 'Professional Bundle',
      description: 'Enhanced bundle for active job seekers',
      creditType: 'bundle',
      creditAmount: 1,
      price: 899,
      bonusCredits: 0,
      validityDays: 180,
      bundleConfig: {
        resume_contact: 150,
        ai_credit: 75
      }
    },
    {
      name: 'Ultimate Bundle',
      description: 'Complete package for serious job seekers',
      creditType: 'bundle',
      creditAmount: 1,
      price: 1899,
      bonusCredits: 0,
      validityDays: 365,
      bundleConfig: {
        resume_contact: 400,
        ai_credit: 200
      }
    }
  ]
};

/**
 * Initialize default subscription plans
 */
export async function initializeDefaultPlans() {
  console.log('🔄 Initializing default subscription plans...');
  
  try {
    for (const planData of Object.values(DEFAULT_SUBSCRIPTION_PLANS)) {
      await prisma.subscriptionPlan.upsert({
        where: { planType: planData.planType },
        update: {
          ...planData,
          features: planData.features,
          updatedAt: new Date()
        },
        create: {
          ...planData,
          features: planData.features
        }
      });
    }
    
    console.log('✅ Default subscription plans initialized');
  } catch (error) {
    console.error('❌ Error initializing default plans:', error);
    throw error;
  }
}

/**
 * Initialize default credit packages
 */
export async function initializeDefaultCreditPackages() {
  console.log('🔄 Initializing default credit packages...');
  
  try {
    for (const packageCategory of Object.values(DEFAULT_CREDIT_PACKAGES)) {
      for (const packageData of packageCategory) {
        await prisma.creditPackage.upsert({
          where: { 
            name: packageData.name
          },
          update: {
            ...packageData,
            bundleConfig: packageData.bundleConfig || null,
            updatedAt: new Date()
          },
          create: {
            ...packageData,
            bundleConfig: packageData.bundleConfig || null
          }
        });
      }
    }
    
    console.log('✅ Default credit packages initialized');
  } catch (error) {
    console.error('❌ Error initializing default credit packages:', error);
    throw error;
  }
}

/**
 * Get user's current subscription
 */
export async function getUserSubscription(userId) {
  console.log('📋 Getting user subscription for:', userId);
  
  try {
    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId: userId,
        status: 'active'
      },
      include: {
        plan: true
      },
      orderBy: {
        createdAt: 'desc'
      }
    });
    
    if (!subscription) {
      // Create free subscription if none exists
      const freePlan = await prisma.subscriptionPlan.findFirst({
        where: { planType: 'free' }
      });
      
      if (freePlan) {
        const newSubscription = await prisma.userSubscription.create({
          data: {
            userId: userId,
            planId: freePlan.id,
            currentPeriodStart: new Date(),
            currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
            status: 'active'
          },
          include: {
            plan: true
          }
        });
        
        console.log('✅ Created free subscription for user:', userId);
        return newSubscription;
      }
    }
    
    return subscription;
  } catch (error) {
    console.error('❌ Error getting user subscription:', error);
    throw error;
  }
}

/**
 * Check if user has exceeded their monthly limits
 */
export async function checkUserUsageLimits(userId, activityType) {
  console.log('🔍 Checking usage limits for user:', userId, 'activity:', activityType);
  
  try {
    const subscription = await getUserSubscription(userId);
    if (!subscription) {
      throw new Error('No active subscription found');
    }
    
    const currentMonth = new Date().getMonth() + 1;
    const currentYear = new Date().getFullYear();
    
    // Get or create user activity record
    let activity = await prisma.userActivity.findUnique({
      where: {
        userId_activityType_month_year: {
          userId: userId,
          activityType: activityType,
          month: currentMonth,
          year: currentYear
        }
      }
    });
    
    if (!activity) {
      activity = await prisma.userActivity.create({
        data: {
          userId: userId,
          activityType: activityType,
          month: currentMonth,
          year: currentYear,
          creditsUsed: 0
        }
      });
    }
    
    // Check limits based on activity type
    let limit = 0;
    switch (activityType) {
      case 'resume_view':
        limit = subscription.plan.maxResumeViews;
        break;
      case 'direct_application':
        limit = subscription.plan.maxDirectApplications;
        break;
      case 'ai_usage':
        limit = subscription.plan.maxAiCredits;
        break;
      case 'job_posting':
        limit = subscription.plan.maxJobPostings;
        break;
    }
    
    const hasLimit = limit > 0;
    const withinLimit = !hasLimit || activity.creditsUsed < limit;
    
    return {
      hasLimit,
      limit,
      used: activity.creditsUsed,
      remaining: hasLimit ? Math.max(0, limit - activity.creditsUsed) : 'unlimited',
      withinLimit,
      activity
    };
  } catch (error) {
    console.error('❌ Error checking usage limits:', error);
    throw error;
  }
}

/**
 * Use a credit (subscription limit or actual credit)
 */
export async function useCredit(userId, creditType, amount = 1) {
  console.log('💳 Using credit for user:', userId, 'type:', creditType, 'amount:', amount);
  
  try {
    // Check subscription limits first
    const activityType = creditType === 'resume_contact' ? 'resume_view' : 
                        creditType === 'ai_credit' ? 'ai_usage' : creditType;
    
    const usageCheck = await checkUserUsageLimits(userId, activityType);
    
    if (!usageCheck.withinLimit) {
      // Try to use actual credits
      const creditUsed = await useUserCredits(userId, creditType, amount);
      if (!creditUsed) {
        throw new Error(`Credit limit exceeded for ${creditType}`);
      }
      return { success: true, source: 'credit' };
    }
    
    // Use subscription allowance
    await prisma.userActivity.update({
      where: {
        id: usageCheck.activity.id
      },
      data: {
        creditsUsed: usageCheck.activity.creditsUsed + amount
      }
    });
    
    return { success: true, source: 'subscription' };
  } catch (error) {
    console.error('❌ Error using credit:', error);
    throw error;
  }
}

/**
 * Get user's credit balance
 */
export async function getUserCredits(userId) {
  console.log('💰 Getting user credits for:', userId);
  
  try {
    const credits = await prisma.userCredit.findMany({
      where: { userId }
    });
    
    return credits.reduce((acc, credit) => {
      acc[credit.creditType] = {
        balance: credit.balance,
        used: credit.usedCredits,
        total: credit.totalPurchased,
        expiresAt: credit.expiresAt
      };
      return acc;
    }, {});
  } catch (error) {
    console.error('❌ Error getting user credits:', error);
    throw error;
  }
}

/**
 * Use actual user credits
 */
export async function useUserCredits(userId, creditType, amount = 1) {
  console.log('🎯 Using user credits:', userId, creditType, amount);
  
  try {
    const userCredit = await prisma.userCredit.findUnique({
      where: {
        userId_creditType: { userId, creditType }
      }
    });
    
    if (!userCredit || userCredit.balance < amount) {
      return false;
    }
    
    await prisma.userCredit.update({
      where: {
        userId_creditType: { userId, creditType }
      },
      data: {
        balance: userCredit.balance - amount,
        usedCredits: userCredit.usedCredits + amount,
        lastUsedAt: new Date()
      }
    });
    
    return true;
  } catch (error) {
    console.error('❌ Error using user credits:', error);
    throw error;
  }
}

/**
 * Add credits to user account
 */
export async function addUserCredits(userId, creditType, amount, expiresAt = null) {
  console.log('➕ Adding user credits:', { userId, creditType, amount, expiresAt });
  
  try {
    // Validate inputs
    if (!userId || typeof userId !== 'string') {
      throw new Error('Invalid userId provided');
    }
    
    if (!creditType || typeof creditType !== 'string') {
      throw new Error('Invalid creditType provided');
    }
    
    if (!amount || typeof amount !== 'number' || amount <= 0) {
      throw new Error('Invalid amount provided');
    }
    
    // Check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true }
    });
    
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }
    
    console.log('👤 User found:', user.email);
    
    // Check if user credits record exists
    const existingCredits = await prisma.userCredit.findUnique({
      where: {
        userId_creditType: { userId, creditType }
      }
    });
    
    console.log('📋 Existing credits:', existingCredits ? {
      balance: existingCredits.balance,
      totalPurchased: existingCredits.totalPurchased,
      expiresAt: existingCredits.expiresAt
    } : 'NOT FOUND');
    
    // Upsert user credits
    const result = await prisma.userCredit.upsert({
      where: {
        userId_creditType: { userId, creditType }
      },
      update: {
        balance: { increment: amount },
        totalPurchased: { increment: amount },
        expiresAt: expiresAt || undefined,
        updatedAt: new Date()
      },
      create: {
        userId,
        creditType,
        balance: amount,
        totalPurchased: amount,
        expiresAt,
        createdAt: new Date(),
        updatedAt: new Date()
      }
    });
    
    console.log('✅ User credits updated successfully:', {
      userId: result.userId,
      creditType: result.creditType,
      balance: result.balance,
      totalPurchased: result.totalPurchased,
      expiresAt: result.expiresAt
    });
    
    return result;
  } catch (error) {
    console.error('❌ Error adding user credits:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
    throw error;
  }
}

/**
 * Create subscription payment
 */
export async function createSubscriptionPayment(userId, planId, billingCycle = 'monthly') {
  console.log('💳 Creating subscription payment for user:', userId, 'plan:', planId);
  
  try {
    // First, check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }
    
    console.log('👤 User found:', user.email);
    
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    });
    
    if (!plan) {
      throw new Error('Subscription plan not found');
    }
    
    console.log('📋 Plan found:', plan.name);
    
    const amount = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;
    
    if (amount <= 0) {
      // Handle free plan
      return await createFreeSubscription(userId, planId);
    }
    
    // Create payment intent
    const paymentIntent = await createPaymentIntent(
      Number(amount),
      'PHP',
      `${plan.name} Subscription - ${billingCycle}`,
      { userId, planId, billingCycle }
    );
    
    console.log('💰 Payment intent created:', paymentIntent.id);
    
    // Create transaction record
    const transaction = await prisma.paymentTransaction.create({
      data: {
        userId,
        paymentIntentId: paymentIntent.id,
        amount,
        currency: 'PHP',
        status: 'pending',
        transactionType: 'subscription',
        relatedId: planId,
        description: `${plan.name} Subscription - ${billingCycle}`,
        paymongoData: paymentIntent
      }
    });
    
    console.log('✅ Transaction created:', transaction.id);
    
    return {
      success: true,
      paymentIntent,
      transaction
    };
  } catch (error) {
    console.error('❌ Error creating subscription payment:', error);
    throw error;
  }
}

/**
 * Create free subscription
 */
async function createFreeSubscription(userId, planId) {
  console.log('🆓 Creating free subscription for user:', userId);
  
  try {
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    });
    
    // Cancel existing subscription
    await prisma.userSubscription.updateMany({
      where: {
        userId,
        status: 'active'
      },
      data: {
        status: 'canceled',
        canceledAt: new Date()
      }
    });
    
    // Create new subscription
    const subscription = await prisma.userSubscription.create({
      data: {
        userId,
        planId,
        currentPeriodStart: new Date(),
        currentPeriodEnd: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 year
        status: 'active'
      },
      include: {
        plan: true
      }
    });
    
    return {
      success: true,
      subscription,
      isFree: true
    };
  } catch (error) {
    console.error('❌ Error creating free subscription:', error);
    throw error;
  }
}

/**
 * Create credit package payment
 */
export async function createCreditPackagePayment(userId, packageId) {
  console.log('💳 Creating credit package payment for user:', userId, 'package:', packageId);
  
  try {
    // First, check if user exists
    const user = await prisma.user.findUnique({
      where: { id: userId }
    });
    
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }
    
    console.log('👤 User found:', user.email);
    
    const creditPackage = await prisma.creditPackage.findUnique({
      where: { id: packageId }
    });
    
    if (!creditPackage) {
      throw new Error('Credit package not found');
    }
    
    console.log('📦 Credit package found:', creditPackage.name);
    
    const paymentIntent = await createPaymentIntent(
      Number(creditPackage.price),
      'PHP',
      `${creditPackage.name} - Credit Package`,
      { userId, packageId }
    );
    
    console.log('💰 Payment intent created:', paymentIntent.id);
    
    const transaction = await prisma.paymentTransaction.create({
      data: {
        userId,
        paymentIntentId: paymentIntent.id,
        amount: creditPackage.price,
        currency: 'PHP',
        status: 'pending',
        transactionType: 'credit_purchase',
        relatedId: packageId,
        description: `${creditPackage.name} - Credit Package`,
        paymongoData: paymentIntent
      }
    });
    
    console.log('✅ Transaction created:', transaction.id);
    
    return {
      success: true,
      paymentIntent,
      transaction
    };
  } catch (error) {
    console.error('❌ Error creating credit package payment:', error);
    throw error;
  }
}

/**
 * Process successful payment
 */
export async function processSuccessfulPayment(paymentIntentId) {
  console.log('✅ Processing successful payment:', paymentIntentId);
  
  try {
    // Find the transaction record
    const transaction = await prisma.paymentTransaction.findFirst({
      where: { paymentIntentId },
      include: {
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });
    
    console.log('📋 Found transaction:', transaction ? {
      id: transaction.id,
      userId: transaction.userId,
      userEmail: transaction.user?.email,
      transactionType: transaction.transactionType,
      relatedId: transaction.relatedId,
      amount: transaction.amount,
      status: transaction.status
    } : 'NOT FOUND');
    
    if (!transaction) {
      console.error('❌ Transaction not found for payment intent:', paymentIntentId);
      throw new Error(`Transaction not found for payment intent: ${paymentIntentId}`);
    }
    
    // Update transaction status first
    console.log('🔄 Updating transaction status to succeeded');
    await prisma.paymentTransaction.update({
      where: { id: transaction.id },
      data: { 
        status: 'succeeded',
        updatedAt: new Date()
      }
    });
    
    console.log('✅ Transaction status updated to succeeded');
    
    // Process based on transaction type
    if (transaction.transactionType === 'subscription') {
      console.log('🔄 Processing subscription activation for user:', transaction.userId);
      const result = await activateSubscription(transaction.userId, transaction.relatedId);
      console.log('✅ Subscription activation result:', result);
      return {
        success: true,
        userId: transaction.userId,
        subscription: result.subscription,
        transactionId: transaction.id
      };
    } else if (transaction.transactionType === 'credit_purchase') {
      console.log('🔄 Processing credit package activation for user:', transaction.userId);
      const result = await activateCreditPackage(transaction.userId, transaction.relatedId);
      console.log('✅ Credit package activation result:', result);
      return {
        success: true,
        userId: transaction.userId,
        creditPackage: result.creditPackage,
        transactionId: transaction.id
      };
    } else {
      console.error('❌ Unknown transaction type:', transaction.transactionType);
      throw new Error(`Unknown transaction type: ${transaction.transactionType}`);
    }
    
  } catch (error) {
    console.error('❌ Error processing successful payment:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    // Update transaction status to failed
    try {
      await prisma.paymentTransaction.updateMany({
        where: { paymentIntentId },
        data: { 
          status: 'failed',
          updatedAt: new Date()
        }
      });
      console.log('🔄 Updated transaction status to failed due to processing error');
    } catch (updateError) {
      console.error('❌ Failed to update transaction status:', updateError);
    }
    
    throw error;
  }
}

/**
 * Activate subscription after payment
 */
async function activateSubscription(userId, planId) {
  console.log('🔄 Activating subscription for user:', userId, 'plan:', planId);
  
  try {
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true }
    });
    
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }
    
    console.log('👤 User found:', user.email);
    
    // Get the subscription plan
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    });
    
    if (!plan) {
      throw new Error(`Subscription plan not found: ${planId}`);
    }
    
    console.log('📋 Plan found:', plan.name);
    
    // Search for existing user subscriptions
    console.log('� Searching for existing user subscriptions');
    const existingSubscriptions = await prisma.userSubscription.findMany({
      where: {
        userId,
        status: {
          in: ['active', 'trial', 'canceled'] // Include all statuses that should be replaced
        }
      },
      include: {
        plan: {
          select: {
            name: true,
            planType: true
          }
        }
      }
    });
    
    console.log('📋 Found existing subscriptions:', existingSubscriptions.length);
    
    // Delete existing subscriptions
    if (existingSubscriptions.length > 0) {
      console.log('🗑️ Deleting existing subscriptions');
      
      // Log what we're deleting
      existingSubscriptions.forEach(sub => {
        console.log(`🗑️ Deleting subscription: ${sub.id} (${sub.plan.name}, status: ${sub.status})`);
      });
      
      const deleteResult = await prisma.userSubscription.deleteMany({
        where: {
          userId,
          status: {
            in: ['active', 'trial', 'canceled']
          }
        }
      });
      
      console.log('✅ Deleted subscriptions count:', deleteResult.count);
    } else {
      console.log('ℹ️ No existing subscriptions found to delete');
    }
    
    // Calculate subscription period based on plan type
    const currentPeriodStart = new Date();
    let currentPeriodEnd;
    
    // Default to 30 days, but you can customize based on plan
    if (plan.planType === 'yearly') {
      currentPeriodEnd = new Date(Date.now() + 365 * 24 * 60 * 60 * 1000); // 365 days
    } else {
      currentPeriodEnd = new Date(Date.now() + 30 * 24 * 60 * 60 * 1000); // 30 days
    }
    
    // Create new subscription record
    console.log('🔄 Creating new subscription record');
    const subscription = await prisma.userSubscription.create({
      data: {
        userId,
        planId,
        currentPeriodStart,
        currentPeriodEnd,
        status: 'active',
        // Reset usage counters for new subscription
        usedJobPostings: 0,
        usedFeaturedJobs: 0,
        usedResumeViews: 0,
        usedDirectApplications: 0,
        usedAiCredits: 0,
        usedAiJobMatches: 0,
        lastResetAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date()
      },
      include: {
        plan: true,
        user: {
          select: {
            id: true,
            email: true
          }
        }
      }
    });
    
    console.log('✅ New subscription created successfully:', {
      id: subscription.id,
      userId: subscription.userId,
      planName: subscription.plan.name,
      planType: subscription.plan.planType,
      status: subscription.status,
      periodStart: subscription.currentPeriodStart,
      periodEnd: subscription.currentPeriodEnd,
      usageCounters: {
        usedJobPostings: subscription.usedJobPostings,
        usedFeaturedJobs: subscription.usedFeaturedJobs,
        usedResumeViews: subscription.usedResumeViews,
        usedDirectApplications: subscription.usedDirectApplications,
        usedAiCredits: subscription.usedAiCredits,
        usedAiJobMatches: subscription.usedAiJobMatches
      }
    });
    
    return { success: true, subscription };
  } catch (error) {
    console.error('❌ Error activating subscription:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
    throw error;
  }
}

/**
 * Activate credit package after payment
 */
async function activateCreditPackage(userId, packageId) {
  console.log('🔄 Activating credit package for user:', userId, 'package:', packageId);
  
  try {
    // Verify user exists
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true }
    });
    
    if (!user) {
      throw new Error(`User not found: ${userId}`);
    }
    
    console.log('👤 User found:', user.email);
    
    // Get the credit package
    const creditPackage = await prisma.creditPackage.findUnique({
      where: { id: packageId }
    });
    
    console.log('📦 Found credit package:', creditPackage ? {
      id: creditPackage.id,
      name: creditPackage.name,
      creditType: creditPackage.creditType,
      creditAmount: creditPackage.creditAmount,
      bonusCredits: creditPackage.bonusCredits,
      validityDays: creditPackage.validityDays
    } : 'NOT FOUND');
    
    if (!creditPackage) {
      throw new Error(`Credit package not found: ${packageId}`);
    }
    
    const totalCredits = creditPackage.creditAmount + creditPackage.bonusCredits;
    const expiresAt = creditPackage.validityDays 
      ? new Date(Date.now() + creditPackage.validityDays * 24 * 60 * 60 * 1000)
      : null;
    
    console.log('💳 Preparing to add credits:', {
      userId,
      creditType: creditPackage.creditType,
      totalCredits,
      expiresAt
    });
    
    if (creditPackage.creditType === 'bundle') {
      // Handle bundle packages
      console.log('📦 Processing bundle package');
      const bundleConfig = creditPackage.bundleConfig;
      
      if (!bundleConfig || typeof bundleConfig !== 'object') {
        throw new Error('Invalid bundle configuration');
      }
      
      for (const [creditType, amount] of Object.entries(bundleConfig)) {
        console.log(`➕ Adding ${amount} ${creditType} credits`);
        await addUserCredits(userId, creditType, amount, expiresAt);
      }
    } else {
      // Handle single credit type
      console.log('📦 Processing single credit type package');
      await addUserCredits(userId, creditPackage.creditType, totalCredits, expiresAt);
    }
    
    console.log('✅ Credit package activated successfully');
    return { success: true, creditPackage };
  } catch (error) {
    console.error('❌ Error activating credit package:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
    throw error;
  }
}

export default {
  initializeDefaultPlans,
  initializeDefaultCreditPackages,
  getUserSubscription,
  checkUserUsageLimits,
  useCredit,
  getUserCredits,
  useUserCredits,
  addUserCredits,
  createSubscriptionPayment,
  createCreditPackagePayment,
  processSuccessfulPayment
};
