'use client';

import { useState, useEffect } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import Link from 'next/link';
import { useAuth } from '../../contexts/AuthContext';
import { colors, typography, components, layout } from '../../utils/designSystem';

export default function LoginPage() {
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
      router.push(redirectUrl);
    } else {
      setError(result.error || 'Login failed');
    }
    
    setLoading(false);
  };

  if (user) {
    return <div>Redirecting...</div>;
  }

  return (
    <div className={`min-h-screen ${colors.neutral.backgroundSecondary} flex items-center justify-center py-12 px-4`}>
      <div className={`max-w-md w-full space-y-8`}>
        <div>
          <h2 className={`mt-6 text-center ${typography.h2} ${colors.neutral.textPrimary}`}>
            Sign in to your account
          </h2>
          <p className={`mt-2 text-center ${typography.bodyBase} ${colors.neutral.textSecondary}`}>
            Or{' '}
            <Link href="/register" className={`font-medium ${colors.primary.text} hover:opacity-80`}>
              create a new account
            </Link>
          </p>
        </div>
        
        <div className={`${components.card.base} ${components.card.padding} max-w-md mx-auto`}>
          <form className="space-y-6" onSubmit={handleSubmit}>
            {error && (
              <div className={`${colors.error.background} ${colors.error.text} p-3 rounded-lg ${typography.bodySmall}`}>
                {error}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className={`block ${typography.bodyBase} font-medium ${colors.neutral.textPrimary} mb-2`}>
                Email address
              </label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={formData.email}
                onChange={handleChange}
                className={`${components.input.base} ${error ? components.input.error : ''}`}
                placeholder="Enter your email"
              />
            </div>

            <div>
              <label htmlFor="password" className={`block ${typography.bodyBase} font-medium ${colors.neutral.textPrimary} mb-2`}>
                Password
              </label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete="current-password"
                required
                value={formData.password}
                onChange={handleChange}
                className={`${components.input.base} ${error ? components.input.error : ''}`}
                placeholder="Enter your password"
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
                    <span>Signing in...</span>
                  </>
                ) : (
                  <span>Sign in</span>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}
