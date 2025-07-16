// API Route: /api/payment/process - Direct payment processing without webhooks
import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/utils/auth';
import { retrievePaymentIntent, attachPaymentMethod } from '@/utils/paymongo';
import { processSuccessfulPayment } from '@/utils/newSubscriptionService';
import { prisma } from '@/utils/db';

export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { paymentIntentId, paymentMethodId } = await request.json();
    
    if (!paymentIntentId || !paymentMethodId) {
      return NextResponse.json(
        { success: false, error: 'Payment intent ID and payment method ID are required' },
        { status: 400 }
      );
    }

    console.log('💳 Processing payment for user:', user.id, 'paymentIntent:', paymentIntentId);

    // Retrieve payment intent to get client key
    const paymentIntent = await retrievePaymentIntent(paymentIntentId);
    
    if (!paymentIntent) {
      return NextResponse.json(
        { success: false, error: 'Payment intent not found' },
        { status: 404 }
      );
    }

    // Attach payment method to payment intent
    // Construct return URL for redirect-based payment methods
    const requestUrl = new URL(request.url);
    const baseUrl = `${requestUrl.protocol}//${requestUrl.host}`;
    const returnUrl = `${baseUrl}/payment/success?payment_intent_id=${paymentIntentId}`;
    
    const result = await attachPaymentMethod(
      paymentIntentId,
      paymentMethodId,
      paymentIntent.attributes.client_key,
      returnUrl
    );

    console.log('💳 Payment attachment result:', result);

    // Check if payment was successful immediately
    if (result && result.attributes && result.attributes.status === 'succeeded') {
      console.log('✅ Payment succeeded immediately, processing...');
      
      try {
        // Process the successful payment directly
        const processingResult = await processSuccessfulPayment(paymentIntentId);
        console.log('✅ Payment processing completed:', processingResult);
        
        return NextResponse.json({
          success: true,
          paymentIntent: result,
          processed: true,
          data: processingResult
        });
      } catch (processingError) {
        console.error('❌ Error processing successful payment:', processingError);
        // Still return success for the payment, but note the processing error
        return NextResponse.json({
          success: true,
          paymentIntent: result,
          processed: false,
          processingError: processingError.message
        });
      }
    } else if (result && result.attributes && result.attributes.status === 'awaiting_next_action') {
      console.log('🔄 Payment requires next action, will redirect to success page');
      
      // Return success with redirect info for frontend to handle
      return NextResponse.json({
        success: true,
        paymentIntent: result,
        processed: false,
        requiresAction: true,
        redirectUrl: returnUrl
      });
    }

    return NextResponse.json({
      success: true,
      paymentIntent: result,
      processed: false
    });
  } catch (error) {
    console.error('❌ Error processing payment:', error);
    return NextResponse.json(
      { success: false, error: 'Payment processing failed', details: error.message },
      { status: 500 }
    );
  }
}

// New endpoint for checking payment status and processing if needed
export async function GET(request) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { searchParams } = new URL(request.url);
    const paymentIntentId = searchParams.get('paymentIntentId');
    
    if (!paymentIntentId) {
      return NextResponse.json(
        { success: false, error: 'Payment intent ID is required' },
        { status: 400 }
      );
    }

    console.log('🔍 Checking payment status for:', paymentIntentId);
    
    // Retrieve the payment intent from Paymongo to verify status
    const paymentIntent = await retrievePaymentIntent(paymentIntentId);
    
    console.log('📋 Payment intent status:', paymentIntent.attributes.status);
    
    if (paymentIntent.attributes.status === 'succeeded') {
      console.log('✅ Payment confirmed as successful, processing...');
      
      // Check if already processed
      const transaction = await prisma.paymentTransaction.findFirst({
        where: { paymentIntentId }
      });
      
      if (transaction && transaction.status === 'succeeded') {
        console.log('✅ Payment already processed');
        return NextResponse.json({
          success: true,
          message: 'Payment already processed',
          status: 'succeeded',
          alreadyProcessed: true
        });
      }
      
      // Process the successful payment
      const result = await processSuccessfulPayment(paymentIntentId);
      
      console.log('✅ Payment processing result:', result);
      
      return NextResponse.json({
        success: true,
        message: 'Payment processed successfully',
        status: 'succeeded',
        data: result
      });
    } else if (paymentIntent.attributes.status === 'awaiting_next_action') {
      console.log('🔄 Payment still awaiting next action, user may need to complete authentication');
      
      // Check if there's a next action
      const nextAction = paymentIntent.attributes.next_action;
      if (nextAction && nextAction.type === 'redirect' && nextAction.redirect) {
        return NextResponse.json({
          success: false,
          error: 'Payment requires authentication',
          status: 'awaiting_next_action',
          redirectUrl: nextAction.redirect.url,
          message: 'Please complete payment authentication'
        });
      }
      
      return NextResponse.json({
        success: false,
        error: 'Payment requires additional action',
        status: 'awaiting_next_action',
        message: 'Please complete payment process'
      });
    } else {
      console.log('❌ Payment not successful, status:', paymentIntent.attributes.status);
      
      // Update transaction status to match Paymongo status
      await prisma.paymentTransaction.updateMany({
        where: { paymentIntentId },
        data: { 
          status: paymentIntent.attributes.status,
          updatedAt: new Date()
        }
      });
      
      return NextResponse.json({
        success: false,
        error: 'Payment not successful',
        status: paymentIntent.attributes.status
      });
    }
    
  } catch (error) {
    console.error('❌ Error checking payment status:', error);
    
    return NextResponse.json(
      { success: false, error: 'Payment status check failed', details: error.message },
      { status: 500 }
    );
  }
}
