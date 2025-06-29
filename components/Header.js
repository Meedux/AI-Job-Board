'use client';

import { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';
import { colors, typography, components, layout, animations } from '../utils/designSystem';
import JobPostModal from './JobPostModal';

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isPostJobModalOpen, setIsPostJobModalOpen] = useState(false);
  const [isResourcesOpen, setIsResourcesOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  
  const { user, logout, loading } = useAuth();
  const primaryNavItems = [
    { label: 'ResumeSync', href: '/resume-analyzer' },
  ];

  const resourcesItems = [
    { label: 'Payment Method', href: '/payment-method' },
    { label: 'Pricing', href: '/pricing' },
    { label: 'Feedback', href: '/feedback' },
  ];
  const userNavItems = user ? [
    { label: 'Dashboard', href: '/dashboard' },
    { label: 'ResumeSync', href: '/resume-analyzer' },
  ] : primaryNavItems;
  return (
    <>
      <header className={`fixed top-0 left-0 right-0 z-40 lg:static ${colors.neutral.backgroundSecondary} ${colors.neutral.borderLight} border-b backdrop-blur-sm bg-opacity-95`}>
        <div className={layout.container}>
          <div className="flex justify-between items-center py-3 sm:py-4">
            {/* Logo - Mobile Optimized */}
            <Link href="/" className="flex items-center space-x-2 sm:space-x-3">
              <div className="w-6 h-6 sm:w-8 sm:h-8 relative">
                <Image
                  src="https://i.imgur.com/DNx92fD.png"
                  alt="GetGetHired"
                  width={32}
                  height={32}
                  className="rounded"
                />
              </div>
              <h1 className={`${typography.h6} sm:${typography.h5} ${colors.neutral.textPrimary}`}>
                GetGetHired
              </h1>
            </Link>

            {/* Mobile Menu Button */}
            <div className="lg:hidden flex items-center space-x-2">
              <button
                onClick={() => setIsPostJobModalOpen(true)}
                className={`${components.button.base} ${components.button.primary} ${components.button.sizes.small} flex items-center space-x-1`}
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span className="hidden sm:inline">Post</span>
              </button>
              
              <button
                onClick={() => setIsMenuOpen(!isMenuOpen)}
                className={`p-2 ${colors.neutral.textSecondary} hover:${colors.neutral.textPrimary} transition-colors touch-manipulation`}
                aria-label="Toggle menu"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  {isMenuOpen ? (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  ) : (
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                  )}
                </svg>
              </button>
            </div>            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-6">
              {userNavItems.map((item) => (
                <Link
                  key={item.label}
                  href={item.href}
                  className={`${components.nav.link} ${typography.bodyBase}`}
                >
                  {item.label}
                </Link>
              ))}
              
              {/* Resources Dropdown */}
              <div className="relative">
                <button
                  onClick={() => setIsResourcesOpen(!isResourcesOpen)}
                  onBlur={(e) => {
                    // Close dropdown when clicking outside
                    if (!e.currentTarget.contains(e.relatedTarget)) {
                      setTimeout(() => setIsResourcesOpen(false), 150);
                    }
                  }}
                  className={`${components.nav.link} ${typography.bodyBase} flex items-center space-x-1`}
                >
                  <span>Resources</span>
                  <svg 
                    className={`w-4 h-4 transition-transform duration-200 ${isResourcesOpen ? 'rotate-180' : ''}`} 
                    fill="none" 
                    stroke="currentColor" 
                    viewBox="0 0 24 24"
                  >
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                  </svg>
                </button>
                
                {/* Dropdown Menu */}
                {isResourcesOpen && (
                  <div 
                    className={`absolute top-full right-0 mt-2 w-48 ${colors.neutral.surface} ${colors.neutral.border} rounded-lg shadow-lg py-2 z-50`}
                    onMouseEnter={() => setIsResourcesOpen(true)}
                    onMouseLeave={() => setIsResourcesOpen(false)}
                  >                    {resourcesItems.map((item) => (
                      <Link
                        key={item.label}
                        href={item.href}
                        className={`block px-4 py-2 ${typography.bodyBase} ${colors.neutral.textSecondary} hover:${colors.neutral.surfaceHover} hover:${colors.neutral.textPrimary} transition-colors duration-200`}
                        onClick={() => setIsResourcesOpen(false)}
                      >
                        {item.label}
                      </Link>
                    ))}
                  </div>
                )}
              </div>              <button
                onClick={() => setIsPostJobModalOpen(true)}
                className={`${components.button.base} ${components.button.primary} ${components.button.sizes.medium} flex items-center space-x-2`}
              >
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                <span>Post a job</span>
              </button>

              {/* Authentication Section */}
              {loading ? (
                <div className="w-8 h-8 animate-pulse bg-gray-200 rounded-full"></div>
              ) : user ? (
                // User Menu Dropdown
                <div className="relative">
                  <button
                    onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                    onBlur={(e) => {
                      if (!e.currentTarget.contains(e.relatedTarget)) {
                        setTimeout(() => setIsUserMenuOpen(false), 150);
                      }
                    }}
                    className={`flex items-center space-x-2 ${components.nav.link} ${typography.bodyBase}`}
                  >
                    <div className={`w-8 h-8 ${colors.primary[500]} rounded-full flex items-center justify-center text-white font-semibold`}>
                      {user.nickname ? user.nickname.charAt(0).toUpperCase() : user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <span className="hidden md:block">{user.nickname || user.fullName}</span>
                    <svg 
                      className={`w-4 h-4 transition-transform duration-200 ${isUserMenuOpen ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* User Dropdown Menu */}
                  {isUserMenuOpen && (
                    <div 
                      className={`absolute top-full right-0 mt-2 w-56 ${colors.neutral.surface} ${colors.neutral.border} rounded-lg shadow-lg py-2 z-50`}
                      onMouseEnter={() => setIsUserMenuOpen(true)}
                      onMouseLeave={() => setIsUserMenuOpen(false)}
                    >
                      <div className="px-4 py-2 border-b border-gray-200">
                        <div className={`${typography.bodyBase} font-medium ${colors.neutral.textPrimary}`}>
                          {user.fullName}
                        </div>
                        <div className={`${typography.bodySmall} ${colors.neutral.textSecondary}`}>
                          {user.email}
                        </div>
                      </div>
                      <Link
                        href="/profile"
                        className={`block px-4 py-2 ${typography.bodyBase} ${colors.neutral.textSecondary} hover:${colors.neutral.surfaceHover} hover:${colors.neutral.textPrimary} transition-colors duration-200`}
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        Profile Settings
                      </Link>
                      <Link
                        href="/my-applications"
                        className={`block px-4 py-2 ${typography.bodyBase} ${colors.neutral.textSecondary} hover:${colors.neutral.surfaceHover} hover:${colors.neutral.textPrimary} transition-colors duration-200`}
                        onClick={() => setIsUserMenuOpen(false)}
                      >
                        My Applications
                      </Link>
                      <button
                        onClick={() => {
                          logout();
                          setIsUserMenuOpen(false);
                        }}
                        className={`w-full text-left px-4 py-2 ${typography.bodyBase} ${colors.neutral.textSecondary} hover:${colors.neutral.surfaceHover} hover:${colors.neutral.textPrimary} transition-colors duration-200`}
                      >
                        Sign Out
                      </button>
                    </div>
                  )}
                </div>
              ) : (
                // Login/Register Links
                <div className="flex items-center space-x-4">
                  <Link
                    href="/login"
                    className={`${components.nav.link} ${typography.bodyBase}`}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className={`${components.button.base} ${components.button.primary} ${components.button.sizes.medium}`}
                  >
                    Sign Up
                  </Link>
                </div>
              )}
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
        </div>        {/* Mobile Navigation - Enhanced */}
        {isMenuOpen && (
          <div className={`lg:hidden ${colors.neutral.surface} ${colors.neutral.borderLight} border-t backdrop-blur-sm bg-opacity-95 max-h-screen overflow-y-auto`}>
            <div className="px-4 py-4 space-y-4">
              {user && (
                <div className="pb-4 border-b border-gray-700">
                  <div className={`flex items-center space-x-3 mb-4`}>
                    <div className={`w-10 h-10 ${colors.primary[500]} rounded-full flex items-center justify-center text-white font-semibold`}>
                      {user.nickname ? user.nickname.charAt(0).toUpperCase() : user.fullName.charAt(0).toUpperCase()}
                    </div>
                    <div>
                      <div className={`${typography.bodyBase} font-medium ${colors.neutral.textPrimary}`}>
                        {user.fullName}
                      </div>
                      <div className={`${typography.bodySmall} ${colors.neutral.textSecondary}`}>
                        {user.email}
                      </div>
                    </div>
                  </div>
                  <div className="space-y-1">
                    <Link
                      href="/profile"
                      className={`block py-3 px-2 ${typography.bodyBase} ${colors.neutral.textSecondary} hover:${colors.neutral.textPrimary} hover:bg-gray-700 rounded-lg transition-all duration-200 touch-manipulation`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      Profile Settings
                    </Link>
                    <Link
                      href="/my-applications"
                      className={`block py-3 px-2 ${typography.bodyBase} ${colors.neutral.textSecondary} hover:${colors.neutral.textPrimary} hover:bg-gray-700 rounded-lg transition-all duration-200 touch-manipulation`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      My Applications
                    </Link>
                  </div>
                </div>
              )}

              {/* Main Navigation */}
              <div className="space-y-1">
                {userNavItems.map((item) => (
                  <Link
                    key={item.label}
                    href={item.href}
                    className={`block py-3 px-2 ${typography.bodyBase} ${colors.neutral.textSecondary} hover:${colors.neutral.textPrimary} hover:bg-gray-700 rounded-lg transition-all duration-200 touch-manipulation`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                ))}
              </div>
              
              {/* Resources Section in Mobile */}
              <div className="pt-2">
                <div className={`text-xs font-semibold ${colors.neutral.textMuted} uppercase tracking-wider mb-3 px-2`}>
                  Resources
                </div>
                <div className="space-y-1">
                  {resourcesItems.map((item) => (
                    <Link
                      key={item.label}
                      href={item.href}
                      className={`block py-3 px-2 ${typography.bodyBase} ${colors.neutral.textSecondary} hover:${colors.neutral.textPrimary} hover:bg-gray-700 rounded-lg transition-all duration-200 touch-manipulation`}
                      onClick={() => setIsMenuOpen(false)}
                    >
                      {item.label}
                    </Link>
                  ))}
                </div>
              </div>

              {/* Mobile Authentication */}
              {!user && (
                <div className="pt-4 border-t border-gray-700 space-y-3">
                  <Link
                    href="/login"
                    className={`block w-full text-center py-3 ${components.button.base} ${components.button.secondary} ${components.button.sizes.medium} touch-manipulation`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign In
                  </Link>
                  <Link
                    href="/register"
                    className={`block w-full text-center py-3 ${components.button.base} ${components.button.primary} ${components.button.sizes.medium} touch-manipulation`}
                    onClick={() => setIsMenuOpen(false)}
                  >
                    Sign Up
                  </Link>
                </div>
              )}

              {/* Sign Out for Mobile */}
              {user && (
                <div className="pt-4 border-t border-gray-700">
                  <button
                    onClick={() => {
                      logout();
                      setIsMenuOpen(false);
                    }}
                    className={`w-full text-left py-3 px-2 ${typography.bodyBase} text-red-400 hover:text-red-300 hover:bg-red-900/20 rounded-lg transition-all duration-200 touch-manipulation`}
                  >
                    Sign Out
                  </button>
                </div>
              )}
            </div>
          </div>
        )}
      </header>

      {/* Job Post Modal */}
      <JobPostModal 
        isOpen={isPostJobModalOpen} 
        onClose={() => setIsPostJobModalOpen(false)} 
      />
    </>
  );
};

export default Header;
