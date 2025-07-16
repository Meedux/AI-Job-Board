// Subscription Service Utility
import { PrismaClient } from '@prisma/client';
import { createPaymentIntent, retrievePaymentIntent } from './paymongo';

const prisma = new PrismaClient();

/**
 * Subscription Plans and Features
 */
export const SUBSCRIPTION_PLANS = {
  FREE: {
    id: 'free',
    name: 'Free',
    price: 0,
    features: {
      jobSearch: true,
      basicFilters: true,
      jobAlerts: 5,
      resumeContacts: 0,
      aiCredits: 0
    }
  },
  BASIC: {
    id: 'basic',
    name: 'Basic',
    price: 299,
    features: {
      jobSearch: true,
      advancedFilters: true,
      jobAlerts: 20,
      resumeContacts: 50,
      aiCredits: 5
    }
  },
  PREMIUM: {
    id: 'premium',
    name: 'Premium',
    price: 599,
    features: {
      jobSearch: true,
      advancedFilters: true,
      jobAlerts: 100,
      resumeContacts: 200,
      aiCredits: 20,
      aiMatching: true,
      prioritySupport: true
    }
  },
  ENTERPRISE: {
    id: 'enterprise',
    name: 'Enterprise',
    price: 999,
    features: {
      jobSearch: true,
      advancedFilters: true,
      jobAlerts: -1, // unlimited
      resumeContacts: -1, // unlimited
      aiCredits: -1, // unlimited
      aiMatching: true,
      prioritySupport: true,
      teamManagement: true,
      customBranding: true
    }
  }
};

export const CREDIT_PACKAGES = {
  RESUME_CONTACT: {
    STARTER: { id: 'resume_starter', credits: 25, price: 199, bonus: 5 },
    PRO: { id: 'resume_pro', credits: 100, price: 599, bonus: 25 },
    ENTERPRISE: { id: 'resume_enterprise', credits: 500, price: 2499, bonus: 100 }
  },
  AI_CREDIT: {
    STARTER: { id: 'ai_starter', credits: 10, price: 149, bonus: 2 },
    PRO: { id: 'ai_pro', credits: 50, price: 599, bonus: 15 },
    ENTERPRISE: { id: 'ai_enterprise', credits: 200, price: 1999, bonus: 50 }
  },
  BUNDLE: {
    STARTER: { id: 'bundle_starter', price: 299, resumeCredits: 25, aiCredits: 10 },
    PRO: { id: 'bundle_pro', price: 799, resumeCredits: 100, aiCredits: 50 },
    ENTERPRISE: { id: 'bundle_enterprise', price: 1999, resumeCredits: 500, aiCredits: 200 }
  }
};

/**
 * Validate if user exists
 */
async function validateUserExists(userId) {
  try {
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, firstName: true, lastName: true }
    });
    
    if (!user) {
      throw new Error(`User with ID ${userId} not found`);
    }
    
    return user;
  } catch (error) {
    console.error('Error validating user:', error);
    throw error;
  }
}

/**
 * Get user's current subscription
 */
export async function getUserSubscription(userId) {
  try {
    // Validate user exists
    await validateUserExists(userId);

    const subscription = await prisma.userSubscription.findFirst({
      where: {
        userId: userId,
        status: 'active'
      },
      include: {
        plan: true
      }
    });

    return subscription;
  } catch (error) {
    console.error('Error fetching user subscription:', error);
    throw error;
  }
}

/**
 * Get user's credit balances
 */
export async function getUserCredits(userId) {
  try {
    // Validate user exists
    await validateUserExists(userId);

    const credits = await prisma.userCredit.findMany({
      where: {
        userId: userId
      }
    });

    return credits.reduce((acc, credit) => {
      acc[credit.creditType] = {
        balance: credit.balance,
        used: credit.usedCredits,
        total_purchased: credit.totalPurchased,
        expires_at: credit.expiresAt
      };
      return acc;
    }, {});
  } catch (error) {
    console.error('Error fetching user credits:', error);
    throw error;
  }
}

