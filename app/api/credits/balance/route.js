// API Route: /api/credits/balance - Enhanced Credit Balance Management
import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/utils/auth';
import { getUserCredits, useCredit, addUserCredits } from '@/utils/newSubscriptionService';

export async function GET(request) {
  console.log('📋 GET /api/credits/balance - Fetching credit balance');
  
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
    console.log('🔍 Fetching credit balance for user:', userId);

    const credits = await getUserCredits(userId);
    
    console.log('✅ Successfully fetched credit balance for user:', userId);

    return NextResponse.json({
      success: true,
      credits: credits
    });
  } catch (error) {
    console.error('❌ Error fetching credit balance:', error);
    return NextResponse.json(
      { success: false, error: 'Failed to fetch credit balance' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  console.log('💳 POST /api/credits/balance - Managing credit balance');
  
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      console.log('❌ Unauthorized access attempt');
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { creditType, amount = 1, action } = await request.json();
    
    if (!creditType || !action) {
      return NextResponse.json(
        { success: false, error: 'Credit type and action are required' },
        { status: 400 }
      );
    }

    const userId = user.id || user.uid;
    console.log('🔄 Managing credit balance:', { userId, creditType, amount, action });

    let result;
    
    if (action === 'use') {
      result = await useCredit(userId, creditType, amount);
      console.log('✅ Credit used successfully:', result);
    } else if (action === 'add') {
      result = await addUserCredits(userId, creditType, amount);
      console.log('✅ Credits added successfully:', result);
    } else {
      return NextResponse.json(
        { success: false, error: 'Invalid action. Use "use" or "add"' },
        { status: 400 }
      );
    }

    // Get updated balance
    const updatedCredits = await getUserCredits(userId);
    
    return NextResponse.json({
      success: true,
      result: result,
      credits: updatedCredits
    });
  } catch (error) {
    console.error('❌ Error managing credit balance:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to manage credit balance' },
      { status: 500 }
    );
  }
}
