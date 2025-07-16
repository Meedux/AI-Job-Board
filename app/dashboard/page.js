'use client';

import { useEffect, useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProtectedRoute from '../../components/ProtectedRoute';
import CreditsDashboard from '../../components/CreditsDashboard';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { colors, typography, components, layout, spacing, gradients, combineClasses, animations } from '../../utils/designSystem';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();
  const { subscription, credits, loading, loadUserData } = useSubscription();
  const [dashboardLoading, setDashboardLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadUserData();
    }
  }, [user]);

  useEffect(() => {
    if (!loading) {
      setDashboardLoading(false);
    }
  }, [loading]);

  // Handle payment status from GCash redirect and direct processing
  useEffect(() => {
    const urlParams = new URLSearchParams(window.location.search);
    const paymentStatus = urlParams.get('payment_status');
    const paymentIntentId = urlParams.get('payment_intent_id');
    
    if (paymentStatus === 'processed' && paymentIntentId) {
      // Clear the URL parameters
      window.history.replaceState({}, document.title, window.location.pathname);
      
      // Process the payment directly
      processPaymentFromRedirect(paymentIntentId);
    }
  }, [user, loadUserData]);

  const processPaymentFromRedirect = async (paymentIntentId) => {
    try {
      console.log('🔄 Processing payment from redirect:', paymentIntentId);
      
      const response = await fetch(`/api/payment/process?paymentIntentId=${paymentIntentId}`, {
        method: 'GET',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const result = await response.json();
      
      if (result.success && result.status === 'succeeded') {
        console.log('✅ Payment processed successfully from redirect');
        
        // Show success message
        const successMessage = document.createElement('div');
        successMessage.className = 'fixed top-4 right-4 bg-green-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        successMessage.innerHTML = '✅ Payment successful! Your purchase has been activated.';
        document.body.appendChild(successMessage);
        
        // Remove message after 5 seconds
        setTimeout(() => {
          document.body.removeChild(successMessage);
        }, 5000);
        
        // Refresh user data
        if (user) {
          loadUserData();
        }
      } else {
        console.error('❌ Payment processing failed from redirect:', result);
        
        // Show error message
        const errorMessage = document.createElement('div');
        errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
        errorMessage.innerHTML = `❌ Payment ${result.status}. Please contact support.`;
        document.body.appendChild(errorMessage);
        
        // Remove message after 5 seconds
        setTimeout(() => {
          document.body.removeChild(errorMessage);
        }, 5000);
      }
    } catch (error) {
      console.error('❌ Error processing payment from redirect:', error);
      
      // Show error message
      const errorMessage = document.createElement('div');
      errorMessage.className = 'fixed top-4 right-4 bg-red-500 text-white px-6 py-3 rounded-lg shadow-lg z-50';
      errorMessage.innerHTML = '❌ Error processing payment. Please contact support.';
      document.body.appendChild(errorMessage);
      
      // Remove message after 5 seconds
      setTimeout(() => {
        document.body.removeChild(errorMessage);
      }, 5000);
    }
  };

  const quickActions = [
    {
      title: 'Browse Jobs',
      description: 'Find your next opportunity',
      href: '/',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0V6a2 2 0 012 2v6a2 2 0 01-2 2H8a2 2 0 01-2-2V8a2 2 0 012-2h8zM16 10h.01M12 14h.01M8 14h.01M8 10h.01" />
        </svg>
      )
    },
    {
      title: 'Resume Analyzer',
      description: 'Analyze and improve your resume',
      href: '/resume-analyzer',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
        </svg>
      )
    },
    {
      title: 'My Applications',
      description: 'Track your job applications',
      href: '/my-applications',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5H7a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
        </svg>
      )
    },
    {
      title: 'Profile Settings',
      description: 'Update your profile information',
      href: '/profile',
      icon: (
        <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
        </svg>
      )
    }
  ];

  return (
    <ProtectedRoute>
      <div className={combineClasses(
        "min-h-screen font-sans relative overflow-hidden",
        colors.neutral.background
      )}>
        {/* Background decorations */}
        <div className="absolute inset-0 overflow-hidden pointer-events-none">
          <div className="absolute -top-40 -right-40 w-80 h-80 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 rounded-full blur-3xl" />
          <div className="absolute -bottom-40 -left-40 w-80 h-80 bg-gradient-to-tr from-purple-500/10 to-pink-500/10 rounded-full blur-3xl" />
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-gradient-to-r from-blue-500/5 to-purple-500/5 rounded-full blur-3xl" />
        </div>

        <Header />
        
        <main className={`${layout.container} px-4 sm:px-6 lg:px-8 relative z-10`}>
          <div className="max-w-7xl mx-auto py-8 sm:py-12">
            {/* Hero Welcome Section */}
            <div className="relative mb-12">
              <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/10 via-purple-500/10 to-pink-500/10 rounded-3xl blur-xl" />
              <div className={combineClasses(
                "relative backdrop-blur-xl border rounded-3xl p-8 sm:p-12 shadow-2xl",
                colors.neutral.surface,
                colors.neutral.border
              )}>
                <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-6 lg:space-y-0 lg:space-x-8">
                  {/* Avatar Section */}
                  <div className="relative">
                    <div className="absolute -inset-1 bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-full opacity-75 blur animate-pulse" />
                    <div className={combineClasses(
                      "relative w-20 h-20 sm:w-24 sm:h-24 rounded-full flex items-center justify-center text-white text-2xl sm:text-3xl font-bold shadow-xl ring-4 ring-white/10",
                      colors.primary.background
                    )}>
                      {user?.nickname ? user.nickname.charAt(0).toUpperCase() : user?.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div className={combineClasses(
                      "absolute -bottom-2 -right-2 w-6 h-6 rounded-full border-4 flex items-center justify-center",
                      colors.success[600],
                      `border-${colors.neutral.background.split('-')[1]}-900`
                    )}>
                      <div className="w-2 h-2 bg-white rounded-full animate-pulse" />
                    </div>
                  </div>
                  
                  {/* Welcome Text */}
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <h1 className={combineClasses(
                        typography.h2,
                        "sm:text-4xl font-bold bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent"
                      )}>
                        Welcome back, {user?.nickname || user?.fullName}!
                      </h1>
                      <div className="animate-bounce">
                        <svg className="w-8 h-8 text-yellow-400" fill="currentColor" viewBox="0 0 24 24">
                          <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                        </svg>
                      </div>
                    </div>
                    <p className={`${typography.bodyLarge} ${colors.neutral.textSecondary} mb-4 max-w-2xl`}>
                      Ready to take your career to the next level? Explore opportunities, track your progress, and land your dream job.
                    </p>
                    <div className="flex flex-wrap gap-3">
                      {['✨ New Features', '🚀 Career Growth', '💼 Dream Jobs'].map((tag, index) => (
                        <span 
                          key={index}
                          className={combineClasses(
                            "px-4 py-2 border rounded-full font-medium backdrop-blur-sm",
                            colors.primary.background,
                            colors.primary.text,
                            "border-indigo-500/30",
                            typography.bodySmall
                          )}
                        >
                          {tag}
                        </span>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Actions Grid - Enhanced */}
            <div className="mb-12">
              <div className="flex items-center justify-between mb-8">
                <div>
                  <h2 className={`${typography.h3} ${colors.neutral.textPrimary} font-bold mb-2`}>Quick Actions</h2>
                  <p className={`${typography.bodyBase} ${colors.neutral.textSecondary}`}>Get started with these essential tools</p>
                </div>
                <div className="hidden sm:flex items-center space-x-2">
                  <div className="w-2 h-2 bg-indigo-500 rounded-full animate-pulse" />
                  <span className={`${typography.bodySmall} ${colors.neutral.textSecondary}`}>Live Dashboard</span>
                </div>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                {quickActions.map((action, index) => (
                  <Link
                    key={index}
                    href={action.href}
                    className="group relative overflow-hidden"
                  >
                    {/* Gradient background */}
                    <div className={combineClasses(
                      "absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100",
                      colors.neutral.surface,
                      animations.transition
                    )} />
                    
                    {/* Card content */}
                    <div className={combineClasses(
                      components.card.base,
                      components.card.padding,
                      animations.transition,
                      "group-hover:transform group-hover:scale-105 group-hover:shadow-2xl group-hover:border-indigo-500/30"
                    )}>
                      {/* Icon with gradient background */}
                      <div className="relative mb-4">
                        <div className="absolute inset-0 bg-gradient-to-r from-indigo-500/20 to-purple-500/20 rounded-xl blur-sm group-hover:blur-none transition-all duration-300" />
                        <div className={combineClasses(
                          "relative p-3 rounded-xl border transition-all duration-300",
                          colors.primary.text,
                          colors.primary.background,
                          "border-indigo-500/20 group-hover:border-indigo-400/40"
                        )}>
                          {action.icon}
                        </div>
                      </div>
                      
                      <h3 className={combineClasses(
                        typography.h5,
                        colors.neutral.textPrimary,
                        "mb-2 group-hover:text-white transition-colors duration-300"
                      )}>
                        {action.title}
                      </h3>
                      <p className={combineClasses(
                        typography.bodySmall,
                        colors.neutral.textSecondary,
                        "group-hover:text-gray-300 transition-colors duration-300"
                      )}>
                        {action.description}
                      </p>
                      
                      {/* Arrow indicator */}
                      <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-all duration-300 transform translate-x-2 group-hover:translate-x-0">
                        <svg className="w-5 h-5 text-indigo-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                        </svg>
                      </div>
                    </div>
                  </Link>
                ))}
              </div>
            </div>

            {/* Enhanced Stats Section */}
            <div className="mb-8">
              <div className="text-center mb-8">
                <h2 className={`${typography.h3} ${colors.neutral.textPrimary} font-bold mb-2`}>Your Progress</h2>
                <p className={`${typography.bodyBase} ${colors.neutral.textSecondary}`}>Track your job search journey</p>
              </div>
              
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-6">
                {[
                  { 
                    value: '0', 
                    label: 'Applications Submitted', 
                    color: 'indigo',
                    icon: '📝',
                    gradient: 'from-indigo-500 to-blue-500'
                  },
                  { 
                    value: '0', 
                    label: 'Interview Invitations', 
                    color: 'green',
                    icon: '🎯',
                    gradient: 'from-green-500 to-emerald-500'
                  },
                  { 
                    value: user?.age || 'N/A', 
                    label: 'Profile Completion', 
                    color: 'purple',
                    icon: '👤',
                    gradient: 'from-purple-500 to-pink-500'
                  }
                ].map((stat, index) => (
                  <div key={index} className="group relative">
                    {/* Background gradient */}
                    <div className={`absolute inset-0 bg-gradient-to-br ${stat.gradient} opacity-5 group-hover:opacity-10 rounded-2xl transition-opacity duration-300`} />
                    
                    <div 
                      className="relative bg-gray-900/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6 text-center transition-all duration-300 group-hover:transform group-hover:scale-105 group-hover:shadow-xl"
                      style={{
                        background: 'rgba(15, 23, 42, 0.6)',
                        boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                      }}
                    >
                      <div className="mb-4 text-3xl">{stat.icon}</div>
                      <div className={`${typography.h1} font-bold mb-2 bg-gradient-to-r ${stat.gradient} bg-clip-text text-transparent`}>
                        {stat.value}
                      </div>
                      <div className={`${typography.bodyBase} ${colors.neutral.textSecondary} group-hover:text-gray-300 transition-colors duration-300`}>
                        {stat.label}
                      </div>
                      
                      {/* Progress indicator for applications */}
                      {index === 0 && (
                        <div className="mt-4">
                          <div className="w-full bg-gray-800 rounded-full h-2">
                            <div className="bg-gradient-to-r from-indigo-500 to-blue-500 h-2 rounded-full" style={{ width: '0%' }} />
                          </div>
                          <p className="text-xs text-gray-500 mt-1">Start applying to see progress</p>
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Subscription Status Section */}
            <div className="mb-12">
              <div className="text-center mb-8">
                <h2 className={`${typography.h3} ${colors.neutral.textPrimary} font-bold mb-2`}>Your Subscription</h2>
                <p className={`${typography.bodyBase} ${colors.neutral.textSecondary}`}>Manage your plan and track your usage</p>
              </div>
              
              {dashboardLoading ? (
                <div className="flex justify-center items-center py-12">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500"></div>
                </div>
              ) : (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Current Plan */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-indigo-500/10 to-purple-500/10 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300" />
                    <div className={combineClasses(
                      "relative backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 group-hover:transform group-hover:scale-105",
                      colors.neutral.surface,
                      colors.neutral.border
                    )}>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="text-2xl">🎯</div>
                        <h3 className={`${typography.h4} ${colors.neutral.textPrimary} font-bold`}>Current Plan</h3>
                      </div>
                      
                      {subscription ? (
                        <div className="space-y-4">
                          <div className="flex items-center justify-between">
                            <span className={`${typography.bodyBase} ${colors.neutral.textSecondary}`}>Plan Type</span>
                            <span className={`${typography.bodyBase} ${colors.neutral.textPrimary} font-medium capitalize`}>
                              {subscription.plan?.name || 'Free'}
                            </span>
                          </div>
                          
                          <div className="flex items-center justify-between">
                            <span className={`${typography.bodyBase} ${colors.neutral.textSecondary}`}>Status</span>
                            <span className={combineClasses(
                              "px-3 py-1 rounded-full text-sm font-medium",
                              subscription.status === 'active' ? 'bg-green-500/20 text-green-400' : 'bg-yellow-500/20 text-yellow-400'
                            )}>
                              {subscription.status}
                            </span>
                          </div>
                          
                          {subscription.currentPeriodEnd && (
                            <div className="flex items-center justify-between">
                              <span className={`${typography.bodyBase} ${colors.neutral.textSecondary}`}>Expires</span>
                              <span className={`${typography.bodyBase} ${colors.neutral.textPrimary}`}>
                                {new Date(subscription.currentPeriodEnd).toLocaleDateString()}
                              </span>
                            </div>
                          )}
                          
                          <div className="pt-4 border-t border-gray-800/50">
                            <Link 
                              href="/pricing"
                              className={combineClasses(
                                "block w-full text-center px-4 py-3 rounded-xl font-medium transition-all duration-200",
                                colors.primary.background,
                                colors.primary.text,
                                "hover:transform hover:scale-105"
                              )}
                            >
                              {subscription.plan?.planType === 'free' ? 'Upgrade Plan' : 'Manage Plan'}
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className={`${typography.bodyBase} ${colors.neutral.textSecondary} mb-4`}>
                            No subscription found
                          </p>
                          <Link 
                            href="/pricing"
                            className={combineClasses(
                              "inline-block px-6 py-3 rounded-xl font-medium transition-all duration-200",
                              colors.primary.background,
                              colors.primary.text,
                              "hover:transform hover:scale-105"
                            )}
                          >
                            Choose a Plan
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  {/* Credits Overview */}
                  <div className="group relative">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-pink-500/10 opacity-0 group-hover:opacity-100 rounded-2xl transition-opacity duration-300" />
                    <div className={combineClasses(
                      "relative backdrop-blur-sm border rounded-2xl p-6 transition-all duration-300 group-hover:transform group-hover:scale-105",
                      colors.neutral.surface,
                      colors.neutral.border
                    )}>
                      <div className="flex items-center space-x-3 mb-4">
                        <div className="text-2xl">💳</div>
                        <h3 className={`${typography.h4} ${colors.neutral.textPrimary} font-bold`}>Credits Balance</h3>
                      </div>
                      
                      {credits && Object.keys(credits).length > 0 ? (
                        <div className="space-y-4">
                          {Object.entries(credits).map(([creditType, creditData]) => (
                            <div key={creditType} className="flex items-center justify-between">
                              <span className={`${typography.bodyBase} ${colors.neutral.textSecondary} capitalize`}>
                                {creditType.replace('_', ' ')}
                              </span>
                              <span className={`${typography.bodyBase} ${colors.neutral.textPrimary} font-medium`}>
                                {creditData?.balance || 0}
                              </span>
                            </div>
                          ))}
                          
                          <div className="pt-4 border-t border-gray-800/50">
                            <Link 
                              href="/pricing"
                              className={combineClasses(
                                "block w-full text-center px-4 py-3 rounded-xl font-medium transition-all duration-200",
                                "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30",
                                "hover:transform hover:scale-105"
                              )}
                            >
                              Buy More Credits
                            </Link>
                          </div>
                        </div>
                      ) : (
                        <div className="text-center py-8">
                          <p className={`${typography.bodyBase} ${colors.neutral.textSecondary} mb-4`}>
                            No credits available
                          </p>
                          <Link 
                            href="/pricing"
                            className={combineClasses(
                              "inline-block px-6 py-3 rounded-xl font-medium transition-all duration-200",
                              "bg-purple-500/20 text-purple-400 hover:bg-purple-500/30",
                              "hover:transform hover:scale-105"
                            )}
                          >
                            Buy Credits
                          </Link>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Credits Dashboard */}
            <div className="mb-12">
              <CreditsDashboard />
            </div>

            {/* Recent Activity & Tips */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Recent Activity */}
              <div 
                className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6"
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                }}
              >
                <div className="flex items-center space-x-2 mb-6">
                  <div className="text-2xl">📈</div>
                  <h3 className={`${typography.h4} ${colors.neutral.textPrimary} font-bold`}>Recent Activity</h3>
                </div>
                
                <div className="space-y-3">
                  {/*
                    { action: 'Profile updated', time: 'Just now', icon: '👤' },
                    { action: 'Logged in', time: '2 min ago', icon: '🔐' },
                    { action: 'Dashboard accessed', time: '5 min ago', icon: '📊' }
                  */}
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-center space-x-3 p-3 rounded-xl bg-gray-800/30 hover:bg-gray-800/50 transition-colors duration-200">
                      <div className="text-lg">🔹</div>
                      <div className="flex-1">
                        <p className={`${typography.bodySmall} ${colors.neutral.textPrimary}`}>Sample activity text here</p>
                        <p className={`${typography.bodyXSmall} ${colors.neutral.textMuted}`}>Time ago</p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Tips & Recommendations */}
              <div 
                className="bg-gray-900/60 backdrop-blur-sm border border-gray-800/50 rounded-2xl p-6"
                style={{
                  background: 'rgba(15, 23, 42, 0.6)',
                  boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)',
                }}
              >
                <div className="flex items-center space-x-2 mb-6">
                  <div className="text-2xl">💡</div>
                  <h3 className={`${typography.h4} ${colors.neutral.textPrimary} font-bold`}>Career Tips</h3>
                </div>
                
                <div className="space-y-4">
                  {/*
                    'Complete your profile to increase visibility by 60%',
                    'Upload your resume to get matched with relevant jobs',
                    'Set up job alerts to never miss an opportunity'
                  */}
                  {Array.from({ length: 3 }).map((_, index) => (
                    <div key={index} className="flex items-start space-x-3 p-3 rounded-xl bg-gradient-to-r from-indigo-500/5 to-purple-500/5 border border-indigo-500/10">
                      <div className="w-6 h-6 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full flex items-center justify-center text-white text-xs font-bold mt-0.5">
                        {index + 1}
                      </div>
                      <p className={`${typography.bodySmall} ${colors.neutral.textSecondary} leading-relaxed`}>Sample tip text here</p>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
