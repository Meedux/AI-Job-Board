'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { colors, typography, components, layout, animations } from '../utils/designSystem';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);

  const navItems = [
    { label: 'Payment Method', href: '/payment-method' },
    { label: 'ResumeSync', href: '/resume-analyzer' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Feedback', href: '/feedback' },
  ];
  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-40 lg:static ${colors.neutral.backgroundSecondary} ${colors.neutral.borderLight} border-b backdrop-blur-sm bg-opacity-95`}>
        <div className={layout.container}>
          <div className="flex justify-between items-center py-4">
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3">
              <div className="w-8 h-8 relative">
                <Image
                  src="https://i.imgur.com/DNx92fD.png"
                  alt="GetGetHired"
                  width={32}
                  height={32}
                  className="rounded"
                />
              </div>
              <h1 className={`${typography.h5} ${colors.neutral.textPrimary}`}>
                GetGetHired
              </h1>
            </Link>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`${components.nav.link} ${typography.bodyBase}`}
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={() => setIsPostJobModalOpen(true)}
                className={`${components.button.base} ${components.button.primary} ${components.button.sizes.medium} flex items-center space-x-2`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Post a job</span>
              </button>
            </nav>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className={`lg:hidden ${components.button.base} ${components.button.secondary} ${components.button.sizes.medium}`}
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>        {/* Mobile Navigation */}
        {isMenuOpen && (
          <div className={`lg:hidden ${colors.neutral.surface} ${colors.neutral.borderLight} border-t backdrop-blur-sm bg-opacity-95`}>
            <div className="px-4 py-4 space-y-3">
              {navItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`block ${components.nav.link} ${typography.bodyBase}`}
                  onClick={() => setIsMenuOpen(false)}
                >
                  {item.label}
                </Link>
              ))}
              <button
                onClick={() => {
                  setIsPostJobModalOpen(true);
                  setIsMenuOpen(false);
                }}
                className={`w-full ${components.button.base} ${components.button.primary} ${components.button.sizes.medium} flex items-center justify-center space-x-2 mt-4`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Post a job</span>
              </button>
            </div>
          </div>
        )}
      </header>

      {/* Post Job Modal */}
      {isPostJobModalOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
          <div className={`${colors.neutral.surface} rounded-lg max-w-xl w-full max-h-[90vh] overflow-y-auto shadow-2xl`}>
            <div className={`flex justify-between items-center ${colors.neutral.borderLight} border-b p-6`}>
              <h2 className={`${typography.h3} ${colors.neutral.textPrimary}`}>Post a job</h2>
              <button
                onClick={() => setIsPostJobModalOpen(false)}
                className={`${components.button.base} ${components.button.ghost} ${components.button.sizes.small} rounded-full`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <p className={`${colors.neutral.textTertiary} ${typography.bodyBase} mb-6`}>
                Hire the best. Share your job post with thousands of job seekers.
              </p>              <form className="space-y-6">
                <div>
                  <label className={`block ${typography.bodyBase} font-medium ${colors.neutral.textPrimary} mb-2`}>Company Name</label>
                  <input
                    type="text"
                    placeholder="Amazon"
                    className={`w-full rounded-lg ${colors.neutral.border} ${colors.neutral.surface} px-4 py-3 ${typography.bodyBase} placeholder:${colors.neutral.textMuted} hover:${colors.neutral.borderHover} focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200`}
                    required
                  />
                </div>
                <div>
                  <label className={`block ${typography.bodyBase} font-medium ${colors.neutral.textPrimary} mb-2`}>Website</label>
                  <input
                    type="url"
                    placeholder="https://amazon.com"
                    className={`w-full rounded-lg ${colors.neutral.border} ${colors.neutral.surface} px-4 py-3 ${typography.bodyBase} placeholder:${colors.neutral.textMuted} hover:${colors.neutral.borderHover} focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200`}
                    required
                  />
                </div>
                <div>
                  <label className={`block ${typography.bodyBase} font-medium ${colors.neutral.textPrimary} mb-2`}>Job Title</label>
                  <input
                    type="text"
                    placeholder="Software Engineer"
                    className={`w-full rounded-lg ${colors.neutral.border} ${colors.neutral.surface} px-4 py-3 ${typography.bodyBase} placeholder:${colors.neutral.textMuted} hover:${colors.neutral.borderHover} focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200`}
                    required
                  />
                </div>
                <div>
                  <label className={`block ${typography.bodyBase} font-medium ${colors.neutral.textPrimary} mb-2`}>Job Description</label>
                  <textarea
                    rows="4"
                    placeholder="Describe the role, requirements, and responsibilities..."
                    className={`w-full rounded-lg ${colors.neutral.border} ${colors.neutral.surface} px-4 py-3 ${typography.bodyBase} placeholder:${colors.neutral.textMuted} hover:${colors.neutral.borderHover} focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200 resize-vertical`}
                    required
                  ></textarea>
                </div>
                <div>
                  <label className={`block ${typography.bodyBase} font-medium ${colors.neutral.textPrimary} mb-2`}>
                    Email <span className={`${colors.neutral.textMuted} ${typography.bodySmall} font-normal`}>(We will contact you via this email)</span>
                  </label>
                  <input
                    type="email"
                    placeholder="jobs@amazon.com"
                    className={`w-full rounded-lg ${colors.neutral.border} ${colors.neutral.surface} px-4 py-3 ${typography.bodyBase} placeholder:${colors.neutral.textMuted} hover:${colors.neutral.borderHover} focus:border-blue-500 focus:outline-none focus:ring-2 focus:ring-blue-500/20 transition-all duration-200`}
                    required
                  />
                </div>
                <button
                  type="submit"
                  className={`w-full ${components.button.base} ${components.button.primary} ${components.button.sizes.medium} flex items-center justify-center space-x-2`}
                >
                  <span>Submit</span>
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                  </svg>
                </button>
              </form>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Header;
