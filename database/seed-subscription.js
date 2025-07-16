import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedSubscriptionData() {
  console.log('Seeding subscription data...');

  // Insert default subscription plans
  const plans = await prisma.subscriptionPlan.createMany({
    data: [
      {
        id: 'clz1a2b3c4d5e6f7g8h9i0j1',
        name: 'Free',
        description: 'Basic access to job listings',
        planType: 'free',
        priceMonthly: 0.00,
        priceYearly: 0.00,
        features: {
          job_search: true,
          basic_filters: true,
          job_alerts: 5
        },
        maxResumeViews: 5,
        maxAiCredits: 0,
        maxDirectApplications: 10,
        maxJobPostings: 0,
        maxFeaturedJobs: 0,
        maxAiJobMatches: 0,
        prioritySupport: false,
        advancedAnalytics: false,
        customBranding: false
      },
      {
        id: 'clz2a3b4c5d6e7f8g9h0i1j2',
        name: 'Basic',
        description: 'Enhanced job search with contact access',
        planType: 'basic',
        priceMonthly: 299.00,
        priceYearly: 2990.00,
        features: {
          job_search: true,
          advanced_filters: true,
          resume_contacts: true,
          job_alerts: true,
          ai_analysis: true
        },
        maxResumeViews: 50,
        maxAiCredits: 5,
        maxDirectApplications: 50,
        maxJobPostings: 5,
        maxFeaturedJobs: 1,
        maxAiJobMatches: 10,
        prioritySupport: false,
        advancedAnalytics: false,
        customBranding: false
      },
      {
        id: 'clz3a4b5c6d7e8f9g0h1i2j3',
        name: 'Premium',
        description: 'Full access with AI features',
        planType: 'premium',
        priceMonthly: 599.00,
        priceYearly: 5990.00,
        features: {
          job_search: true,
          advanced_filters: true,
          resume_contacts: true,
          job_alerts: true,
          ai_analysis: true,
          ai_matching: true,
          priority_support: true
        },
        maxResumeViews: 200,
        maxAiCredits: 20,
        maxDirectApplications: 200,
        maxJobPostings: 20,
        maxFeaturedJobs: 5,
        maxAiJobMatches: 50,
        prioritySupport: true,
        advancedAnalytics: true,
        customBranding: false
      },
      {
        id: 'clz4a5b6c7d8e9f0g1h2i3j4',
        name: 'Enterprise',
        description: 'Unlimited access for teams',
        planType: 'enterprise',
        priceMonthly: 999.00,
        priceYearly: 9990.00,
        features: {
          job_search: true,
          advanced_filters: true,
          resume_contacts: true,
          job_alerts: true,
          ai_analysis: true,
          ai_matching: true,
          priority_support: true,
          team_management: true,
          custom_branding: true
        },
        maxResumeViews: 0, // 0 means unlimited
        maxAiCredits: 0,
        maxDirectApplications: 0,
        maxJobPostings: 0,
        maxFeaturedJobs: 0,
        maxAiJobMatches: 0,
        prioritySupport: true,
        advancedAnalytics: true,
        customBranding: true
      }
    ],
    skipDuplicates: true
  });

  // Insert default credit packages
  const creditPackages = await prisma.creditPackage.createMany({
    data: [
      {
        id: 'clz5a6b7c8d9e0f1g2h3i4j5',
        name: 'Resume Contact Starter',
        description: '25 resume contact views',
        creditType: 'resume_contact',
        creditAmount: 25,
        price: 199.00,
        bonusCredits: 5
      },
      {
        id: 'clz6a7b8c9d0e1f2g3h4i5j6',
        name: 'Resume Contact Pro',
        description: '100 resume contact views',
        creditType: 'resume_contact',
        creditAmount: 100,
        price: 599.00,
        bonusCredits: 25
      },
      {
        id: 'clz7a8b9c0d1e2f3g4h5i6j7',
        name: 'Resume Contact Enterprise',
        description: '500 resume contact views',
        creditType: 'resume_contact',
        creditAmount: 500,
        price: 2499.00,
        bonusCredits: 100
      },
      {
        id: 'clz8a9b0c1d2e3f4g5h6i7j8',
        name: 'AI Credit Starter',
        description: '10 AI resume analysis credits',
        creditType: 'ai_credit',
        creditAmount: 10,
        price: 149.00,
        bonusCredits: 2
      },
      {
        id: 'clz9a0b1c2d3e4f5g6h7i8j9',
        name: 'AI Credit Pro',
        description: '50 AI resume analysis credits',
        creditType: 'ai_credit',
        creditAmount: 50,
        price: 599.00,
        bonusCredits: 15
      },
      {
        id: 'clz0a1b2c3d4e5f6g7h8i9j0',
        name: 'AI Credit Enterprise',
        description: '200 AI resume analysis credits',
        creditType: 'ai_credit',
        creditAmount: 200,
        price: 1999.00,
        bonusCredits: 50
      }
    ],
    skipDuplicates: true
  });

  // Insert default pricing tiers
  const pricingTiers = await prisma.pricingTier.createMany({
    data: [
      {
        id: 'clz1b2c3d4e5f6g7h8i9j0k1',
        name: 'Free',
        description: 'Basic access to job listings',
        priceMonthly: 0.00,
        priceYearly: 0.00,
        features: {
          job_search: true,
          basic_filters: true,
          job_alerts: 5
        }
      },
      {
        id: 'clz2b3c4d5e6f7g8h9i0j1k2',
        name: 'Basic',
        description: 'Enhanced job search with contact access',
        priceMonthly: 299.00,
        priceYearly: 2990.00,
        features: {
          job_search: true,
          advanced_filters: true,
          resume_contacts: 50,
          job_alerts: 20,
          ai_resume_analysis: 5
        }
      },
      {
        id: 'clz3b4c5d6e7f8g9h0i1j2k3',
        name: 'Premium',
        description: 'Full access with AI features',
        priceMonthly: 599.00,
        priceYearly: 5990.00,
        features: {
          job_search: true,
          advanced_filters: true,
          resume_contacts: 200,
          job_alerts: 100,
          ai_resume_analysis: 20,
          ai_job_matching: true,
          priority_support: true
        }
      },
      {
        id: 'clz4b5c6d7e8f9g0h1i2j3k4',
        name: 'Enterprise',
        description: 'Unlimited access for teams',
        priceMonthly: 999.00,
        priceYearly: 9990.00,
        features: {
          job_search: true,
          advanced_filters: true,
          resume_contacts: -1,
          job_alerts: -1,
          ai_resume_analysis: -1,
          ai_job_matching: true,
          priority_support: true,
          team_management: true,
          custom_branding: true
        }
      }
    ],
    skipDuplicates: true
  });

  console.log('Subscription data seeded successfully!');
  console.log(`Created ${plans.count} subscription plans`);
  console.log(`Created ${creditPackages.count} credit packages`);
  console.log(`Created ${pricingTiers.count} pricing tiers`);
}

async function main() {
  try {
    await seedSubscriptionData();
  } catch (error) {
    console.error('Error seeding subscription data:', error);
  } finally {
    await prisma.$disconnect();
  }
}

main();
