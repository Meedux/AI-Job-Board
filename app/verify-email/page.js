'use client';

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

function VerifyEmailInner() {
  const router = useRouter();
  const searchParams = useSearchParams();

  const [email, setEmail] = useState('');
  const [code, setCode] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [isResending, setIsResending] = useState(false);
  const [message, setMessage] = useState('');
  const [isError, setIsError] = useState(false);

  const nextPath = useMemo(() => searchParams.get('next') || '/', [searchParams]);

  useEffect(() => {
    const prefillEmail = searchParams.get('email');
    if (prefillEmail) {
      setEmail(prefillEmail);
    }
  }, [searchParams]);

  const handleVerify = async (e) => {
    e.preventDefault();
    setMessage('');
    setIsError(false);

    if (!email || code.trim().length !== 6) {
      setMessage('Enter your email and the 6-digit code.');
      setIsError(true);
      return;
    }

    setIsVerifying(true);
    try {
      const response = await fetch('/api/auth/verify-email', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, code: code.trim() })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage('Email verified! Redirecting you now...');
        setIsError(false);
        setTimeout(() => router.push(data.next || nextPath), 500);
      } else {
        setMessage(data.error || 'Verification failed.');
        setIsError(true);
      }
    } catch (error) {
      console.error('Verification error:', error);
      setMessage('An error occurred. Please try again.');
      setIsError(true);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleResendVerification = async (e) => {
    e.preventDefault();

    if (!email) {
      setMessage('Please enter your email address.');
      setIsError(true);
      return;
    }

    setIsResending(true);
    setMessage('');
    setIsError(false);

    try {
      const response = await fetch('/api/auth/resend-verification', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ email })
      });

      const data = await response.json();

      if (response.ok) {
        setMessage(data.message || 'Verification code sent.');
        setIsError(false);
      } else {
        setMessage(data.error || 'Failed to resend verification code.');
        setIsError(true);
      }
    } catch (error) {
      console.error('Resend verification error:', error);
      setMessage('An error occurred. Please try again.');
      setIsError(true);
    } finally {
      setIsResending(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-900 flex flex-col justify-center py-12 sm:px-6 lg:px-8">
      <div className="sm:mx-auto sm:w-full sm:max-w-md text-center">
        <h1 className="mt-6 text-3xl font-extrabold text-white">Verify your email</h1>
        <p className="mt-2 text-sm text-gray-300">Enter the 6-digit code we sent and you are in.</p>
      </div>

      <div className="mt-8 sm:mx-auto sm:w-full sm:max-w-md">
        <div className="bg-gray-800 py-8 px-4 shadow sm:rounded-lg sm:px-10 border border-gray-700 space-y-6">
          <form className="space-y-5" onSubmit={handleVerify}>
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-gray-300">Email address</label>
              <input
                id="email"
                name="email"
                type="email"
                autoComplete="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="appearance-none block w-full px-3 py-2 border border-gray-600 rounded-md shadow-sm placeholder-gray-400 bg-gray-700 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm"
                placeholder="you@example.com"
              />
            </div>

            <div className="space-y-1">
              <label htmlFor="code" className="block text-sm font-medium text-gray-300">6-digit code</label>
              <input
                id="code"
                name="code"
                inputMode="numeric"
                pattern="[0-9]*"
                maxLength={6}
                required
                value={code}
                onChange={(e) => setCode(e.target.value.replace(/[^0-9]/g, ''))}
                className="appearance-none tracking-widest text-center text-lg block w-full px-3 py-3 border border-gray-600 rounded-md shadow-sm placeholder-gray-500 bg-gray-700 text-white focus:outline-none focus:ring-indigo-500 focus:border-indigo-500"
                placeholder="123456"
              />
              <p className="text-xs text-gray-400">Codes expire after 15 minutes.</p>
            </div>

            {message && (
              <div className={`p-4 rounded-md ${isError ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'}`}>
                <p className="text-sm">{message}</p>
              </div>
            )}

            <button
              type="submit"
              disabled={isVerifying}
              className="w-full flex justify-center py-2.5 px-4 border border-transparent text-sm font-medium rounded-md text-white bg-indigo-600 hover:bg-indigo-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isVerifying ? 'Verifying...' : 'Verify and continue'}
            </button>
          </form>

          <div className="border-t border-gray-700 pt-4">
            <p className="text-sm text-gray-300 mb-3">Need a new code?</p>
            <form className="space-y-3" onSubmit={handleResendVerification}>
              <button
                type="submit"
                disabled={isResending}
                className="w-full flex justify-center py-2 px-4 border border-gray-600 text-sm font-medium rounded-md text-indigo-100 bg-gray-700 hover:bg-gray-650 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isResending ? 'Sending code...' : 'Resend verification code'}
              </button>
            </form>
          </div>

          <div className="text-center">
            <button
              onClick={() => router.push('/login')}
              className="text-indigo-400 hover:text-indigo-300 text-sm font-medium"
            >
              Back to login
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-900 flex items-center justify-center text-gray-200">
        Loading verification...
      </div>
    }>
      <VerifyEmailInner />
    </Suspense>
  );
}
