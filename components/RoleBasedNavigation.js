'use client';

import { useAuth } from '@/contexts/AuthContext';
import { USER_ROLES, hasPermission, PERMISSIONS } from '@/utils/roleSystem';

export default function RoleBasedNavigation() {
  const { user } = useAuth();

  if (!user) return null;

  const getNavigationItems = () => {
    const items = [];

    // Common items for all users
    items.push({ name: 'Dashboard', href: '/dashboard', icon: '🏠' });

    // Role-specific items
    if (user.role === USER_ROLES.SUPER_ADMIN) {
      items.push({ name: 'Super Admin', href: '/admin', icon: '⚡' });
      items.push({ name: 'All Users', href: '/admin/users', icon: '👥' });
      items.push({ name: 'System Settings', href: '/admin/settings', icon: '⚙️' });
    }

    if (user.role === USER_ROLES.EMPLOYER_ADMIN) {
      items.push({ name: 'Admin Panel', href: '/admin', icon: '👔' });
      items.push({ name: 'Sub-Users', href: '/admin/sub-users', icon: '👥' });
      items.push({ name: 'Subscription', href: '/subscription', icon: '💳' });
    }

    if (user.role === USER_ROLES.SUB_USER) {
      items.push({ name: 'My Dashboard', href: '/admin', icon: '📊' });
    }

    // Permission-based items
    if (hasPermission(user, PERMISSIONS.VIEW_JOBS)) {
      items.push({ name: 'Browse Jobs', href: '/jobs', icon: '🔍' });
    }

    if (hasPermission(user, PERMISSIONS.POST_JOBS)) {
      items.push({ name: 'Post Job', href: '/post-job', icon: '➕' });
    }

    if (hasPermission(user, PERMISSIONS.VIEW_RESUMES)) {
      items.push({ name: 'Resumes', href: '/resumes', icon: '📋' });
    }

    if (hasPermission(user, PERMISSIONS.VIEW_APPLICATIONS)) {
      items.push({ name: 'Applications', href: '/applications', icon: '📝' });
    }

    // Common items
    if (user.role === USER_ROLES.JOB_SEEKER) {
      items.push({ name: 'Profile', href: '/profile/job-seeker', icon: '👤' });
    } else if (user.role === USER_ROLES.EMPLOYER_ADMIN || user.role === USER_ROLES.SUB_USER) {
      items.push({ name: 'Profile', href: '/profile/employer', icon: '👤' });
    } else {
      items.push({ name: 'Profile', href: '/profile', icon: '👤' });
    }

    return items;
  };

  const navigationItems = getNavigationItems();

  return (
    <nav className="bg-gray-800 border-b border-gray-700">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex items-center justify-between h-16">
          <div className="flex items-center">
            <div className="flex-shrink-0">
              <span className="text-white text-lg font-bold">JobSite</span>
            </div>
            <div className="hidden md:block">
              <div className="ml-10 flex items-baseline space-x-4">
                {navigationItems.map((item) => (
                  <a
                    key={item.name}
                    href={item.href}
                    className="text-gray-300 hover:bg-gray-700 hover:text-white px-3 py-2 rounded-md text-sm font-medium flex items-center space-x-2"
                  >
                    <span className="text-base">{item.icon}</span>
                    <span>{item.name}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>
          
          <div className="hidden md:block">
            <div className="ml-4 flex items-center md:ml-6">
              <div className="text-gray-300 text-sm">
                <span className="font-medium">{user.fullName || user.email}</span>
                <div className="text-xs text-gray-400">
                  {user.role === USER_ROLES.SUPER_ADMIN && '⚡ Super Admin'}
                  {user.role === USER_ROLES.EMPLOYER_ADMIN && '👔 Employer Admin'}
                  {user.role === USER_ROLES.SUB_USER && `📋 ${user.userType?.charAt(0).toUpperCase() + user.userType?.slice(1) || 'Sub-User'}`}
                  {user.role === USER_ROLES.JOB_SEEKER && '👤 Job Seeker'}
                </div>
              </div>
              <button
                onClick={() => {
                  // Logout functionality
                  window.location.href = '/api/auth/logout';
                }}
                className="ml-4 bg-gray-700 text-gray-300 hover:bg-gray-600 hover:text-white px-3 py-2 rounded-md text-sm font-medium"
              >
                Logout
              </button>
            </div>
          </div>

          {/* Mobile menu button */}
          <div className="md:hidden">
            <button
              type="button"
              className="bg-gray-800 inline-flex items-center justify-center p-2 rounded-md text-gray-400 hover:text-white hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-offset-gray-800 focus:ring-white"
              aria-controls="mobile-menu"
              aria-expanded="false"
            >
              <span className="sr-only">Open main menu</span>
              <svg className="block h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
        </div>
      </div>

      {/* Mobile menu */}
      <div className="md:hidden" id="mobile-menu">
        <div className="px-2 pt-2 pb-3 space-y-1 sm:px-3">
          {navigationItems.map((item) => (
            <a
              key={item.name}
              href={item.href}
              className="text-gray-300 hover:bg-gray-700 hover:text-white flex items-center space-x-2 px-3 py-2 rounded-md text-base font-medium"
            >
              <span className="text-lg">{item.icon}</span>
              <span>{item.name}</span>
            </a>
          ))}
          <button
            onClick={() => {
              window.location.href = '/api/auth/logout';
            }}
            className="text-gray-300 hover:bg-gray-700 hover:text-white block px-3 py-2 rounded-md text-base font-medium w-full text-left"
          >
            Logout
          </button>
        </div>
      </div>
    </nav>
  );
}
