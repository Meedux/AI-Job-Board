'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { colors, typography, components, layout, combineClasses } from '../../utils/designSystem';

export default function RegisterPage() {
  const [formData, setFormData] = useState({
    fullName: '',
    nickname: '',
    email: '',
    password: '',
    confirmPassword: '',
    dateOfBirth: '',
    fullAddress: '',
  });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  
  const { register, user } = useAuth();
  const router = useRouter();

  // Redirect if already logged in
  useEffect(() => {
    if (user) {
      router.push('/');
    }
  }, [user, router]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const validateForm = () => {
    if (formData.password !== formData.confirmPassword) {
      setError('Passwords do not match');
      return false;
    }
    
    if (formData.password.length < 8) {
      setError('Password must be at least 8 characters');
      return false;
    }
    
    if (!formData.fullName || !formData.email || !formData.dateOfBirth) {
      setError('Please fill in all required fields');
      return false;
    }
    
    return true;
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    console.log('🔄 Registration form submitted');
    setError('');
    
    if (!validateForm()) {
      console.log('❌ Form validation failed');
      return;
    }
    
    setLoading(true);
    console.log('📝 Form data before registration:', { ...formData, password: '[HIDDEN]', confirmPassword: '[HIDDEN]' });

    const { confirmPassword, ...registrationData } = formData;
    console.log('📤 Calling register function with:', { ...registrationData, password: '[HIDDEN]' });
    const result = await register(registrationData);
    
    console.log('📨 Registration result:', result);
    if (result.success) {
      console.log('✅ Registration successful, redirecting to:', result.redirectUrl || '/');
      // Use the redirect URL returned from registration (admin users go to /admin)
      const finalRedirectUrl = result.redirectUrl || '/';
      router.push(finalRedirectUrl);
    } else {
      console.log('❌ Registration failed:', result.error);
      setError(result.error || 'Registration failed');
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
        <div className="max-w-4xl w-full space-y-8">
          {/* Header Section */}
          <div className="text-center space-y-6">
            {/* Logo/Icon */}
            <div className="flex justify-center">
              <div className="relative">
                <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full opacity-75 blur-lg animate-pulse"></div>
                <div className="relative w-20 h-20 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center shadow-2xl">
                  <svg className="w-10 h-10 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                  </svg>
                </div>
              </div>
            </div>

            <div className="space-y-3">
              <h2 className={`${typography.h1} ${colors.neutral.textPrimary} font-bold bg-gradient-to-r from-gray-100 via-gray-200 to-gray-300 bg-clip-text text-transparent`}>
                Join Our Community
              </h2>
              <p className={`${typography.bodyLarge} ${colors.neutral.textSecondary} max-w-md mx-auto`}>
                Create your account and unlock amazing opportunities
              </p>
              <p className={`${typography.bodyBase} ${colors.neutral.textTertiary}`}>
                Already have an account?{' '}
                <Link href="/login" className={`font-semibold ${colors.primary.text} hover:text-blue-300 transition-colors duration-200 underline decoration-2 underline-offset-2`}>
                  Sign in here
                </Link>
              </p>
            </div>
          </div>
          
          {/* Form Card */}
          <div className="relative">
            {/* Card Glow Effect */}
            <div className="absolute -inset-1 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-xl"></div>
            
            <div className={combineClasses(
              "relative backdrop-blur-xl border rounded-2xl p-8 sm:p-12 shadow-2xl",
              colors.neutral.surface,
              colors.neutral.border
            )}>
              <form className="space-y-8" onSubmit={handleSubmit}>
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
                
                {/* Form Grid */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                  {/* Personal Information Section */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5.121 17.804A13.937 13.937 0 0112 16c2.5 0 4.847.655 6.879 1.804M15 10a3 3 0 11-6 0 3 3 0 016 0zm6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                        </svg>
                      </div>
                      <h3 className={`${typography.h5} ${colors.neutral.textPrimary} font-semibold`}>
                        Personal Information
                      </h3>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label htmlFor="fullName" className={`block ${typography.bodyBase} font-medium ${colors.neutral.textPrimary} mb-2`}>
                          Full Name <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <input
                            id="fullName"
                            name="fullName"
                            type="text"
                            required
                            value={formData.fullName}
                            onChange={handleChange}
                            className={`${components.input.base} ${error ? components.input.error : ''} pl-12`}
                            placeholder="Enter your full name"
                          />
                          
                        </div>
                      </div>

                      <div>
                        <label htmlFor="nickname" className={`block ${typography.bodyBase} font-medium ${colors.neutral.textPrimary} mb-2`}>
                          Nickname <span className="text-gray-500">(Optional)</span>
                        </label>
                        <div className="relative">
                          <input
                            id="nickname"
                            name="nickname"
                            type="text"
                            value={formData.nickname}
                            onChange={handleChange}
                            className={`${components.input.base} pl-12`}
                            placeholder="Enter your nickname"
                          />
                        </div>
                      </div>

                      <div>
                        <label htmlFor="dateOfBirth" className={`block ${typography.bodyBase} font-medium ${colors.neutral.textPrimary} mb-2`}>
                          Date of Birth <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <input
                            id="dateOfBirth"
                            name="dateOfBirth"
                            type="date"
                            required
                            value={formData.dateOfBirth}
                            onChange={handleChange}
                            className={`${components.input.base} pl-12`}
                          />
                          
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Account & Security Section */}
                  <div className="space-y-6">
                    <div className="flex items-center space-x-3 mb-6">
                      <div className="w-8 h-8 bg-gradient-to-r from-green-600 to-blue-600 rounded-lg flex items-center justify-center">
                        <svg className="w-4 h-4 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" />
                        </svg>
                      </div>
                      <h3 className={`${typography.h5} ${colors.neutral.textPrimary} font-semibold`}>
                        Account & Security
                      </h3>
                    </div>

                    <div className="space-y-5">
                      <div>
                        <label htmlFor="email" className={`block ${typography.bodyBase} font-medium ${colors.neutral.textPrimary} mb-2`}>
                          Email Address <span className="text-red-400">*</span>
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
                            className={`${components.input.base} pl-12`}
                            placeholder="Enter your email"
                          />
                          
                        </div>
                      </div>

                      <div>
                        <label htmlFor="password" className={`block ${typography.bodyBase} font-medium ${colors.neutral.textPrimary} mb-2`}>
                          Password <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <input
                            id="password"
                            name="password"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={formData.password}
                            onChange={handleChange}
                            className={`${components.input.base} pl-12`}
                            placeholder="Enter your password"
                          />
                          
                        </div>
                      </div>

                      <div>
                        <label htmlFor="confirmPassword" className={`block ${typography.bodyBase} font-medium ${colors.neutral.textPrimary} mb-2`}>
                          Confirm Password <span className="text-red-400">*</span>
                        </label>
                        <div className="relative">
                          <input
                            id="confirmPassword"
                            name="confirmPassword"
                            type="password"
                            autoComplete="new-password"
                            required
                            value={formData.confirmPassword}
                            onChange={handleChange}
                            className={`${components.input.base} pl-12`}
                            placeholder="Confirm your password"
                          />
                          
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

                {/* Address Section */}
                <div className="space-y-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-pink-600 rounded-lg flex items-center justify-center">
                      <svg className="w-4 h-4 text-gray-100" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 21V5a2 2 0 00-2-2H7a2 2 0 00-2 2v16m14 0h2m-2 0h-5m-9 0H3m2 0h5M9 7h1m-1 4h1m4-4h1m-1 4h1m-5 10v-5a1 1 0 011-1h2a1 1 0 011 1v5m-4 0h4" />
                      </svg>
                    </div>
                    <h3 className={`${typography.h5} ${colors.neutral.textPrimary} font-semibold`}>
                      Address Information
                    </h3>
                  </div>

                  <div>
                    <label htmlFor="fullAddress" className={`block ${typography.bodyBase} font-medium ${colors.neutral.textPrimary} mb-2`}>
                      Full Address <span className="text-gray-500">(Optional)</span>
                    </label>
                    <div className="relative">
                      <textarea
                        id="fullAddress"
                        name="fullAddress"
                        rows="4"
                        value={formData.fullAddress}
                        onChange={handleChange}
                        className={`${components.input.base} pl-12 resize-none`}
                        placeholder="Enter your full address"
                      />
                      
                    </div>
                  </div>
                </div>

                {/* Submit Button */}
                <div className="pt-6">
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
                          <span>Creating your account...</span>
                        </>
                      ) : (
                        <>
                          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M18 9v3m0 0v3m0-3h3m-3 0h-3m-2-5a4 4 0 11-8 0 4 4 0 018 0zM3 20a6 6 0 0112 0v1H3v-1z" />
                          </svg>
                          <span>Create Account</span>
                        </>
                      )}
                    </div>
                  </button>
                </div>

                {/* Footer Info */}
                <div className="text-center space-y-3 pt-6 border-t border-gray-700">
                  <p className={`${typography.bodySmall} ${colors.neutral.textTertiary}`}>
                    By creating an account, you agree to our{' '}
                    <Link href="/terms" className={`${colors.primary.text} hover:text-blue-300 underline`}>
                      Terms of Service
                    </Link>
                    {' '}and{' '}
                    <Link href="/privacy" className={`${colors.primary.text} hover:text-blue-300 underline`}>
                      Privacy Policy
                    </Link>
                  </p>
                </div>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
