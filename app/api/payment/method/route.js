// API Route: /api/payment/method
import { NextResponse } from 'next/server';
import { getUserFromRequest } from '@/utils/auth';
import { createPaymentMethod } from '@/utils/paymongo';

export async function POST(request) {
  try {
    const user = getUserFromRequest(request);
    
    if (!user) {
      return NextResponse.json(
        { success: false, error: 'Unauthorized' },
        { status: 401 }
      );
    }

    const { type, details } = await request.json();
    
    if (!type || !details) {
      return NextResponse.json(
        { success: false, error: 'Payment method type and details are required' },
        { status: 400 }
      );
    }

    // Create payment method based on type
    let paymentMethodDetails;
    
    if (type === 'card') {
      // For card payments, we need card details
      const { number, expiry, cvv, name } = details;
      
      if (!number || !expiry || !cvv || !name) {
        return NextResponse.json(
          { success: false, error: 'Card number, expiry, CVV, and cardholder name are required' },
          { status: 400 }
        );
      }

      // Format expiry from MM/YY to MM and YY
      const [month, year] = expiry.split('/');
      
      paymentMethodDetails = {
        card_number: number.replace(/\s/g, ''), // Remove spaces
        exp_month: parseInt(month),
        exp_year: parseInt(`20${year}`), // Convert YY to 20YY
        cvc: cvv,
        billing: {
          name: name,
          email: user.email || 'user@example.com'
        }
      };
    } else if (type === 'gcash') {
      // For GCash, we might need phone number or other details
      paymentMethodDetails = {
        phone: details.phone || user.phone || '+639123456789',
        email: user.email || 'user@example.com'
      };
    } else {
      return NextResponse.json(
        { success: false, error: 'Unsupported payment method type' },
        { status: 400 }
      );
    }

    // Create payment method using Paymongo API
    const paymentMethod = await createPaymentMethod(type, paymentMethodDetails);
    
    return NextResponse.json({
      success: true,
      paymentMethod: {
        id: paymentMethod.id,
        type: paymentMethod.attributes.type,
        details: paymentMethod.attributes.details
      }
    });
  } catch (error) {
    console.error('Error creating payment method:', error);
    return NextResponse.json(
      { success: false, error: error.message || 'Failed to create payment method' },
      { status: 500 }
    );
  }
}
