'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { 
  USER_ROLES, 
  SUB_USER_TYPES,
  PERMISSIONS,
  hasPermission
} from '@/utils/roleSystem';

export default function SubUserDashboard() {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [activities, setActivities] = useState([]);
  const [stats, setStats] = useState({
    resumeCreditsUsed: 0,
    resumeCreditsAllocated: 0,
    aiCreditsUsed: 0,
    aiCreditsAllocated: 0,
    totalActivities: 0,
    lastLoginAt: null
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user?.role === USER_ROLES.SUB_USER) {
      loadUserData();
    }
  }, [user]);

  const loadUserData = async () => {
    try {
      // Load user activities and stats
      const response = await fetch('/api/users/dashboard');
      if (response.ok) {
        const data = await response.json();
        setStats(data.stats);
        setActivities(data.activities || []);
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (user?.role !== USER_ROLES.SUB_USER) {
    return (
      <div className="bg-gray-900 flex items-center justify-center pt-16 min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-300">This dashboard is for sub-users only.</p>
        </div>
      </div>
    );
  }

  const getUserTypeIcon = () => {
    switch (user.userType) {
      case SUB_USER_TYPES.STAFF:
        return '👥';
      case SUB_USER_TYPES.VENDOR:
        return '🏢';
      case SUB_USER_TYPES.CUSTOMER:
        return '🤝';
      default:
        return '👤';
    }
  };

  const getUserTypeName = () => {
    return user.userType?.charAt(0).toUpperCase() + user.userType?.slice(1) || 'Sub-User';
  };

  const getAvailableFeatures = () => {
    const features = [];
    
    if (hasPermission(user, PERMISSIONS.VIEW_JOBS)) {
      features.push({ name: 'Browse Jobs', icon: '🔍', description: 'Search and view job listings' });
    }
    
    if (hasPermission(user, PERMISSIONS.APPLY_TO_JOBS)) {
      features.push({ name: 'Apply to Jobs', icon: '📝', description: 'Submit job applications' });
    }
    
    if (hasPermission(user, PERMISSIONS.VIEW_RESUMES)) {
      features.push({ name: 'View Resumes', icon: '📋', description: 'Access resume database' });
    }
    
    if (hasPermission(user, PERMISSIONS.DOWNLOAD_RESUMES)) {
      features.push({ name: 'Download Resumes', icon: '⬇️', description: 'Download candidate resumes' });
    }
    
    if (hasPermission(user, PERMISSIONS.POST_JOBS)) {
      features.push({ name: 'Post Jobs', icon: '➕', description: 'Create and publish job listings' });
    }
    
    if (hasPermission(user, PERMISSIONS.USE_AI_FEATURES)) {
      features.push({ name: 'AI Tools', icon: '🤖', description: 'Access AI-powered features' });
    }

    return features;
  };

  return (
    <div className="bg-gray-900 text-white pt-16 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <div className="flex items-center space-x-3 mb-2">
            <span className="text-3xl">{getUserTypeIcon()}</span>
            <h1 className="text-3xl font-bold text-white">{getUserTypeName()} Dashboard</h1>
          </div>
          <p className="text-gray-300">Welcome back, {user.fullName || user.email}</p>
        </div>

        {/* Account Status */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">Account Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <span className="text-sm text-gray-400">User Type:</span>
              <div className="text-lg font-medium text-white">
                {getUserTypeName()}
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-400">Status:</span>
              <div className={`text-lg font-medium ${user.isActive ? 'text-green-400' : 'text-red-400'}`}>
                {user.isActive ? 'Active' : 'Inactive'}
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-400">Parent Account:</span>
              <div className="text-lg font-medium text-white">
                {user.parentUser?.companyName || user.parentUser?.fullName || 'N/A'}
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-400">Last Login:</span>
              <div className="text-lg font-medium text-white">
                {stats.lastLoginAt ? new Date(stats.lastLoginAt).toLocaleDateString() : 'First time'}
              </div>
            </div>
          </div>
        </div>

        {/* Credits Overview */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">Resume Credits</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Used</span>
              <span className="text-sm text-gray-400">Allocated</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-white">{stats.resumeCreditsUsed || 0}</span>
              <span className="text-2xl font-bold text-green-400">{stats.resumeCreditsAllocated || 0}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-green-400 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${stats.resumeCreditsAllocated > 0 ? (stats.resumeCreditsUsed / stats.resumeCreditsAllocated) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>

          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-lg font-semibold text-white mb-4">AI Credits</h3>
            <div className="flex items-center justify-between mb-2">
              <span className="text-sm text-gray-400">Used</span>
              <span className="text-sm text-gray-400">Allocated</span>
            </div>
            <div className="flex items-center justify-between mb-4">
              <span className="text-2xl font-bold text-white">{stats.aiCreditsUsed || 0}</span>
              <span className="text-2xl font-bold text-blue-400">{stats.aiCreditsAllocated || 0}</span>
            </div>
            <div className="w-full bg-gray-700 rounded-full h-2">
              <div 
                className="bg-blue-400 h-2 rounded-full transition-all duration-300"
                style={{ 
                  width: `${stats.aiCreditsAllocated > 0 ? (stats.aiCreditsUsed / stats.aiCreditsAllocated) * 100 : 0}%` 
                }}
              ></div>
            </div>
          </div>
        </div>

        {/* Available Features */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">Available Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {getAvailableFeatures().map((feature, index) => (
              <div key={index} className="bg-gray-700 rounded-lg p-4 border border-gray-600">
                <div className="flex items-center space-x-3 mb-2">
                  <span className="text-2xl">{feature.icon}</span>
                  <h3 className="font-medium text-white">{feature.name}</h3>
                </div>
                <p className="text-sm text-gray-400">{feature.description}</p>
              </div>
            ))}
          </div>
          {getAvailableFeatures().length === 0 && (
            <div className="text-center py-8 text-gray-400">
              No features available. Contact your admin to assign permissions.
            </div>
          )}
        </div>

        {/* ATS Activities (if applicable) */}
        {(user.userType === SUB_USER_TYPES.STAFF || hasPermission(user, PERMISSIONS.VIEW_JOBS)) && (
          <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
            <h2 className="text-lg font-semibold text-white mb-4">Recent ATS Activities</h2>
            <div className="bg-gray-700 rounded-lg p-8 text-center border-2 border-dashed border-gray-600">
              <div className="text-4xl text-gray-500 mb-4">📊</div>
              <h3 className="text-lg font-medium text-gray-300 mb-2">ATS Activity Tracking</h3>
              <p className="text-gray-400 mb-4">
                Your activity logs and performance metrics will appear here once 
                the ATS system is fully integrated.
              </p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-gray-400">
                <div>✓ Application Reviews</div>
                <div>✓ Candidate Interactions</div>
                <div>✓ Interview Scheduling</div>
                <div>✓ Resume Downloads</div>
              </div>
            </div>
          </div>
        )}

        {/* Quick Actions */}
        <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
            {hasPermission(user, PERMISSIONS.VIEW_JOBS) && (
              <button className="bg-indigo-600 hover:bg-indigo-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                Browse Jobs
              </button>
            )}
            
            {hasPermission(user, PERMISSIONS.VIEW_RESUMES) && (
              <button className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                View Resumes
              </button>
            )}
            
            {hasPermission(user, PERMISSIONS.POST_JOBS) && (
              <button className="bg-purple-600 hover:bg-purple-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
                Post New Job
              </button>
            )}
            
            <button className="bg-gray-600 hover:bg-gray-700 text-white font-medium py-3 px-4 rounded-lg transition-colors">
              Update Profile
            </button>
          </div>
        </div>

        {/* Help & Support for Sub-Users */}
        <div className="mt-8 bg-blue-900 bg-opacity-50 rounded-lg p-6 border border-blue-700">
          <h2 className="text-lg font-semibold text-white mb-4">Need Help?</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-medium text-blue-200 mb-2">Contact Your Admin</h3>
              <p className="text-sm text-blue-300 mb-2">
                For access issues, credit allocation, or permissions:
              </p>
              <p className="text-sm text-blue-100">
                {user.parentUser?.email || 'Contact your company administrator'}
              </p>
            </div>
            <div>
              <h3 className="font-medium text-blue-200 mb-2">Technical Support</h3>
              <p className="text-sm text-blue-300 mb-2">
                For technical issues or feature questions:
              </p>
              <button className="text-sm bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded transition-colors">
                Open Support Ticket
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
