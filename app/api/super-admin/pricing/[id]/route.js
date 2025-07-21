import { NextResponse } from 'next/server';
import prisma from '../../../../../utils/db';
import { getUserFromRequest } from '../../../../../utils/auth';

// GET - Get single pricing tier
export async function GET(request, { params }) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const tier = await prisma.subscriptionPlan.findUnique({
      where: { id: params.id }
    });

    if (!tier) {
      return NextResponse.json({ 
        error: 'Pricing tier not found' 
      }, { status: 404 });
    }

    return NextResponse.json({ 
      success: true, 
      tier 
    });

  } catch (error) {
    console.error('Error fetching pricing tier:', error);
    return NextResponse.json({ 
      error: 'Failed to fetch pricing tier' 
    }, { status: 500 });
  }
}

// PUT - Update pricing tier
export async function PUT(request, { params }) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const data = await request.json();
    
    // Check if tier exists
    const existingTier = await prisma.subscriptionPlan.findUnique({
      where: { id: params.id }
    });

    if (!existingTier) {
      return NextResponse.json({ 
        error: 'Pricing tier not found' 
      }, { status: 404 });
    }

    // Check if name is being changed and if it conflicts
    if (data.name && data.name !== existingTier.name) {
      const nameConflict = await prisma.subscriptionPlan.findFirst({
        where: { 
          name: data.name,
          id: { not: params.id }
        }
      });

      if (nameConflict) {
        return NextResponse.json({ 
          error: 'A plan with this name already exists' 
        }, { status: 400 });
      }
    }

    const updatedTier = await prisma.subscriptionPlan.update({
      where: { id: params.id },
      data: {
        name: data.name || existingTier.name,
        description: data.description !== undefined ? data.description : existingTier.description,
        planType: data.planType || existingTier.planType,
        priceMonthly: data.priceMonthly !== undefined ? data.priceMonthly : existingTier.priceMonthly,
        priceYearly: data.priceYearly !== undefined ? data.priceYearly : existingTier.priceYearly,
        maxJobPostings: data.maxJobPostings !== undefined ? data.maxJobPostings : existingTier.maxJobPostings,
        maxFeaturedJobs: data.maxFeaturedJobs !== undefined ? data.maxFeaturedJobs : existingTier.maxFeaturedJobs,
        maxResumeViews: data.maxResumeViews !== undefined ? data.maxResumeViews : existingTier.maxResumeViews,
        maxDirectApplications: data.maxDirectApplications !== undefined ? data.maxDirectApplications : existingTier.maxDirectApplications,
        maxAiCredits: data.maxAiCredits !== undefined ? data.maxAiCredits : existingTier.maxAiCredits,
        maxAiJobMatches: data.maxAiJobMatches !== undefined ? data.maxAiJobMatches : existingTier.maxAiJobMatches,
        prioritySupport: data.prioritySupport !== undefined ? data.prioritySupport : existingTier.prioritySupport,
        advancedAnalytics: data.advancedAnalytics !== undefined ? data.advancedAnalytics : existingTier.advancedAnalytics,
        customBranding: data.customBranding !== undefined ? data.customBranding : existingTier.customBranding,
        trialDays: data.trialDays !== undefined ? data.trialDays : existingTier.trialDays,
        features: data.features !== undefined ? data.features : existingTier.features,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      tier: updatedTier 
    });

  } catch (error) {
    console.error('Error updating pricing tier:', error);
    return NextResponse.json({ 
      error: 'Failed to update pricing tier' 
    }, { status: 500 });
  }
}

// DELETE - Delete pricing tier
export async function DELETE(request, { params }) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user || user.role !== 'super_admin') {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Check if tier exists
    const existingTier = await prisma.subscriptionPlan.findUnique({
      where: { id: params.id }
    });

    if (!existingTier) {
      return NextResponse.json({ 
        error: 'Pricing tier not found' 
      }, { status: 404 });
    }

    // Check if there are active subscriptions using this plan
    const activeSubscriptions = await prisma.userSubscription.count({
      where: { 
        planId: params.id,
        status: 'active'
      }
    });

    if (activeSubscriptions > 0) {
      return NextResponse.json({ 
        error: `Cannot delete plan with ${activeSubscriptions} active subscription(s). Please cancel or migrate subscriptions first.` 
      }, { status: 400 });
    }

    // Soft delete by setting isActive to false instead of hard delete
    // This preserves historical data
    const deletedTier = await prisma.subscriptionPlan.update({
      where: { id: params.id },
      data: { 
        isActive: false,
        updatedAt: new Date()
      }
    });

    return NextResponse.json({ 
      success: true, 
      message: 'Pricing tier deleted successfully' 
    });

  } catch (error) {
    console.error('Error deleting pricing tier:', error);
    return NextResponse.json({ 
      error: 'Failed to delete pricing tier' 
    }, { status: 500 });
  }
}
