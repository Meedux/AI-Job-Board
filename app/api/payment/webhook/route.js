// API Route: /api/payment/webhook - Enhanced for Freemium Job Posting
import { NextResponse } from 'next/server';
import { verifyWebhookSignature } from '@/utils/paymongo';
import { processSuccessfulPayment } from '@/utils/newSubscriptionService';
import { prisma } from '@/utils/db';

export async function POST(request) {
  console.log('🔔 POST /api/payment/webhook - Processing payment webhook');
  
  try {
    const body = await request.text();
    const signature = request.headers.get('paymongo-signature');
    const webhookSecret = process.env.PAYMONGO_WEBHOOK_SECRET;

    console.log('📋 Webhook received:', {
      hasSignature: !!signature,
      hasSecret: !!webhookSecret,
      bodyLength: body.length
    });

    // In development, be more lenient with signature verification
    if (process.env.NODE_ENV === 'development') {
      console.log('🔧 Development mode - skipping signature verification');
      if (!webhookSecret) {
        console.warn('⚠️ WARNING: PAYMONGO_WEBHOOK_SECRET is not set in development');
      }
    } else {
      if (!signature || !webhookSecret) {
        console.log('❌ Missing webhook signature or secret');
        return NextResponse.json(
          { success: false, error: 'Missing webhook signature or secret' },
          { status: 400 }
        );
      }

      try {
        // Verify webhook signature
        const isValid = verifyWebhookSignature(body, signature, webhookSecret);
        console.log('🔐 Signature verification result:', isValid);
        
        if (!isValid) {
          console.log('❌ Invalid webhook signature');
          return NextResponse.json(
            { success: false, error: 'Invalid webhook signature' },
            { status: 400 }
          );
        }
      } catch (verificationError) {
        console.error('❌ Webhook signature verification failed:', verificationError);
        return NextResponse.json(
          { success: false, error: 'Webhook signature verification failed' },
          { status: 400 }
        );
      }
    }

    let event;
    try {
      event = JSON.parse(body);
    } catch (parseError) {
      console.error('❌ Failed to parse webhook body:', parseError);
      return NextResponse.json(
        { success: false, error: 'Invalid JSON in webhook body' },
        { status: 400 }
      );
    }

    console.log('📥 Webhook event received:', {
      type: event.data?.type,
      id: event.data?.id,
      attributes: event.data?.attributes ? Object.keys(event.data.attributes) : 'none'
    });

    if (!event.data || !event.data.type) {
      console.error('❌ Invalid webhook event structure');
      return NextResponse.json(
        { success: false, error: 'Invalid webhook event structure' },
        { status: 400 }
      );
    }

    // Handle different event types
    switch (event.data.type) {
      case 'payment_intent.succeeded':
        await handlePaymentSuccess(event.data);
        break;
      case 'payment_intent.payment_failed':
        await handlePaymentFailed(event.data);
        break;
      case 'payment_intent.requires_action':
        await handlePaymentRequiresAction(event.data);
        break;
      default:
        console.log('ℹ️ Unhandled webhook event type:', event.data.type);
        // Still return success for unhandled events
        break;
    }

    return NextResponse.json({ success: true, received: true });
  } catch (error) {
    console.error('❌ Webhook error:', error);
    return NextResponse.json(
      { success: false, error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}

async function handlePaymentSuccess(paymentIntent) {
  console.log('✅ Processing successful payment:', paymentIntent.id);
  
  try {
    // Validate payment intent structure
    if (!paymentIntent.id) {
      throw new Error('Payment intent ID is missing');
    }
    
    // Process payment using the new subscription service
    console.log('🔄 Calling processSuccessfulPayment for:', paymentIntent.id);
    const result = await processSuccessfulPayment(paymentIntent.id);
    console.log('✅ Payment processed successfully:', result);
    
    // Verify the result
    if (result && result.success) {
      console.log('✅ Payment processing completed successfully');
      if (result.subscription) {
        console.log('✅ Subscription created:', result.subscription.id);
      }
      if (result.creditPackage) {
        console.log('✅ Credit package activated:', result.creditPackage.name);
      }
      
      return result;
    } else {
      console.error('❌ Payment processing failed:', result);
      throw new Error('Payment processing returned failure status');
    }
    
    // TODO: Send confirmation email
    // await sendPaymentConfirmationEmail(result.userId, result);
    
  } catch (error) {
    console.error('❌ Error handling payment success:', error);
    console.error('❌ Error details:', error.message);
    console.error('❌ Error stack:', error.stack);
    
    // Try to mark the transaction as failed
    try {
      await prisma.paymentTransaction.updateMany({
        where: { paymentIntentId: paymentIntent.id },
        data: { 
          status: 'failed',
          updatedAt: new Date()
        }
      });
      console.log('🔄 Marked transaction as failed due to processing error');
    } catch (updateError) {
      console.error('❌ Failed to update transaction status:', updateError);
    }
    
    throw error;
  }
}

async function handlePaymentFailed(paymentIntent) {
  console.log('❌ Processing failed payment:', paymentIntent.id);
  
  try {
    // Update transaction status
    await prisma.paymentTransaction.updateMany({
      where: {
        paymentIntentId: paymentIntent.id
      },
      data: {
        status: 'failed',
        updatedAt: new Date()
      }
    });

    console.log('❌ Payment failed updated in database:', paymentIntent.id);
    
    // TODO: Send failure notification email
    // await sendPaymentFailureEmail(userId, paymentIntent);

  } catch (error) {
    console.error('❌ Error handling payment failure:', error);
    throw error;
  }
}

async function handlePaymentRequiresAction(paymentIntent) {
  console.log('🔄 Processing payment that requires action:', paymentIntent.id);
  
  try {
    // Update transaction status
    await prisma.paymentTransaction.updateMany({
      where: {
        paymentIntentId: paymentIntent.id
      },
      data: {
        status: 'requires_action',
        updatedAt: new Date()
      }
    });

    console.log('🔄 Payment requires action updated in database:', paymentIntent.id);

  } catch (error) {
    console.error('❌ Error handling payment requires action:', error);
    throw error;
  }
}
