'use client';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { colors, typography, components, layout } from '../../utils/designSystem';
import Link from 'next/link';

export default function MyApplicationsPage() {
  const { user } = useAuth();

  return (
    <ProtectedRoute>
      <div className={`min-h-screen ${colors.neutral.background} font-sans`}>
        <Header />
        
        <main className={layout.container}>
          <div className="max-w-6xl mx-auto py-12">
            <div className={`${components.card.base} ${components.card.padding}`}>
              <h1 className={`${typography.h2} ${colors.neutral.textPrimary} mb-8`}>
                My Applications
              </h1>

              <div className="text-center py-12">
                <div className={`inline-flex items-center justify-center w-16 h-16 ${colors.neutral.backgroundTertiary} rounded-full mb-4`}>
                  <svg className={`w-8 h-8 ${colors.neutral.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className={`${typography.h4} ${colors.neutral.textPrimary} mb-2`}>
                  No Applications Yet
                </h3>
                <p className={`${typography.bodyBase} ${colors.neutral.textSecondary} mb-6 max-w-md mx-auto`}>
                  You {"haven't"} applied to any jobs yet. Browse our job listings to find opportunities that match your skills.
                </p>
                <Link
                  href="/"
                  className={`${components.button.base} ${components.button.primary} ${components.button.sizes.medium}`}
                >
                  Browse Jobs
                </Link>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
