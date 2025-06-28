'use client';

import { useState } from 'react';
import Link from 'next/link';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProtectedRoute from '../../components/ProtectedRoute';
import { colors, typography, components, layout } from '../../utils/designSystem';

export default function ResumeAnalyzer() {
  const [isLoading, setIsLoading] = useState(true);

  const handleIframeLoad = () => {
    setIsLoading(false);
  };
  return (
    <ProtectedRoute>
      <div className={`min-h-screen ${colors.neutral.background} font-sans`}>
        <Header />
        
        <main className={layout.container}>
        {/* Simple Page Header */}
        <div className="py-8 text-center">
          <h1 className={`${typography.h1} ${colors.neutral.textPrimary} mb-4`}>
            Resume Analyzer
          </h1>
          <p className={`${typography.bodyLarge} ${colors.neutral.textTertiary} max-w-2xl mx-auto`}>
            Upload your resume and get instant AI-powered feedback to improve your job applications.
          </p>
        </div>

        {/* Resume Analyzer Tool */}
        <div className="max-w-5xl mx-auto mb-8 relative">
          {/* Loading State */}
          {isLoading && (
            <div className="absolute inset-0 flex items-center justify-center bg-gray-900 bg-opacity-90 z-10 rounded-lg">
              <div className="text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                <p className={`${typography.bodyBase} ${colors.neutral.textTertiary}`}>
                  Loading Resume Analyzer...
                </p>
              </div>
            </div>
          )}

          {/* Clean Iframe Container */}
          <div className="bg-gray-800 rounded-lg shadow-sm border border-gray-700 overflow-hidden">
            <iframe
              src="https://meesamraza-resume-analyzer1.hf.space"
              width="100%"
              height="800"
              style={{
                border: 'none',
                display: 'block'
              }}
              onLoad={handleIframeLoad}
              title="Resume Analyzer Tool"
            />
          </div>
        </div>

        {/* Quick Tips */}
        <div className="max-w-4xl mx-auto mb-12">
          <div className={`${components.card.base} ${components.card.padding}`}>
            <h2 className={`${typography.h4} ${colors.neutral.textPrimary} mb-4 text-center`}>
              Resume Tips
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <ul className={`space-y-2 ${typography.bodyBase} ${colors.neutral.textTertiary}`}>
                  <li>• Use action verbs and quantify achievements</li>
                  <li>• Keep formatting clean and consistent</li>
                  <li>• Tailor content to specific job descriptions</li>
                </ul>
              </div>
              <div>
                <ul className={`space-y-2 ${typography.bodyBase} ${colors.neutral.textTertiary}`}>
                  <li>• Include relevant keywords from job postings</li>
                  <li>• Proofread carefully for errors</li>
                  <li>• Keep resume to 1-2 pages maximum</li>
                </ul>
              </div>
            </div>
          </div>
        </div>        {/* Simple CTA */}
        <div className="text-center mb-12">
          <Link 
            href="/"
            className={`${components.button.base} ${components.button.primary} ${components.button.sizes.large}`}
          >
            Back to Job Search
          </Link>        </div>
      </main>
      
      <Footer />
    </div>
    </ProtectedRoute>
  );
}