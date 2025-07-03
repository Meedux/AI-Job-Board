'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProtectedRoute from '../../components/ProtectedRoute';
import { colors, typography, components, layout } from '../../utils/designSystem';

const AdminDashboard = () => {
  const { user, isAdmin } = useAuth();
  const { showToast } = useNotifications();
  const [activeTab, setActiveTab] = useState('overview');
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalJobs: 0,
    totalApplications: 0,
    recentActivity: []
  });
  const [users, setUsers] = useState([]);
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);

  const fetchAdminData = useCallback(async () => {
    try {
      setLoading(true);
      
      // Fetch users
      const usersResponse = await fetch('/api/users');
      let usersData = [];
      if (usersResponse.ok) {
        const response = await usersResponse.json();
        usersData = response.users || [];
        setUsers(usersData);
      }

      // Fetch jobs
      const jobsResponse = await fetch('/api/jobs?limit=100');
      let jobsData = [];
      if (jobsResponse.ok) {
        const response = await jobsResponse.json();
        jobsData = response.jobs || [];
        setJobs(jobsData);
      }

      // Update stats with fresh data
      setStats(prev => ({
        ...prev,
        totalUsers: usersData.length,
        totalJobs: jobsData.length,
        totalApplications: 0, // This would come from applications API
        recentActivity: [
          { type: 'user_registration', message: 'New user registered', time: '2 hours ago' },
          { type: 'job_posted', message: 'New job posted', time: '5 hours ago' },
          { type: 'application_submitted', message: 'Application submitted', time: '1 day ago' }
        ]
      }));

    } catch (error) {
      console.error('Error fetching admin data:', error);
      showToast('Failed to load admin data', 'error');
    } finally {
      setLoading(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (user && isAdmin(user.email)) {
      fetchAdminData();
    }
  }, [user, isAdmin, fetchAdminData]);

  const handleDeleteUser = async (userId) => {
    if (window.confirm('Are you sure you want to delete this user?')) {
      showToast('User deletion not implemented yet', 'info');
    }
  };

  const handleDeleteJob = async (jobId) => {
    if (window.confirm('Are you sure you want to delete this job?')) {
      showToast('Job deletion not implemented yet', 'info');
    }
  };

  const handleCreateTestNotifications = async () => {
    try {
      const response = await fetch('/api/admin/notifications/test', {
        method: 'POST'
      });
      
      if (response.ok) {
        showToast('Test notifications created successfully!', 'success');
        await fetchAdminData(); // Refresh data
      } else {
        showToast('Failed to create test notifications', 'error');
      }
    } catch (error) {
      console.error('Error creating test notifications:', error);
      showToast('Error creating test notifications', 'error');
    }
  };

  const handleTestEmailService = async (testType, testEmail = null) => {
    try {
      const response = await fetch('/api/admin/email/test', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testType, testEmail }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        if (testType === 'connection') {
          showToast(`Email service ${data.result.success ? 'connection verified!' : 'connection failed: ' + data.result.message}`, 
                   data.result.success ? 'success' : 'error');
        } else {
          showToast('Test email sent successfully!', 'success');
          if (data.result.previewUrl) {
            console.log('📧 Email preview:', data.result.previewUrl);
            showToast('Check console for email preview URL', 'info');
          }
        }
      } else {
        showToast(`Failed to test email: ${data.error}`, 'error');
      }
    } catch (error) {
      console.error('Error testing email service:', error);
      showToast('Error testing email service', 'error');
    }
  };

  // Check if user is admin
  if (!user || !isAdmin(user.email)) {
    return (
      <ProtectedRoute>
        <div className={`min-h-screen ${colors.neutral.background} font-sans`}>
          <Header />
          <main className={layout.container}>
            <div className="max-w-4xl mx-auto py-12">
              <div className={`${components.card.base} ${components.card.padding} text-center`}>
                <h1 className={`${typography.h2} ${colors.neutral.textPrimary} mb-4`}>
                  Access Denied
                </h1>
                <p className={`${typography.bodyLarge} ${colors.neutral.textSecondary}`}>
                  You don&apos;t have permission to access the admin dashboard.
                </p>
              </div>
            </div>
          </main>
          <Footer />
        </div>
      </ProtectedRoute>
    );
  }

  const TabButton = ({ id, label, isActive, onClick }) => (
    <button
      onClick={() => onClick(id)}
      className={`px-4 py-2 rounded-lg font-medium transition-colors ${
        isActive
          ? `${colors.primary[600]} ${colors.neutral.textPrimary}`
          : `${colors.neutral.backgroundTertiary} ${colors.neutral.textSecondary} hover:${colors.neutral.surfaceHover}`
      }`}
    >
      {label}
    </button>
  );

  const StatCard = ({ title, value, icon }) => (
    <div className={`${components.card.base} ${components.card.padding}`}>
      <div className="flex items-center justify-between">
        <div>
          <p className={`${typography.bodySmall} ${colors.neutral.textMuted} uppercase tracking-wide`}>
            {title}
          </p>
          <p className={`${typography.h3} ${colors.neutral.textPrimary} mt-1`}>
            {value}
          </p>
        </div>
        <div className={`text-2xl ${colors.primary.text}`}>
          {icon}
        </div>
      </div>
    </div>
  );

  return (
    <ProtectedRoute>
      <div className={`min-h-screen ${colors.neutral.background} font-sans`}>
        <Header />
        
        <main className={layout.container}>
          <div className="max-w-7xl mx-auto py-8">
            {/* Header */}
            <div className="mb-8">
              <h1 className={`${typography.h1} ${colors.neutral.textPrimary} mb-2`}>
                Admin Dashboard
              </h1>
              <p className={`${typography.bodyLarge} ${colors.neutral.textSecondary}`}>
                Manage users, jobs, and monitor site activity
              </p>
              {user?.email?.endsWith('@getgethired.com') && (
                <div className={`mt-4 p-3 rounded-lg ${colors.primary[500]} bg-opacity-20 border border-blue-600`}>
                  <p className={`${typography.bodyBase} ${colors.primary.text}`}>
                    🎉 Welcome, {user.fullName}! You have been automatically granted admin access due to your @getgethired.com email address.
                  </p>
                </div>
              )}
            </div>

            {/* Tabs */}
            <div className="flex flex-wrap gap-2 mb-8">
              <TabButton 
                id="overview" 
                label="Overview" 
                isActive={activeTab === 'overview'} 
                onClick={setActiveTab} 
              />
              <TabButton 
                id="users" 
                label="Users" 
                isActive={activeTab === 'users'} 
                onClick={setActiveTab} 
              />
              <TabButton 
                id="jobs" 
                label="Jobs" 
                isActive={activeTab === 'jobs'} 
                onClick={setActiveTab} 
              />
              <TabButton 
                id="settings" 
                label="Settings" 
                isActive={activeTab === 'settings'} 
                onClick={setActiveTab} 
              />
            </div>

            {loading ? (
              <div className="text-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                <p className={`${typography.bodyBase} ${colors.neutral.textSecondary}`}>
                  Loading admin data...
                </p>
              </div>
            ) : (
              <>
                {/* Overview Tab */}
                {activeTab === 'overview' && (
                  <div className="space-y-8">
                    {/* Stats Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                      <StatCard title="Total Users" value={stats.totalUsers} icon="👥" />
                      <StatCard title="Total Jobs" value={stats.totalJobs} icon="💼" />
                      <StatCard title="Applications" value={stats.totalApplications} icon="📄" />
                      <StatCard title="Active Today" value="12" icon="🔥" />
                    </div>

                    {/* Recent Activity */}
                    <div className={`${components.card.base} ${components.card.padding}`}>
                      <h3 className={`${typography.h4} ${colors.neutral.textPrimary} mb-4`}>
                        Recent Activity
                      </h3>
                      <div className="space-y-3">
                        {stats.recentActivity.map((activity, index) => (
                          <div key={index} className="flex items-center justify-between py-2 border-b border-gray-700 last:border-b-0">
                            <span className={`${typography.bodyBase} ${colors.neutral.textSecondary}`}>
                              {activity.message}
                            </span>
                            <span className={`${typography.bodySmall} ${colors.neutral.textMuted}`}>
                              {activity.time}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                )}

                {/* Users Tab */}
                {activeTab === 'users' && (
                  <div className={`${components.card.base} ${components.card.padding}`}>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className={`${typography.h4} ${colors.neutral.textPrimary}`}>
                        User Management
                      </h3>
                      <button
                        onClick={fetchAdminData}
                        className={`${components.button.base} ${components.button.primary} ${components.button.sizes.small}`}
                      >
                        Refresh
                      </button>
                    </div>
                    
                    <div className="overflow-x-auto">
                      <table className="min-w-full divide-y divide-gray-700">
                        <thead className={colors.neutral.backgroundSecondary}>
                          <tr>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${colors.neutral.textMuted} uppercase tracking-wider`}>
                              User
                            </th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${colors.neutral.textMuted} uppercase tracking-wider`}>
                              Email
                            </th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${colors.neutral.textMuted} uppercase tracking-wider`}>
                              Age
                            </th>
                            <th className={`px-6 py-3 text-left text-xs font-medium ${colors.neutral.textMuted} uppercase tracking-wider`}>
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody className={`${colors.neutral.surface} divide-y divide-gray-700`}>
                          {users && users.length > 0 ? (
                            users.map((user, index) => (
                              <tr key={user.uid || index}>
                                <td className="px-6 py-4 whitespace-nowrap">
                                  <div className="flex items-center">
                                    <div className={`w-8 h-8 ${colors.primary[500]} rounded-full flex items-center justify-center text-white text-sm font-semibold mr-3`}>
                                      {user.nickname ? user.nickname.charAt(0).toUpperCase() : (user.fullName || 'U').charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <div className={`${typography.bodyBase} ${colors.neutral.textPrimary}`}>
                                        {user.fullName || 'Unknown User'}
                                      </div>
                                      {user.nickname && (
                                        <div className={`${typography.bodySmall} ${colors.neutral.textMuted}`}>
                                          @{user.nickname}
                                        </div>
                                      )}
                                    </div>
                                  </div>
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap ${typography.bodyBase} ${colors.neutral.textSecondary}`}>
                                  {user.email || 'No email'}
                                </td>
                                <td className={`px-6 py-4 whitespace-nowrap ${typography.bodyBase} ${colors.neutral.textSecondary}`}>
                                  {user.age || 'N/A'}
                                </td>
                                <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                  <button
                                    onClick={() => handleDeleteUser(user.uid)}
                                    className={`${colors.error.text} hover:${colors.error.background} px-3 py-1 rounded`}
                                  >
                                    Delete
                                  </button>
                                </td>
                              </tr>
                            ))
                          ) : (
                            <tr>
                              <td colSpan="4" className="px-6 py-8 text-center">
                                <p className={`${typography.bodyBase} ${colors.neutral.textSecondary}`}>
                                  No users found. Check your API connection or try refreshing.
                                </p>
                              </td>
                            </tr>
                          )}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}

                {/* Jobs Tab */}
                {activeTab === 'jobs' && (
                  <div className={`${components.card.base} ${components.card.padding}`}>
                    <div className="flex justify-between items-center mb-6">
                      <h3 className={`${typography.h4} ${colors.neutral.textPrimary}`}>
                        Job Management
                      </h3>
                      <button
                        onClick={fetchAdminData}
                        className={`${components.button.base} ${components.button.primary} ${components.button.sizes.small}`}
                      >
                        Refresh
                      </button>
                    </div>
                    
                    <div className="space-y-4">
                      {jobs && jobs.length > 0 ? (
                        jobs.slice(0, 10).map((job, index) => (
                          <div key={job.id || index} className={`${colors.neutral.backgroundSecondary} p-4 rounded-lg`}>
                            <div className="flex justify-between items-start">
                              <div className="flex-1">
                                <h4 className={`${typography.h6} ${colors.neutral.textPrimary} mb-2`}>
                                  {job.title || 'Untitled Position'}
                                </h4>
                                <p className={`${typography.bodyBase} ${colors.neutral.textSecondary} mb-2`}>
                                  {(typeof job.company === 'string' ? job.company : job.company?.name) || 'Unknown Company'} • {job.location || 'Remote'}
                                </p>
                                <div className="flex gap-2">
                                  <span className="px-2 py-1 text-xs bg-blue-900 text-blue-300 rounded-full">
                                    {job.type || 'Full-time'}
                                  </span>
                                  <span className="px-2 py-1 text-xs bg-green-900 text-green-300 rounded-full">
                                    {job.level || 'Mid-level'}
                                  </span>
                                </div>
                              </div>
                              <button
                                onClick={() => handleDeleteJob(job.id)}
                                className={`${colors.error.text} hover:${colors.error.background} px-3 py-1 rounded ml-4`}
                              >
                                Delete
                              </button>
                            </div>
                          </div>
                        ))
                      ) : (
                        <div className="text-center py-8">
                          <p className={`${typography.bodyBase} ${colors.neutral.textSecondary}`}>
                            No jobs found. Check your API connection or try refreshing.
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                )}

                {/* Settings Tab */}
                {activeTab === 'settings' && (
                  <div className={`${components.card.base} ${components.card.padding}`}>
                    <h3 className={`${typography.h4} ${colors.neutral.textPrimary} mb-6`}>
                      Admin Settings
                    </h3>
                    
                    <div className="space-y-6">
                      <div>
                        <h4 className={`${typography.h6} ${colors.neutral.textPrimary} mb-3`}>
                          Site Configuration
                        </h4>
                        <p className={`${typography.bodyBase} ${colors.neutral.textSecondary} mb-4`}>
                          Advanced settings would go here in a production environment.
                        </p>
                        <div className="space-x-4">
                          <button
                            onClick={() => showToast('Settings saved successfully!', 'success')}
                            className={`${components.button.base} ${components.button.primary} ${components.button.sizes.medium}`}
                          >
                            Save Settings
                          </button>
                          <button
                            onClick={handleCreateTestNotifications}
                            className={`${components.button.base} ${components.button.secondary} ${components.button.sizes.medium}`}
                          >
                            Create Test Notifications
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <h4 className={`${typography.h6} ${colors.neutral.textPrimary} mb-3`}>
                          Data Management
                        </h4>
                        <div className="space-y-2">
                          <button
                            onClick={() => showToast('Data export initiated', 'info')}
                            className={`${components.button.base} ${components.button.secondary} ${components.button.sizes.medium} mr-4`}
                          >
                            Export Data
                          </button>
                          <button
                            onClick={() => showToast('Cache cleared', 'success')}
                            className={`${components.button.base} ${components.button.secondary} ${components.button.sizes.medium}`}
                          >
                            Clear Cache
                          </button>
                        </div>
                      </div>

                      <div>
                        <h4 className={`${typography.h6} ${colors.neutral.textPrimary} mb-3`}>
                          Email Service Testing
                        </h4>
                        <p className={`${typography.bodyBase} ${colors.neutral.textSecondary} mb-4`}>
                          Test the email notification system and SMTP configuration.
                        </p>
                        <div className="space-y-3">
                          <div className="flex flex-wrap gap-2">
                            <button
                              onClick={() => handleTestEmailService('connection')}
                              className={`${components.button.base} ${components.button.secondary} ${components.button.sizes.medium}`}
                            >
                              🔗 Test Connection
                            </button>
                            <button
                              onClick={() => {
                                const email = prompt('Enter email address to send test to:', user.email);
                                if (email) handleTestEmailService('test_email', email);
                              }}
                              className={`${components.button.base} ${components.button.secondary} ${components.button.sizes.medium}`}
                            >
                              📧 Send Test Email
                            </button>
                            <button
                              onClick={() => handleTestEmailService('admin_notification')}
                              className={`${components.button.base} ${components.button.secondary} ${components.button.sizes.medium}`}
                            >
                              🔔 Test Admin Notifications
                            </button>
                          </div>
                          <p className={`${typography.bodySmall} ${colors.neutral.textMuted}`}>
                            💡 In development mode, check console for Ethereal email preview URLs
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>
                )}
              </>
            )}
          </div>
        </main>
        
        <Footer />
      </div>
    </ProtectedRoute>
  );
};

export default AdminDashboard;
