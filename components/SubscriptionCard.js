'use client';

import { useState, useEffect } from 'react';
import { useSubscription } from '../contexts/SubscriptionContext';
import { useAuth } from '../contexts/AuthContext';
import PaymentModal from './PaymentModal';
import { combineClasses } from '../utils/designSystem';

const SubscriptionCard = ({ plan, isPopular = false, className = '', defaultBillingCycle = 'monthly', currentSubscription = null }) => {
  const { subscribeToPlan, subscription, loading } = useSubscription();
  const { user } = useAuth();
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [billingCycle, setBillingCycle] = useState(defaultBillingCycle);

  // Update billing cycle when defaultBillingCycle changes
  useEffect(() => {
    setBillingCycle(defaultBillingCycle);
  }, [defaultBillingCycle]);

  const isCurrentPlan = currentSubscription?.planId === plan.id;
  const isUpgrade = currentSubscription && plan.priceMonthly > currentSubscription.plan?.priceMonthly;

  const handleSubscribe = async () => {
    if (!user) {
      // Redirect to login or show login modal
      window.location.href = '/login';
      return;
    }

    try {
      const result = await subscribeToPlan(plan.id, billingCycle);
      
      if (result.isFree) {
        // Free subscription activated directly
        handlePaymentSuccess();
      } else {
        // Paid subscription - show payment modal
        setShowPaymentModal(true);
      }
    } catch (error) {
      console.error('Failed to initiate subscription:', error);
    }
  };

  const handlePaymentSuccess = () => {
    setShowPaymentModal(false);
    // Refresh subscription data
    window.location.reload();
  };

  const formatPrice = (price) => {
    return price === 0 ? 'Free' : `₱${price.toLocaleString()}`;
  };

  const getCurrentPrice = () => {
    if (billingCycle === 'yearly' && plan.price_yearly) {
      return plan.price_yearly;
    }
    return plan.price_monthly;
  };

  const getPriceLabel = () => {
    if (getCurrentPrice() === 0) return '';
    return billingCycle === 'yearly' ? '/year' : '/month';
  };

  const getButtonText = () => {
    if (isCurrentPlan) return 'Current Plan';
    if (isUpgrade) return 'Upgrade';
    if (plan.price_monthly === 0) return 'Get Started';
    return user ? 'Subscribe' : 'Login to Subscribe';
  };

  const getButtonStyle = () => {
    if (isCurrentPlan) {
      return "bg-gray-700 text-gray-400 cursor-not-allowed";
    }
    if (isUpgrade) {
      return "bg-green-600 hover:bg-green-700 text-white";
    }
    if (isPopular) {
      return "bg-blue-600 hover:bg-blue-700 text-white";
    }
    return "bg-gray-700 hover:bg-gray-600 text-white";
  };

  return (
    <>
      <div className={combineClasses(
        "relative bg-gray-900 rounded-xl p-4 border transition-all duration-300 hover:shadow-xl flex flex-col h-full",
        isPopular ? "border-blue-500 shadow-lg shadow-blue-500/20" : "border-gray-700 hover:border-gray-600",
        className
      )}>
        {/* Popular Badge */}
        {isPopular && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-blue-600 text-white px-4 py-1 rounded-full text-sm font-medium">
              Most Popular
            </div>
          </div>
        )}

        {/* Current Plan Badge */}
        {isCurrentPlan && (
          <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
            <div className="bg-green-600 text-white px-4 py-1 rounded-full text-sm font-medium">
              Current Plan
            </div>
          </div>
        )}

        {/* Header */}
        <div className="text-center mb-4">
          <h3 className="text-lg font-bold text-white mb-2">{plan.name}</h3>
          <p className="text-gray-400 text-xs mb-3">{plan.description}</p>
          
          {/* Price */}
          <div className="mb-3">
            <div className="text-2xl font-bold text-white mb-1">
              {formatPrice(getCurrentPrice())}
              {getCurrentPrice() > 0 && (
                <span className="text-xs font-normal text-gray-400">{getPriceLabel()}</span>
              )}
            </div>
            
            {/* Savings indicator for yearly */}
            {billingCycle === 'yearly' && plan.price_yearly && (
              <div className="text-xs text-green-400">
                Save {Math.round((1 - plan.price_yearly / (plan.price_monthly * 12)) * 100)}% annually
              </div>
            )}
          </div>
        </div>

        {/* Features */}
        <div className="space-y-2 mb-4 flex-grow">
          {plan.features && Object.entries(plan.features).map(([key, value], index) => (
            <div key={index} className="flex items-center gap-2">
              <svg className="w-4 h-4 text-green-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span className="text-gray-300 text-xs">
                {key.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
                {typeof value === 'number' && value > 0 ? ` (${value})` : ''}
              </span>
            </div>
          ))}
        </div>

        {/* Bottom Section - Always at bottom */}
        <div className="mt-auto">
          {/* Limits */}
          <div className="space-y-1 mb-4 text-xs text-gray-400">
            {plan.max_resume_views > 0 && (
              <div className="flex justify-between">
                <span>Resume Views:</span>
                <span className="font-medium">{plan.max_resume_views}/month</span>
              </div>
            )}
            {plan.max_resume_views === 0 && (
              <div className="flex justify-between">
                <span>Resume Views:</span>
                <span className="font-medium text-green-400">Unlimited</span>
              </div>
            )}
            
            {plan.max_ai_credits > 0 && (
              <div className="flex justify-between">
                <span>AI Credits:</span>
                <span className="font-medium">{plan.max_ai_credits}/month</span>
              </div>
            )}
            {plan.max_ai_credits === 0 && (
              <div className="flex justify-between">
                <span>AI Credits:</span>
                <span className="font-medium text-green-400">Unlimited</span>
              </div>
            )}
            
            {plan.max_job_applications > 0 && (
              <div className="flex justify-between">
                <span>Job Applications:</span>
                <span className="font-medium">{plan.max_job_applications}/month</span>
              </div>
            )}
            {plan.max_job_applications === 0 && (
              <div className="flex justify-between">
                <span>Job Applications:</span>
                <span className="font-medium text-green-400">Unlimited</span>
              </div>
            )}
          </div>

          {/* CTA Button */}
          <button
            onClick={handleSubscribe}
            disabled={isCurrentPlan || loading}
            className={combineClasses(
              "w-full py-2 px-3 rounded-lg font-medium text-sm transition-all duration-200",
              "disabled:cursor-not-allowed disabled:opacity-50",
              getButtonStyle()
            )}
          >
            {loading ? 'Processing...' : getButtonText()}
          </button>

          {/* Additional Info */}
          {plan.price_monthly > 0 && (
            <div className="mt-3 text-center">
              <p className="text-xs text-gray-500">
                Cancel anytime. No long-term contracts.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Payment Modal */}
      <PaymentModal
        isOpen={showPaymentModal}
        onClose={() => setShowPaymentModal(false)}
        paymentType="subscription"
        planData={plan}
        billingCycle={billingCycle}
        onSuccess={handlePaymentSuccess}
      />
    </>
  );
};

export default SubscriptionCard;
