'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import { colors, typography, components, layout, spacing } from '../../utils/designSystem';

export default function PricingPage() {
  const [isAnnual, setIsAnnual] = useState(false);

  const plans = [
    {
      id: 'starter',
      name: 'Starter',
      description: 'Perfect for small businesses just getting started',
      monthlyPrice: 19,
      annualPrice: 190,
      features: [
        'Post up to 3 jobs per month',
        'Basic candidate filtering',
        'Email support',
        '30-day job posting duration',
        'Standard job templates',
        'Basic analytics'
      ],
      limitations: [
        'Limited to 3 active jobs',
        'No premium job highlighting',
        'Standard support only'
      ],
      buttonText: 'Start Free Trial',
      popular: false
    },
    {
      id: 'professional',
      name: 'Professional',
      description: 'Ideal for growing companies with regular hiring needs',
      monthlyPrice: 79,
      annualPrice: 790,
      features: [
        'Post unlimited jobs',
        'Advanced candidate filtering',
        'Priority email & chat support',
        '60-day job posting duration',
        'Custom job templates',
        'Advanced analytics dashboard',
        'Resume database access',
        'Job promotion & highlighting',
        'Bulk job posting',
        'Team collaboration tools'
      ],
      limitations: [],
      buttonText: 'Start Free Trial',
      popular: true
    },
    {
      id: 'enterprise',
      name: 'Enterprise',
      description: 'For large organizations with complex hiring workflows',
      monthlyPrice: 199,
      annualPrice: 1990,
      features: [
        'Everything in Professional',
        'Dedicated account manager',
        'Custom integrations & API access',
        'White-label solution',
        'Advanced reporting & analytics',
        '24/7 phone support',
        'Custom workflows',
        'SSO integration',
        'Compliance & security features',
        'Onboarding assistance',
        'Custom training sessions'
      ],
      limitations: [],
      buttonText: 'Contact Sales',
      popular: false
    }
  ];

  const faqs = [
    {
      question: 'How does the free trial work?',
      answer: 'You get full access to your chosen plan for 14 days, no credit card required. You can post jobs, access all features, and cancel anytime during the trial period.'
    },
    {
      question: 'Can I change my plan later?',
      answer: 'Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any billing adjustments.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), PayPal, and bank transfers for Enterprise customers.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'Yes, we offer a 30-day money-back guarantee. If you\'re not satisfied, we\'ll refund your payment in full, no questions asked.'
    },
    {
      question: 'Is there a setup fee?',
      answer: 'No setup fees ever! The price you see is the price you pay. Enterprise customers may have optional onboarding services available.'
    },
    {
      question: 'How does billing work?',
      answer: 'You\'re billed monthly or annually based on your preference. Annual plans come with a 20% discount. All billing is handled securely through our payment processor.'
    }
  ];

  const [openFaq, setOpenFaq] = useState(null);

  const toggleFaq = (index) => {
    setOpenFaq(openFaq === index ? null : index);
  };

  const getPrice = (plan) => {
    return isAnnual ? plan.annualPrice : plan.monthlyPrice;
  };

  const getSavings = (plan) => {
    if (!isAnnual) return 0;
    const monthlyTotal = plan.monthlyPrice * 12;
    return monthlyTotal - plan.annualPrice;
  };

  return (
    <div className={`min-h-screen ${colors.neutral.background} font-sans`}>
      <Header />
      
      {/* Hero Section */}
      <div className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <h1 className={`${typography.h1} ${colors.neutral.textPrimary} mb-6`}>
            Simple, Transparent Pricing
          </h1>
          <p className={`${typography.bodyLarge} ${colors.neutral.textTertiary} max-w-2xl mx-auto mb-8`}>
            Choose the perfect plan for your hiring needs. Start with a free trial and upgrade anytime.
          </p>
          
          {/* Billing Toggle */}
          <div className="flex items-center justify-center space-x-4 mb-12">
            <span className={`${typography.bodyBase} ${colors.neutral.textSecondary} ${!isAnnual ? 'font-medium' : ''}`}>
              Monthly
            </span>
            <button
              onClick={() => setIsAnnual(!isAnnual)}
              className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 ${
                isAnnual ? 'bg-blue-600' : 'bg-gray-200'
              }`}
            >
              <span
                className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                  isAnnual ? 'translate-x-6' : 'translate-x-1'
                }`}
              />
            </button>
            <span className={`${typography.bodyBase} ${colors.neutral.textSecondary} ${isAnnual ? 'font-medium' : ''}`}>
              Annual
            </span>
            {isAnnual && (
              <span className={`${colors.success.text} ${typography.bodySmall} font-medium px-2 py-1 ${colors.success.background} rounded-full`}>
                Save 20%
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Pricing Plans */}
      <div className="px-4 pb-20">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan) => (
              <div
                key={plan.id}
                className={`${components.card.base} ${components.card.padding} relative transition-all duration-200 ${
                  plan.popular 
                    ? 'ring-2 ring-blue-500 scale-105 shadow-xl' 
                    : 'hover:shadow-lg'
                }`}
              >
                {plan.popular && (
                  <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                    <span className={`${colors.primary[600]} text-white px-4 py-2 rounded-full ${typography.bodySmall} font-medium shadow-lg`}>
                      Most Popular
                    </span>
                  </div>
                )}
                
                <div className="text-center mb-8">
                  <h3 className={`${typography.h3} ${colors.neutral.textPrimary} mb-2`}>
                    {plan.name}
                  </h3>
                  <p className={`${typography.bodyBase} ${colors.neutral.textTertiary} mb-6`}>
                    {plan.description}
                  </p>
                  
                  <div className="mb-4">
                    <span className={`${typography.h1} ${colors.neutral.textPrimary} font-bold`}>
                      ${getPrice(plan)}
                    </span>
                    <span className={`${colors.neutral.textTertiary} ${typography.bodyBase}`}>
                      /{isAnnual ? 'year' : 'month'}
                    </span>
                  </div>
                  
                  {isAnnual && getSavings(plan) > 0 && (
                    <p className={`${colors.success.text} ${typography.bodySmall} font-medium`}>
                      Save ${getSavings(plan)} per year
                    </p>
                  )}
                </div>
                
                <div className="mb-8">
                  <h4 className={`${typography.h6} ${colors.neutral.textPrimary} mb-4`}>
                    Features included:
                  </h4>
                  <ul className="space-y-3">
                    {plan.features.map((feature, index) => (
                      <li key={index} className={`flex items-start space-x-3 ${typography.bodySmall}`}>
                        <svg className={`w-5 h-5 ${colors.success.text} mt-0.5 flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                        </svg>
                        <span className={colors.neutral.textSecondary}>{feature}</span>
                      </li>
                    ))}
                  </ul>
                  
                  {plan.limitations.length > 0 && (
                    <div className="mt-6">
                      <h4 className={`${typography.bodySmall} ${colors.neutral.textMuted} mb-2 font-medium`}>
                        Limitations:
                      </h4>
                      <ul className="space-y-2">
                        {plan.limitations.map((limitation, index) => (
                          <li key={index} className={`flex items-start space-x-3 ${typography.bodyXSmall}`}>
                            <svg className={`w-4 h-4 ${colors.neutral.textMuted} mt-0.5 flex-shrink-0`} fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M4.293 4.293a1 1 0 011.414 0L10 8.586l4.293-4.293a1 1 0 111.414 1.414L11.414 10l4.293 4.293a1 1 0 01-1.414 1.414L10 11.414l-4.293 4.293a1 1 0 01-1.414-1.414L8.586 10 4.293 5.707a1 1 0 010-1.414z" clipRule="evenodd" />
                            </svg>
                            <span className={colors.neutral.textMuted}>{limitation}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
                
                <div className="mt-auto">
                  {plan.buttonText === 'Contact Sales' ? (
                    <Link
                      href="/feedback"
                      className={`w-full ${components.button.base} ${plan.popular ? components.button.primary : components.button.secondary} ${components.button.sizes.large} flex items-center justify-center space-x-2`}
                    >
                      <span>{plan.buttonText}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                      </svg>
                    </Link>
                  ) : (
                    <Link
                      href="/payment-method"
                      className={`w-full ${components.button.base} ${plan.popular ? components.button.primary : components.button.secondary} ${components.button.sizes.large} flex items-center justify-center space-x-2`}
                    >
                      <span>{plan.buttonText}</span>
                      <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                      </svg>
                    </Link>
                  )}
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Features Comparison */}
      <div className="px-4 py-20 bg-gray-50 dark:bg-gray-800">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`${typography.h2} ${colors.neutral.textPrimary} mb-4`}>
              Why Choose GetGetHired?
            </h2>
            <p className={`${typography.bodyLarge} ${colors.neutral.textTertiary} max-w-3xl mx-auto`}>
              We provide the tools and support you need to find the best talent for your organization.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[
              {
                icon: '🎯',
                title: 'Targeted Reach',
                description: 'Connect with qualified candidates through our advanced matching algorithms and extensive network.'
              },
              {
                icon: '⚡',
                title: 'Fast Hiring',
                description: 'Streamline your hiring process with automated workflows and instant candidate notifications.'
              },
              {
                icon: '📊',
                title: 'Smart Analytics',
                description: 'Make data-driven hiring decisions with comprehensive analytics and performance insights.'
              },
              {
                icon: '🔒',
                title: 'Secure & Compliant',
                description: 'Enterprise-grade security with GDPR compliance and SOC 2 certification for peace of mind.'
              },
              {
                icon: '🤝',
                title: 'Expert Support',
                description: 'Get help from our dedicated support team and hiring experts whenever you need it.'
              },
              {
                icon: '🚀',
                title: 'Scale with Growth',
                description: 'Our platform grows with your business, from startup to enterprise with flexible solutions.'
              }
            ].map((feature, index) => (
              <div key={index} className={`${components.card.base} ${components.card.padding} text-center`}>
                <div className="text-4xl mb-4">{feature.icon}</div>
                <h3 className={`${typography.h5} ${colors.neutral.textPrimary} mb-3`}>
                  {feature.title}
                </h3>
                <p className={`${typography.bodyBase} ${colors.neutral.textTertiary}`}>
                  {feature.description}
                </p>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* FAQ Section */}
      <div className="px-4 py-20">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <h2 className={`${typography.h2} ${colors.neutral.textPrimary} mb-4`}>
              Frequently Asked Questions
            </h2>
            <p className={`${typography.bodyLarge} ${colors.neutral.textTertiary}`}>
              Everything you need to know about our pricing and plans.
            </p>
          </div>
          
          <div className="space-y-4">
            {faqs.map((faq, index) => (
              <div key={index} className={`${components.card.base} ${components.card.padding}`}>
                <button
                  onClick={() => toggleFaq(index)}
                  className="w-full flex justify-between items-center text-left"
                >
                  <h3 className={`${typography.h6} ${colors.neutral.textPrimary}`}>
                    {faq.question}
                  </h3>
                  <svg
                    className={`w-5 h-5 ${colors.neutral.textSecondary} transition-transform ${
                      openFaq === index ? 'transform rotate-180' : ''
                    }`}
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                {openFaq === index && (
                  <div className="mt-4 pt-4 border-t border-gray-200 dark:border-gray-700">
                    <p className={`${typography.bodyBase} ${colors.neutral.textTertiary}`}>
                      {faq.answer}
                    </p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* CTA Section */}
      <div className="px-4 py-20 bg-gradient-to-r from-blue-600 to-purple-600">
        <div className="max-w-4xl mx-auto text-center">
          <h2 className={`${typography.h2} text-white mb-4`}>
            Ready to Find Your Next Great Hire?
          </h2>
          <p className={`${typography.bodyLarge} text-blue-100 mb-8 max-w-2xl mx-auto`}>
            Join thousands of companies using GetGetHired to build amazing teams. Start your free trial today.
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link
              href="/payment-method"
              className="px-8 py-3 bg-white text-blue-600 rounded-lg font-medium hover:bg-gray-50 transition-colors"
            >
              Start Free Trial
            </Link>
            <Link
              href="/feedback"
              className="px-8 py-3 border-2 border-white text-white rounded-lg font-medium hover:bg-white hover:text-blue-600 transition-colors"
            >
              Contact Sales
            </Link>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}