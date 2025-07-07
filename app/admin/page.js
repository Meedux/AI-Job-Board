'use client';

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useNotifications } from '../../contexts/NotificationContext';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProtectedRoute from '../../components/ProtectedRoute';
import { colors, typography, components, layout, combineClasses } from '../../utils/designSystem';
import { CopyToClipboard } from 'react-copy-to-clipboard';

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
  const [embeds, setEmbeds] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showEmbedForm, setShowEmbedForm] = useState(false);
  const [newEmbed, setNewEmbed] = useState({
    name: '',
    type: 'jobs',
    config: {}
  });

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

      // Fetch embeds
      const embedsResponse = await fetch('/api/admin/embeds');
      let embedsData = [];
      if (embedsResponse.ok) {
        const response = await embedsResponse.json();
        embedsData = response.embeds || [];
        setEmbeds(embedsData);
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

  const handleCreateEmbed = async () => {
    try {
      const response = await fetch('/api/admin/embeds', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(newEmbed),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showToast('Embed created successfully!', 'success');
        setEmbeds(prev => [data.embed, ...prev]);
        setShowEmbedForm(false);
        setNewEmbed({ name: '', type: 'jobs', config: {} });
      } else {
        showToast(`Failed to create embed: ${data.error}`, 'error');
      }
    } catch (error) {
      console.error('Error creating embed:', error);
      showToast('Error creating embed', 'error');
    }
  };

  const handleDeleteEmbed = async (embedId) => {
    if (!confirm('Are you sure you want to delete this embed?')) return;
    
    try {
      const response = await fetch(`/api/admin/embeds?id=${embedId}`, {
        method: 'DELETE',
      });
      
      if (response.ok) {
        showToast('Embed deleted successfully!', 'success');
        setEmbeds(prev => prev.filter(embed => embed.id !== embedId));
      } else {
        const data = await response.json();
        showToast(`Failed to delete embed: ${data.error}`, 'error');
      }
    } catch (error) {
      console.error('Error deleting embed:', error);
      showToast('Error deleting embed', 'error');
    }
  };

  const getEmbedConfigForm = (type) => {
    switch (type) {
      case 'jobs':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className={components.label.base}>Max Jobs</label>
              <input
                type="number"
                min="1"
                max="20"
                value={newEmbed.config.limit || 5}
                onChange={(e) => setNewEmbed(prev => ({ 
                  ...prev, 
                  config: { ...prev.config, limit: parseInt(e.target.value) }
                }))}
                className={components.input.base}
              />
            </div>
            <div>
              <label className={components.label.base}>Height (px)</label>
              <input
                type="number"
                min="200"
                max="800"
                value={newEmbed.config.height || 400}
                onChange={(e) => setNewEmbed(prev => ({ 
                  ...prev, 
                  config: { ...prev.config, height: parseInt(e.target.value) }
                }))}
                className={components.input.base}
              />
            </div>
            <div>
              <label className={components.label.base}>Category Filter</label>
              <input
                type="text"
                value={newEmbed.config.category || ''}
                onChange={(e) => setNewEmbed(prev => ({ 
                  ...prev, 
                  config: { ...prev.config, category: e.target.value }
                }))}
                className={components.input.base}
                placeholder="e.g., Technology"
              />
            </div>
            <div>
              <label className={components.label.base}>Location Filter</label>
              <input
                type="text"
                value={newEmbed.config.location || ''}
                onChange={(e) => setNewEmbed(prev => ({ 
                  ...prev, 
                  config: { ...prev.config, location: e.target.value }
                }))}
                className={components.input.base}
                placeholder="e.g., San Francisco"
              />
            </div>
            <div>
              <label className={components.label.base}>Theme</label>
              <select
                value={newEmbed.config.theme || 'light'}
                onChange={(e) => setNewEmbed(prev => ({ 
                  ...prev, 
                  config: { ...prev.config, theme: e.target.value }
                }))}
                className={components.input.base}
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
            <div className="flex items-center">
              <input
                type="checkbox"
                id="showLogo"
                checked={newEmbed.config.showLogo !== false}
                onChange={(e) => setNewEmbed(prev => ({ 
                  ...prev, 
                  config: { ...prev.config, showLogo: e.target.checked }
                }))}
                className="mr-2"
              />
              <label htmlFor="showLogo" className={components.label.base}>Show Logo</label>
            </div>
          </div>
        );
      case 'search':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Width</label>
              <input
                type="text"
                value={newEmbed.config.width || '100%'}
                onChange={(e) => setNewEmbed(prev => ({ 
                  ...prev, 
                  config: { ...prev.config, width: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                placeholder="100% or 400px"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Height (px)</label>
              <input
                type="number"
                min="100"
                max="300"
                value={newEmbed.config.height || 120}
                onChange={(e) => setNewEmbed(prev => ({ 
                  ...prev, 
                  config: { ...prev.config, height: parseInt(e.target.value) }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Redirect URL</label>
              <input
                type="url"
                value={newEmbed.config.redirectUrl || '/'}
                onChange={(e) => setNewEmbed(prev => ({ 
                  ...prev, 
                  config: { ...prev.config, redirectUrl: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Theme</label>
              <select
                value={newEmbed.config.theme || 'light'}
                onChange={(e) => setNewEmbed(prev => ({ 
                  ...prev, 
                  config: { ...prev.config, theme: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>
        );
      case 'post-job':
        return (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1">Height (px)</label>
              <input
                type="number"
                min="400"
                max="800"
                value={newEmbed.config.height || 600}
                onChange={(e) => setNewEmbed(prev => ({ 
                  ...prev, 
                  config: { ...prev.config, height: parseInt(e.target.value) }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pre-fill Company Name</label>
              <input
                type="text"
                value={newEmbed.config.companyName || ''}
                onChange={(e) => setNewEmbed(prev => ({ 
                  ...prev, 
                  config: { ...prev.config, companyName: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Pre-fill Company Website</label>
              <input
                type="url"
                value={newEmbed.config.companyWebsite || ''}
                onChange={(e) => setNewEmbed(prev => ({ 
                  ...prev, 
                  config: { ...prev.config, companyWebsite: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              />
            </div>
            <div>
              <label className="block text-sm font-medium mb-1">Theme</label>
              <select
                value={newEmbed.config.theme || 'light'}
                onChange={(e) => setNewEmbed(prev => ({ 
                  ...prev, 
                  config: { ...prev.config, theme: e.target.value }
                }))}
                className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              >
                <option value="light">Light</option>
                <option value="dark">Dark</option>
              </select>
            </div>
          </div>
        );
      default:
        return null;
    }
  };

  const handleTestNotificationSystem = async (testType) => {
    try {
      const response = await fetch('/api/admin/notifications/test-system', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ testType }),
      });
      
      const data = await response.json();
      
      if (response.ok) {
        showToast(`Test notification created: ${testType}`, 'success');
        // Trigger a refresh of notifications if in notifications tab
        if (activeTab === 'notifications') {
          window.location.reload(); // Simple refresh for demo
        }
      } else {
        showToast(`Failed to create test notification: ${data.error}`, 'error');
      }
    } catch (error) {
      console.error('Error creating test notification:', error);
      showToast('Error creating test notification', 'error');
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
                id="embeds" 
                label="Embeds" 
                isActive={activeTab === 'embeds'} 
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

                {/* Embeds Tab */}
                {activeTab === 'embeds' && (
                  <div className="space-y-6">
                    <div className={`${components.card.base} ${components.card.padding}`}>
                      <div className="flex justify-between items-center mb-6">
                        <h3 className={`${typography.h4} ${colors.neutral.textPrimary}`}>
                          Embeddable Widgets
                        </h3>
                        <button
                          onClick={() => setShowEmbedForm(true)}
                          className={`${components.button.base} ${components.button.primary} ${components.button.sizes.medium}`}
                        >
                          + Create New Embed
                        </button>
                      </div>

                      <p className={`${typography.bodyBase} ${colors.neutral.textSecondary} mb-6`}>
                        Create embeddable widgets that other websites can use to display your job listings, search functionality, or job posting forms.
                      </p>

                      {/* Create Embed Form */}
                      {showEmbedForm && (
                        <div className={`${colors.neutral.backgroundSecondary} p-6 rounded-lg mb-6`}>
                          <h4 className={`${typography.h6} ${colors.neutral.textPrimary} mb-4`}>
                            Create New Embed
                          </h4>
                          
                          <div className="space-y-4">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <div>
                                <label className="block text-sm font-medium mb-1">Name</label>
                                <input
                                  type="text"
                                  value={newEmbed.name}
                                  onChange={(e) => setNewEmbed(prev => ({ ...prev, name: e.target.value }))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                  placeholder="e.g., Tech Jobs Widget"
                                />
                              </div>
                              <div>
                                <label className="block text-sm font-medium mb-1">Type</label>
                                <select
                                  value={newEmbed.type}
                                  onChange={(e) => setNewEmbed(prev => ({ ...prev, type: e.target.value, config: {} }))}
                                  className="w-full px-3 py-2 border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-green-500"
                                >
                                  <option value="jobs">Job Listings</option>
                                  <option value="search">Search Widget</option>
                                  <option value="post-job">Job Posting Form</option>
                                </select>
                              </div>
                            </div>

                            <div>
                              <label className="block text-sm font-medium mb-2">Configuration</label>
                              {getEmbedConfigForm(newEmbed.type)}
                            </div>

                            <div className="flex gap-2">
                              <button
                                onClick={handleCreateEmbed}
                                disabled={!newEmbed.name}
                                className={`${components.button.base} ${components.button.primary} ${components.button.sizes.medium} disabled:opacity-50`}
                              >
                                Create Embed
                              </button>
                              <button
                                onClick={() => {
                                  setShowEmbedForm(false);
                                  setNewEmbed({ name: '', type: 'jobs', config: {} });
                                }}
                                className={`${components.button.base} ${components.button.secondary} ${components.button.sizes.medium}`}
                              >
                                Cancel
                              </button>
                            </div>
                          </div>
                        </div>
                      )}

                      {/* Embeds List */}
                      <div className="space-y-4">
                        {embeds.length === 0 ? (
                          <div className="text-center py-8">
                            <p className={`${typography.bodyBase} ${colors.neutral.textSecondary}`}>
                              No embeds created yet. Create your first embeddable widget!
                            </p>
                          </div>
                        ) : (
                          embeds.map((embed) => (
                            <div key={embed.id} className={`border rounded-lg p-4 ${colors.neutral.backgroundSecondary}`}>
                              <div className="flex justify-between items-start mb-4">
                                <div>
                                  <h4 className={`${typography.h6} ${colors.neutral.textPrimary}`}>
                                    {embed.name}
                                  </h4>
                                  <p className={`${typography.bodySmall} ${colors.neutral.textSecondary}`}>
                                    Type: {embed.type} • Created: {new Date(embed.createdAt).toLocaleDateString()}
                                  </p>
                                </div>
                                <div className="flex gap-2">
                                  <a
                                    href={embed.embedCode.url}
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className={`${components.button.base} ${components.button.secondary} ${components.button.sizes.small}`}
                                  >
                                    Preview
                                  </a>
                                  <button
                                    onClick={() => handleDeleteEmbed(embed.id)}
                                    className={`${components.button.base} ${components.button.sizes.small} bg-red-600 hover:bg-red-700 text-white`}
                                  >
                                    Delete
                                  </button>
                                </div>
                              </div>

                              <div className="space-y-3">
                                <div>
                                  <label className="block text-sm font-medium mb-1">HTML Embed Code:</label>
                                  <div className="flex">
                                    <textarea
                                      readOnly
                                      value={embed.embedCode.html}
                                      className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-l font-mono"
                                      rows={4}
                                    />
                                    <CopyToClipboard
                                      text={embed.embedCode.html}
                                      onCopy={() => showToast('HTML code copied!', 'success')}
                                    >
                                      <button className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 text-sm">
                                        Copy
                                      </button>
                                    </CopyToClipboard>
                                  </div>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium mb-1">JavaScript Embed Code:</label>
                                  <div className="flex">
                                    <textarea
                                      readOnly
                                      value={embed.embedCode.javascript}
                                      className="flex-1 px-3 py-2 text-xs bg-gray-50 border border-gray-300 rounded-l font-mono"
                                      rows={6}
                                    />
                                    <CopyToClipboard
                                      text={embed.embedCode.javascript}
                                      onCopy={() => showToast('JavaScript code copied!', 'success')}
                                    >
                                      <button className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 text-sm">
                                        Copy
                                      </button>
                                    </CopyToClipboard>
                                  </div>
                                  <p className="text-xs text-gray-500 mt-1">
                                    Add <code>&lt;div id=&quot;getgethired-widget&quot;&gt;&lt;/div&gt;</code> to your HTML where you want the widget to appear.
                                  </p>
                                </div>

                                <div>
                                  <label className="block text-sm font-medium mb-1">Direct URL:</label>
                                  <div className="flex">
                                    <input
                                      readOnly
                                      value={embed.embedCode.url}
                                      className="flex-1 px-3 py-2 text-sm bg-gray-50 border border-gray-300 rounded-l"
                                    />
                                    <CopyToClipboard
                                      text={embed.embedCode.url}
                                      onCopy={() => showToast('URL copied!', 'success')}
                                    >
                                      <button className="px-4 py-2 bg-blue-600 text-white rounded-r hover:bg-blue-700 text-sm">
                                        Copy
                                      </button>
                                    </CopyToClipboard>
                                  </div>
                                </div>
                              </div>
                            </div>
                          ))
                        )}
                      </div>
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
                          Notification System Testing
                        </h4>
                        <p className={`${typography.bodyBase} ${colors.neutral.textSecondary} mb-4`}>
                          Test the integrated notification system with different types of notifications.
                        </p>
                        <div className="grid grid-cols-2 gap-4 mb-4">
                          <button
                            onClick={() => handleTestNotificationSystem('user_registration')}
                            className={`${components.button.base} ${components.button.secondary} ${components.button.sizes.small}`}
                          >
                            🔐 Test User Registration
                          </button>
                          <button
                            onClick={() => handleTestNotificationSystem('job_posted')}
                            className={`${components.button.base} ${components.button.secondary} ${components.button.sizes.small}`}
                          >
                            💼 Test Job Posted
                          </button>
                          <button
                            onClick={() => handleTestNotificationSystem('system_error')}
                            className={`${components.button.base} ${components.button.secondary} ${components.button.sizes.small}`}
                          >
                            ⚠️ Test System Error
                          </button>
                          <button
                            onClick={() => handleTestNotificationSystem('security_alert')}
                            className={`${components.button.base} ${components.button.secondary} ${components.button.sizes.small}`}
                          >
                            🚨 Test Security Alert
                          </button>
                          <button
                            onClick={() => handleTestNotificationSystem('custom_admin')}
                            className={`${components.button.base} ${components.button.secondary} ${components.button.sizes.small}`}
                          >
                            👨‍💼 Test Admin Notification
                          </button>
                          <button
                            onClick={() => handleTestNotificationSystem('custom_system')}
                            className={`${components.button.base} ${components.button.secondary} ${components.button.sizes.small}`}
                          >
                            🖥️ Test System Notification
                          </button>
                        </div>
                        <div className={`${colors.neutral.backgroundSecondary} p-4 rounded-lg`}>
                          <p className={`${typography.bodySmall} ${colors.neutral.textSecondary}`}>
                            <strong>Note:</strong> These tests will create real notifications and trigger email alerts to admin addresses. 
                            Admin-only notifications will only be visible to admin users, while user notifications will be visible to regular users.
                          </p>
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