/**
 * Create subscription payment intent
 */
export async function createSubscriptionPayment(userId, planId, billingCycle = 'monthly') {
  try {
    console.log('createSubscriptionPayment called with:', {
      userId: userId,
      planId: planId,
      billingCycle: billingCycle
    });

    // Validate inputs
    if (!userId) {
      throw new Error('User ID is required');
    }
    
    if (!planId) {
      throw new Error('Plan ID is required');
    }

    // Validate user exists
    await validateUserExists(userId);

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      throw new Error('Subscription plan not found');
    }

    // Calculate the correct price based on billing cycle
    const price = billingCycle === 'yearly' ? plan.priceYearly : plan.priceMonthly;

    console.log('Creating payment intent with:', {
      price: price,
      billingCycle: billingCycle,
      planName: plan.name,
      userId: userId
    });

    // Handle free plans - no payment intent needed
    if (price === 0) {
      console.log('Free plan detected, creating subscription directly');
      return await createUserSubscription(userId, planId, billingCycle);
    }

    const paymentIntent = await createPaymentIntent(
      price,
      'PHP',
      `Subscription: ${plan.name} (${billingCycle})`,
      {
        userId: userId,
        planId: planId,
        billingCycle: billingCycle,
        type: 'subscription'
      }
    );

    // If payment intent is null (too small amount), create subscription directly
    if (!paymentIntent) {
      console.log('Amount too small for payment processing, creating free subscription');
      return await createUserSubscription(userId, planId, billingCycle);
    }

    // Create payment transaction record
    await prisma.paymentTransaction.create({
      data: {
        userId: userId,
        paymentIntentId: paymentIntent.id,
        amount: price,
        currency: 'PHP',
        status: 'pending',
        transactionType: 'subscription',
        relatedId: null, // Set to null for subscription payments since relatedId references CreditPackage
        metadata: {
          planId: planId,
          billingCycle: billingCycle
        },
        paymongoData: paymentIntent
      }
    });

    return paymentIntent;
  } catch (error) {
    console.error('Error creating subscription payment:', error);
    throw error;
  }
}

/**
 * Create user subscription directly (for free plans)
 */
export async function createUserSubscription(userId, planId, billingCycle = 'monthly') {
  try {
    console.log('createUserSubscription called with:', {
      userId: userId,
      planId: planId,
      billingCycle: billingCycle
    });

    // Validate user exists
    await validateUserExists(userId);

    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    });

    if (!plan) {
      throw new Error('Subscription plan not found');
    }

    const periodEnd = new Date();
    if (billingCycle === 'yearly') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // Cancel existing active subscriptions
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

    // Create new subscription
    const subscription = await prisma.userSubscription.create({
      data: {
        userId: userId,
        planId: planId,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd,
        metadata: {
          billingCycle: billingCycle,
          createdDirectly: true
        }
      }
    });

    console.log('Created subscription:', subscription);
    return subscription;
  } catch (error) {
    console.error('Error creating user subscription:', error);
    throw error;
  }
}

/**
 * Create credit purchase payment intent
 */
export async function createCreditPurchasePayment(userId, packageId, packageType) {
  try {
    // Validate user exists
    await validateUserExists(userId);

    const creditPackage = await prisma.creditPackage.findUnique({
      where: { id: packageId }
    });

    if (!creditPackage) {
      throw new Error('Credit package not found');
    }

    const paymentIntent = await createPaymentIntent(
      creditPackage.price,
      'PHP',
      `Credits: ${creditPackage.name}`,
      {
        userId: userId,
        packageId: packageId,
        packageType: packageType,
        type: 'credit_purchase'
      }
    );

    // Create payment transaction record
    await prisma.paymentTransaction.create({
      data: {
        userId: userId,
        paymentIntentId: paymentIntent.id,
        amount: creditPackage.price,
        currency: 'PHP',
        status: 'pending',
        transactionType: 'credit_purchase',
        relatedId: creditPackage.id, // Use creditPackage.id instead of packageId
        metadata: {
          packageId: packageId,
          packageType: packageType,
          creditType: creditPackage.creditType,
          creditAmount: creditPackage.creditAmount,
          bonusCredits: creditPackage.bonusCredits
        },
        paymongoData: paymentIntent
      }
    });

    return paymentIntent;
  } catch (error) {
    console.error('Error creating credit purchase payment:', error);
    throw error;
  }
}

