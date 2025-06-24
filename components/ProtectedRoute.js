'use client';

import { useEffect, useState } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';
import { colors, typography } from '../utils/designSystem';

const ProtectedRoute = ({ children, redirectTo = '/login' }) => {
  const { user, loading } = useAuth();
  const router = useRouter();
  const pathname = usePathname();
  const [hasRedirected, setHasRedirected] = useState(false);

  useEffect(() => {
    if (!loading && !user && !hasRedirected) {
      console.log('🔒 ProtectedRoute: User not authenticated, redirecting...');
      console.log('📍 Current pathname:', pathname);
      
      // Only add redirect parameter if we have a valid pathname and it's not login/register
      let redirectUrl = redirectTo;
      if (pathname && pathname !== '/login' && pathname !== '/register' && pathname !== '/') {
        redirectUrl = `${redirectTo}?redirect=${encodeURIComponent(pathname)}`;
        console.log('🔄 Redirect URL with return path:', redirectUrl);
      } else {
        console.log('🔄 Simple redirect URL:', redirectUrl);
      }
      
      setHasRedirected(true);
      router.push(redirectUrl);
    }
  }, [user, loading, router, redirectTo, pathname, hasRedirected]);
  // Show loading state
  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className={`${typography.bodyBase} ${colors.neutral.textSecondary}`}>
            Checking authentication...
          </p>
        </div>
      </div>
    );
  }

  // If user is authenticated, render children immediately
  if (user) {
    return children;
  }

  // Show redirecting message only briefly while redirect is happening
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="text-center">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
        <p className={`${typography.bodyBase} ${colors.neutral.textSecondary}`}>
          Redirecting to login...
        </p>
      </div>
    </div>
  );
};

export default ProtectedRoute;
