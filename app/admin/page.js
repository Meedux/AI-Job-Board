'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { USER_ROLES } from '@/utils/roleSystem';
import Header from '@/components/Header';
import SuperAdminDashboard from '@/components/SuperAdminDashboard';
import EmployerAdminDashboard from '@/components/EmployerAdminDashboard';
import SubUserDashboard from '@/components/SubUserDashboard';

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
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading dashboard...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="min-h-screen bg-gray-900 flex items-center justify-center">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Authentication Required</h1>
            <p className="text-gray-300 mb-6">Please log in to access the admin dashboard.</p>
            <a 
              href="/login"
              className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
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
    case USER_ROLES.SUPER_ADMIN:
      return (
        <div className="min-h-screen bg-gray-50">
          <Header />
          <SuperAdminDashboard />
        </div>
      );
    
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
          <div className="min-h-screen bg-gray-900 flex items-center justify-center">
            <div className="text-center">
              <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
              <p className="text-gray-300 mb-6">
                Your account type ({user.role}) does not have access to admin features.
              </p>
              <div className="space-x-4">
                <a 
                  href="/dashboard"
                  className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Go to Dashboard
                </a>
                <a 
                  href="/"
                  className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
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