/**
 * Process successful subscription payment
 */
export async function processSubscriptionPayment(paymentIntentId) {
  try {
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { paymentIntentId: paymentIntentId }
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Update transaction status
    await prisma.paymentTransaction.update({
      where: { id: transaction.id },
      data: { status: 'succeeded' }
    });

    // Create or update subscription
    const planId = transaction.metadata.planId;
    const billingCycle = transaction.metadata.billingCycle;
    
    const plan = await prisma.subscriptionPlan.findUnique({
      where: { id: planId }
    });

    const periodEnd = new Date();
    if (billingCycle === 'yearly') {
      periodEnd.setFullYear(periodEnd.getFullYear() + 1);
    } else {
      periodEnd.setMonth(periodEnd.getMonth() + 1);
    }

    // Cancel existing subscriptions
    await prisma.userSubscription.updateMany({
      where: {
        userId: transaction.userId,
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
        userId: transaction.userId,
        planId: planId,
        status: 'active',
        currentPeriodStart: new Date(),
        currentPeriodEnd: periodEnd,
        metadata: {
          paymentIntentId: paymentIntentId,
          billingCycle: billingCycle
        }
      }
    });

    // Add initial credits based on plan
    if (plan.maxResumeViews > 0) {
      await addUserCredits(transaction.userId, 'resume_contact', plan.maxResumeViews);
    }
    if (plan.maxAiCredits > 0) {
      await addUserCredits(transaction.userId, 'ai_credit', plan.maxAiCredits);
    }

    return subscription;
  } catch (error) {
    console.error('Error processing subscription payment:', error);
    throw error;
  }
}

/**
 * Process successful credit purchase payment
 */
export async function processCreditPurchasePayment(paymentIntentId) {
  try {
    const transaction = await prisma.paymentTransaction.findUnique({
      where: { paymentIntentId: paymentIntentId }
    });

    if (!transaction) {
      throw new Error('Transaction not found');
    }

    // Update transaction status
    await prisma.paymentTransaction.update({
      where: { id: transaction.id },
      data: { status: 'succeeded' }
    });

    const metadata = transaction.metadata;
    const creditType = metadata.creditType;
    const creditAmount = metadata.creditAmount;
    const bonusCredits = metadata.bonusCredits || 0;

    // Handle different credit types
    if (creditType === 'bundle') {
      // Handle bundle packages
      const bundlePackage = CREDIT_PACKAGES.BUNDLE[metadata.packageType.toUpperCase()];
      if (bundlePackage) {
        await addUserCredits(transaction.userId, 'resume_contact', bundlePackage.resumeCredits);
        await addUserCredits(transaction.userId, 'ai_credit', bundlePackage.aiCredits);
      }
    } else {
      // Handle individual credit types
      const totalCredits = creditAmount + bonusCredits;
      await addUserCredits(transaction.userId, creditType, totalCredits);
    }

    return {
      creditType: creditType,
      creditAmount: creditAmount,
      bonusCredits: bonusCredits
    };
  } catch (error) {
    console.error('Error processing credit purchase payment:', error);
    throw error;
  }
}

/**
 * Add credits to user account
 */
