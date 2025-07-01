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
    <div className={`min-h-screen ${colors.neutral.background} font-sans relative overflow-hidden`}>
      {/* Background decorations */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl" />
        <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full blur-3xl" />
        <div className="absolute top-1/3 left-1/4 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-96 h-96 bg-gradient-to-r from-green-500/5 to-blue-500/5 rounded-full blur-3xl" />
      </div>

      <Header />
      
      {/* Enhanced Hero Section */}
      <div className="relative py-20 px-4 z-10">
        <div className="max-w-6xl mx-auto text-center">
          {/* Hero Card */}
          <div className="relative mb-16">
            <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-xl" />
            <div 
              className="relative bg-gray-900/80 backdrop-blur-xl border border-gray-800/50 rounded-3xl p-8 sm:p-12 shadow-2xl"
              style={{
                background: 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)',
                boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(99, 102, 241, 0.1)',
              }}
            >
              <div className="flex items-center justify-center space-x-3 mb-6">
                <div className="text-4xl animate-bounce">💰</div>
                <h1 className={`${typography.h1} ${colors.neutral.textPrimary} font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent`}>
                  Simple, Transparent Pricing
                </h1>
                <div className="text-4xl animate-bounce" style={{ animationDelay: '0.5s' }}>✨</div>
              </div>
              <p className={`${typography.bodyLarge} ${colors.neutral.textTertiary} max-w-3xl mx-auto mb-8`}>
                Choose the perfect plan for your hiring needs. Start with a free trial and upgrade anytime with our flexible, growth-focused solutions.
              </p>
              
              {/* Enhanced Billing Toggle */}
              <div className="flex items-center justify-center space-x-6 mb-8">
                <span className={`${typography.bodyBase} ${colors.neutral.textSecondary} transition-all duration-300 ${!isAnnual ? 'font-bold text-white scale-110' : ''}`}>
                  Monthly
                </span>
                <div className="relative">
                  <button
                    onClick={() => setIsAnnual(!isAnnual)}
                    className={`relative inline-flex h-8 w-14 items-center rounded-full transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                      isAnnual ? 'bg-gradient-to-r from-indigo-500 to-purple-500 shadow-lg' : 'bg-gray-600'
                    }`}
                  >
                    <span
                      className={`inline-block h-6 w-6 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${
                        isAnnual ? 'translate-x-7' : 'translate-x-1'
                      }`}
                    />
                  </button>
                  {isAnnual && (
                    <div className="absolute -top-2 -right-2 w-4 h-4 bg-green-500 rounded-full animate-ping" />
                  )}
                </div>
                <span className={`${typography.bodyBase} ${colors.neutral.textSecondary} transition-all duration-300 ${isAnnual ? 'font-bold text-white scale-110' : ''}`}>
                  Annual
                </span>
                {isAnnual && (
                  <div className="animate-pulse">
                    <span className={`${colors.success.text} ${typography.bodySmall} font-bold px-3 py-1.5 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full shadow-lg backdrop-blur-sm`}>
                      🎉 Save 20%
                    </span>
                  </div>
                )}
              </div>

              {/* Trust indicators */}
              <div className="flex flex-wrap justify-center gap-6 text-sm text-gray-400">
                {['🔐 Secure Payments', '📱 14-Day Free Trial', '💯 Money-Back Guarantee'].map((indicator, index) => (
                  <div key={index} className="flex items-center space-x-2">
                    <span>{indicator}</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Pricing Plans */}
      <div className="relative px-4 pb-20 z-10">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {plans.map((plan, index) => (
              <div
                key={plan.id}
                className={`group relative transition-all duration-500 ${
                  plan.popular ? 'md:-translate-y-4' : ''
                }`}
              >
                {/* Popular badge glow effect */}
                {plan.popular && (
                  <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-3xl opacity-75 blur-sm group-hover:opacity-100 transition-opacity duration-300" />
                )}
                
                {/* Card background gradient */}
                <div className={`absolute inset-0 rounded-3xl opacity-0 group-hover:opacity-100 transition-opacity duration-300 ${
                  plan.popular 
                    ? 'bg-gradient-to-br from-indigo-500/10 to-purple-500/10' 
                    : 'bg-gradient-to-br from-gray-800/30 to-gray-900/30'
                }`} />
                
                <div 
                  className={`relative backdrop-blur-xl border rounded-3xl p-8 transition-all duration-300 group-hover:transform group-hover:scale-105 group-hover:shadow-2xl ${
                    plan.popular 
                      ? 'border-indigo-500/50 shadow-xl' 
                      : 'border-gray-800/50 group-hover:border-gray-700/50'
                  }`}
                  style={{
                    background: plan.popular 
                      ? 'linear-gradient(135deg, rgba(15, 23, 42, 0.9) 0%, rgba(30, 41, 59, 0.9) 100%)'
                      : 'rgba(15, 23, 42, 0.6)',
                    boxShadow: plan.popular 
                      ? '0 25px 50px -12px rgba(99, 102, 241, 0.3)'
                      : '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  {plan.popular && (
                    <div className="absolute -top-4 left-1/2 transform -translate-x-1/2 z-20">
                      <div className="relative">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full blur animate-pulse" />
                        <span className="relative bg-gradient-to-r from-indigo-500 to-purple-500 text-white px-6 py-2 rounded-full text-sm font-bold shadow-xl border border-white/20">
                          ⭐ Most Popular
                        </span>
                      </div>
                    </div>
                  )}
                  
                  {/* Plan header */}
                  <div className="text-center mb-8">
                    <div className="mb-4">
                      <div className={`w-16 h-16 mx-auto rounded-full flex items-center justify-center text-2xl mb-4 ${
                        plan.popular 
                          ? 'bg-gradient-to-br from-indigo-500/20 to-purple-500/20 border border-indigo-500/30' 
                          : 'bg-gradient-to-br from-gray-700/50 to-gray-800/50 border border-gray-600/30'
                      }`}>
                        {index === 0 ? '🚀' : index === 1 ? '⚡' : '👑'}
                      </div>
                      <h3 className={`${typography.h3} ${colors.neutral.textPrimary} mb-2 font-bold`}>
                        {plan.name}
                      </h3>
                      <p className={`${typography.bodyBase} ${colors.neutral.textTertiary} mb-6`}>
                        {plan.description}
                      </p>
                    </div>
                    
                    {/* Pricing display */}
                    <div className="mb-6">
                      <div className="flex items-baseline justify-center mb-2">
                        <span className="text-3xl font-light text-gray-400">$</span>
                        <span className={`${typography.h1} ${colors.neutral.textPrimary} font-bold bg-gradient-to-r ${
                          plan.popular 
                            ? 'from-indigo-400 to-purple-400' 
                            : 'from-white to-gray-300'
                        } bg-clip-text text-transparent`}>
                          {getPrice(plan)}
                        </span>
                        <span className={`${colors.neutral.textTertiary} ${typography.bodyBase} ml-2`}>
                          /{isAnnual ? 'year' : 'month'}
                        </span>
                      </div>
                      
                      {isAnnual && getSavings(plan) > 0 && (
                        <div className="animate-pulse">
                          <p className={`${colors.success.text} ${typography.bodySmall} font-bold px-3 py-1 bg-gradient-to-r from-green-500/20 to-emerald-500/20 border border-green-500/30 rounded-full inline-block`}>
                            💸 Save ${getSavings(plan)} per year
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Features list */}
                  <div className="mb-8">
                    <h4 className={`${typography.h6} ${colors.neutral.textPrimary} mb-6 font-bold flex items-center`}>
                      <svg className="w-5 h-5 mr-2 text-green-400" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      Features included:
                    </h4>
                    <ul className="space-y-4">
                      {plan.features.map((feature, featureIndex) => (
                        <li key={featureIndex} className={`flex items-start space-x-3 ${typography.bodySmall} group/item`}>
                          <div className="flex-shrink-0 mt-0.5">
                            <div className="w-5 h-5 bg-gradient-to-r from-green-400 to-emerald-400 rounded-full flex items-center justify-center">
                              <svg className="w-3 h-3 text-white" fill="currentColor" viewBox="0 0 20 20">
                                <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                              </svg>
                            </div>
                          </div>
                          <span className={`${colors.neutral.textSecondary} group-hover/item:text-gray-300 transition-colors duration-200`}>
                            {feature}
                          </span>
                        </li>
                      ))}
                    </ul>
                    
                    {plan.limitations.length > 0 && (
                      <div className="mt-6 p-4 bg-gray-800/30 rounded-xl border border-gray-700/50">
                        <h4 className={`${typography.bodySmall} ${colors.neutral.textMuted} mb-3 font-medium flex items-center`}>
                          <svg className="w-4 h-4 mr-2" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                          </svg>
                          Limitations:
                        </h4>
                        <ul className="space-y-2">
                          {plan.limitations.map((limitation, limitIndex) => (
                            <li key={limitIndex} className={`flex items-start space-x-3 ${typography.bodyXSmall}`}>
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
                  
                  {/* CTA Button */}
                  <div className="mt-auto">
                    {plan.buttonText === 'Contact Sales' ? (
                      <Link
                        href="/feedback"
                        className={`group/btn relative w-full inline-flex items-center justify-center px-6 py-4 text-sm font-bold rounded-xl transition-all duration-300 overflow-hidden ${
                          plan.popular 
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 shadow-lg hover:shadow-xl' 
                            : 'bg-gray-700 text-white hover:bg-gray-600 border border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <span className="relative z-10 flex items-center space-x-2">
                          <span>{plan.buttonText}</span>
                          <svg className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                          </svg>
                        </span>
                        {plan.popular && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                        )}
                      </Link>
                    ) : (
                      <Link
                        href="/payment-method"
                        className={`group/btn relative w-full inline-flex items-center justify-center px-6 py-4 text-sm font-bold rounded-xl transition-all duration-300 overflow-hidden ${
                          plan.popular 
                            ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white hover:from-indigo-600 hover:to-purple-600 shadow-lg hover:shadow-xl hover:scale-105' 
                            : 'bg-gray-700 text-white hover:bg-gray-600 border border-gray-600 hover:border-gray-500'
                        }`}
                      >
                        <span className="relative z-10 flex items-center space-x-2">
                          <span>{plan.buttonText}</span>
                          <svg className="w-4 h-4 transition-transform duration-300 group-hover/btn:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                          </svg>
                        </span>
                        {plan.popular && (
                          <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/20 to-transparent -skew-x-12 -translate-x-full group-hover/btn:translate-x-full transition-transform duration-700" />
                        )}
                      </Link>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced Features Comparison */}
      <div className="relative px-4 py-20 z-10">
        <div className="absolute inset-0 bg-gradient-to-br from-gray-900/50 to-gray-800/50 backdrop-blur-sm" />
        <div className="relative max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="text-4xl animate-pulse">🚀</div>
              <h2 className={`${typography.h2} ${colors.neutral.textPrimary} font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent`}>
                Why Choose GetGetHired?
              </h2>
              <div className="text-4xl animate-pulse" style={{ animationDelay: '0.5s' }}>⭐</div>
            </div>
            <p className={`${typography.bodyLarge} ${colors.neutral.textTertiary} max-w-3xl mx-auto`}>
              We provide the tools and support you need to find the best talent for your organization with cutting-edge technology and expert guidance.
            </p>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {[
              {
                icon: '🎯',
                title: 'Targeted Reach',
                description: 'Connect with qualified candidates through our advanced matching algorithms and extensive network.',
                gradient: 'from-red-500 to-orange-500'
              },
              {
                icon: '⚡',
                title: 'Fast Hiring',
                description: 'Streamline your hiring process with automated workflows and instant candidate notifications.',
                gradient: 'from-yellow-500 to-orange-500'
              },
              {
                icon: '📊',
                title: 'Smart Analytics',
                description: 'Make data-driven hiring decisions with comprehensive analytics and performance insights.',
                gradient: 'from-blue-500 to-purple-500'
              },
              {
                icon: '🔒',
                title: 'Secure & Compliant',
                description: 'Enterprise-grade security with GDPR compliance and SOC 2 certification for peace of mind.',
                gradient: 'from-green-500 to-blue-500'
              },
              {
                icon: '🤝',
                title: 'Expert Support',
                description: 'Get help from our dedicated support team and hiring experts whenever you need it.',
                gradient: 'from-purple-500 to-pink-500'
              },
              {
                icon: '🚀',
                title: 'Scale with Growth',
                description: 'Our platform grows with your business, from startup to enterprise with flexible solutions.',
                gradient: 'from-indigo-500 to-purple-500'
              }
            ].map((feature, index) => (
              <div key={index} className="group relative">
                {/* Background gradient */}
                <div className={`absolute inset-0 bg-gradient-to-br ${feature.gradient} opacity-5 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`} />
                
                <div 
                  className="relative backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 text-center transition-all duration-300 group-hover:transform group-hover:scale-105 group-hover:shadow-xl group-hover:border-gray-700/50"
                  style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  {/* Icon with gradient background */}
                  <div className="relative mb-6">
                    <div className={`absolute inset-0 bg-gradient-to-r ${feature.gradient} opacity-20 rounded-xl blur-sm group-hover:opacity-30 transition-opacity duration-300`} />
                    <div className={`relative w-16 h-16 mx-auto bg-gradient-to-br ${feature.gradient} bg-opacity-10 rounded-xl flex items-center justify-center text-4xl border border-gray-600/30 group-hover:border-gray-500/50 transition-colors duration-300`}>
                      {feature.icon}
                    </div>
                  </div>
                  
                  <h3 className={`${typography.h5} ${colors.neutral.textPrimary} mb-3 font-bold group-hover:text-white transition-colors duration-300`}>
                    {feature.title}
                  </h3>
                  <p className={`${typography.bodyBase} ${colors.neutral.textTertiary} group-hover:text-gray-300 transition-colors duration-300 leading-relaxed`}>
                    {feature.description}
                  </p>
                  
                  {/* Hover indicator */}
                  <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                    <div className={`w-2 h-2 bg-gradient-to-r ${feature.gradient} rounded-full animate-pulse`} />
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Enhanced FAQ Section */}
      <div className="relative px-4 py-20 z-10">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-16">
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="text-4xl">❓</div>
              <h2 className={`${typography.h2} ${colors.neutral.textPrimary} font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent`}>
                Frequently Asked Questions
              </h2>
              <div className="text-4xl">💡</div>
            </div>
            <p className={`${typography.bodyLarge} ${colors.neutral.textTertiary}`}>
              Everything you need to know about our pricing and plans. Can&apos;t find what you&apos;re looking for? Contact our support team.
            </p>
          </div>
          
          <div className="space-y-6">
            {faqs.map((faq, index) => (
              <div key={index} className="group">
                <div 
                  className={`backdrop-blur-sm border border-gray-800/50 rounded-2xl transition-all duration-300 group-hover:border-gray-700/50 group-hover:shadow-lg ${
                    openFaq === index ? 'border-indigo-500/30 shadow-xl' : ''
                  }`}
                  style={{
                    background: 'rgba(15, 23, 42, 0.6)',
                    boxShadow: openFaq === index 
                      ? '0 10px 25px -5px rgba(99, 102, 241, 0.2)' 
                      : '0 4px 12px -2px rgba(0, 0, 0, 0.3)',
                  }}
                >
                  <button
                    onClick={() => toggleFaq(index)}
                    className="w-full flex justify-between items-center text-left p-6 group-hover:bg-gray-800/20 transition-colors duration-300 rounded-2xl"
                  >
                    <div className="flex items-center space-x-4">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold transition-all duration-300 ${
                        openFaq === index 
                          ? 'bg-gradient-to-r from-indigo-500 to-purple-500 text-white' 
                          : 'bg-gray-700 text-gray-300 group-hover:bg-gray-600'
                      }`}>
                        {index + 1}
                      </div>
                      <h3 className={`${typography.h6} ${colors.neutral.textPrimary} group-hover:text-white transition-colors duration-300`}>
                        {faq.question}
                      </h3>
                    </div>
                    <div className={`transition-all duration-300 ${
                      openFaq === index 
                        ? 'text-indigo-400 rotate-180' 
                        : 'text-gray-400 group-hover:text-gray-300'
                    }`}>
                      <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                      </svg>
                    </div>
                  </button>
                  
                  <div className={`overflow-hidden transition-all duration-300 ${
                    openFaq === index ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
                  }`}>
                    <div className="px-6 pb-6">
                      <div className="pl-12 pt-4 border-t border-gray-700/50">
                        <p className={`${typography.bodyBase} ${colors.neutral.textTertiary} leading-relaxed`}>
                          {faq.answer}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Additional help section */}
          <div className="mt-12 text-center">
            <div 
              className="backdrop-blur-sm border border-gray-800/50 rounded-2xl p-8"
              style={{
                background: 'rgba(15, 23, 42, 0.6)',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
              }}
            >
              <div className="text-3xl mb-4">🤔</div>
              <h3 className={`${typography.h5} ${colors.neutral.textPrimary} mb-3 font-bold`}>
                Still have questions?
              </h3>
              <p className={`${typography.bodyBase} ${colors.neutral.textTertiary} mb-6`}>
                Our support team is here to help you choose the right plan for your needs.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/feedback"
                  className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-indigo-500 to-purple-500 text-white rounded-xl font-medium hover:from-indigo-600 hover:to-purple-600 transition-all duration-300 hover:scale-105 shadow-lg"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                  </svg>
                  Contact Support
                </Link>
                <Link
                  href="/about"
                  className="inline-flex items-center justify-center px-6 py-3 border border-gray-600 text-gray-300 rounded-xl font-medium hover:bg-gray-700 hover:text-white transition-all duration-300"
                >
                  <svg className="w-5 h-5 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  Learn More
                </Link>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced CTA Section */}
      <div className="relative px-4 py-20 overflow-hidden">
        {/* Background effects */}
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-600/90 via-purple-600/90 to-pink-600/90" />
        <div className="absolute inset-0 bg-gradient-to-t from-black/20 to-transparent" />
        <div className="absolute top-0 left-0 w-full h-full opacity-30">
          <div className="absolute top-20 left-20 w-32 h-32 bg-white/10 rounded-full blur-xl animate-pulse" />
          <div className="absolute bottom-20 right-20 w-40 h-40 bg-white/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '1s' }} />
          <div className="absolute top-1/2 left-1/3 w-24 h-24 bg-white/10 rounded-full blur-xl animate-pulse" style={{ animationDelay: '2s' }} />
        </div>
        
        <div className="relative max-w-6xl mx-auto text-center z-10">
          {/* Main CTA Card */}
          <div 
            className="backdrop-blur-xl border border-white/20 rounded-3xl p-8 sm:p-12 shadow-2xl"
            style={{
              background: 'rgba(255, 255, 255, 0.1)',
              boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.5), 0 0 0 1px rgba(255, 255, 255, 0.1)',
            }}
          >
            <div className="flex items-center justify-center space-x-3 mb-6">
              <div className="text-5xl animate-bounce">🚀</div>
              <h2 className={`${typography.h2} text-white font-bold`}>
                Ready to Find Your Next Great Hire?
              </h2>
              <div className="text-5xl animate-bounce" style={{ animationDelay: '0.5s' }}>⭐</div>
            </div>
            
            <p className={`${typography.bodyLarge} text-blue-100 mb-8 max-w-3xl mx-auto leading-relaxed`}>
              Join thousands of companies using GetGetHired to build amazing teams. Start your free trial today and transform your hiring process with our cutting-edge platform.
            </p>

            {/* Stats row */}
            <div className="flex flex-wrap justify-center gap-8 mb-10 text-white">
              {[
                { number: '10,000+', label: 'Companies Trust Us' },
                { number: '50,000+', label: 'Successful Hires' },
                { number: '14-Day', label: 'Free Trial' }
              ].map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="text-2xl font-bold bg-gradient-to-r from-white to-blue-100 bg-clip-text text-transparent">
                    {stat.number}
                  </div>
                  <div className="text-sm text-blue-200">
                    {stat.label}
                  </div>
                </div>
              ))}
            </div>
            
            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Link
                href="/payment-method"
                className="group relative inline-flex items-center justify-center px-8 py-4 bg-white text-gray-900 rounded-xl font-bold text-lg transition-all duration-300 hover:scale-105 hover:shadow-2xl overflow-hidden"
              >
                <span className="relative z-10 flex items-center space-x-2">
                  <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                  <span>Start Free Trial</span>
                </span>
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-gray-100 to-transparent -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-700" />
              </Link>
              
              <Link
                href="/feedback"
                className="group inline-flex items-center justify-center px-8 py-4 border-2 border-white/30 text-white rounded-xl font-bold text-lg hover:bg-white/10 hover:border-white/50 transition-all duration-300 backdrop-blur-sm"
              >
                <svg className="w-5 h-5 mr-2 transition-transform duration-300 group-hover:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
                </svg>
                Contact Sales
              </Link>
            </div>

            {/* Trust badges */}
            <div className="mt-10 pt-8 border-t border-white/20">
              <p className="text-blue-100 text-sm mb-4">Trusted by industry leaders</p>
              <div className="flex flex-wrap justify-center gap-6 text-white/60">
                {['🏢 Enterprise Ready', '🔒 SOC 2 Certified', '🌍 GDPR Compliant', '📞 24/7 Support'].map((badge, index) => (
                  <div key={index} className="text-sm">
                    {badge}
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>

      <Footer />
    </div>
  );
}