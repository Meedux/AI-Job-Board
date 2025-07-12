'use client';

import { useState, useEffect, Suspense } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { colors, typography, components, layout, combineClasses } from '../../utils/designSystem';

function LoginForm() {
  const [formData, setFormData] = useState({
    email: '',
    password: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { login, user } = useAuth();
  const router = useRouter();
  const searchParams = useSearchParams();
  const redirectUrl = searchParams.get('redirect') || '/';

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push(redirectUrl);
    }
  }, [user, router, redirectUrl]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(formData.email, formData.password);
    
    if (result.success) {
      // Use the redirect URL returned from login (admin users go to /admin)
      const finalRedirectUrl = result.redirectUrl || redirectUrl;
      router.push(finalRedirectUrl);
    } else {
      setError(result.error || 'Login failed');
    }
    
    setLoading(false);
  };

  if (user) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className={combineClasses(
      "min-h-screen relative overflow-hidden",
      colors.neutral.background
    )}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-64 h-64 bg-gradient-to-br from-indigo-600/10 to-cyan-600/10 rounded-full blur-2xl animate-pulse delay-500"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-6">
            {/* Logo/Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-75 blur-lg animate-pulse"></div>
                <div className="relative w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                  <svg className="w-10 h-10 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className={`${typography.h1} ${colors.neutral.textPrimary} font-bold bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 bg-clip-text text-transparent`}>
                Welcome Back
              </h2>
              <p className={`${typography.bodyLarge} ${colors.neutral.textSecondary} max-w-sm mx-auto`}>
                Sign in to your account and continue your journey
              </p>
              <p className={`${typography.bodyBase} ${colors.neutral.textTertiary}`}>
                Don't have an account?{' '}
                <Link href="/register" className={`font-semibold ${colors.primary.text} hover:text-blue-300 transition-colors duration-200 underline decoration-2 underline-offset-2`}>
                  Create one here
                </Link>
              </p>
            </div>
          </div>
          
          {/* Form Card */}
          <div className="relative">
            {/* Card Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-xl"></div>
            
            <div className={combineClasses(
              "relative backdrop-blur-xl border rounded-2xl p-8 sm:p-10 shadow-2xl",
              colors.neutral.surface,
              colors.neutral.border
            )}>
              <form className="space-y-6" onSubmit={handleSubmit}>
                {/* Error Message */}
                {error && (
                  <div className={`${colors.error.background} ${colors.error.text} p-4 rounded-xl ${typography.bodyBase} border border-red-800/50 backdrop-blur-sm`}>
                    <div className="flex items-center space-x-2">
                      <svg className="w-5 h-5 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span>{error}</span>
                    </div>
                  </div>
                )}
                
                {/* Email Field */}
                <div>
                  <label htmlFor="email" className={`block ${typography.bodyBase} font-medium ${colors.neutral.textPrimary} mb-2`}>
                    Email Address
                  </label>
                  <div className="relative">
                    <input
                      id="email"
                      name="email"
                      type="email"
                      autoComplete="email"
                      required
                      value={formData.email}
                      onChange={handleChange}
                      className={`${components.input.base} ${error ? components.input.error : ''} pl-12`}
                      placeholder="Enter your email"
                    />
                  </div>
                </div>

                {/* Password Field */}
                <div>
                  <label htmlFor="password" className={`block ${typography.bodyBase} font-medium ${colors.neutral.textPrimary} mb-2`}>
                    Password
                  </label>
                  <div className="relative">
                    <input
                      id="password"
                      name="password"
                      type="password"
                      autoComplete="current-password"
                      required
                      value={formData.password}
                      onChange={handleChange}
                      className={`${components.input.base} ${error ? components.input.error : ''} pl-12`}
                      placeholder="Enter your password"
                    />
                  </div>
                </div>

                {/* Forgot Password Link */}
                <div className="flex items-center justify-between">
                  <div className="flex items-center">
                    <input
                      id="remember-me"
                      name="remember-me"
                      type="checkbox"
                      className="h-4 w-4 text-blue-600 focus:ring-blue-500 border-gray-600 rounded bg-gray-800"
                    />
                    <label htmlFor="remember-me" className={`ml-2 block ${typography.bodySmall} ${colors.neutral.textSecondary}`}>
                      Remember me
                    </label>
                  </div>
                  <div className="text-sm">
                    {/* <Link href="/forgot-password" className={`font-medium ${colors.primary.text} hover:text-blue-300 transition-colors duration-200`}>
                      Forgot password?
                    </Link> */}
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-2">
                  <button
                    type="submit"
                    disabled={loading}
                    className={`w-full relative overflow-hidden ${components.button.base} ${components.button.sizes.large} bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-gray-100 font-semibold shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 active:scale-95`}
                  >
                    {/* Button glow effect */}
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-600 to-purple-600 opacity-75 blur-xl"></div>
                    
                    <div className="relative flex items-center justify-center space-x-3">
                      {loading ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-gray-200 border-t-transparent"></div>
                          <span>Signing you in...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M11 16l-4-4m0 0l4-4m-4 4h14m-5 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h7a3 3 0 013 3v1" />
                          </svg>
                          <span>Sign In</span>
                        </>
                      )}
                    </div>
                  </button>
                </div>

                {/* Footer Info */}
                <div className="text-center space-y-3 pt-6 border-t border-gray-700">
                  <p className={`${typography.bodySmall} ${colors.neutral.textTertiary}`}>
                    Secure sign-in with end-to-end encryption
                  </p>
                  <div className="flex justify-center space-x-4">
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                      <span className={`${typography.bodyXSmall} ${colors.neutral.textTertiary}`}>SSL Protected</span>
                    </div>
                    <div className="flex items-center space-x-1">
                      <svg className="w-4 h-4 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" />
                      </svg>
                      <span className={`${typography.bodyXSmall} ${colors.neutral.textTertiary}`}>Secure</span>
                    </div>
                  </div>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Loading component for Suspense fallback
function LoginPageLoading() {
  return (
    <div className={combineClasses(
      "min-h-screen relative overflow-hidden",
      colors.neutral.background
    )}>
      {/* Animated Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-72 h-72 bg-gradient-to-br from-blue-600/20 to-purple-600/20 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-gradient-to-br from-purple-600/20 to-blue-600/20 rounded-full blur-3xl animate-pulse delay-1000"></div>
      </div>

      <div className="relative z-10 min-h-screen flex items-center justify-center py-12 px-4">
        <div className="max-w-md w-full space-y-8">
          <div className="text-center animate-pulse">
            <div className="w-20 h-20 bg-gradient-to-r from-blue-600/50 to-purple-600/50 rounded-full mx-auto mb-6"></div>
            <div className="h-8 bg-gray-700 rounded w-3/4 mx-auto mb-4"></div>
            <div className="h-4 bg-gray-700 rounded w-1/2 mx-auto mb-8"></div>
            
            <div className={combineClasses(
              "backdrop-blur-xl border rounded-2xl p-8 sm:p-10 shadow-2xl animate-pulse",
              colors.neutral.surface,
              colors.neutral.border
            )}>
              <div className="space-y-6">
                <div className="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
                <div className="h-12 bg-gray-700 rounded"></div>
                <div className="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
                <div className="h-12 bg-gray-700 rounded"></div>
                <div className="h-12 bg-gray-700 rounded"></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function LoginPage() {
  return (
    <>
      <Suspense fallback={<LoginPageLoading />}>
        <LoginForm />
      </Suspense>
    </>
  );
}
