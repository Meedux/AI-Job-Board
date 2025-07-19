'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import SubscriptionCard from '../../components/SubscriptionCard';
import CreditPackages from '../../components/CreditPackages';
import { useAuth } from '../../contexts/AuthContext';
import { colors, typography, components, layout, spacing } from '../../utils/designSystem';

export default function PricingPage() {
  const { user } = useAuth();
  const [isAnnual, setIsAnnual] = useState(false);
  const [activeTab, setActiveTab] = useState('plans'); // 'plans' or 'credits'
  const [plans, setPlans] = useState([]);
  const [packages, setPackages] = useState([]);
  const [loading, setLoading] = useState(true);
  const [userSubscription, setUserSubscription] = useState(null);

  useEffect(() => {
    // Always load plans and packages regardless of auth status
    loadPlans();
    loadPackages();
    
    // Only load user subscription if authenticated
    if (user) {
      loadUserSubscription();
    }
  }, [user]);

  const loadPlans = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/subscription/plans');
      const data = await response.json();
      if (response.ok) {
        setPlans(data.plans || []);
      }
    } catch (error) {
      console.error('Error loading plans:', error);
    }
  };

  const loadPackages = async () => {
    try {
      const response = await fetch('/api/credits/packages');
      const data = await response.json();
      if (response.ok) {
        setPackages(data.all || []);
      }
    } catch (error) {
      console.error('Error loading packages:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadUserSubscription = async () => {
    try {
      const response = await fetch('/api/subscription/status', {
        credentials: 'include'
      });
      const data = await response.json();
      if (response.ok && data.subscription) {
        setUserSubscription(data.subscription);
      }
    } catch (error) {
      console.error('Error loading user subscription:', error);
      // Don't set error state, just log it since this is optional
    }
  };

  const faqs = [
    {
      question: 'Is job content really free?',
      answer: 'Yes! All job listings, descriptions, requirements, and company information are completely free to view. You can apply to any job without a premium subscription.'
    },
    {
      question: 'What are premium features?',
      answer: 'Premium features focus on AI-powered tools (resume builder, analyzer, cover letter generator) and convenience features (one-click apply, lazy apply, resume visibility to employers).'
    },
    {
      question: 'How do AI credits work?',
      answer: 'AI features like resume analysis and generation use credits. Each plan comes with a monthly allocation. Enterprise plans have unlimited usage.'
    },
    {
      question: 'Can I change my plan later?',
      answer: 'Absolutely! You can upgrade or downgrade your plan at any time. Changes take effect immediately, and we\'ll prorate any billing adjustments.'
    },
    {
      question: 'What payment methods do you accept?',
      answer: 'We accept all major credit cards (Visa, MasterCard, American Express), GCash, and PayMaya through our secure payment partner Paymongo.'
    },
    {
      question: 'Do you offer refunds?',
      answer: 'Yes, we offer a 30-day money-back guarantee. If you\'re not satisfied, we\'ll refund your payment in full, no questions asked.'
    },
    {
      question: 'What is resume visibility?',
      answer: 'Premium users can make their resumes visible to employers, allowing companies to find and contact them directly for job opportunities.'
    },
    {
      question: 'Do credits expire?',
      answer: 'No, credits never expire. Once you purchase them, they remain in your account until you use them.'
    },
    {
      question: 'Is there a setup fee?',
      answer: 'No setup fees! What you see is what you pay. Start using your plan immediately after signup.'
    }
  ];

  return (
    <div className="min-h-screen bg-gray-950 text-white">
      <Header />
      
      <main className="pt-20">
          {/* Hero Section */}
          <div className="py-20 px-4 sm:px-6 lg:px-8 text-center">
            <div className="max-w-4xl mx-auto">
              <h1 className="text-4xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                Choose Your Plan
              </h1>
              <p className="text-xl text-gray-300 mb-4">
                Job content is FREE for everyone. Premium features unlock AI tools and convenience features.
              </p>
              
              <div className="inline-flex items-center px-4 py-2 bg-green-600/20 border border-green-500/30 rounded-lg mb-8">
                <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                </svg>
                <span className="text-green-300 font-medium">All job content is FREE to view and apply</span>
              </div>

              {/* Login CTA for unauthenticated users */}
              {!user && (
                <div className="mb-8 p-4 bg-blue-900/20 border border-blue-700 rounded-lg">
                  <div className="flex items-center gap-3 justify-center">
                    <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                    </svg>
                    <span className="text-blue-400 font-medium">
                      <Link href="/login" className="text-white hover:text-blue-300 underline">Login</Link> or <Link href="/register" className="text-white hover:text-blue-300 underline">Register</Link> to purchase plans and credits
                    </span>
                  </div>
                </div>
              )}

              {/* Current Subscription Status */}
              {user && userSubscription && userSubscription.plan && (
                <div className="mb-8 p-4 bg-green-900/20 border border-green-700 rounded-lg">
                  <div className="flex items-center gap-3 justify-center">
                    <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <span className="text-green-400 font-medium">
                      You are currently subscribed to: <span className="text-white">{userSubscription.plan?.name || 'Unknown Plan'}</span>
                    </span>
                  </div>
                  <p className="text-green-300 text-sm mt-2 text-center">
                    Your subscription is active until {new Date(userSubscription.currentPeriodEnd).toLocaleDateString()}
                  </p>
                </div>
              )}
              
              {/* Tab Navigation */}
              <div className="flex items-center justify-center gap-4 mb-8">
                <button
                  onClick={() => setActiveTab('plans')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === 'plans'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  Subscription Plans
                </button>
                <button
                  onClick={() => setActiveTab('credits')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-200 ${
                    activeTab === 'credits'
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-800 text-gray-400 hover:bg-gray-700'
                  }`}
                >
                  Credit Packages
                </button>
              </div>

              {/* Billing Toggle */}
              {activeTab === 'plans' && (
                <div className="flex items-center justify-center gap-4 mb-12">
                  <span className={`text-sm ${!isAnnual ? 'text-white' : 'text-gray-400'}`}>
                    Monthly
                  </span>
                  <button
                    onClick={() => setIsAnnual(!isAnnual)}
                    className={`relative w-14 h-7 rounded-full transition-colors duration-200 ${
                      isAnnual ? 'bg-blue-600' : 'bg-gray-600'
                    }`}
                  >
                    <div
                      className={`absolute top-0.5 left-0.5 w-6 h-6 bg-white rounded-full transition-transform duration-200 ${
                        isAnnual ? 'translate-x-7' : 'translate-x-0'
                      }`}
                    />
                  </button>
                  <span className={`text-sm ${isAnnual ? 'text-white' : 'text-gray-400'}`}>
                    Annual
                    <span className="text-green-400 ml-1">(Save 20%)</span>
                  </span>
                </div>
              )}
            </div>
          </div>

          {/* Subscription Plans */}
          {activeTab === 'plans' && (
            <div className="py-12 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading subscription plans...</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                    {plans.map((plan, index) => (
                      <SubscriptionCard
                        key={plan.id}
                        plan={{
                          ...plan,
                          price_monthly: plan.price_monthly,
                          price_yearly: plan.price_yearly,
                        }}
                        isPopular={index === 1}
                        defaultBillingCycle={isAnnual ? 'yearly' : 'monthly'}
                        currentSubscription={userSubscription}
                      />
                    ))}
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Credit Packages */}
          {activeTab === 'credits' && (
            <div className="py-12 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                {loading ? (
                  <div className="text-center py-12">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
                    <p className="text-gray-400">Loading credit packages...</p>
                  </div>
                ) : (
                  <CreditPackages packages={packages} />
                )}
              </div>
            </div>
          )}

          {/* Features Comparison */}
          {activeTab === 'plans' && (
            <div className="py-16 px-4 sm:px-6 lg:px-8">
              <div className="max-w-7xl mx-auto">
                <div className="text-center mb-12">
                  <h2 className="text-3xl font-bold mb-4">Compare Plans</h2>
                  <p className="text-gray-400">Choose the plan that fits your needs</p>
                </div>
                
                <div className="bg-gray-900 rounded-2xl p-6 border border-gray-700 overflow-x-auto">
                  <div className="grid grid-cols-5 gap-4 min-w-[600px]">
                    <div className="space-y-3">
                      <div className="h-12 flex items-center">
                        <span className="font-semibold text-white">Features</span>
                      </div>
                      <div className="font-medium text-gray-300 text-sm py-2">Job Search</div>
                      <div className="font-medium text-gray-300 text-sm py-2">Resume Views</div>
                      <div className="font-medium text-gray-300 text-sm py-2">AI Credits</div>
                      <div className="font-medium text-gray-300 text-sm py-2">Job Applications</div>
                      <div className="font-medium text-gray-300 text-sm py-2">Priority Support</div>
                      <div className="font-medium text-gray-300 text-sm py-2">Advanced Features</div>
                    </div>
                    
                    {plans.map((plan) => (
                      <div key={plan.id} className="space-y-3">
                        <div className="text-center h-12 flex items-center justify-center">
                          <h3 className="font-bold text-white text-base">{plan.name}</h3>
                        </div>
                        <div className="text-center py-2">
                          <svg className="w-4 h-4 text-green-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                          </svg>
                        </div>
                        <div className="text-center text-xs text-gray-400 py-2">
                          {plan.max_resume_views === 0 ? 'Unlimited' : `${plan.max_resume_views}/month`}
                        </div>
                        <div className="text-center text-xs text-gray-400 py-2">
                          {plan.max_ai_credits === 0 ? 'Unlimited' : `${plan.max_ai_credits}/month`}
                        </div>
                        <div className="text-center text-xs text-gray-400 py-2">
                          {plan.max_job_applications === 0 ? 'Unlimited' : `${plan.max_job_applications}/month`}
                        </div>
                        <div className="text-center py-2">
                          {plan.priority_support ? (
                            <svg className="w-4 h-4 text-green-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-gray-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </div>
                        <div className="text-center py-2">
                          {plan.price_monthly > 299 ? (
                            <svg className="w-4 h-4 text-green-400 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
                            </svg>
                          ) : (
                            <svg className="w-4 h-4 text-gray-600 mx-auto" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                            </svg>
                          )}
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* FAQ Section */}
          <div className="py-20 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
              <div className="text-center mb-16">
                <h2 className="text-3xl font-bold mb-4">Frequently Asked Questions</h2>
                <p className="text-gray-400">Everything you need to know about our plans and pricing</p>
              </div>
              
              <div className="space-y-4">
                {faqs.map((faq, index) => (
                  <div key={index} className="bg-gray-900 rounded-lg p-6 border border-gray-700">
                    <h3 className="font-semibold text-white mb-3">{faq.question}</h3>
                    <p className="text-gray-400">{faq.answer}</p>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* CTA Section */}
          <div className="py-20 px-4 sm:px-6 lg:px-8 bg-gradient-to-r from-blue-600/10 to-purple-600/10">
            <div className="max-w-4xl mx-auto text-center">
              <h2 className="text-3xl font-bold mb-4">Ready to Get Started?</h2>
              <p className="text-xl text-gray-300 mb-8">
                Join thousands of job seekers who have found their dream job with GetGetHired
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Link
                  href="/register"
                  className="bg-blue-600 hover:bg-blue-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                >
                  Start Free Trial
                </Link>
                <Link
                  href="/dashboard"
                  className="bg-gray-800 hover:bg-gray-700 text-white px-8 py-3 rounded-lg font-medium transition-colors"
                >
                  View Dashboard
                </Link>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    );
  }
