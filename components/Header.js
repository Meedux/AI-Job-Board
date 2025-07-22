'use client';

import { useState, useEffect, useRef } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useAuth } from '../contexts/AuthContext';

const Header = ({ onSearch, onFilter }) => {
  const [isScrolled, setIsScrolled] = useState(false);
  const [isScrollingUp, setIsScrollingUp] = useState(false);
  const [showHero, setShowHero] = useState(true);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const [isUserMenuOpen, setIsUserMenuOpen] = useState(false);
  const [isFilterModalOpen, setIsFilterModalOpen] = useState(false);
  const [activeDropdown, setActiveDropdown] = useState(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');
  const [filters, setFilters] = useState({
    category: '',
    level: '',
    type: '',
    remote: false
  });
  
  const { user, logout, loading } = useAuth();
  const router = useRouter();
  const lastScrollY = useRef(0);
  const heroRef = useRef(null);

  useEffect(() => {
    const handleScroll = () => {
      const currentScrollY = window.scrollY;
      const scrollingUp = currentScrollY < lastScrollY.current;
      const scrolledPast = currentScrollY > 100;
      
      setIsScrolled(currentScrollY > 0);
      setIsScrollingUp(scrollingUp);
      
      // Show hero when scrolling up or at top
      if (scrollingUp || currentScrollY < 50) {
        setShowHero(true);
      } else if (scrolledPast) {
        setShowHero(false);
      }
      
      lastScrollY.current = currentScrollY;
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu and modals when clicking outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (isMobileMenuOpen && !event.target.closest('.mobile-menu')) {
        setIsMobileMenuOpen(false);
      }
      if (isUserMenuOpen && !event.target.closest('.user-menu')) {
        setIsUserMenuOpen(false);
      }
      if (isFilterModalOpen && !event.target.closest('.filter-modal')) {
        setIsFilterModalOpen(false);
      }
      if (activeDropdown && !event.target.closest('.nav-dropdown')) {
        setActiveDropdown(null);
      }
    };

    document.addEventListener('click', handleClickOutside);
    return () => document.removeEventListener('click', handleClickOutside);
  }, [isMobileMenuOpen, isUserMenuOpen, isFilterModalOpen, activeDropdown]);

  const handleLogout = async () => {
    try {
      await logout();
      setIsUserMenuOpen(false);
      setIsMobileMenuOpen(false);
      // Redirect to landing page after successful logout
      router.push('/');
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

  const getRoleDisplayName = (role) => {
    switch (role) {
      case 'super_admin':
        return 'Super Admin';
      case 'employer_admin':
        return 'Employer Admin';
      case 'sub_user':
        return 'Sub User';
      case 'job_seeker':
        return 'Job Seeker';
      default:
        return role || 'User';
    }
  };

  const getRoleColorClass = (role) => {
    switch (role) {
      case 'super_admin':
        return 'bg-red-900 text-red-300';
      case 'employer_admin':
        return 'bg-purple-900 text-purple-300';
      case 'sub_user':
        return 'bg-yellow-900 text-yellow-300';
      case 'job_seeker':
        return 'bg-blue-900 text-blue-300';
      default:
        return 'bg-gray-900 text-gray-300';
    }
  };

  const handleSearch = (e) => {
    e.preventDefault();
    const searchParams = {
      search: searchTerm.trim(),
      location: location,
      ...filters
    };
    onSearch && onSearch(searchParams);
  };

  const handleFilterChange = (filterType, value) => {
    const newFilters = { ...filters, [filterType]: value };
    setFilters(newFilters);
    
    const searchParams = {
      search: searchTerm.trim(),
      location: location,
      ...newFilters
    };
    onSearch && onSearch(searchParams);
  };

  const clearFilters = () => {
    setSearchTerm('');
    setLocation('');
    setFilters({
      category: '',
      level: '',
      type: '',
      remote: false
    });
    
    const searchParams = {
      search: '',
      location: '',
      category: '',
      level: '',
      type: '',
      remote: false
    };
    onSearch && onSearch(searchParams);
  };

  const locations = [
    { value: '', label: 'All locations' },
    { value: 'San Francisco', label: 'San Francisco' },
    { value: 'London', label: 'London' },
    { value: 'New York', label: 'New York' },
    { value: 'Paris', label: 'Paris' },
    { value: 'Amsterdam', label: 'Amsterdam' },
    { value: 'Mountain View', label: 'Mountain View' },
    { value: 'Tokyo', label: 'Tokyo' },
    { value: 'Toronto', label: 'Toronto' },
    { value: 'Manila', label: 'Manila' }
  ];

  const categories = [
    { value: '', label: 'All categories' },
    { value: 'Design', label: 'Design' },
    { value: 'Engineer', label: 'Engineer' },
    { value: 'Human Resources', label: 'Human Resources' },
    { value: 'Marketing', label: 'Marketing' }
  ];

  const levels = [
    { value: '', label: 'All levels' },
    { value: 'Fresher', label: 'Fresher' },
    { value: 'Junior', label: 'Junior' },
    { value: 'Middle', label: 'Middle' },
    { value: 'Senior', label: 'Senior' },
    { value: 'Entry', label: 'Entry' }
  ];

  const jobTypes = [
    { value: '', label: 'All types' },
    { value: 'Full-time', label: 'Full-time' },
    { value: 'Part-time', label: 'Part-time' },
    { value: 'Contract', label: 'Contract' },
    { value: 'Freelance', label: 'Freelance' }
  ];

  // Enhanced Role-specific navigation with dropdowns
  const getNavigationStructure = () => {
    if (!user) {
      return {
        simple: [
          { href: '/', label: 'Home', icon: '🏠' },
          { href: '/jobs', label: 'Browse Jobs', icon: '💼' },
          { href: '/about', label: 'About', icon: 'ℹ️' },
          { href: '/pricing', label: 'Pricing', icon: '💰' },
        ],
        dropdowns: []
      };
    }

    switch (user.role) {
      case 'super_admin':
        return {
          simple: [
            { href: '/', label: 'Home', icon: '🏠' },
            { href: '/jobs', label: 'Browse Jobs', icon: '💼' }
          ],
          dropdowns: [
            {
              label: 'Super Admin Panel',
              icon: '⚙️',
              items: [
                { href: '/super-admin', label: 'Dashboard', icon: '📊' },
                { href: '/super-admin/users', label: 'User Management', icon: '👥' },
                { href: '/admin/companies', label: 'Companies', icon: '🏢' },
                { href: '/super-admin/pricing', label: 'Pricing Tiers', icon: '💎' },
                { href: '/super-admin/credits', label: 'Credit Packages', icon: '⚡' },
                { href: '/super-admin/analytics', label: 'Analytics', icon: '�' },
                { href: '/super-admin/settings', label: 'System Settings', icon: '🔧' },
              ]
            },
            {
              label: 'More',
              icon: '➕',
              items: [
                { href: '/about', label: 'About', icon: 'ℹ️' },
                { href: '/pricing', label: 'Pricing', icon: '💰' },
              ]
            }
          ]
        };
      
      case 'employer_admin':
        return {
          simple: [
            { href: '/', label: 'Home', icon: '🏠' },
            { href: '/jobs', label: 'Browse Jobs', icon: '💼' }
          ],
          dropdowns: [
            {
              label: 'Employer Hub',
              icon: '🏢',
              items: [
                { href: '/admin', label: 'Dashboard', icon: '📊' },
                { href: '/ats', label: 'ATS Dashboard', icon: '👥' },
                { href: '/admin/post-job', label: 'Post Job', icon: '➕' },
                { href: '/admin/jobs', label: 'Manage Jobs', icon: '📋' },
                { href: '/admin/companies', label: 'Companies', icon: '🏢' },
                { href: '/admin/applications', label: 'Applications', icon: '📄' },
                { href: '/admin/candidates', label: 'Candidates', icon: '👤' },
              ]
            },
            {
              label: 'Resources',
              icon: '📚',
              items: [
                { href: '/admin/credits', label: 'Credits', icon: '💳' },
                { href: '/admin/billing', label: 'Billing', icon: '💰' },
                { href: '/admin/analytics', label: 'Analytics', icon: '📈' },
                { href: '/pricing', label: 'Pricing', icon: '💰' },
              ]
            }
          ]
        };
      
      case 'sub_user':
        return {
          simple: [
            { href: '/', label: 'Home', icon: '🏠' },
            { href: '/jobs', label: 'Browse Jobs', icon: '💼' }
          ],
          dropdowns: [
            {
              label: 'Workspace',
              icon: '👤',
              items: [
                { href: '/admin', label: 'Dashboard', icon: '📊' },
                { href: '/admin/assigned-tasks', label: 'Assigned Tasks', icon: '✅' },
                { href: '/admin/reports', label: 'My Reports', icon: '📄' },
              ]
            },
            {
              label: 'More',
              icon: '➕',
              items: [
                { href: '/about', label: 'About', icon: 'ℹ️' },
              ]
            }
          ]
        };
      
      default: // job_seeker
        return {
          simple: [
            { href: '/', label: 'Home', icon: '🏠' },
            { href: '/jobs', label: 'Browse Jobs', icon: '💼' }
          ],
          dropdowns: [
            {
              label: 'Tools',
              icon: '🛠️',
              items: [
                { href: '/resume-analyzer', label: 'Resume Analyzer', icon: '📄' },
                { href: '/my-applications', label: 'My Applications', icon: '📋' },
                { href: '/job-alerts', label: 'Job Alerts', icon: '🔔' },
              ]
            },
            {
              label: 'More',
              icon: '➕',
              items: [
                { href: '/about', label: 'About', icon: 'ℹ️' },
                { href: '/pricing', label: 'Pricing', icon: '💰' },
              ]
            }
          ]
        };
    }
  };

  const getUserNavigationItems = () => {
    if (!user) return [];

    const baseUserLinks = [];
    
    switch (user.role) {
      case 'super_admin':
        return [
          ...baseUserLinks,
          // { href: '/admin', label: 'Admin Panel', icon: '⚙️' },
          // { href: '/profile', label: 'Profile', icon: '👤' },
        ];
      
      case 'employer_admin':
        return [
          ...baseUserLinks,
          { href: '/profile', label: 'Profile', icon: '👤' },
        ];
      
      case 'sub_user':
        return [
          ...baseUserLinks,
          { href: '/admin', label: 'Workspace', icon: '👤' },
          { href: '/profile', label: 'Profile', icon: '👤' },
        ];
      
      default: // job_seeker
        return [
          ...baseUserLinks,
          // { href: '/my-applications', label: 'My Applications', icon: '📋' },
          // { href: '/resume-analyzer', label: 'Resume Analyzer', icon: '📄' },
          // { href: '/profile', label: 'Profile', icon: '👤' },
          { href: '/dashboard', label: 'Dashboard', icon: '📊' }
        ];
    }
  };

  const navigation = getNavigationStructure();
  const userNavLinks = getUserNavigationItems();

  return (
    <div className="relative">
      {/* Sticky Navigation Bar */}
      <header className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
        isScrolled 
          ? 'bg-gray-900/95 backdrop-blur-md border-b border-gray-700 shadow-lg' 
          : 'bg-gray-900/90 backdrop-blur-sm'
      }`}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            
            {/* Logo */}
            <Link href="/" className="flex items-center space-x-3 flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center shadow-lg">
                <span className="text-white font-bold text-sm">GGH</span>
              </div>
              <div className="hidden sm:block">
                <span className="text-white font-bold text-xl">GetGetHired</span>
              </div>
            </Link>

            {/* Sticky Search Bar */}
            <div className="flex-1 max-w-2xl mx-8 hidden md:block">
              <form onSubmit={handleSearch} className="relative">
                <div className="flex items-center bg-gray-800/50 border border-gray-600 rounded-lg overflow-hidden">
                  <div className="relative flex-1">
                    <input
                      type="text"
                      value={searchTerm}
                      onChange={(e) => setSearchTerm(e.target.value)}
                      placeholder="Search jobs, companies, skills..."
                      className="w-full px-4 py-2 bg-transparent text-white placeholder-gray-400 text-sm focus:outline-none"
                    />
                  </div>
                  
                  {/* Filter Modal Trigger */}
                  <button
                    type="button"
                    onClick={() => setIsFilterModalOpen(true)}
                    className="px-3 py-2 border-l border-gray-600 text-gray-400 hover:text-blue-400 transition-colors flex items-center space-x-1"
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                    </svg>
                    <span className="text-xs">Filters</span>
                  </button>
                </div>
              </form>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden lg:flex items-center space-x-1">
              {/* Simple Links */}
              {navigation.simple.map((link) => (
                <Link 
                  key={link.href}
                  href={link.href} 
                  className="px-3 py-2 text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded-lg transition-all duration-200 font-medium text-sm flex items-center space-x-1"
                >
                  <span className="text-xs">{link.icon}</span>
                  <span>{link.label}</span>
                </Link>
              ))}
              
              {/* Dropdown Links */}
              {navigation.dropdowns.map((dropdown, index) => (
                <div key={index} className="relative nav-dropdown">
                  <button
                    onClick={() => setActiveDropdown(activeDropdown === index ? null : index)}
                    className="px-3 py-2 text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded-lg transition-all duration-200 font-medium text-sm flex items-center space-x-1"
                  >
                    <span className="text-xs">{dropdown.icon}</span>
                    <span>{dropdown.label}</span>
                    <svg 
                      className={`w-4 h-4 transition-transform duration-200 ${activeDropdown === index ? 'rotate-180' : ''}`} 
                      fill="none" 
                      stroke="currentColor" 
                      viewBox="0 0 24 24"
                    >
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
                    </svg>
                  </button>
                  
                  {/* Dropdown Menu */}
                  {activeDropdown === index && (
                    <div className="absolute top-full left-0 mt-2 w-56 bg-gray-800 border border-gray-700 rounded-xl shadow-lg z-50 animate-fadeIn">
                      <div className="py-2">
                        {dropdown.items.map((item) => (
                          <Link
                            key={item.href}
                            href={item.href}
                            className="flex items-center space-x-2 px-4 py-2 text-gray-300 hover:bg-gray-700 hover:text-blue-400 transition-colors text-sm w-full"
                            onClick={() => setActiveDropdown(null)}
                          >
                            <span className="text-xs">{item.icon}</span>
                            <span>{item.label}</span>
                          </Link>
                        ))}
                      </div>
                    </div>
                  )}
                </div>
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
                      <nav className="hidden xl:flex items-center space-x-1">
                        {userNavLinks.map((link) => (
                          <Link 
                            key={link.href}
                            href={link.href} 
                            className="px-3 py-2 text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded-lg transition-all duration-200 text-sm font-medium flex items-center space-x-1"
                          >
                            <span className="text-xs">{link.icon}</span>
                            <span>{link.label}</span>
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
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getRoleColorClass(user.role)}`}>
                                  {getRoleDisplayName(user.role)}
                                </span>
                              )}
                            </div>
                            <div className="py-2">
                              {/* Mobile User Navigation */}
                              <div className="xl:hidden">
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
                {/* Mobile Search */}
                <div className="mb-4">
                  <form onSubmit={handleSearch} className="space-y-2">
                    <div className="flex items-center bg-gray-800/50 border border-gray-600 rounded-lg overflow-hidden">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search jobs..."
                        className="flex-1 px-4 py-2 bg-transparent text-white placeholder-gray-400 text-sm focus:outline-none"
                      />
                      <button
                        type="submit"
                        className="px-3 py-2 text-gray-400 hover:text-blue-400 transition-colors"
                      >
                        <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                        </svg>
                      </button>
                    </div>
                    <button
                      type="button"
                      onClick={() => setIsFilterModalOpen(true)}
                      className="w-full px-3 py-2 bg-gray-800/50 border border-gray-600 text-gray-400 hover:text-blue-400 transition-colors rounded-lg text-sm text-left"
                    >
                      Advanced Filters
                    </button>
                  </form>
                </div>

                {/* Simple Navigation Links */}
                {navigation.simple.map((link) => (
                  <Link 
                    key={link.href}
                    href={link.href} 
                    className="flex items-center space-x-2 px-3 py-2 text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded-lg transition-all duration-200 font-medium"
                    onClick={closeMobileMenu}
                  >
                    <span className="text-sm">{link.icon}</span>
                    <span>{link.label}</span>
                  </Link>
                ))}
                
                {/* Dropdown Navigation Sections */}
                {navigation.dropdowns.map((dropdown, index) => (
                  <div key={index} className="mt-4">
                    <div className="px-3 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider flex items-center space-x-1">
                      <span>{dropdown.icon}</span>
                      <span>{dropdown.label}</span>
                    </div>
                    {dropdown.items.map((item) => (
                      <Link
                        key={item.href}
                        href={item.href}
                        className="flex items-center space-x-2 px-6 py-2 text-gray-300 hover:text-blue-400 hover:bg-gray-800 rounded-lg transition-all duration-200 font-medium text-sm"
                        onClick={closeMobileMenu}
                      >
                        <span className="text-xs">{item.icon}</span>
                        <span>{item.label}</span>
                      </Link>
                    ))}
                  </div>
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
                        <div className="flex-1">
                          <p className="text-white text-sm font-semibold">{user.fullName || 'User'}</p>
                          <p className="text-gray-400 text-xs">{user.email}</p>
                          {user.role && (
                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium mt-1 ${getRoleColorClass(user.role)}`}>
                              {getRoleDisplayName(user.role)}
                            </span>
                          )}
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

      {/* Collapsible Hero Section */}
      {/* <div 
        ref={heroRef}
        className={`transition-all duration-500 ease-in-out overflow-hidden ${
          showHero ? 'max-h-96 opacity-100' : 'max-h-0 opacity-0'
        }`}
        style={{ paddingTop: '64px' }} // Account for fixed header
      >
        <section className="bg-gradient-to-r from-gray-900 to-gray-800 py-12 sm:py-16">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center">
              <h1 className="text-4xl sm:text-5xl font-bold text-white mb-4">
                Find Your Next{' '}
                <span className="text-blue-400">Tech Career</span>
              </h1>
              <p className="text-gray-300 text-lg sm:text-xl mb-8 max-w-3xl mx-auto">
                Discover remote and on-site tech opportunities from top companies worldwide.
              </p>
              
              <div className="max-w-4xl mx-auto">
                <form onSubmit={handleSearch} className="flex flex-col sm:flex-row gap-4 items-center justify-center">
                  <div className="flex-1 w-full sm:max-w-md">
                    <div className="relative">
                      <input
                        type="text"
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        placeholder="Search jobs, companies, skills..."
                        className="w-full px-4 py-3 bg-gray-800/80 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                      />
                      <svg className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-5.197-5.197m0 0A7.5 7.5 0 105.196 5.196a7.5 7.5 0 0010.607 10.607z" />
                      </svg>
                    </div>
                  </div>
                  
                  <div className="flex-1 w-full sm:max-w-xs">
                    <select
                      value={location}
                      onChange={(e) => setLocation(e.target.value)}
                      className="w-full px-4 py-3 bg-gray-800/80 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                    >
                      {locations.map((loc) => (
                        <option key={loc.value} value={loc.value} className="bg-gray-800">
                          {loc.label}
                        </option>
                      ))}
                    </select>
                  </div>
                  
                  <button
                    type="submit"
                    className="px-8 py-3 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Search Jobs
                  </button>
                </form>
              </div>
            </div>
          </div>
        </section>
      </div> */}

      {/* Advanced Filter Modal */}
      {isFilterModalOpen && (
        <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-gray-800 rounded-xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto filter-modal">
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h3 className="text-xl font-semibold text-white">Advanced Filters</h3>
              <button
                onClick={() => setIsFilterModalOpen(false)}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            
            <div className="p-6 space-y-6">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {/* Category Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Category</label>
                  <select
                    value={filters.category}
                    onChange={(e) => handleFilterChange('category', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {categories.map((cat) => (
                      <option key={cat.value} value={cat.value} className="bg-gray-700">
                        {cat.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Level Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Experience Level</label>
                  <select
                    value={filters.level}
                    onChange={(e) => handleFilterChange('level', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {levels.map((level) => (
                      <option key={level.value} value={level.value} className="bg-gray-700">
                        {level.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Job Type Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Job Type</label>
                  <select
                    value={filters.type}
                    onChange={(e) => handleFilterChange('type', e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {jobTypes.map((type) => (
                      <option key={type.value} value={type.value} className="bg-gray-700">
                        {type.label}
                      </option>
                    ))}
                  </select>
                </div>
                
                {/* Location Filter */}
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-2">Location</label>
                  <select
                    value={location}
                    onChange={(e) => setLocation(e.target.value)}
                    className="w-full px-4 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                  >
                    {locations.map((loc) => (
                      <option key={loc.value} value={loc.value} className="bg-gray-700">
                        {loc.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
              
              {/* Remote Work Toggle */}
              <div className="flex items-center space-x-3">
                <input
                  type="checkbox"
                  id="remote"
                  checked={filters.remote}
                  onChange={(e) => handleFilterChange('remote', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 focus:ring-2"
                />
                <label htmlFor="remote" className="text-sm font-medium text-gray-300">
                  Remote work only
                </label>
              </div>
              
              {/* Action Buttons */}
              <div className="flex items-center justify-between pt-4 border-t border-gray-700">
                <button
                  onClick={clearFilters}
                  className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                >
                  Clear All
                </button>
                <div className="flex items-center space-x-3">
                  <button
                    onClick={() => setIsFilterModalOpen(false)}
                    className="px-4 py-2 text-gray-400 hover:text-white transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    onClick={() => {
                      handleSearch({ preventDefault: () => {} });
                      setIsFilterModalOpen(false);
                    }}
                    className="px-6 py-2 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white font-medium rounded-lg transition-all duration-200"
                  >
                    Apply Filters
                  </button>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default Header;
