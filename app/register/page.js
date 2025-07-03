'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { colors, typography, components, layout } from '../../utils/designSystem';

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
    <div className={`min-h-screen ${colors.neutral.backgroundSecondary} flex items-center justify-center py-12 px-4`}>
      <div className={`max-w-2xl w-full space-y-8`}>
        <div>
          <h2 className={`mt-6 text-center ${typography.h2} ${colors.neutral.textPrimary}`}>
            Create your account
          </h2>
          <p className={`mt-2 text-center ${typography.bodyBase} ${colors.neutral.textSecondary}`}>
            Already have an account?{' '}
            <Link href="/login" className={`font-medium ${colors.primary.text} hover:opacity-80`}>
              Sign in here
            </Link>
          </p>
        </div>
        
        <div className={`${components.card.base} ${components.card.padding} max-w-2xl mx-auto`}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className={`${colors.error.background} ${colors.error.text} p-3 rounded-lg ${typography.bodySmall}`}>
                {error}
              </div>
            )}
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="fullName" className={`block ${typography.bodyBase} font-medium ${colors.neutral.textPrimary} mb-2`}>
                  Full Name <span className="text-red-500">*</span>
                </label>                <input
                  id="fullName"
                  name="fullName"
                  type="text"
                  required
                  value={formData.fullName}
                  onChange={handleChange}
                  className={`${components.input.base} ${error ? components.input.error : ''}`}
                  placeholder="Enter your full name"
                />
              </div>

              <div>
                <label htmlFor="nickname" className={`block ${typography.bodyBase} font-medium ${colors.neutral.textPrimary} mb-2`}>
                  Nickname
                </label>
                <input
                  id="nickname"
                  name="nickname"
                  type="text"
                  value={formData.nickname}
                  onChange={handleChange}
                  className={components.input.base}
                  placeholder="Enter your nickname (optional)"
                />
              </div>
            </div>

            <div>
              <label htmlFor="email" className={`block ${typography.bodyBase} font-medium ${colors.neutral.textPrimary} mb-2`}>
                Email address <span className="text-red-500">*</span>
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={components.input.base}
                placeholder="Enter your email"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <label htmlFor="password" className={`block ${typography.bodyBase} font-medium ${colors.neutral.textPrimary} mb-2`}>
                  Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="password"
                  name="password"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.password}
                  onChange={handleChange}
                  className={components.input.base}
                  placeholder="Enter your password"
                />
              </div>

              <div>
                <label htmlFor="confirmPassword" className={`block ${typography.bodyBase} font-medium ${colors.neutral.textPrimary} mb-2`}>
                  Confirm Password <span className="text-red-500">*</span>
                </label>
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type="password"
                  autoComplete="new-password"
                  required
                  value={formData.confirmPassword}
                  onChange={handleChange}
                  className={components.input.base}
                  placeholder="Confirm your password"
                />
              </div>
            </div>

            <div>
              <label htmlFor="dateOfBirth" className={`block ${typography.bodyBase} font-medium ${colors.neutral.textPrimary} mb-2`}>
                Date of Birth <span className="text-red-500">*</span>
              </label>
              <input
                id="dateOfBirth"
                name="dateOfBirth"
                type="date"
                required
                value={formData.dateOfBirth}
                onChange={handleChange}
                className={components.input.base}
              />
            </div>

            <div>
              <label htmlFor="fullAddress" className={`block ${typography.bodyBase} font-medium ${colors.neutral.textPrimary} mb-2`}>
                Full Address
              </label>
              <textarea
                id="fullAddress"
                name="fullAddress"
                rows="3"
                value={formData.fullAddress}
                onChange={handleChange}
                className={components.input.base}
                placeholder="Enter your full address (optional)"
              />
            </div>

            <div>
              <button
                type="submit"
                disabled={loading}
                className={`w-full ${components.button.base} ${components.button.primary} ${components.button.sizes.medium} flex items-center justify-center space-x-2`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Creating account...</span>
                  </>
                ) : (
                  <span>Create Account</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
