'use client';

import { useState, useEffect } from 'react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';
import { combineClasses } from '../utils/designSystem';

const PaymentModal = ({ isOpen, onClose, paymentType, planData, billingCycle, onSuccess }) => {
  const { paymentIntent, loading, error, clearError } = useSubscription();
  const { user } = useAuth();
  const [paymentMethod, setPaymentMethod] = useState('card');
  const [cardDetails, setCardDetails] = useState({
    number: '',
    expiry: '',
    cvv: '',
    name: '',
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [paymentStep, setPaymentStep] = useState('form'); // 'form', 'processing', 'success', 'error'

  // Function to get current price based on billing cycle
  const getCurrentPrice = () => {
    if (paymentType === 'subscription' && planData) {
      if (billingCycle === 'yearly' && planData.price_yearly) {
        return planData.price_yearly;
      }
      return planData.price_monthly || 0;
    }
    return planData?.price || 0;
  };

  const getPriceLabel = () => {
    if (paymentType === 'subscription' && planData) {
      return billingCycle === 'yearly' ? '/year' : '/month';
    }
    return '';
  };

  useEffect(() => {
    if (isOpen) {
      setPaymentStep('form');
      setIsProcessing(false);
      clearError();
    }
  }, [isOpen, clearError]);

  const handleClose = () => {
    if (!isProcessing) {
      onClose();
    }
  };

  const handleCardInputChange = (field, value) => {
    // Format card number
    if (field === 'number') {
      value = value.replace(/\s/g, '').replace(/(.{4})/g, '$1 ').trim();
      if (value.length > 19) return;
    }
    
    // Format expiry
    if (field === 'expiry') {
      value = value.replace(/\D/g, '').replace(/(\d{2})(\d{2})/, '$1/$2');
      if (value.length > 5) return;
    }
    
    // Format CVV
    if (field === 'cvv') {
      value = value.replace(/\D/g, '');
      if (value.length > 3) return;
    }

    setCardDetails(prev => ({ ...prev, [field]: value }));
  };

  const processPayment = async () => {
    console.log('💳 Processing payment with intent:', paymentIntent);
    
    if (!paymentIntent) {
      console.error('❌ Payment intent not found');
      alert('Payment intent not found. Please try again.');
      return;
    }

    setIsProcessing(true);
    setPaymentStep('processing');

    try {
      // Step 1: Create payment method
      let paymentMethodDetails;
      
      if (paymentMethod === 'card') {
        paymentMethodDetails = {
          number: cardDetails.number,
          expiry: cardDetails.expiry,
          cvv: cardDetails.cvv,
          name: cardDetails.name
        };
      } else if (paymentMethod === 'gcash') {
        paymentMethodDetails = {
          phone: user.phone || '+639123456789' // Default phone for GCash
        };
      }

      const paymentMethodResponse = await fetch('/api/payment/method', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          type: paymentMethod,
          details: paymentMethodDetails,
        }),
      });

      const paymentMethodResult = await paymentMethodResponse.json();

      if (!paymentMethodResponse.ok) {
        throw new Error(paymentMethodResult.error || 'Failed to create payment method');
      }

      // Step 2: Process payment with payment method ID
      const paymentProcessResponse = await fetch('/api/payment/process', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include', // Include cookies for authentication
        body: JSON.stringify({
          paymentIntentId: paymentIntent.id,
          paymentMethodId: paymentMethodResult.paymentMethod.id,
        }),
      });

      const paymentResult = await paymentProcessResponse.json();

      if (paymentProcessResponse.ok) {
        // Check if payment requires action (redirect for GCash)
        if (paymentResult.requiresAction && paymentResult.paymentIntent.attributes.next_action) {
          // For GCash and other redirect-based methods, redirect to the payment URL
          const nextAction = paymentResult.paymentIntent.attributes.next_action;
          if (nextAction.type === 'redirect' && nextAction.redirect) {
            console.log('🔄 Redirecting to payment provider:', nextAction.redirect.url);
            window.location.href = nextAction.redirect.url;
            return;
          }
        }

        // Check if payment was processed immediately (card payments)
        if (paymentResult.processed) {
          console.log('✅ Payment processed immediately');
          setPaymentStep('success');
          setTimeout(() => {
            onSuccess?.(paymentResult.data);
            onClose();
          }, 2000);
          return;
        }

        // For other cases, wait and check status
        console.log('⏳ Payment initiated, checking status...');
        await checkPaymentStatus(paymentIntent.id);
        
      } else {
        throw new Error(paymentResult.error || 'Payment failed');
      }
    } catch (error) {
      console.error('Payment processing error:', error);
      setPaymentStep('error');
    } finally {
      setIsProcessing(false);
    }
  };

  const checkPaymentStatus = async (paymentIntentId) => {
    // Poll for payment status
    const maxAttempts = 10;
    const pollInterval = 3000; // 3 seconds

    for (let attempt = 1; attempt <= maxAttempts; attempt++) {
      try {
        console.log(`🔍 Checking payment status (attempt ${attempt}/${maxAttempts})`);
        
        const response = await fetch(`/api/payment/process?paymentIntentId=${paymentIntentId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        const result = await response.json();
        
        if (result.success && result.status === 'succeeded') {
          console.log('✅ Payment confirmed successful');
          setPaymentStep('success');
          setTimeout(() => {
            onSuccess?.(result.data);
            onClose();
          }, 2000);
          return;
        } else if (result.success && result.alreadyProcessed) {
          console.log('✅ Payment already processed');
          setPaymentStep('success');
          setTimeout(() => {
            onSuccess?.(result.data);
            onClose();
          }, 2000);
          return;
        } else if (result.status === 'failed') {
          console.log('❌ Payment failed');
          throw new Error('Payment failed');
        }
        
        // If payment is still processing, wait before next attempt
        if (attempt < maxAttempts) {
          await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
      } catch (error) {
        console.error('Error checking payment status:', error);
        if (attempt === maxAttempts) {
          throw error;
        }
        await new Promise(resolve => setTimeout(resolve, pollInterval));
      }
    }
    
    throw new Error('Payment status check timed out');
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    processPayment();
  };

  const isFormValid = () => {
    if (paymentMethod === 'card') {
      return cardDetails.number.length >= 19 && 
             cardDetails.expiry.length === 5 && 
             cardDetails.cvv.length >= 3 && 
             cardDetails.name.length > 0;
    } else if (paymentMethod === 'gcash') {
      // For GCash, we don't need card details, just check if user exists
      return true;
    }
    return false;
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-gray-900 rounded-2xl max-w-md w-full mx-4 border border-gray-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <h2 className="text-xl font-bold text-white">
            {paymentType === 'subscription' ? 'Subscribe to Plan' : 'Purchase Credits'}
          </h2>
          <button
            onClick={handleClose}
            disabled={isProcessing}
            className="text-gray-400 hover:text-white transition-colors disabled:opacity-50"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>

        {/* Content */}
        <div className="p-6">
          {/* Plan Details */}
          {planData && (
            <div className="mb-6 p-4 bg-gray-800 rounded-lg border border-gray-600">
              <h3 className="font-semibold text-white mb-2">{planData.name}</h3>
              <p className="text-gray-400 text-sm mb-3">{planData.description}</p>
              <div className="text-2xl font-bold text-green-400">
                ₱{getCurrentPrice().toLocaleString()}
                {paymentType === 'subscription' && <span className="text-sm font-normal text-gray-400">{getPriceLabel()}</span>}
              </div>
            </div>
          )}

          {/* Payment Form */}
          {paymentStep === 'form' && (
            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Payment Method Selection */}
              <div className="space-y-2">
                <label className="block text-sm font-medium text-gray-300 mb-2">
                  Payment Method
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('card')}
                    className={combineClasses(
                      "flex items-center justify-center gap-2 p-3 rounded-lg border transition-all",
                      paymentMethod === 'card' 
                        ? "border-blue-500 bg-blue-500/20 text-blue-400" 
                        : "border-gray-600 bg-gray-800 text-gray-400 hover:border-gray-500"
                    )}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M4 4a2 2 0 00-2 2v1h16V6a2 2 0 00-2-2H4z" />
                      <path fillRule="evenodd" d="M18 9H2v5a2 2 0 002 2h12a2 2 0 002-2V9zM4 13a1 1 0 011-1h1a1 1 0 110 2H5a1 1 0 01-1-1zm5-1a1 1 0 100 2h1a1 1 0 100-2H9z" clipRule="evenodd" />
                    </svg>
                    Card
                  </button>
                  <button
                    type="button"
                    onClick={() => setPaymentMethod('gcash')}
                    className={combineClasses(
                      "flex items-center justify-center gap-2 p-3 rounded-lg border transition-all",
                      paymentMethod === 'gcash' 
                        ? "border-blue-500 bg-blue-500/20 text-blue-400" 
                        : "border-gray-600 bg-gray-800 text-gray-400 hover:border-gray-500"
                    )}
                  >
                    <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm12 4a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6a1 1 0 011-1h11z" clipRule="evenodd" />
                    </svg>
                    GCash
                  </button>
                </div>
              </div>

              {/* Card Details */}
              {paymentMethod === 'card' && (
                <div className="space-y-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Card Number
                    </label>
                    <input
                      type="text"
                      value={cardDetails.number}
                      onChange={(e) => handleCardInputChange('number', e.target.value)}
                      placeholder="1234 5678 9012 3456"
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        Expiry Date
                      </label>
                      <input
                        type="text"
                        value={cardDetails.expiry}
                        onChange={(e) => handleCardInputChange('expiry', e.target.value)}
                        placeholder="MM/YY"
                        className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                        required
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-2">
                        CVV
                      </label>
                      <input
                        type="text"
                        value={cardDetails.cvv}
                        onChange={(e) => handleCardInputChange('cvv', e.target.value)}
                        placeholder="123"
                        className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-2">
                      Cardholder Name
                    </label>
                    <input
                      type="text"
                      value={cardDetails.name}
                      onChange={(e) => handleCardInputChange('name', e.target.value)}
                      placeholder="John Doe"
                      className="w-full p-3 bg-gray-800 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:border-blue-500 focus:outline-none transition-colors"
                      required
                    />
                  </div>
                </div>
              )}

              {/* GCash Payment Info */}
              {paymentMethod === 'gcash' && (
                <div className="space-y-4">
                  <div className="p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                    <div className="flex items-center gap-3 mb-3">
                      <div className="w-8 h-8 bg-blue-600 rounded-full flex items-center justify-center">
                        <svg className="w-5 h-5 text-white" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm12 4a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1v-6a1 1 0 011-1h11z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <h4 className="font-medium text-blue-400">GCash Payment</h4>
                    </div>
                    <p className="text-sm text-gray-300 mb-2">
                      You will be redirected to GCash to complete your payment securely.
                    </p>
                    <p className="text-xs text-gray-400">
                      Make sure you have the GCash app installed on your device or have access to your GCash account.
                    </p>
                  </div>
                </div>
              )}

              {/* Error Message */}
              {error && (
                <div className="p-3 bg-red-900/20 border border-red-700 rounded-lg">
                  <p className="text-red-400 text-sm">{error}</p>
                </div>
              )}

              {/* Submit Button */}
              <button
                type="submit"
                disabled={!isFormValid() || isProcessing}
                className={combineClasses(
                  "w-full py-3 px-4 rounded-lg font-medium transition-all duration-200",
                  isFormValid() && !isProcessing
                    ? "bg-blue-600 hover:bg-blue-700 text-white"
                    : "bg-gray-700 text-gray-400 cursor-not-allowed"
                )}
              >
                {isProcessing ? 'Processing...' : 
                  paymentMethod === 'gcash' ? 
                    `Pay with GCash ₱${getCurrentPrice().toLocaleString()}` : 
                    `Pay ₱${getCurrentPrice().toLocaleString()}`
                }
              </button>
            </form>
          )}

          {/* Processing State */}
          {paymentStep === 'processing' && (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Processing your payment...</p>
            </div>
          )}

          {/* Success State */}
          {paymentStep === 'success' && (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Payment Successful!</h3>
              <p className="text-gray-400">Your payment has been processed successfully.</p>
            </div>
          )}

          {/* Error State */}
          {paymentStep === 'error' && (
            <div className="text-center py-8">
              <div className="w-12 h-12 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-4">
                <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">Payment Failed</h3>
              <p className="text-gray-400 mb-4">There was an error processing your payment. Please try again.</p>
              <button
                onClick={() => setPaymentStep('form')}
                className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default PaymentModal;
