'use client';

import { useState } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { hasPremiumFeature, PREMIUM_FEATURES, getPremiumFeatureLimits } from '../../utils/premiumFeatures';
import PremiumFeatureButton from '../../components/PremiumFeatureButton';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProtectedRoute from '../../components/ProtectedRoute';

export default function ResumeAnalyzer() {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [file, setFile] = useState(null);
  const [analyzing, setAnalyzing] = useState(false);
  const [analysis, setAnalysis] = useState(null);
  const [dragActive, setDragActive] = useState(false);

  const hasAccess = hasPremiumFeature(PREMIUM_FEATURES.AI_RESUME_ANALYZER, user, subscription);
  const limits = getPremiumFeatureLimits(PREMIUM_FEATURES.AI_RESUME_ANALYZER, subscription);
  const handleFileUpload = (uploadedFile) => {
    if (uploadedFile && uploadedFile.type === 'application/pdf') {
      setFile(uploadedFile);
    } else {
      alert('Please upload a PDF file');
    }
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') {
      setDragActive(true);
    } else if (e.type === 'dragleave') {
      setDragActive(false);
    }
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    
    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      handleFileUpload(e.dataTransfer.files[0]);
    }
  };

  const analyzeResume = async () => {
    if (!hasAccess) {
      alert('Please upgrade to Premium to use AI Resume Analyzer');
      return;
    }

    if (!file) {
      alert('Please upload a resume first');
      return;
    }

    setAnalyzing(true);
    
    try {
      // Simulate API call to AI service
      await new Promise(resolve => setTimeout(resolve, 3000));
      
      // Mock analysis results
      setAnalysis({
        score: 85,
        strengths: [
          'Strong technical skills section',
          'Quantified achievements',
          'Professional formatting',
          'Relevant work experience'
        ],
        weaknesses: [
          'Missing keywords for target roles',
          'No summary statement',
          'Could use more action verbs'
        ],
        suggestions: [
          'Add a professional summary at the top',
          'Include more industry-specific keywords',
          'Quantify more achievements with numbers',
          'Use stronger action verbs to start bullet points'
        ],
        keywords: {
          found: ['JavaScript', 'React', 'Node.js', 'MongoDB', 'Git'],
          missing: ['TypeScript', 'AWS', 'Docker', 'Agile', 'Leadership']
        }
      });
    } catch (error) {
      console.error('Error analyzing resume:', error);
      alert('Error analyzing resume. Please try again.');
    } finally {
      setAnalyzing(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-950 text-white">
        <Header />
        
        <main className="pt-20 pb-16">
          <div className="max-w-4xl mx-auto px-4">
            {/* Header */}
            <div className="text-center mb-12">
              <h1 className="text-4xl md:text-5xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-600 bg-clip-text text-transparent">
                AI Resume Analyzer
              </h1>
              <p className="text-xl text-gray-300 mb-6">
                Get AI-powered insights to improve your resume and increase your chances of landing interviews
              </p>
              
              {hasAccess && (
                <div className="inline-flex items-center px-4 py-2 bg-green-600/20 border border-green-500/30 rounded-lg">
                  <svg className="w-5 h-5 text-green-400 mr-2" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  <span className="text-green-300 font-medium">
                    Premium Feature Active • {limits.limit === -1 ? 'Unlimited' : `${limits.limit - limits.used} analyses remaining`}
                  </span>
                </div>
              )}
            </div>

            {/* Upload Section */}
            <div className="bg-gray-800/50 rounded-xl p-8 border border-gray-700/50 mb-8">
              <div
                className={`relative border-2 border-dashed rounded-lg p-8 text-center transition-all duration-300 ${
                  dragActive
                    ? 'border-blue-500 bg-blue-500/10'
                    : 'border-gray-600 hover:border-gray-500'
                }`}
                onDragEnter={handleDrag}
                onDragLeave={handleDrag}
                onDragOver={handleDrag}
                onDrop={handleDrop}
              >
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleFileUpload(e.target.files[0])}
                  className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  disabled={!hasAccess}
                />
                
                <div className="space-y-4">
                  <div className="mx-auto w-16 h-16 bg-gray-700 rounded-full flex items-center justify-center">
                    <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12" />
                    </svg>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-semibold text-white mb-2">
                      {file ? file.name : 'Upload Your Resume'}
                    </h3>
                    <p className="text-gray-400">
                      {file ? 'File ready for analysis' : 'Drag and drop your PDF resume or click to browse'}
                    </p>
                  </div>
                  
                  {file && (
                    <div className="inline-flex items-center px-3 py-1 bg-green-600/20 border border-green-500/30 rounded-full text-sm text-green-300">
                      <svg className="w-4 h-4 mr-1" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                      </svg>
                      File uploaded successfully
                    </div>
                  )}
                </div>
              </div>
              
              <div className="mt-6 text-center">
                <PremiumFeatureButton
                  feature={PREMIUM_FEATURES.AI_RESUME_ANALYZER}
                  onClick={analyzeResume}
                  disabled={!file || analyzing}
                  className="px-8 py-3 text-lg"
                >
                  {analyzing ? (
                    <>
                      <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" fill="none" viewBox="0 0 24 24">
                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                      </svg>
                      Analyzing Resume...
                    </>
                  ) : (
                    'Analyze My Resume'
                  )}
                </PremiumFeatureButton>
              </div>
            </div>

            {/* Analysis Results */}
            {analysis && (
              <div className="space-y-6">
                {/* Score */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <h3 className="text-2xl font-bold mb-4 text-center">Resume Score</h3>
                  <div className="flex items-center justify-center mb-4">
                    <div className="relative w-32 h-32">
                      <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          className="text-gray-700"
                        />
                        <circle
                          cx="50"
                          cy="50"
                          r="40"
                          stroke="currentColor"
                          strokeWidth="8"
                          fill="none"
                          strokeDasharray={`${analysis.score * 2.51} 251`}
                          className="text-blue-500"
                        />
                      </svg>
                      <div className="absolute inset-0 flex items-center justify-center">
                        <span className="text-3xl font-bold text-white">{analysis.score}%</span>
                      </div>
                    </div>
                  </div>
                  <p className="text-center text-gray-300">
                    {analysis.score >= 90 ? 'Excellent' : analysis.score >= 70 ? 'Good' : 'Needs Improvement'}
                  </p>
                </div>

                {/* Strengths & Weaknesses */}
                <div className="grid md:grid-cols-2 gap-6">
                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                    <h3 className="text-xl font-bold mb-4 text-green-400">Strengths</h3>
                    <ul className="space-y-2">
                      {analysis.strengths.map((strength, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="w-5 h-5 text-green-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-300">{strength}</span>
                        </li>
                      ))}
                    </ul>
                  </div>

                  <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                    <h3 className="text-xl font-bold mb-4 text-red-400">Areas for Improvement</h3>
                    <ul className="space-y-2">
                      {analysis.weaknesses.map((weakness, index) => (
                        <li key={index} className="flex items-start">
                          <svg className="w-5 h-5 text-red-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                            <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                          </svg>
                          <span className="text-gray-300">{weakness}</span>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>

                {/* Suggestions */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <h3 className="text-xl font-bold mb-4 text-yellow-400">AI Suggestions</h3>
                  <ul className="space-y-3">
                    {analysis.suggestions.map((suggestion, index) => (
                      <li key={index} className="flex items-start">
                        <svg className="w-5 h-5 text-yellow-400 mt-0.5 mr-2 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M11.3 1.046A1 1 0 0112 2v5h4a1 1 0 01.82 1.573l-7 10A1 1 0 018 18v-5H4a1 1 0 01-.82-1.573l7-10a1 1 0 011.12-.38z" clipRule="evenodd" />
                        </svg>
                        <span className="text-gray-300">{suggestion}</span>
                      </li>
                    ))}
                  </ul>
                </div>

                {/* Keywords */}
                <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
                  <h3 className="text-xl font-bold mb-4 text-blue-400">Keyword Analysis</h3>
                  <div className="grid md:grid-cols-2 gap-6">
                    <div>
                      <h4 className="font-semibold mb-2 text-green-400">Found Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.keywords.found.map((keyword, index) => (
                          <span key={index} className="px-2 py-1 bg-green-600/20 border border-green-500/30 rounded text-sm text-green-300">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                    <div>
                      <h4 className="font-semibold mb-2 text-red-400">Missing Keywords</h4>
                      <div className="flex flex-wrap gap-2">
                        {analysis.keywords.missing.map((keyword, index) => (
                          <span key={index} className="px-2 py-1 bg-red-600/20 border border-red-500/30 rounded text-sm text-red-300">
                            {keyword}
                          </span>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Premium Feature Promotion */}
            {!hasAccess && (
              <div className="bg-gradient-to-r from-purple-900/50 to-pink-900/50 rounded-xl p-8 border border-purple-500/30 text-center">
                <h3 className="text-2xl font-bold mb-4">Unlock AI Resume Analyzer</h3>
                <p className="text-gray-300 mb-6">
                  Get detailed insights, keyword analysis, and personalized suggestions to improve your resume
                </p>
                <a
                  href="/pricing"
                  className="inline-block px-8 py-3 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white font-semibold rounded-lg transition-all duration-200 transform hover:scale-105"
                >
                  Upgrade to Premium
                </a>
              </div>
            )}
          </div>
        </main>
        
        <Footer />
      </div>
    </ProtectedRoute>
  );
}