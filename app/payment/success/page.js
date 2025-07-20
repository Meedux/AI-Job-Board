'use client';

import { useEffect, useState, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '../../../contexts/AuthContext';
import { useSubscription } from '../../../contexts/SubscriptionContext';

// Separate component that uses useSearchParams
function PaymentSuccessContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { user } = useAuth();
  const { loadUserData } = useSubscription();
  
  const [processing, setProcessing] = useState(true);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState(null);
  const [countdown, setCountdown] = useState(10);
  const [paymentDetails, setPaymentDetails] = useState(null);

  useEffect(() => {
    const paymentIntentId = searchParams.get('payment_intent_id');
    
    if (!paymentIntentId) {
      setError('Payment intent ID not found');
      setProcessing(false);
      return;
    }

    processPayment(paymentIntentId);
  }, [searchParams]);

  // Function to get role-specific dashboard URL
  const getRoleBasedDashboard = (userRole) => {
    switch (userRole) {
      case 'super_admin':
        return '/admin';
      case 'employer_admin':
        return '/admin';
      case 'sub_user':
        return '/admin';
      case 'job_seeker':
      default:
        return '/dashboard';
    }
  };

  useEffect(() => {
    if (success && countdown > 0) {
      const timer = setTimeout(() => {
        setCountdown(countdown - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else if (success && countdown === 0) {
      const dashboardUrl = getRoleBasedDashboard(user?.role);
      router.push(dashboardUrl);
    }
  }, [success, countdown, router, user]);

  const processPayment = async (paymentIntentId) => {
    try {
      console.log('🔄 Processing payment on success page:', paymentIntentId);
      
      // Poll for payment completion with retries
      const maxAttempts = 10;
      const pollInterval = 3000; // 3 seconds
      
      for (let attempt = 1; attempt <= maxAttempts; attempt++) {
        console.log(`🔍 Checking payment status (attempt ${attempt}/${maxAttempts})`);
        
        // Wait before checking (except first attempt)
        if (attempt > 1) {
          await new Promise(resolve => setTimeout(resolve, pollInterval));
        }
        
        const response = await fetch(`/api/payment/process?paymentIntentId=${paymentIntentId}`, {
          method: 'GET',
          headers: {
            'Content-Type': 'application/json',
          },
          credentials: 'include',
        });

        const result = await response.json();
        
        console.log(`📋 Payment processing result (attempt ${attempt}):`, result);

        if (result.success && result.status === 'succeeded') {
          console.log('✅ Payment processed successfully');
          setPaymentDetails(result.data);
          setSuccess(true);
          
          // Refresh user data
          if (user) {
            await loadUserData();
          }
          return;
        } else if (result.success && result.alreadyProcessed) {
          console.log('✅ Payment already processed');
          setPaymentDetails(result.data);
          setSuccess(true);
          
          // Refresh user data
          if (user) {
            await loadUserData();
          }
          return;
        } else if (result.status === 'awaiting_next_action') {
          console.log('🔄 Payment still awaiting next action, continuing to poll...');
          continue;
        } else if (result.status === 'failed') {
          console.error('❌ Payment failed:', result);
          setError(`Payment failed. Please try again or contact support.`);
          return;
        }
        
        // If we get here, payment might still be processing
        if (attempt === maxAttempts) {
          console.error('❌ Payment processing timed out');
          setError('Payment processing is taking longer than expected. Please check your dashboard or contact support.');
          return;
        }
      }
    } catch (error) {
      console.error('❌ Error processing payment:', error);
      setError('Failed to process payment. Please contact support.');
    } finally {
      setProcessing(false);
    }
  };

  if (processing) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-gray-800 rounded-lg shadow-xl p-8 text-center">
            <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-6"></div>
            <h1 className="text-2xl font-bold text-white mb-4">Processing Payment</h1>
            <p className="text-gray-300 mb-4">
              Thank you for your payment! We're confirming your transaction with the payment provider and activating your purchase.
            </p>
            <p className="text-gray-400 text-sm">
              This may take a few moments. Please don't close this page.
            </p>
            <div className="mt-6 bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-center space-x-2">
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-100"></div>
                <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse delay-200"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-gray-800 rounded-lg shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-red-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Payment Processing Error</h1>
            <p className="text-gray-300 mb-6">{error}</p>
            <div className="space-y-3">
              <button
                onClick={() => router.push(getRoleBasedDashboard(user?.role))}
                className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Go to Dashboard
              </button>
              <button
                onClick={() => router.push('/pricing')}
                className="w-full bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (success) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="max-w-md w-full mx-4">
          <div className="bg-gray-800 rounded-lg shadow-xl p-8 text-center">
            <div className="w-16 h-16 bg-green-500 rounded-full flex items-center justify-center mx-auto mb-6">
              <svg className="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
            </div>
            <h1 className="text-2xl font-bold text-white mb-4">Payment Successful!</h1>
            <p className="text-gray-300 mb-6">
              Your payment has been processed successfully and your purchase has been activated.
            </p>
            
            {paymentDetails && (
              <div className="bg-gray-700 rounded-lg p-4 mb-6 text-left">
                <h3 className="text-lg font-semibold text-white mb-3">Purchase Details:</h3>
                {paymentDetails.subscription && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Plan:</span>
                      <span className="text-white">{paymentDetails.subscription.plan?.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Status:</span>
                      <span className="text-green-400">Active</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Valid Until:</span>
                      <span className="text-white">
                        {new Date(paymentDetails.subscription.currentPeriodEnd).toLocaleDateString()}
                      </span>
                    </div>
                  </div>
                )}
                {paymentDetails.creditPackage && (
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-300">Package:</span>
                      <span className="text-white">{paymentDetails.creditPackage.name}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Credits:</span>
                      <span className="text-green-400">
                        {paymentDetails.creditPackage.creditAmount + paymentDetails.creditPackage.bonusCredits}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-300">Type:</span>
                      <span className="text-white">{paymentDetails.creditPackage.creditType}</span>
                    </div>
                  </div>
                )}
              </div>
            )}
            
            <div className="bg-blue-600 rounded-lg p-4 mb-6">
              <p className="text-white">
                Redirecting to {user?.role === 'job_seeker' ? 'your dashboard' : 'admin panel'} in <span className="font-bold">{countdown}</span> seconds...
              </p>
            </div>
            
            <button
              onClick={() => router.push(getRoleBasedDashboard(user?.role))}
              className="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
            >
              {user?.role === 'job_seeker' ? 'Go to Dashboard Now' : 'Go to Admin Panel Now'}
            </button>
          </div>
        </div>
      </div>
    );
  }

  return null;
}

// Loading fallback component
function PaymentSuccessLoading() {
  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center">
      <div className="max-w-md w-full mx-4">
        <div className="bg-gray-800 rounded-lg shadow-xl p-8 text-center">
          <div className="animate-spin rounded-full h-16 w-16 border-b-2 border-blue-500 mx-auto mb-6"></div>
          <h1 className="text-2xl font-bold text-white mb-4">Loading Payment Status</h1>
          <p className="text-gray-300">
            Please wait while we check your payment status...
          </p>
        </div>
      </div>
    </div>
  );
}

// Main component with Suspense boundary
export default function PaymentSuccessPage() {
  return (
    <Suspense fallback={<PaymentSuccessLoading />}>
      <PaymentSuccessContent />
    </Suspense>
  );
}
