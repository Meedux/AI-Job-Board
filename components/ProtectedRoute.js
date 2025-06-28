'use client';

import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { colors, typography } from '../utils/designSystem';

const ProtectedRoute = ({ children, fallback = null }) => {
  const { user, loading } = useAuth();

  console.log('🛡️ ProtectedRoute state:', { 
    hasUser: !!user, 
    loading, 
    userEmail: user?.email 
  });

  // Show loading state while checking authentication
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-800">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`${typography.bodyBase} ${colors.neutral.textSecondary}`}>
            Verifying authentication...
          </p>
        </div>
      </div>
    );
  }

  // If user is authenticated, render the protected content
  if (user) {
    console.log('✅ User authenticated, rendering protected content');
    return children;
  }

  // If not authenticated and no custom fallback, show access denied
  if (fallback) {
    return fallback;
  }

  // Default: Show access denied message
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-800">
      <div className="max-w-md w-full text-center p-8">
        <div className="mb-6">
          <div className="mx-auto h-16 w-16 rounded-full bg-red-100 flex items-center justify-center mb-4">
            <svg className="h-8 w-8 text-red-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.732-.833-2.5 0L4.268 19.5c-.77.833.192 2.5 1.732 2.5z" />
            </svg>
          </div>
          <h2 className={`${typography.h3} ${colors.neutral.textPrimary} mb-2`}>
            Access Denied
          </h2>
          <p className={`${typography.bodyBase} ${colors.neutral.textSecondary} mb-6`}>
            You need to be logged in to access this page.
          </p>
        </div>
        
        <div className="space-y-3">
          <a
            href="/login"
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-blue-600 hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Sign In
          </a>
          <a
            href="/register"
            className="w-full inline-flex items-center justify-center px-4 py-2 border border-gray-600 text-sm font-medium rounded-md text-gray-300 bg-gray-800 hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
          >
            Create Account
          </a>
          <Link
            href="/"
            className="w-full inline-flex items-center justify-center px-4 py-2 text-sm font-medium text-gray-500 hover:text-gray-700 transition-colors"
          >
            ← Back to Home
          </Link>
        </div>
      </div>
    </div>
  );
};

export default ProtectedRoute;
