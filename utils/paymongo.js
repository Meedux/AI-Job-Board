// Paymongo Integration Utility
import { NextResponse } from 'next/server';

const PAYMONGO_BASE_URL = 'https://api.paymongo.com/v1';
const PAYMONGO_SECRET_KEY = process.env.PAYMONGO_SECRET_KEY;
const PAYMONGO_PUBLIC_KEY = process.env.PAYMONGO_PUBLIC_KEY;

if (!PAYMONGO_SECRET_KEY) {
  throw new Error('PAYMONGO_SECRET_KEY environment variable is required');
}

// Base64 encode the secret key for authorization
const authHeader = `Basic ${Buffer.from(PAYMONGO_SECRET_KEY).toString('base64')}`;

/**
 * Create a payment intent
 */
export async function createPaymentIntent(amount, currency = 'PHP', description = '', metadata = {}) {
  try {
    // Validate amount
    if (isNaN(amount)) {
      throw new Error('amount is required and must be a positive number');
    }

    // Check minimum amount requirement (₱20.00 = 2000 centavos)
    if (amount < 20) {
      console.log('Amount too small for payment processing, handling as free subscription');
      return null; // Return null for free subscriptions
    }

    const response = await fetch(`${PAYMONGO_BASE_URL}/payment_intents`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        data: {
          attributes: {
            amount: amount * 100, // Convert to centavos
            payment_method_allowed: ['card', 'gcash', 'grab_pay', 'paymaya'],
            payment_method_options: {
              card: {
                request_three_d_secure: 'automatic'
              }
            },
            currency: currency,
            description: description,
            statement_descriptor: 'GetGetHired',
            metadata: metadata
          }
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.errors?.[0]?.detail || 'Failed to create payment intent');
    }

    return data.data;
  } catch (error) {
    console.error('Paymongo payment intent creation error:', error);
    throw error;
  }
}

/**
 * Attach payment method to payment intent
 */
export async function attachPaymentMethod(paymentIntentId, paymentMethodId, clientKey, returnUrl = null) {
  try {
    const requestBody = {
      data: {
        attributes: {
          payment_method: paymentMethodId,
          client_key: clientKey
        }
      }
    };

    // Add return_url for redirect-based payment methods (GCash, GrabPay, etc.)
    if (returnUrl) {
      requestBody.data.attributes.return_url = returnUrl;
    }

    const response = await fetch(`${PAYMONGO_BASE_URL}/payment_intents/${paymentIntentId}/attach`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify(requestBody)
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.errors?.[0]?.detail || 'Failed to attach payment method');
    }

    return data.data;
  } catch (error) {
    console.error('Paymongo payment method attachment error:', error);
    throw error;
  }
}

/**
 * Create payment method
 */
export async function createPaymentMethod(type, details) {
  try {
    const response = await fetch(`${PAYMONGO_BASE_URL}/payment_methods`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        data: {
          attributes: {
            type: type,
            details: details
          }
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.errors?.[0]?.detail || 'Failed to create payment method');
    }

    return data.data;
  } catch (error) {
    console.error('Paymongo payment method creation error:', error);
    throw error;
  }
}

/**
 * Retrieve payment intent
 */
export async function retrievePaymentIntent(paymentIntentId) {
  try {
    const response = await fetch(`${PAYMONGO_BASE_URL}/payment_intents/${paymentIntentId}`, {
      method: 'GET',
      headers: {
        'Authorization': authHeader,
        'Accept': 'application/json'
      }
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.errors?.[0]?.detail || 'Failed to retrieve payment intent');
    }

    return data.data;
  } catch (error) {
    console.error('Paymongo payment intent retrieval error:', error);
    throw error;
  }
}

/**
 * Create a webhook
 */
export async function createWebhook(url, events) {
  try {
    const response = await fetch(`${PAYMONGO_BASE_URL}/webhooks`, {
      method: 'POST',
      headers: {
        'Authorization': authHeader,
        'Content-Type': 'application/json',
        'Accept': 'application/json'
      },
      body: JSON.stringify({
        data: {
          attributes: {
            url: url,
            events: events
          }
        }
      })
    });

    const data = await response.json();
    
    if (!response.ok) {
      throw new Error(data.errors?.[0]?.detail || 'Failed to create webhook');
    }

    return data.data;
  } catch (error) {
    console.error('Paymongo webhook creation error:', error);
    throw error;
  }
}

/**
 * Verify webhook signature
 */
export function verifyWebhookSignature(payload, signature, secret) {
  const crypto = require('crypto');
  const expectedSignature = crypto
    .createHmac('sha256', secret)
    .update(payload)
    .digest('hex');
  
  return signature === expectedSignature;
}

/**
 * Handle webhook events
 */
export function handleWebhookEvent(event) {
  switch (event.type) {
    case 'payment_intent.succeeded':
      return handlePaymentSuccess(event.data);
    case 'payment_intent.payment_failed':
      return handlePaymentFailed(event.data);
    case 'payment_intent.requires_action':
      return handlePaymentRequiresAction(event.data);
    default:
      console.log('Unhandled webhook event:', event.type);
      return null;
  }
}

function handlePaymentSuccess(paymentIntent) {
  console.log('Payment succeeded:', paymentIntent.id);
  // Handle successful payment (update subscription, add credits, etc.)
  return {
    status: 'success',
    paymentIntentId: paymentIntent.id,
    amount: paymentIntent.attributes.amount,
    currency: paymentIntent.attributes.currency
  };
}

function handlePaymentFailed(paymentIntent) {
  console.log('Payment failed:', paymentIntent.id);
  // Handle failed payment
  return {
    status: 'failed',
    paymentIntentId: paymentIntent.id,
    error: paymentIntent.attributes.last_payment_error
  };
}

function handlePaymentRequiresAction(paymentIntent) {
  console.log('Payment requires action:', paymentIntent.id);
  // Handle payment that requires additional action
  return {
    status: 'requires_action',
    paymentIntentId: paymentIntent.id,
    nextAction: paymentIntent.attributes.next_action
  };
}

// Export configuration
export const PaymongoConfig = {
  publicKey: PAYMONGO_PUBLIC_KEY,
  baseUrl: PAYMONGO_BASE_URL,
  supportedMethods: ['card', 'gcash', 'grab_pay', 'paymaya'],
  currency: 'PHP'
};