export async function addUserCredits(userId, creditType, amount, expiresAt = null) {
  try {
    // Validate user exists
    await validateUserExists(userId);

    // Find or create user credit record
    const existingCredit = await prisma.userCredit.findFirst({
      where: {
        userId: userId,
        creditType: creditType
      }
    });

    if (existingCredit) {
      // Update existing credit balance
      const updatedCredit = await prisma.userCredit.update({
        where: {
          id: existingCredit.id
        },
        data: {
          balance: existingCredit.balance + amount,
          totalPurchased: existingCredit.totalPurchased + amount,
          expiresAt: expiresAt,
          updatedAt: new Date()
        }
      });
      return updatedCredit;
    } else {
      // Create new credit record
      const newCredit = await prisma.userCredit.create({
        data: {
          userId: userId,
          creditType: creditType,
          balance: amount,
          totalPurchased: amount,
          expiresAt: expiresAt
        }
      });
      return newCredit;
    }
  } catch (error) {
    console.error('Error adding user credits:', error);
    throw error;
  }
}

/**
 * Use credits from user account
 */
export async function useUserCredits(userId, creditType, amount = 1) {
  try {
    // Validate user exists
    await validateUserExists(userId);

    // Find the user credit record
    const userCredit = await prisma.userCredit.findFirst({
      where: {
        userId: userId,
        creditType: creditType
      }
    });

    if (!userCredit) {
      throw new Error(`No credits found for user ${userId} and type ${creditType}`);
    }

    if (userCredit.balance < amount) {
      throw new Error(`Insufficient credits. Available: ${userCredit.balance}, Required: ${amount}`);
    }

    // Update credit balance
    const updatedCredit = await prisma.userCredit.update({
      where: {
        id: userCredit.id
      },
      data: {
        balance: userCredit.balance - amount,
        usedCredits: userCredit.usedCredits + amount,
        lastUsedAt: new Date(),
        updatedAt: new Date()
      }
    });

    return updatedCredit.balance;
  } catch (error) {
    console.error('Error using user credits:', error);
    throw error;
  }
}

/**
 * Get user credit balance
 */
export async function getUserCreditBalance(userId, creditType) {
  try {
    // Validate user exists
    await validateUserExists(userId);
    const result = await prisma.$queryRaw`
      SELECT get_user_credit_balance(${userId}::uuid, ${creditType})
    `;
    return result[0].get_user_credit_balance;
  } catch (error) {
    console.error('Error getting user credit balance:', error);
    throw error;
  }
}

/**
 * Check if user has feature access
 */
export async function hasFeatureAccess(userId, feature) {
  try {
    const subscription = await getUserSubscription(userId);
    
    if (!subscription) {
      // Free plan features
      return SUBSCRIPTION_PLANS.FREE.features[feature] || false;
    }

    const plan = subscription.plan;
    const features = plan.features;
    
    return features[feature] || false;
  } catch (error) {
    console.error('Error checking feature access:', error);
    return false;
  }
}

/**
 * Get subscription analytics
 */
export async function getSubscriptionAnalytics(userId) {
  try {
    const subscription = await getUserSubscription(userId);
    const credits = await getUserCredits(userId);
    
    const analytics = {
      subscription: subscription ? {
        plan: subscription.plan.name,
        status: subscription.status,
        currentPeriodEnd: subscription.currentPeriodEnd,
        daysRemaining: Math.ceil((new Date(subscription.currentPeriodEnd) - new Date()) / (1000 * 60 * 60 * 24))
      } : null,
      credits: credits,
      usage: {
        resumeContactsUsed: credits.resume_contact?.used || 0,
        aiCreditsUsed: credits.ai_credit?.used || 0
      }
    };

    return analytics;
  } catch (error) {
    console.error('Error getting subscription analytics:', error);
    throw error;
  }
}

export default {
  SUBSCRIPTION_PLANS,
  CREDIT_PACKAGES,
  getUserSubscription,
  getUserCredits,
  createSubscriptionPayment,
  createCreditPurchasePayment,
  processSubscriptionPayment,
  processCreditPurchasePayment,
  addUserCredits,
  useUserCredits,
  getUserCreditBalance,
  hasFeatureAccess,
  getSubscriptionAnalytics
};
