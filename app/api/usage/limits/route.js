// API Route: /api/usage/limits - Check user usage limits
import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/utils/auth';
import { checkUserUsageLimits } from '@/utils/newSubscriptionService';

export async function GET(request) {
  console.log('📊 GET /api/usage/limits - Checking usage limits');
  
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      console.log('❌ Unauthorized access attempt');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const activityType = searchParams.get('type');
    
    if (!activityType) {
      return NextResponse.json(
        { success: false, error: 'Activity type is required' },
        { status: 400 }
      );
    }

    const userId = user.id || user.uid;
    console.log('🔍 Checking usage limits for user:', userId, 'type:', activityType);

    const usageCheck = await checkUserUsageLimits(userId, activityType);
    
    console.log('✅ Usage limits checked:', usageCheck);

    return NextResponse.json({
      success: true,
      usage: usageCheck
    });
  } catch (error) {
    console.error('❌ Error checking usage limits:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to check usage limits' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  console.log('📝 POST /api/usage/limits - Use/consume usage limit');
  
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      console.log('❌ Unauthorized access attempt');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { activityType, amount = 1 } = await request.json();
    
    if (!activityType) {
      return NextResponse.json(
        { success: false, error: 'Activity type is required' },
        { status: 400 }
      );
    }

    const userId = user.id || user.uid;
    console.log('🔄 Using usage limit for user:', userId, 'type:', activityType, 'amount:', amount);

    // Map activity type to credit type
    const creditType = activityType === 'resume_view' ? 'resume_contact' : 
                      activityType === 'ai_usage' ? 'ai_credit' : activityType;

    const { useCredit } = await import('@/utils/newSubscriptionService');
    const result = await useCredit(userId, creditType, amount);
    
    console.log('✅ Usage limit consumed:', result);

    return NextResponse.json({
      success: true,
      result: result
    });
  } catch (error) {
    console.error('❌ Error consuming usage limit:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to consume usage limit' },
      { status: 500 }
    );
  }
}
