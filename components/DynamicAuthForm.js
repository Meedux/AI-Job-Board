"use client";

import { useEffect, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { USER_ROLES } from '@/utils/roleSystem';

const initialForm = {
  fullName: '',
  companyName: '',
  email: '',
  password: '',
  agreeToTerms: false
};

export default function DynamicAuthForm() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const { login } = useAuth();

  const [isLogin, setIsLogin] = useState(true);
  const [userType, setUserType] = useState('jobseeker');
  const [formData, setFormData] = useState(initialForm);
  const [showPassword, setShowPassword] = useState(false);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');
  const [captchaToken] = useState('');

  useEffect(() => {
    if (searchParams.get('redirect') === 'post-job') {
      setUserType('hirer');
      setIsLogin(false);
    }
  }, [searchParams]);

  const handleInputChange = (e) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === 'checkbox' ? checked : value
    }));
    setError('');
  };

  const validateForm = () => {
    if (!formData.email || !formData.password) {
      setError('Email and password are required');
      return false;
    }

    if (!isLogin) {
      if (!formData.fullName.trim()) {
        setError('Full name is required');
        return false;
      }
      if (!formData.agreeToTerms) {
        setError('You must agree to the Terms & Conditions');
        return false;
      }
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(formData.email)) {
      setError('Please enter a valid email address');
      return false;
    }

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
    setSuccess('');

    try {
      if (isLogin) {
        const response = await fetch('/api/auth/login-enhanced', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            email: formData.email,
            password: formData.password,
            captchaToken
          })
        });

        const data = await response.json();

        if (response.ok) {
          await login(data.user, data.token);

          const role = data.user?.role;
          const isEmployer = role === USER_ROLES.EMPLOYER_ADMIN || role === 'employer_admin' || role === USER_ROLES.EMPLOYER_STAFF;

          if (isEmployer) {
            router.push('/onboarding/employer');
          } else if (role === USER_ROLES.SUPER_ADMIN || role === 'super_admin') {
            router.push('/super-admin');
          } else if (role === USER_ROLES.SUB_USER || role === 'sub_user') {
            router.push('/admin');
          } else {
            router.push('/dashboard');
          }
        } else {
          if (data.errorCode === 'EMAIL_VERIFICATION_REQUIRED') {
            router.push('/verify-email');
            return;
          }
          setError(data.error || 'Login failed');
        }
      } else {
        const registrationData = {
          email: formData.email,
          password: formData.password,
          fullName: formData.fullName,
          companyName: formData.companyName || null,
          role: userType === 'hirer' ? USER_ROLES.EMPLOYER_ADMIN : USER_ROLES.JOB_SEEKER,
          userType,
          captchaToken
        };

        const response = await fetch('/api/auth/register-enhanced', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(registrationData)
        });

        const data = await response.json();

        if (response.ok) {
          setSuccess('Registration successful! Please verify your email.');
          const next = userType === 'hirer' ? '/onboarding/employer' : '/dashboard';
          setTimeout(() => {
            router.push(`/verify-email?next=${encodeURIComponent(next)}`);
          }, 900);
        } else {
          setError(data.error || 'Registration failed');
        }
      }
    } catch (err) {
      console.error('Auth error:', err);
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
    setError('');
    setSuccess('');

    try {
      const response = await fetch('/api/auth/forgot-password', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email: formData.email })
      });

      const data = await response.json();
      if (response.ok) {
        setSuccess('Password reset email sent!');
      } else {
        setError(data.error || 'Failed to send reset email');
      }
    } catch (err) {
      setError('Failed to send reset email');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-md w-full space-y-8">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white">{isLogin ? 'Sign in' : 'Create your account'}</h2>
          <p className="mt-2 text-sm text-gray-400">
            {isLogin ? (
              <>
                Don't have an account?{' '}
                <button onClick={() => setIsLogin(false)} className="font-medium text-indigo-400 hover:text-indigo-300">
                  Sign up
                </button>
              </>
            ) : (
              <>
                Already have an account?{' '}
                <button onClick={() => setIsLogin(true)} className="font-medium text-indigo-400 hover:text-indigo-300">
                  Sign in
                </button>
              </>
            )}
          </p>
        </div>

        <form className="mt-4 space-y-6" onSubmit={handleSubmit}>
          {!isLogin && (
            <div className="bg-gray-800 rounded-lg p-4 border border-gray-700 space-y-3">
              <label className="block text-sm font-medium text-gray-300">I am a:</label>
              <div className="flex space-x-4">
                <label className="flex items-center text-sm text-gray-300">
                  <input
                    type="radio"
                    name="userType"
                    value="jobseeker"
                    checked={userType === 'jobseeker'}
                    onChange={() => setUserType('jobseeker')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-2">Job Seeker</span>
                </label>
                <label className="flex items-center text-sm text-gray-300">
                  <input
                    type="radio"
                    name="userType"
                    value="hirer"
                    checked={userType === 'hirer'}
                    onChange={() => setUserType('hirer')}
                    className="h-4 w-4 text-indigo-600 focus:ring-indigo-500 border-gray-300"
                  />
                  <span className="ml-2">Employer / Hirer</span>
                </label>
              </div>
            </div>
          )}

          {!isLogin && (
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-300">Full Name</label>
                <input
                  type="text"
                  name="fullName"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="mt-1 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-indigo-500"
                  placeholder="Your full name"
                  required
                />
              </div>

              {userType === 'hirer' && (
                <div>
                  <label className="block text-sm font-medium text-gray-300">Company Name (optional)</label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleInputChange}
                    className="mt-1 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-indigo-500"
                    placeholder="Your company"
                  />
                  <p className="text-xs text-gray-400 mt-1">Complete employer verification on the next page.</p>
                </div>
              )}
            </div>
          )}

          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-300">Email address</label>
              <input
                type="email"
                name="email"
                value={formData.email}
                onChange={handleInputChange}
                className="mt-1 w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-indigo-500"
                placeholder="you@example.com"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300">Password</label>
              <div className="mt-1 relative">
                <input
                  type={showPassword ? 'text' : 'password'}
                  name="password"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white placeholder-gray-400 focus:outline-none focus:ring-indigo-500 pr-16"
                  placeholder={isLogin ? 'Your password' : 'At least 8 characters'}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute inset-y-0 right-0 pr-3 flex items-center text-sm text-gray-400 hover:text-gray-200"
                >
                  {showPassword ? 'Hide' : 'Show'}
                </button>
              </div>
            </div>

            {!isLogin && (
              <label className="flex items-start text-sm text-gray-300">
                <input
                  type="checkbox"
                  name="agreeToTerms"
                  checked={formData.agreeToTerms}
                  onChange={handleInputChange}
                  className="h-4 w-4 text-indigo-600 bg-gray-700 border-gray-600 rounded focus:ring-indigo-500 mt-1"
                  required
                />
                <span className="ml-2">
                  I agree to the{' '}
                  <a href="/terms" className="text-indigo-400 hover:text-indigo-300">Terms</a> and{' '}
                  <a href="/privacy" className="text-indigo-400 hover:text-indigo-300">Privacy Policy</a>.
                </span>
              </label>
            )}
          </div>

          {error && (
            <div className="bg-red-900/60 border border-red-700 text-red-100 px-4 py-3 rounded">{error}</div>
          )}

          {success && (
            <div className="bg-green-900/60 border border-green-700 text-green-100 px-4 py-3 rounded">{success}</div>
          )}

          <div>
            <button
              type="submit"
              disabled={loading}
              className="w-full flex justify-center py-2 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-60"
            >
              {loading ? 'Please wait...' : isLogin ? 'Sign in' : 'Create account'}
            </button>
          </div>

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

          {searchParams.get('redirect') === 'post-job' && !isLogin && (
            <div className="bg-blue-900/60 border border-blue-700 text-blue-100 px-4 py-3 rounded">
              Complete registration to post your job. We will collect verification next.
            </div>
          )}
        </form>
      </div>
    </div>
  );
}
