"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { USER_ROLES } from '@/utils/roleSystem';
import Header from '@/components/Header';
import EmployerAdminDashboard from '@/components/EmployerAdminDashboard';
import SubUserDashboard from '@/components/SubUserDashboard';
import { colors, components, typography } from '@/utils/designSystem';

export default function AdminDashboardPage() {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className={`min-h-screen ${colors.neutral.background} flex items-center justify-center`}>
          <div className="text-center">
            <div className={`animate-spin rounded-full h-12 w-12 border-b-2 ${colors.primary[600]} mx-auto mb-4`}></div>
            <p className={`${colors.neutral.textSecondary}`}>Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className={`min-h-screen ${colors.neutral.background} flex items-center justify-center`}>
          <div className="text-center">
            <h1 className={`${typography.h3} ${colors.neutral.textPrimary} mb-4`}>Authentication Required</h1>
            <p className={`${colors.neutral.textSecondary} mb-6`}>Please log in to access the admin dashboard.</p>
            <a 
              href="/login"
              className={`${components.button.base} ${components.button.primary} ${components.button.sizes.medium}`}
            >
              Go to Login
            </a>
          </div>
        </div>
      </div>
    );
  }

  // Route to appropriate dashboard based on user role
  switch (user.role) {
    case USER_ROLES.EMPLOYER_ADMIN:
      return (
        <div className="min-h-screen bg-gray-50">
          <Header />
          <EmployerAdminDashboard />
        </div>
      );
    
    case USER_ROLES.SUB_USER:
      return (
        <div className="min-h-screen bg-gray-50">
          <Header />
          <SubUserDashboard />
        </div>
      );
    
    default:
      return (
        <div className="min-h-screen bg-gray-50">
          <Header />
          <div className={`min-h-screen ${colors.neutral.background} flex items-center justify-center`}>
            <div className="text-center">
              <h1 className={`${typography.h3} ${colors.neutral.textPrimary} mb-4`}>Access Denied</h1>
              <p className={`${colors.neutral.textSecondary} mb-6`}>
                This admin area is for employers only. Super admins should use the dedicated super admin panel.
              </p>
              <div className="space-x-4">
                {user.role === USER_ROLES.SUPER_ADMIN ? (
                  <a 
                    href="/super-admin"
                    className={`${components.button.base} ${components.button.primary} ${components.button.sizes.medium}`}
                  >
                    Go to Super Admin Panel
                  </a>
                ) : (
                  <a 
                    href="/dashboard"
                    className={`${components.button.base} ${components.button.primary} ${components.button.sizes.medium}`}
                  >
                    Go to Dashboard
                  </a>
                )}
                <a 
                  href="/"
                  className={`${components.button.base} ${components.button.ghost} ${components.button.sizes.medium}`}
                >
                  Go Home
                </a>
              </div>
            </div>
          </div>
        </div>
      );
  }
}
