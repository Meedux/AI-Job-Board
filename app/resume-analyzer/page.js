'use client';

import { useState, useEffect, useRef } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { hasPremiumFeature, PREMIUM_FEATURES, getPremiumFeatureLimits } from '../../utils/premiumFeatures';
import PremiumFeatureButton from '../../components/PremiumFeatureButton';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProtectedRoute from '../../components/ProtectedRoute';


export default function ResumeAnalyzer() {
  const { user } = useAuth();
  const { subscription, credits } = useSubscription();
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [userCredits, setUserCredits] = useState({});
  const [loading, setLoading] = useState(true);
  const [showEmbed, setShowEmbed] = useState(false);
  const iframeRef = useRef(null);

  const hasAccess = hasPremiumFeature(PREMIUM_FEATURES.AI_RESUME_ANALYZER, user, subscription);
  const limits = getPremiumFeatureLimits(PREMIUM_FEATURES.AI_RESUME_ANALYZER, subscription);

  // Check if user has AI credits or subscription access
  const hasAICredits = (userCredits.ai_credit?.balance || 0) > 0 || hasAccess;

  // Load user's current credit balance
  useEffect(() => {
    const loadCredits = async () => {
      try {
        const response = await fetch('/api/credits/balance', {
          credentials: 'include'
        });
        
        if (response.ok) {
          const data = await response.json();
          if (data.success) {
            // The credits come as an object with creditType as keys
            // and each value contains { balance, used, total, expiresAt }
            console.log('Credits loaded:', data.credits);
            setUserCredits(data.credits);
          } else {
            console.log('No credits found or invalid format:', data);
            setUserCredits({});
          }
        }
      } catch (error) {
        console.error('Error loading credits:', error);
        setUserCredits({});
      } finally {
        setLoading(false);
      }
    };

    if (user) {
      loadCredits();
    } else {
      setLoading(false);
    }
  }, [user]);

  // Handle iframe messages for credit deduction
  useEffect(() => {
    const handleMessage = async (event) => {
      // Verify the origin is from the Hugging Face iframe
      if (event.origin !== 'https://meesamraza-resume-analyzer1.hf.space') {
        return;
      }

      // Check if this is a resume analysis event that should trigger credit deduction
      if (event.data && event.data.type === 'resume_analyzed') {
        await deductAICredit();
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  // Deduct AI credit when resume is analyzed
  const deductAICredit = async () => {
    if (hasAccess) {
      // Don't deduct credits for premium users
      return;
    }

    try {
      const response = await fetch('/api/credits/balance', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          creditType: 'ai_credit',
          amount: 1,
          action: 'use'
        }),
      });

      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          // Update local credit state with the new structure
          console.log('Credits updated after deduction:', data.credits);
          setUserCredits(data.credits);
          
          console.log('AI credit deducted successfully');
        } else {
          console.error('Failed to deduct credit:', data);
        }
      } else {
        console.error('Failed to deduct credit - response not ok');
      }
    } catch (error) {
      console.error('Error deducting AI credit:', error);
    }
  };

  const handleStartAnalysis = async () => {
    if (!hasAICredits) {
      alert('You need AI credits or a subscription to use the Resume Analyzer');
      return;
    }

    // Show confirmation for non-premium users
    if (!hasAccess) {
      const confirmed = window.confirm(
        `This will deduct 1 AI credit from your account.\nCurrent balance: ${userCredits.ai_credit?.balance || 0} credits.\n\nDo you want to continue?`
      );
      
      if (!confirmed) {
        return;
      }

      // Deduct credit upfront for non-premium users
      await deductAICredit();
      
      // Check if deduction was successful and user still has credits
      if ((userCredits.ai_credit?.balance || 0) <= 0) {
        alert('Insufficient AI credits. Please purchase more credits or upgrade to premium.');
        return;
      }
    }
    
    setShowEmbed(true);
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-950 text-white">
        <Header />
        
        <main className="pt-20 pb-16">
          <div className="max-w-6xl mx-auto px-4">
            {/* Header */}
            <div className="text-center mb-8">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                AI Resume Analyzer
              </h1>
              <p className="text-xl text-gray-300 mb-6">
                Get AI-powered insights to improve your resume and increase your chances of landing interviews
              </p>
              
              {/* Credit Status */}
              {!loading && (
                <div className="flex flex-wrap justify-center gap-4 mb-6">
                  {hasAccess && (
                    <div className="inline-flex items-center px-4 py-2 bg-green-600/20 border border-green-500/30 rounded-lg">
                      <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      <span className="text-green-300 font-medium">
                        Premium Subscription Active • Unlimited Usage
                      </span>
                    </div>
                  )}
                  
                  <div className="inline-flex items-center px-4 py-2 bg-blue-600/20 border border-blue-500/30 rounded-lg">
                    <svg className="w-5 h-5 text-blue-400 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                    </svg>
                    <span className="text-blue-300 font-medium">
                      AI Credits: {userCredits.ai_credit?.balance || 0}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* AI Resume Analyzer Embed */}
            {showEmbed && hasAICredits ? (
              <div className="bg-gray-800/50 rounded-xl p-4 border border-gray-700/50 mb-8">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-semibold text-white">AI Resume Analyzer</h2>
                  <button
                    onClick={() => setShowEmbed(false)}
                    className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors"
                  >
                    Close Analyzer
                  </button>
                </div>
                
                <div className="relative">
                  <iframe 
                    ref={iframeRef}
                    src="https://meesamraza-resume-analyzer1.hf.space" 
                    width="100%" 
                    height="820px" 
                    style={{ border: 'none', marginTop: '-20px', padding: 0, overflow: 'hidden' }}
                    scrolling="no"
                    title="AI Resume Analyzer"
                    className="rounded-lg"
                  />
                  
                  {/* Credit Deduction Notice */}
                  <div className="mt-4 p-3 bg-yellow-600/20 border border-yellow-500/30 rounded-lg">
                    <p className="text-yellow-300 text-sm">
                      <strong>Note:</strong> {hasAccess ? 
                        'Unlimited usage with your premium subscription.' : 
                        `1 AI credit has been deducted. Remaining balance: ${userCredits.ai_credit?.balance || 0} credits.`
                      }
                    </p>
                  </div>
                </div>
              </div>
            ) : (
              <>
                {/* Start Analysis Section */}
                {hasAICredits ? (
                  <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700/50 mb-8 text-center">
                    <div className="space-y-6">
                      <div className="mx-auto w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <svg className="w-10 h-10 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4M7.835 4.697a3.42 3.42 0 001.946-.806 3.42 3.42 0 014.438 0 3.42 3.42 0 001.946.806 3.42 3.42 0 013.138 3.138 3.42 3.42 0 00.806 1.946 3.42 3.42 0 010 4.438 3.42 3.42 0 00-.806 1.946 3.42 3.42 0 01-3.138 3.138 3.42 3.42 0 00-1.946.806 3.42 3.42 0 01-4.438 0 3.42 3.42 0 00-1.946-.806 3.42 3.42 0 01-3.138-3.138 3.42 3.42 0 00-.806-1.946 3.42 3.42 0 010-4.438 3.42 3.42 0 00.806-1.946 3.42 3.42 0 013.138-3.138z" />
                        </svg>
                      </div>
                      
                      <div>
                        <h3 className="text-2xl font-bold text-white mb-2">
                          Ready to Analyze Your Resume?
                        </h3>
                        <p className="text-gray-400 mb-6">
                          Our AI-powered tool will provide detailed insights, suggestions, and keyword analysis to help you optimize your resume for better job opportunities.
                        </p>
                      </div>
                      
                      <button
                        onClick={handleStartAnalysis}
                        className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
                      >
                        Start AI Resume Analysis
                      </button>
                    </div>
                  </div>
                ) : (
                  <>
                    {/* No Access Section */}
                    <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700/50 mb-8">
                      <div className="text-center space-y-6">
                        <div className="mx-auto w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                          <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                          </svg>
                        </div>
                        
                        <div>
                          <h3 className="text-2xl font-bold text-white mb-2">
                            AI Credits Required
                          </h3>
                          <p className="text-gray-400 mb-6">
                            You need AI credits or a premium subscription to use the AI Resume Analyzer.
                          </p>
                        </div>
                        
                        <div className="flex flex-wrap justify-center gap-4">
                          <a
                            href="/pricing"
                            className="px-6 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
                          >
                            View Subscription Plans
                          </a>
                          
                          <a
                            href="/dashboard"
                            className="px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition-colors"
                          >
                            Buy AI Credits
                          </a>
                        </div>
                      </div>
                    </div>
                  </>
                )}
              </>
            )}

            {/* Features Section */}
            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <div className="w-12 h-12 bg-blue-600/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v4a2 2 0 01-2 2h-2a2 2 0 00-2-2z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">AI-Powered Analysis</h3>
                <p className="text-gray-400 text-sm">
                  Advanced machine learning algorithms analyze your resume for content, structure, and optimization opportunities.
                </p>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <div className="w-12 h-12 bg-green-600/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 7h.01M7 3h5c.512 0 1.024.195 1.414.586l7 7a2 2 0 010 2.828l-7 7a2 2 0 01-2.828 0l-7-7A1.994 1.994 0 013 12V7a4 4 0 014-4z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Keyword Optimization</h3>
                <p className="text-gray-400 text-sm">
                  Identify missing keywords and optimize your resume for ATS systems and recruiter searches.
                </p>
              </div>
              
              <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                <div className="w-12 h-12 bg-purple-600/20 rounded-lg flex items-center justify-center mb-4">
                  <svg className="w-6 h-6 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
                  </svg>
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">Instant Feedback</h3>
                <p className="text-gray-400 text-sm">
                  Get immediate suggestions for improvements with specific, actionable recommendations.
                </p>
              </div>
            </div>

            {/* How it Works */}
            <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700/50 mb-8">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">How It Works</h2>
              <div className="grid md:grid-cols-3 gap-8">
                <div className="text-center">
                  <div className="w-16 h-16 bg-blue-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-blue-400">1</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Upload Resume</h3>
                  <p className="text-gray-400 text-sm">
                    Upload your resume in PDF format using our secure analyzer tool.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-green-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-green-400">2</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">AI Analysis</h3>
                  <p className="text-gray-400 text-sm">
                    Our AI analyzes content, structure, keywords, and formatting for optimization opportunities.
                  </p>
                </div>
                
                <div className="text-center">
                  <div className="w-16 h-16 bg-purple-600/20 rounded-full flex items-center justify-center mx-auto mb-4">
                    <span className="text-2xl font-bold text-purple-400">3</span>
                  </div>
                  <h3 className="text-lg font-semibold text-white mb-2">Get Results</h3>
                  <p className="text-gray-400 text-sm">
                    Receive detailed feedback, scoring, and actionable suggestions to improve your resume.
                  </p>
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