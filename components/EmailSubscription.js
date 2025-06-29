'use client';

import { useState } from 'react';
import { colors, typography, components, spacing, gradients } from '../utils/designSystem';

const EmailSubscription = () => {
  const [email, setEmail] = useState('');
  const [isSubmitted, setIsSubmitted] = useState(false);

  const handleSubmit = (e) => {
    e.preventDefault();
    // Handle email subscription logic here
    console.log('Subscribing email:', email);
    setIsSubmitted(true);
    setTimeout(() => setIsSubmitted(false), 3000);
    setEmail('');
  };

  return (
    <div className={`${components.card.base} ${components.card.padding}`}>
      <div className="text-center mb-6">
        <div className={`inline-flex items-center justify-center w-16 h-16 ${colors.primary.background} rounded-lg mb-4`}>
          <svg className={`w-8 h-8 ${colors.primary.text}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
          </svg>
        </div>
        <h3 className={`${typography.h4} ${colors.neutral.textPrimary} mb-2`}>
          New remote jobs in your inbox, every Monday!
        </h3>
        <p className={`${typography.bodyBase} ${colors.neutral.textTertiary}`}>
          Subscribe to get your 5-minute brief on tech remote jobs every Monday
        </p>
      </div>

      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <input
            type="email"
            placeholder="Enter your email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className={components.input.base}
            required
          />
        </div>
        <button
          type="submit"
          disabled={isSubmitted}
          className={`w-full ${components.button.base} ${isSubmitted ? `${colors.success.background} text-white` : `${components.button.primary}`} ${components.button.sizes.medium}`}
        >
          {isSubmitted ? (
            <span className="flex items-center justify-center space-x-2">
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
              </svg>
              <span>Subscribed!</span>
            </span>
          ) : (
            'Subscribe'
          )}
        </button>
      </form>

      <div className={`mt-4 ${typography.bodyXSmall} ${colors.neutral.textMuted} text-center`}>
        We respect your privacy. Unsubscribe at any time.
      </div>
    </div>
  );
};

export default EmailSubscription;
