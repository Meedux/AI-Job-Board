import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

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
    maxJobPostings: 1,
    maxFeaturedJobs: 0,
    maxResumeViews: 5,
    maxDirectApplications: 10,
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
    priceYearly: 2990,
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
    priceYearly: 5990,
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
    priceYearly: 9990,
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
    maxJobPostings: 0,
    maxFeaturedJobs: 0,
    maxResumeViews: 0,
    maxDirectApplications: 0,
    maxAiCredits: 0,
    maxAiJobMatches: 0,
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
      const existing = await prisma.subscriptionPlan.findFirst({
        where: { planType: planData.planType }
      });
      
      if (!existing) {
        await prisma.subscriptionPlan.create({
          data: {
            ...planData,
            features: planData.features
          }
        });
        console.log(`✅ Created plan: ${planData.name}`);
      } else {
        console.log(`⚠️ Plan already exists: ${planData.name}`);
      }
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
        const existing = await prisma.creditPackage.findFirst({
          where: { name: packageData.name }
        });
        
        if (!existing) {
          await prisma.creditPackage.create({
            data: {
              ...packageData,
              bundleConfig: packageData.bundleConfig || null
            }
          });
          console.log(`✅ Created credit package: ${packageData.name}`);
        } else {
          console.log(`⚠️ Credit package already exists: ${packageData.name}`);
        }
      }
    }
    
    console.log('✅ Default credit packages initialized');
  } catch (error) {
    console.error('❌ Error initializing default credit packages:', error);
    throw error;
  }
}

export default {
  initializeDefaultPlans,
  initializeDefaultCreditPackages
};
