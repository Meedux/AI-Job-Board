'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { USER_ROLES } from '@/utils/roleSystem';

export default function DynamicAuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();
  
  // Form state
  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState('jobseeker'); // jobseeker or hirer
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [captchaToken, setCaptchaToken] = useState('');
  
  // Form data
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    name: '', // For jobseekers
    companyName: '', // For hirers
    companyType: '', // e.g., direct, agency
    employerCategory: '', // local, abroad, both
    taxId: '',
    authorizedRepresentatives: [],
    agreeToTerms: false
  });

  // Check if user came from job posting
  const redirectToJobPost = searchParams.get('redirect') === 'post-job';

  useEffect(() => {
    // If redirect from job posting, default to hirer
    if (redirectToJobPost) {
      setUserType('hirer');
      setIsLogin(false); // Show registration form
    }
  }, [redirectToJobPost]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError(''); // Clear error when user types
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return false;
    }

    if (!isLogin) {
      if (userType === 'jobseeker' && !formData.name.trim()) {
        setError('Name is required for job seekers');
        return false;
      }
      if (userType === 'hirer' && !formData.companyName.trim()) {
        setError('Company name is required for hirers');
        return false;
      }
      if (!formData.agreeToTerms) {
        setError('You must agree to the Terms & Conditions');
        return false;
      }
    }

    // Email validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

    // Password validation
    if (!isLogin && formData.password.length < 8) {
      setError('Password must be at least 8 characters long');
      return false;
    }

    return true;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setLoading(true);
    setError('');

    try {
      if (isLogin) {
        // Login logic - use enhanced API
        const response = await fetch('/api/auth/login-enhanced', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            captchaToken
          })
        });

        const data = await response.json();

        if (response.ok) {
          await login(data.user, data.token);
          
          // Redirect based on user role
          if (data.user.role === USER_ROLES.SUPER_ADMIN || data.user.role === 'super_admin') {
            router.push('/super-admin');
          } else if (data.user.role === USER_ROLES.EMPLOYER_ADMIN || 
              data.user.role === USER_ROLES.SUB_USER ||
              data.user.role === 'employer_admin') { // Extra check for string value
            router.push('/admin');
          } else {
            router.push('/dashboard');
          }
        } else {
          // Handle email verification required
          if (data.errorCode === 'EMAIL_VERIFICATION_REQUIRED') {
            router.push('/verify-email');
            return;
          }
          setError(data.error || 'Login failed');
        }
      } else {
        // Registration logic
        const registrationData = {
          email: formData.email,
          password: formData.password,
          role: userType === 'hirer' ? USER_ROLES.EMPLOYER_ADMIN : USER_ROLES.JOB_SEEKER,
          userType: userType,
          captchaToken
        };

        if (userType === 'jobseeker') {
          registrationData.fullName = formData.name;
        } else {
          registrationData.companyName = formData.companyName;
          registrationData.fullName = formData.companyName; // Use company name as full name initially
          registrationData.companyType = formData.companyType;
          registrationData.employerCategory = formData.employerCategory;
          registrationData.taxId = formData.taxId;
          registrationData.authorizedRepresentatives = formData.authorizedRepresentatives;
        }

        const response = await fetch('/api/auth/register-enhanced', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json'
          },
          body: JSON.stringify(registrationData)
        });

        const data = await response.json();

        if (response.ok) {
          if (data.requiresVerification) {
            // Redirect to verification page instead of auto-login
            setSuccess('Registration successful! Please check your email to verify your account.');
            setTimeout(() => {
              router.push('/verify-email');
            }, 2000);
          } else {
            // Auto-login for immediate verification (development mode)
            setSuccess('Registration successful! Welcome to JobSite.');
            
            if (data.token) {
              await login(data.user, data.token);
              
              // Redirect based on original intent or user type
              if (redirectToJobPost && userType === 'hirer') {
                router.push('/post-job');
              } else if (data.user.role === USER_ROLES.SUPER_ADMIN || data.user.role === 'super_admin') {
                router.push('/super-admin');
              } else if (data.user.role === USER_ROLES.EMPLOYER_ADMIN || data.user.role === 'employer_admin') {
                router.push('/admin');
              } else {
                router.push('/dashboard');
              }
            }
          }
        } else {
          setError(data.error || 'Registration failed');
        }
      }
    } catch (error) {
      console.error('Auth error:', error);
      setError('An unexpected error occurred. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleForgotPassword = async () => {
    if (!formData.email) {
      setError('Please enter your email address first');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email: formData.email })
      });

      if (response.ok) {
        setSuccess('Password reset email sent! Check your inbox.');
      } else {
        const data = await response.json();
        setError(data.error || 'Failed to send reset email');
      }
    } catch (error) {
      setError('Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div>
          <h2 className="mt-6 text-center text-3xl font-extrabold text-white">
            {isLogin ? 'Sign in to your account' : 'Create your account'}
          </h2>
          <p className="mt-2 text-center text-sm text-gray-400">
            {isLogin ? (
              <>
                Don't have an account?{' '}
                <button
                  onClick={() => setIsLogin(false)}
                  className="font-medium text-indigo-400 hover:text-indigo-300"
                >
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button
                  onClick={() => setIsLogin(true)}
                  className="font-medium text-indigo-400 hover:text-indigo-300"
                >
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>

        <form className="mt-8 space-y-6" onSubmit={handleSubmit}>
          {/* User Type Selection - Only for Registration */}
          {!isLogin && (
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700">
              <label className="block text-sm font-medium text-gray-300 mb-3">
                I am a:
              </label>
              <div className="flex space-x-4">
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="userType"
                    value="jobseeker"
                    checked={userType === 'jobseeker'}
                    onChange={(e) => setUserType(e.target.value)}
                    className="h-4 w-4 text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-300">👤 Job Seeker</span>
                </label>
                <label className="flex items-center">
                  <input
                    type="radio"
                    name="userType"
                    value="hirer"
                    checked={userType === 'hirer'}
                    onChange={(e) => setUserType(e.target.value)}
                    className="h-4 w-4 text-indigo-600 bg-gray-700 border-gray-600 focus:ring-indigo-500"
                  />
                  <span className="ml-2 text-sm text-gray-300">🏢 Hirer</span>
                </label>
              </div>
            </div>
          )}

          <div className="space-y-4">
            {/* Dynamic Name/Company Field - Only for Registration */}
            {!isLogin && (
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-1">
                  {userType === 'jobseeker' ? 'Full Name' : 'Company Name'}
                </label>
                <input
                  type="text"
                  name={userType === 'jobseeker' ? 'name' : 'companyName'}
                  value={userType === 'jobseeker' ? formData.name : formData.companyName}
                  onChange={handleInputChange}
                  required={!isLogin}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                  placeholder={userType === 'jobseeker' ? 'Enter your full name' : 'Enter your company name'}
                />
                {userType === 'hirer' && (
                  <div className="mt-3 space-y-3">
                    <div className="grid grid-cols-2 gap-3">
                      <select name="companyType" value={formData.companyType} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                        <option value="">Company Type</option>
                        <option value="direct">Direct Employer</option>
                        <option value="agency">Agency</option>
                        <option value="sub_agency">Sub-Agency</option>
                      </select>
                      <select name="employerCategory" value={formData.employerCategory} onChange={handleInputChange} className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white">
                        <option value="">Category</option>
                        <option value="local">Local</option>
                        <option value="abroad">Abroad</option>
                        <option value="both">Both</option>
                      </select>
                    </div>
                    <input type="text" name="taxId" value={formData.taxId} onChange={handleInputChange} placeholder="Tax Identification Number (TIN)" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white" />
                    <textarea name="authorizedReps" value={(formData.authorizedRepresentatives || []).map(a => `${a.name} <${a.email}>`).join('\n')} onChange={(e) => {
                      const lines = e.target.value.split('\n').map(l => l.trim()).filter(Boolean);
                      const ars = lines.map(line => {
                        const m = line.match(/^(.*) <(.*)>$/);
                        if (m) return { name: m[1].trim(), email: m[2].trim() };
                        return { name: line, email: '' };
                      });
                      setFormData(prev => ({ ...prev, authorizedRepresentatives: ars }));
                    }} placeholder="Authorized reps: One per line: Full Name <email@example.com>" className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white" rows={3} />
                  </div>
                )}
              </div>
            )}

            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Email Address
              </label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                required
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
                placeholder="Enter your email"
              />
            </div>

            {/* Password Field */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Password
              </label>
              <div className="relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  required
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent pr-10"
                  placeholder={isLogin ? 'Enter your password' : 'Create a password (min 8 characters)'}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-300"
                >
                  {showPassword ? '🙈' : '👁️'}
                </button>
              </div>
            </div>

            {/* Terms Agreement - Only for Registration */}
            {!isLogin && (
              <div className="flex items-start">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  required
                  className="h-4 w-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500 mt-1"
                />
                <label className="ml-2 text-sm text-gray-300">
                  I agree to the{' '}
                  <a href="/terms" className="text-indigo-400 hover:text-indigo-300">
                    Terms & Conditions
                  </a>
                  ,{' '}
                  <a href="/privacy" className="text-indigo-400 hover:text-indigo-300">
                    Privacy Policy
                  </a>
                  , and{' '}
                  <a href="/cookies" className="text-indigo-400 hover:text-indigo-300">
                    Cookie Policy
                  </a>
                </label>
              </div>
            )}
          </div>

          {/* Error/Success Messages */}
          {error && (
            <div className="bg-red-900 border border-red-700 text-red-200 px-4 py-3 rounded">
              {error}
            </div>
          )}

          {success && (
            <div className="bg-green-900 border border-green-700 text-green-200 px-4 py-3 rounded">
              {success}
            </div>
          )}

          {/* Submit Button */}
          <div>
            <button
              type="submit"
              disabled={loading}
              className="group relative w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {loading ? (
                <div className="flex items-center">
                  <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                  Processing...
                </div>
              ) : (
                isLogin ? 'Sign In' : 'Create Account'
              )}
            </button>
          </div>

          {/* Forgot Password - Only for Login */}
          {isLogin && (
            <div className="text-center">
              <button
                type="button"
                onClick={handleForgotPassword}
                className="text-sm text-indigo-400 hover:text-indigo-300"
              >
                Forgot your password?
              </button>
            </div>
          )}

          {/* LinkedIn Login Option */}
          <div className="mt-6">
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-600" />
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-gray-900 text-gray-400">Or continue with</span>
              </div>
            </div>

            <div className="mt-6">
              <button
                type="button"
                onClick={() => {
                  // LinkedIn OAuth integration
                  window.location.href = '/api/auth/linkedin';
                }}
                className="w-full inline-flex justify-center py-2 px-4 border border-gray-600 rounded-md shadow-sm bg-gray-800 text-sm font-medium text-gray-300 hover:bg-gray-700"
              >
                <svg className="w-5 h-5 mr-2" viewBox="0 0 24 24" fill="currentColor">
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
                </svg>
                Sign {isLogin ? 'in' : 'up'} with LinkedIn
              </button>
            </div>
          </div>

          {/* Special Message for Job Posting Redirect */}
          {redirectToJobPost && !isLogin && (
            <div className="bg-blue-900 border border-blue-700 text-blue-200 px-4 py-3 rounded">
              🎯 Complete registration to post your job! You'll be redirected to the job posting form after account creation.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
