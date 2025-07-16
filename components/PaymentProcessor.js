// Payment Processing Component - Direct approach without webhooks
import { useState, useEffect } from 'react';
import { toast } from 'react-hot-toast';

export default function PaymentProcessor({ paymentIntentId, onSuccess, onError }) {
  const [processing, setProcessing] = useState(false);
  const [checked, setChecked] = useState(false);

  const checkPaymentStatus = async () => {
    if (!paymentIntentId || processing || checked) return;

    setProcessing(true);
    setChecked(true);

    try {
      console.log('🔍 Checking payment status for:', paymentIntentId);
      
      const response = await fetch(`/api/payment/process?paymentIntentId=${paymentIntentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      console.log('📋 Payment status result:', result);

      if (result.success && result.status === 'succeeded') {
        console.log('✅ Payment successful and processed');
        toast.success('Payment successful! Your purchase has been activated.');
        
        if (onSuccess) {
          onSuccess(result.data);
        }
      } else if (result.success && result.alreadyProcessed) {
        console.log('✅ Payment already processed');
        toast.success('Payment already processed successfully.');
        
        if (onSuccess) {
          onSuccess(result.data);
        }
      } else {
        console.log('❌ Payment not successful:', result.status);
        toast.error(`Payment ${result.status}. Please try again.`);
        
        if (onError) {
          onError(result);
        }
      }
    } catch (error) {
      console.error('❌ Error checking payment status:', error);
      toast.error('Error checking payment status. Please contact support.');
      
      if (onError) {
        onError(error);
      }
    } finally {
      setProcessing(false);
    }
  };

  // Check payment status when component mounts
  useEffect(() => {
    if (paymentIntentId) {
      // Add a small delay to ensure payment is processed by Paymongo
      const timer = setTimeout(checkPaymentStatus, 2000);
      return () => clearTimeout(timer);
    }
  }, [paymentIntentId]);

  // Provide manual retry option
  const handleRetry = () => {
    setChecked(false);
    checkPaymentStatus();
  };

  if (!paymentIntentId) {
    return null;
  }

  return (
    <div className="payment-processor">
      {processing && (
        <div className="flex items-center justify-center p-4 bg-blue-50 rounded-lg">
          <div className="animate-spin rounded-full h-6 w-6 border-b-2 border-blue-600 mr-3"></div>
          <span className="text-blue-600">Processing payment...</span>
        </div>
      )}
      
      {!processing && checked && (
        <div className="flex items-center justify-center p-4 bg-gray-50 rounded-lg">
          <button
            onClick={handleRetry}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Check Payment Status Again
          </button>
        </div>
      )}
    </div>
  );
}

// Hook for manual payment processing
export function usePaymentProcessor() {
  const [processing, setProcessing] = useState(false);

  const processPayment = async (paymentIntentId) => {
    if (!paymentIntentId) {
      throw new Error('Payment intent ID is required');
    }

    setProcessing(true);

    try {
      console.log('💳 Processing payment:', paymentIntentId);
      
      const response = await fetch(`/api/payment/process?paymentIntentId=${paymentIntentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
      });

      const result = await response.json();
      
      if (result.success && result.status === 'succeeded') {
        console.log('✅ Payment processed successfully');
        toast.success('Payment successful! Your purchase has been activated.');
        return result.data;
      } else if (result.success && result.alreadyProcessed) {
        console.log('✅ Payment already processed');
        toast.success('Payment already processed successfully.');
        return result.data;
      } else {
        console.log('❌ Payment processing failed:', result);
        toast.error(`Payment ${result.status}. Please try again.`);
        throw new Error(result.error || 'Payment processing failed');
      }
    } catch (error) {
      console.error('❌ Error processing payment:', error);
      toast.error('Error processing payment. Please contact support.');
      throw error;
    } finally {
      setProcessing(false);
    }
  };

  return { processPayment, processing };
}
