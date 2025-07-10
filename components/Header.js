'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [user, setUser] = useState(null);

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Mock user check - replace with actual auth logic
  useEffect(() => {
    // Check if user is logged in
    const token = localStorage.getItem('authToken');
    if (token) {
      setUser({ name: 'John Doe', email: 'john@example.com' });
    }
  }, []);

  const handleLogout = () => {
    localStorage.removeItem('authToken');
    setUser(null);
    window.location.href = '/';
  };

  return (
    <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-200 ${
      isScrolled 
        ? 'bg-gray-900/95 backdrop-blur-sm border-b border-gray-700/50' 
        : 'bg-gray-900/80'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-2">
            <div className="w-8 h-8 bg-blue-600 rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">J</span>
            </div>
            <span className="text-white font-bold text-xl hidden sm:block">JobBoard</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link 
              href="/" 
              className="px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-md transition-colors"
            >
              Jobs
            </Link>
            <Link 
              href="/about" 
              className="px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-md transition-colors"
            >
              About
            </Link>
            <Link 
              href="/pricing" 
              className="px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-md transition-colors"
            >
              Pricing
            </Link>
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {user ? (
              // Logged in user menu
              <div className="flex items-center space-x-3">
                <Link 
                  href="/dashboard" 
                  className="hidden sm:block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-md transition-colors text-sm"
                >
                  Dashboard
                </Link>
                <Link 
                  href="/my-applications" 
                  className="hidden sm:block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-md transition-colors text-sm"
                >
                  Applications
                </Link>
                <div className="relative group">
                  <button className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-md transition-colors">
                    <div className="w-7 h-7 bg-blue-600 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-medium">
                        {user.name.split(' ').map(n => n[0]).join('')}
                      </span>
                    </div>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Dropdown Menu */}
                  <div className="absolute right-0 mt-2 w-48 bg-gray-800 border border-gray-700 rounded-md shadow-lg opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-200">
                    <div className="px-4 py-3 border-b border-gray-700">
                      <p className="text-white text-sm font-medium">{user.name}</p>
                      <p className="text-gray-400 text-xs">{user.email}</p>
                    </div>
                    <div className="py-1">
                      <Link 
                        href="/profile" 
                        className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors"
                      >
                        Profile
                      </Link>
                      <Link 
                        href="/dashboard" 
                        className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors sm:hidden"
                      >
                        Dashboard
                      </Link>
                      <Link 
                        href="/my-applications" 
                        className="block px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-white transition-colors sm:hidden"
                      >
                        Applications
                      </Link>
                      <button 
                        onClick={handleLogout}
                        className="block w-full text-left px-4 py-2 text-red-400 hover:bg-gray-700 hover:text-red-300 transition-colors"
                      >
                        Sign Out
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ) : (
              // Guest user actions
              <div className="flex items-center space-x-2">
                <Link 
                  href="/login" 
                  className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-md transition-colors text-sm"
                >
                  Sign In
                </Link>
                <Link 
                  href="/register" 
                  className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-md transition-colors text-sm font-medium"
                >
                  Sign Up
                </Link>
              </div>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-md transition-colors"
            >
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                {isMobileMenuOpen ? (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                ) : (
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
                )}
              </svg>
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && (
          <div className="md:hidden border-t border-gray-700/50 bg-gray-900/95 backdrop-blur-sm">
            <div className="px-2 pt-2 pb-3 space-y-1">
              <Link 
                href="/" 
                className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Jobs
              </Link>
              <Link 
                href="/about" 
                className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                About
              </Link>
              <Link 
                href="/pricing" 
                className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-md transition-colors"
                onClick={() => setIsMobileMenuOpen(false)}
              >
                Pricing
              </Link>
              {user && (
                <>
                  <div className="border-t border-gray-700/50 my-2"></div>
                  <Link 
                    href="/dashboard" 
                    className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Dashboard
                  </Link>
                  <Link 
                    href="/profile" 
                    className="block px-3 py-2 text-gray-300 hover:text-white hover:bg-gray-800/50 rounded-md transition-colors"
                    onClick={() => setIsMobileMenuOpen(false)}
                  >
                    Profile
                  </Link>
                </>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
