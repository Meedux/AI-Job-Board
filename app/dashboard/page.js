'use client';

import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { colors, typography, components, layout } from '../../utils/designSystem';
import Link from 'next/link';

export default function DashboardPage() {
  const { user } = useAuth();

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
      <div className={`min-h-screen ${colors.neutral.background} font-sans`}>
        <Header />
        
        <main className={layout.container}>
          <div className="max-w-6xl mx-auto py-12">
            {/* Welcome Section */}
            <div className={`${components.card.base} ${components.card.padding} mb-8`}>
              <div className="flex items-center space-x-4 mb-6">
                <div className={`w-16 h-16 ${colors.primary[500]} rounded-full flex items-center justify-center text-white text-xl font-bold`}>
                  {user?.nickname ? user.nickname.charAt(0).toUpperCase() : user?.fullName.charAt(0).toUpperCase()}
                </div>
                <div>
                  <h1 className={`${typography.h2} ${colors.neutral.textPrimary}`}>
                    Welcome back, {user?.nickname || user?.fullName}!
                  </h1>
                  <p className={`${typography.bodyBase} ${colors.neutral.textSecondary}`}>
                    Ready to find your next opportunity?
                  </p>
                </div>
              </div>
            </div>

            {/* Quick Actions Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {quickActions.map((action, index) => (
                <Link
                  key={index}
                  href={action.href}
                  className={`${components.card.base} ${components.card.hover} ${components.card.padding} block transition-all duration-200`}
                >
                  <div className={`${colors.primary.text} mb-4`}>
                    {action.icon}
                  </div>
                  <h3 className={`${typography.h5} ${colors.neutral.textPrimary} mb-2`}>
                    {action.title}
                  </h3>
                  <p className={`${typography.bodySmall} ${colors.neutral.textSecondary}`}>
                    {action.description}
                  </p>
                </Link>
              ))}
            </div>

            {/* Stats Section */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <div className={`${components.card.base} ${components.card.padding} text-center`}>
                <div className={`${typography.h2} ${colors.primary.text} mb-2`}>
                  0
                </div>
                <div className={`${typography.bodyBase} ${colors.neutral.textSecondary}`}>
                  Applications Submitted
                </div>
              </div>
              
              <div className={`${components.card.base} ${components.card.padding} text-center`}>
                <div className={`${typography.h2} ${colors.success.text} mb-2`}>
                  0
                </div>
                <div className={`${typography.bodyBase} ${colors.neutral.textSecondary}`}>
                  Interview Invitations
                </div>
              </div>
              
              <div className={`${components.card.base} ${components.card.padding} text-center`}>
                <div className={`${typography.h2} ${colors.neutral.textPrimary} mb-2`}>
                  {user?.age || 'N/A'}
                </div>
                <div className={`${typography.bodyBase} ${colors.neutral.textSecondary}`}>
                  Age
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
