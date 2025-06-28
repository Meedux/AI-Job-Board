'use client';

import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { colors, typography, components, layout, spacing } from '../../utils/designSystem';

export default function PaymentMethodPage() {
  const [selectedPlan, setSelectedPlan] = useState('pro');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState('card');
  const [formData, setFormData] = useState({
    cardNumber: '',
    expiryDate: '',
    cvv: '',
    name: '',
    email: '',
    billingAddress: ''
  });
  const [isProcessing, setIsProcessing] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);

  const plans = [
    {
      id: 'basic',
      name: 'Basic',
      price: 29,
      period: 'month',
      features: [
        'Post up to 5 jobs',
        'Basic candidate filtering',
        'Email support',
        '30-day job posting'
      ]
    },
    {
      id: 'pro',
      name: 'Professional',
      price: 79,
      period: 'month',
      popular: true,
      features: [
        'Post unlimited jobs',
        'Advanced candidate filtering',
        'Priority support',
        '60-day job posting',
        'Resume database access',
        'Analytics dashboard'
      ]
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      price: 199,
      period: 'month',
      features: [
        'Everything in Professional',
        'Dedicated account manager',
        'Custom integrations',
        'White-label solution',
        'Advanced analytics',
        '24/7 phone support'
      ]
    }
  ];

  const paymentMethods = [
    { id: 'card', name: 'Credit/Debit Card', icon: '💳' },
    { id: 'paypal', name: 'PayPal', icon: '🟦' },
    { id: 'bank', name: 'Bank Transfer', icon: '🏦' }
  ];

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsProcessing(true);
    
    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      setShowSuccess(true);
    }, 2000);
  };

  const formatCardNumber = (value) => {
    const v = value.replace(/\s+/g, '').replace(/[^0-9]/gi, '');
    const matches = v.match(/\d{4,16}/g);
    const match = matches && matches[0] || '';
    const parts = [];
    for (let i = 0, len = match.length; i < len; i += 4) {
      parts.push(match.substring(i, i + 4));
    }
    if (parts.length) {
      return parts.join(' ');
    } else {
      return v;
    }
  };

  const selectedPlanData = plans.find(plan => plan.id === selectedPlan);

  return (
    <div className={`min-h-screen ${colors.neutral.background} font-sans`}>
      <Header />
      
      {/* Hero Section */}
      <div className="py-16 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className={`${typography.h1} ${colors.neutral.textPrimary} mb-4`}>
            Choose Your Plan
          </h1>
          <p className={`${typography.bodyLarge} ${colors.neutral.textTertiary} max-w-2xl mx-auto`}>
            Select the perfect plan for your hiring needs and complete your payment to get started.
          </p>
        </div>
      </div>

      <div className="px-4 pb-20">
        <div className="max-w-6xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            {/* Plans Selection */}
            <div className="lg:col-span-2">
              <h2 className={`${typography.h3} ${colors.neutral.textPrimary} mb-6`}>
                Select a Plan
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {plans.map((plan) => (
                  <div
                    key={plan.id}
                    className={`${components.card.base} ${components.card.padding} cursor-pointer transition-all duration-200 relative ${
                      selectedPlan === plan.id 
                        ? 'ring-2 ring-blue-500 border-blue-500' 
                        : 'hover:shadow-lg'
                    }`}
                    onClick={() => setSelectedPlan(plan.id)}
                  >
                    {plan.popular && (
                      <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                        <span className={`${colors.primary[600]} text-white px-3 py-1 rounded-full ${typography.bodySmall} font-medium`}>
                          Most Popular
                        </span>
                      </div>
                    )}
                    
                    <div className="text-center">
                      <h3 className={`${typography.h5} ${colors.neutral.textPrimary} mb-2`}>
                        {plan.name}
                      </h3>
                      <div className="mb-4">
                        <span className={`${typography.h2} ${colors.neutral.textPrimary} font-bold`}>
                          ${plan.price}
                        </span>
                        <span className={`${colors.neutral.textTertiary} ${typography.bodyBase}`}>
                          /{plan.period}
                        </span>
                      </div>
                      
                      <ul className="space-y-2 text-left">
                        {plan.features.map((feature, index) => (
                          <li key={index} className={`flex items-start space-x-2 ${typography.bodySmall}`}>
                            <svg className={`w-4 h-4 ${colors.primary.text} mt-0.5 flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                            <span className={colors.neutral.textTertiary}>{feature}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment Method Selection */}
              <h2 className={`${typography.h3} ${colors.neutral.textPrimary} mb-6`}>
                Payment Method
              </h2>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-8">
                {paymentMethods.map((method) => (
                  <div
                    key={method.id}
                    className={`${components.card.base} ${components.card.padding} cursor-pointer transition-all duration-200 ${
                      selectedPaymentMethod === method.id 
                        ? 'ring-2 ring-blue-500 border-blue-500' 
                        : 'hover:shadow-md'
                    }`}
                    onClick={() => setSelectedPaymentMethod(method.id)}
                  >
                    <div className="flex items-center space-x-3">
                      <span className="text-2xl">{method.icon}</span>
                      <span className={`${typography.bodyBase} ${colors.neutral.textPrimary} font-medium`}>
                        {method.name}
                      </span>
                    </div>
                  </div>
                ))}
              </div>

              {/* Payment Form */}
              {selectedPaymentMethod === 'card' && (
                <div className={`${components.card.base} ${components.card.padding}`}>
                  <h3 className={`${typography.h4} ${colors.neutral.textPrimary} mb-6`}>
                    Card Information
                  </h3>
                  
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className={`block ${typography.bodyBase} font-medium ${colors.neutral.textPrimary} mb-2`}>
                        Card Number
                      </label>
                      <input
                        type="text"
                        name="cardNumber"
                        value={formData.cardNumber}
                        onChange={(e) => {
                          const formatted = formatCardNumber(e.target.value);
                          setFormData(prev => ({ ...prev, cardNumber: formatted }));
                        }}
                        placeholder="1234 5678 9012 3456"
                        className={`w-full rounded-lg ${colors.neutral.border} ${colors.neutral.surface} px-4 py-3 ${typography.bodyBase} placeholder:${colors.neutral.textMuted} hover:${colors.neutral.borderHover} focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200`}
                        required
                      />
                    </div>
                    
                    <div className="grid grid-cols-2 gap-4">
                      <div>
                        <label className={`block ${typography.bodyBase} font-medium ${colors.neutral.textPrimary} mb-2`}>
                          Expiry Date
                        </label>
                        <input
                          type="text"
                          name="expiryDate"
                          value={formData.expiryDate}
                          onChange={handleInputChange}
                          placeholder="MM/YY"
                          className={`w-full rounded-lg ${colors.neutral.border} ${colors.neutral.surface} px-4 py-3 ${typography.bodyBase} placeholder:${colors.neutral.textMuted} hover:${colors.neutral.borderHover} focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200`}
                          required
                        />
                      </div>
                      <div>
                        <label className={`block ${typography.bodyBase} font-medium ${colors.neutral.textPrimary} mb-2`}>
                          CVV
                        </label>
                        <input
                          type="text"
                          name="cvv"
                          value={formData.cvv}
                          onChange={handleInputChange}
                          placeholder="123"
                          className={`w-full rounded-lg ${colors.neutral.border} ${colors.neutral.surface} px-4 py-3 ${typography.bodyBase} placeholder:${colors.neutral.textMuted} hover:${colors.neutral.borderHover} focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200`}
                          required
                        />
                      </div>
                    </div>
                    
                    <div>
                      <label className={`block ${typography.bodyBase} font-medium ${colors.neutral.textPrimary} mb-2`}>
                        Cardholder Name
                      </label>
                      <input
                        type="text"
                        name="name"
                        value={formData.name}
                        onChange={handleInputChange}
                        placeholder="John Smith"
                        className={`w-full rounded-lg ${colors.neutral.border} ${colors.neutral.surface} px-4 py-3 ${typography.bodyBase} placeholder:${colors.neutral.textMuted} hover:${colors.neutral.borderHover} focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200`}
                        required
                      />
                    </div>
                  </form>
                </div>
              )}

              {selectedPaymentMethod === 'paypal' && (
                <div className={`${components.card.base} ${components.card.padding} text-center`}>
                  <div className="py-8">
                    <div className="text-4xl mb-4">🟦</div>
                    <h3 className={`${typography.h4} ${colors.neutral.textPrimary} mb-2`}>
                      PayPal Payment
                    </h3>
                    <p className={`${typography.bodyBase} ${colors.neutral.textTertiary}`}>
                      You will be redirected to PayPal to complete your payment securely.
                    </p>
                  </div>
                </div>
              )}

              {selectedPaymentMethod === 'bank' && (
                <div className={`${components.card.base} ${components.card.padding}`}>
                  <h3 className={`${typography.h4} ${colors.neutral.textPrimary} mb-4`}>
                    Bank Transfer Details
                  </h3>
                  <div className={`${colors.neutral.backgroundSecondary} rounded-lg p-4 ${typography.bodySmall}`}>
                    <div className="space-y-2">
                      <div><strong>Account Name:</strong> GetGetHired Inc.</div>
                      <div><strong>Account Number:</strong> 1234567890</div>
                      <div><strong>Routing Number:</strong> 987654321</div>
                      <div><strong>Reference:</strong> {selectedPlanData?.name} Plan - {formData.email}</div>
                    </div>
                  </div>
                  <p className={`${typography.bodySmall} ${colors.neutral.textTertiary} mt-4`}>
                    Please include the reference number in your transfer description.
                  </p>
                </div>
              )}
            </div>

            {/* Order Summary */}
            <div className="lg:col-span-1">
              <div className={`${components.card.base} ${components.card.padding} sticky top-4`}>
                <h3 className={`${typography.h4} ${colors.neutral.textPrimary} mb-6`}>
                  Order Summary
                </h3>
                
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span className={`${typography.bodyBase} ${colors.neutral.textSecondary}`}>
                      {selectedPlanData?.name} Plan
                    </span>
                    <span className={`${typography.bodyBase} ${colors.neutral.textPrimary} font-medium`}>
                      ${selectedPlanData?.price}/{selectedPlanData?.period}
                    </span>
                  </div>
                  
                  <div className="flex justify-between items-center">
                    <span className={`${typography.bodyBase} ${colors.neutral.textSecondary}`}>
                      Tax (10%)
                    </span>
                    <span className={`${typography.bodyBase} ${colors.neutral.textPrimary} font-medium`}>
                      ${Math.round(selectedPlanData?.price * 0.1)}
                    </span>
                  </div>
                  
                  <hr className={colors.neutral.borderLight} />
                  
                  <div className="flex justify-between items-center">
                    <span className={`${typography.h5} ${colors.neutral.textPrimary}`}>
                      Total
                    </span>
                    <span className={`${typography.h5} ${colors.neutral.textPrimary} font-bold`}>
                      ${Math.round(selectedPlanData?.price * 1.1)}
                    </span>
                  </div>
                </div>
                
                <button
                  onClick={handleSubmit}
                  disabled={isProcessing}
                  className={`w-full mt-6 ${components.button.base} ${components.button.primary} ${components.button.sizes.large} flex items-center justify-center space-x-2 disabled:opacity-50 disabled:cursor-not-allowed`}
                >
                  {isProcessing ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                      <span>Processing...</span>
                    </>
                  ) : (
                    <>
                      <span>Complete Payment</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                    </>
                  )}
                </button>
                
                <p className={`${typography.bodyXSmall} ${colors.neutral.textMuted} text-center mt-4`}>
                  🔒 Your payment information is secure and encrypted
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Success Modal */}
      {showSuccess && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4">
          <div className="fixed inset-0 bg-black bg-opacity-50"></div>
          <div className="relative max-w-md w-full bg-gray-800 rounded-lg p-8 text-center">
            <div className="text-6xl mb-4">🎉</div>
            <h3 className={`${typography.h3} ${colors.neutral.textPrimary} mb-4`}>
              Payment Successful!
            </h3>
            <p className={`${typography.bodyBase} ${colors.neutral.textTertiary} mb-6`}>
              Welcome to {selectedPlanData?.name}! Your account has been upgraded and you can now start posting jobs.
            </p>
            <button
              onClick={() => setShowSuccess(false)}
              className={`${components.button.base} ${components.button.primary} ${components.button.sizes.medium} mx-auto`}
            >
              Get Started
            </button>
          </div>
        </div>
      )}

      <Footer />
    </div>
  );
}