'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { useAuth } from '../contexts/AuthContext';

const Header = () => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const { user, logout, loading } = useAuth();

  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 0);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.mobile-menu')) {
        setIsMobileMenuOpen(false);
      }
      if (isUserMenuOpen && !event.target.closest('.user-menu')) {
        setIsUserMenuOpen(false);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen, isUserMenuOpen]);

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
      setIsMobileMenuOpen(false);
    } catch (error) {
      console.error('Logout failed:', error);
    }
  };

  const closeMobileMenu = () => {
    setIsMobileMenuOpen(false);
  };

  const getUserInitials = (fullName) => {
    if (!fullName) return 'U';
    return fullName.split(' ').map(n => n[0]).join('').toUpperCase();
  };

  const navLinks = [
    { href: '/', label: 'Jobs' },
    { href: '/about', label: 'About' },
    { href: '/pricing', label: 'Pricing' },
  ];

  const userNavLinks = [
    { href: '/dashboard', label: 'Dashboard' },
    { href: '/my-applications', label: 'My Applications' },
    { href: '/profile', label: 'Profile' },
  ];

  return (
    <header className={`z-50 transition-all duration-300 ${
      isScrolled 
        ? 'bg-gray-900/95 backdrop-blur-md border-b border-gray-700 shadow-lg' 
        : 'bg-gray-900/90 backdrop-blur-sm'
    }`}>
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          
          {/* Logo */}
          <Link href="/" className="flex items-center space-x-3 flex-shrink-0">
            <div className="w-13 h-13 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
              <span className="text-white font-bold text-lg">GGH</span>
            </div>
            <div className="hidden sm:block">
              <span className="text-white font-bold text-xl">GetGetHired</span>
              <span className="text-gray-300 text-sm block -mt-1">Find Your Dream Job</span>
            </div>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1">
            {navLinks.map((link) => (
              <Link 
                key={link.href}
                href={link.href} 
                className="px-4 py-2 text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded-lg transition-all duration-200 font-medium"
              >
                {link.label}
              </Link>
            ))}
          </nav>

          {/* User Actions */}
          <div className="flex items-center space-x-3">
            {!loading && (
              <>
                {user ? (
                  // Logged in user menu
                  <div className="flex items-center space-x-3">
                    {/* Desktop User Navigation */}
                    <nav className="hidden lg:flex items-center space-x-1">
                      {userNavLinks.map((link) => (
                        <Link 
                          key={link.href}
                          href={link.href} 
                          className="px-3 py-2 text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded-lg transition-all duration-200 text-sm font-medium"
                        >
                          {link.label}
                        </Link>
                      ))}
                    </nav>

                    {/* User Menu Dropdown */}
                    <div className="relative user-menu">
                      <button 
                        onClick={() => setIsUserMenuOpen(!isUserMenuOpen)}
                        className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:bg-gray-800 rounded-lg transition-all duration-200 border border-gray-700"
                      >
                        <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-semibold">
                            {getUserInitials(user.fullName)}
                          </span>
                        </div>
                        <span className="hidden sm:block text-sm font-medium truncate max-w-24">
                          {user.fullName || 'User'}
                        </span>
                        <svg className="w-4 h-4 transition-transform duration-200" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                        </svg>
                      </button>
                      
                      {/* User Dropdown Menu */}
                      {isUserMenuOpen && (
                        <div className="absolute right-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-lg">
                          <div className="px-4 py-3 border-b border-gray-700">
                            <p className="text-white text-sm font-semibold truncate">{user.fullName || 'User'}</p>
                            <p className="text-gray-400 text-xs truncate">{user.email}</p>
                            {user.role && (
                              <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-900 text-blue-300 mt-1">
                                {user.role}
                              </span>
                            )}
                          </div>
                          <div className="py-2">
                            {/* Mobile User Navigation */}
                            <div className="lg:hidden">
                              {userNavLinks.map((link) => (
                                <Link 
                                  key={link.href}
                                  href={link.href} 
                                  className="block px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors text-sm"
                                  onClick={() => setIsUserMenuOpen(false)}
                                >
                                  {link.label}
                                </Link>
                              ))}
                              <div className="border-t border-gray-700 my-2"></div>
                            </div>
                            
                            <Link 
                              href="/profile" 
                              className="block px-4 py-2 text-gray-300 hover:bg-gray-700 transition-colors text-sm"
                              onClick={() => setIsUserMenuOpen(false)}
                            >
                              <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z" />
                                </svg>
                                <span>Profile Settings</span>
                              </div>
                            </Link>
                            
                            <button 
                              onClick={handleLogout}
                              className="block w-full text-left px-4 py-2 text-red-400 hover:bg-red-950 transition-colors text-sm"
                            >
                              <div className="flex items-center space-x-2">
                                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
                                </svg>
                                <span>Sign Out</span>
                              </div>
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                ) : (
                  // Guest user actions
                  <div className="flex items-center space-x-3">
                    <Link 
                      href="/login" 
                      className="px-4 py-2 text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded-lg transition-all duration-200 text-sm font-medium"
                    >
                      Sign In
                    </Link>
                    <Link 
                      href="/register" 
                      className="px-4 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 text-sm font-medium shadow-lg hover:shadow-xl"
                    >
                      Get Started
                    </Link>
                  </div>
                )}
              </>
            )}

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              className="md:hidden p-2 text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded-lg transition-all duration-200 mobile-menu"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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
          <div className="md:hidden border-t border-gray-700 bg-gray-900/95 backdrop-blur-md mobile-menu">
            <div className="px-2 pt-3 pb-4 space-y-1">
              {navLinks.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className="block px-3 py-2 text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded-lg transition-all duration-200 font-medium"
                  onClick={closeMobileMenu}
                >
                  {link.label}
                </Link>
              ))}
              
              {user && (
                <>
                  <div className="border-t border-gray-700 my-3"></div>
                  <div className="px-3 py-2">
                    <div className="flex items-center space-x-3 mb-3">
                      <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center">
                        <span className="text-white text-sm font-semibold">
                          {getUserInitials(user.fullName)}
                        </span>
                      </div>
                      <div>
                        <p className="text-white text-sm font-semibold">{user.fullName || 'User'}</p>
                        <p className="text-gray-400 text-xs">{user.email}</p>
                      </div>
                    </div>
                  </div>
                  
                  {userNavLinks.map((link) => (
                    <Link 
                      key={link.href}
                      href={link.href} 
                      className="block px-3 py-2 text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded-lg transition-all duration-200 font-medium"
                      onClick={closeMobileMenu}
                    >
                      {link.label}
                    </Link>
                  ))}
                  
                  <button 
                    onClick={handleLogout}
                    className="block w-full text-left px-3 py-2 text-red-400 hover:bg-red-950 rounded-lg transition-all duration-200 font-medium"
                  >
                    Sign Out
                  </button>
                </>
              )}
              
              {!user && !loading && (
                <div className="border-t border-gray-700 my-3 pt-3 space-y-2">
                  <Link 
                    href="/login" 
                    className="block px-3 py-2 text-center text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded-lg transition-all duration-200 font-medium border border-gray-700"
                    onClick={closeMobileMenu}
                  >
                    Sign In
                  </Link>
                  <Link 
                    href="/register" 
                    className="block px-3 py-2 text-center bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white rounded-lg transition-all duration-200 font-medium shadow-lg"
                    onClick={closeMobileMenu}
                  >
                    Get Started
                  </Link>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
    </header>
  );
};

export default Header;
