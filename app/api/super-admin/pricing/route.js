import { NextResponse } from 'next/server';
import prisma from '../../../../utils/db';
import { getUserFromRequest } from '../../../../utils/auth';

// GET - List all pricing tiers
export async function GET(request) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tiers = await prisma.subscriptionPlan.findMany({
      orderBy: [
        { planType: 'asc' },
        { priceMonthly: 'asc' }
      ]
    });

    return NextResponse.json({ 
      success: true, 
      tiers 
    });

  } catch (error) {
    console.error('Error fetching pricing tiers:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch pricing tiers' 
    }, { status: 500 });
  }
}

// POST - Create new pricing tier
export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Validate required fields
    if (!data.name || !data.planType) {
      return NextResponse.json({ 
        error: 'Name and plan type are required' 
      }, { status: 400 });
    }

    // Check if plan name already exists
    const existingPlan = await prisma.subscriptionPlan.findFirst({
      where: { name: data.name }
    });

    if (existingPlan) {
      return NextResponse.json({ 
        error: 'A plan with this name already exists' 
      }, { status: 400 });
    }

    const newTier = await prisma.subscriptionPlan.create({
      data: {
        name: data.name,
        description: data.description || '',
        planType: data.planType,
        priceMonthly: data.priceMonthly || 0,
        priceYearly: data.priceYearly || 0,
        maxJobPostings: data.maxJobPostings || 0,
        maxFeaturedJobs: data.maxFeaturedJobs || 0,
        maxResumeViews: data.maxResumeViews || 0,
        maxDirectApplications: data.maxDirectApplications || 0,
        maxAiCredits: data.maxAiCredits || 0,
        maxAiJobMatches: data.maxAiJobMatches || 0,
        prioritySupport: data.prioritySupport || false,
        advancedAnalytics: data.advancedAnalytics || false,
        customBranding: data.customBranding || false,
        trialDays: data.trialDays || 0,
        features: data.features || [],
        isActive: true
      }
    });

    return NextResponse.json({ 
      success: true, 
      tier: newTier 
    });

  } catch (error) {
    console.error('Error creating pricing tier:', error);
    return NextResponse.json({ 
      error: 'Failed to create pricing tier' 
    }, { status: 500 });
  }
}
