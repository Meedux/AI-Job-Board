'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

/**
 * Hook for handling authentication requirements in pages
 * @param {Object} options Configuration options
 * @param {boolean} options.requireAuth Whether authentication is required
 * @param {string} options.redirectTo Where to redirect if not authenticated
 * @param {function} options.onAuthRequired Callback when auth is required but not present
 * @returns {Object} Auth state and helper functions
 */
export const useAuthGuard = (options = {}) => {
  const {
    requireAuth = false,
    redirectTo = '/login',
    onAuthRequired = null
  } = options;

  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (requireAuth && !loading && !user) {
      if (onAuthRequired) {
        onAuthRequired();
      } else {
        // Simple redirect without URL parameters
        router.push(redirectTo);
      }
    }
  }, [user, loading, requireAuth, redirectTo, onAuthRequired, router]);

  return {
    user,
    loading,
    isAuthenticated: !!user,
    isAuthRequired: requireAuth,
    isAuthChecking: loading,
    shouldShowContent: !requireAuth || (requireAuth && user),
    shouldShowLoading: loading,
    shouldRedirect: requireAuth && !loading && !user
  };
};

/**
 * Component wrapper for pages that require authentication
 */
export const withAuthGuard = (WrappedComponent, options = {}) => {
  return function AuthGuardedComponent(props) {
    const authState = useAuthGuard({ requireAuth: true, ...options });

    if (authState.shouldShowLoading) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-800">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-gray-600">Checking authentication...</p>
          </div>
        </div>
      );
    }

    if (authState.shouldRedirect) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-800">
          <div className="text-center">
            <p className="text-gray-600">Redirecting to login...</p>
          </div>
        </div>
      );
    }

    if (authState.shouldShowContent) {
      return <WrappedComponent {...props} />;
    }

    return null;
  };
};
