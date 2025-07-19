// Enhanced Dashboard Component with Privacy Settings
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useSubscription } from '../contexts/SubscriptionContext';
import { colors, typography, components, layout, spacing, gradients, combineClasses, animations } from '../utils/designSystem';

export default function PrivacyDashboard() {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [activeTab, setActiveTab] = useState('privacy');
  
  // Privacy settings state
  const [privacySettings, setPrivacySettings] = useState({
    showSensitiveInfo: false,
    profileVisibility: 'public',
    hideProfile: false,
    hideContactInfo: true,
    hideEmail: true,
    hidePhone: true,
    hideAddress: true,
    accountStatus: 'active',
    dataRetention: true,
    marketingOptIn: false
  });

  // Notification preferences state
  const [notificationSettings, setNotificationSettings] = useState({
    emailNotifications: true,
    jobAlerts: true,
    resumeAlerts: true,
    marketingEmails: false,
    emailJobAlerts: true,
    emailResumeAlerts: true,
    emailApplications: true,
    emailMessages: true,
    emailAnnouncements: true,
    emailMarketing: false,
    pushJobAlerts: true,
    pushApplications: true,
    pushMessages: true
  });

  // Load user settings
  useEffect(() => {
    if (user) {
      loadUserSettings();
    }
  }, [user]);

  const loadUserSettings = async () => {
    try {
      const [privacyRes, notificationRes] = await Promise.all([
        fetch('/api/user/privacy-settings'),
        fetch('/api/user/notification-settings')
      ]);

      if (privacyRes.ok) {
        const privacyData = await privacyRes.json();
        setPrivacySettings(prev => ({ ...prev, ...privacyData }));
      }

      if (notificationRes.ok) {
        const notificationData = await notificationRes.json();
        setNotificationSettings(prev => ({ ...prev, ...notificationData }));
      }
    } catch (error) {
      console.error('Error loading user settings:', error);
    } finally {
      setLoading(false);
    }
  };

  const saveSettings = async (settingsType, settings) => {
    setSaving(true);
    try {
      const response = await fetch(`/api/user/${settingsType}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(settings)
      });

      if (response.ok) {
        console.log(`${settingsType} settings saved successfully`);
      } else {
        console.error(`Failed to save ${settingsType} settings`);
      }
    } catch (error) {
      console.error(`Error saving ${settingsType} settings:`, error);
    } finally {
      setSaving(false);
    }
  };

  const handlePrivacyChange = (setting, value) => {
    const newSettings = { ...privacySettings, [setting]: value };
    setPrivacySettings(newSettings);
    saveSettings('privacy-settings', newSettings);
  };

  const handleNotificationChange = (setting, value) => {
    const newSettings = { ...notificationSettings, [setting]: value };
    setNotificationSettings(newSettings);
    saveSettings('notification-settings', newSettings);
  };

  const handleAccountAction = async (action) => {
    if (!confirm(`Are you sure you want to ${action} your account? This action cannot be undone.`)) {
      return;
    }

    try {
      const response = await fetch(`/api/user/account-action`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action })
      });

      if (response.ok) {
        alert(`Account ${action} successfully`);
        if (action === 'delete') {
          window.location.href = '/';
        }
      } else {
        alert(`Failed to ${action} account`);
      }
    } catch (error) {
      console.error(`Error ${action} account:`, error);
      alert(`Error ${action} account`);
    }
  };

  const tabs = [
    { id: 'privacy', label: 'Privacy & Security', icon: '🔒' },
    { id: 'notifications', label: 'Notifications', icon: '🔔' },
    { id: 'account', label: 'Account Management', icon: '⚙️' }
  ];

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <div className="max-w-6xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Privacy & Settings Dashboard</h1>
          <p className="text-gray-400">Manage your privacy, notifications, and account settings</p>
        </div>

        {/* Tabs */}
        <div className="mb-8">
          <div className="flex space-x-1 bg-gray-800 p-1 rounded-lg">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={`flex items-center gap-2 px-4 py-2 rounded-md transition-all duration-200 ${
                  activeTab === tab.id
                    ? 'bg-blue-600 text-white shadow-lg'
                    : 'text-gray-400 hover:text-white hover:bg-gray-700'
                }`}
              >
                <span>{tab.icon}</span>
                <span className="font-medium">{tab.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Tab Content */}
        <div className="bg-gray-800 rounded-xl p-6">
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Privacy & Security Settings</h2>
              
              {/* Sensitive Information */}
              <div className="border-b border-gray-700 pb-6">
                <h3 className="text-lg font-medium text-white mb-3">Content Visibility</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">Show Sensitive Information</label>
                      <p className="text-sm text-gray-400">Display email addresses, phone numbers, and other contact details</p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={privacySettings.showSensitiveInfo}
                        onChange={(e) => handlePrivacyChange('showSensitiveInfo', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">Profile Visibility</label>
                      <p className="text-sm text-gray-400">Control who can see your profile</p>
                    </div>
                    <select
                      value={privacySettings.profileVisibility}
                      onChange={(e) => handlePrivacyChange('profileVisibility', e.target.value)}
                      className="bg-gray-700 border border-gray-600 text-white rounded-md px-3 py-2"
                    >
                      <option value="public">Public</option>
                      <option value="private">Private</option>
                      <option value="premium_only">Premium Users Only</option>
                    </select>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">Hide Profile</label>
                      <p className="text-sm text-gray-400">Completely hide your profile from search results</p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={privacySettings.hideProfile}
                        onChange={(e) => handlePrivacyChange('hideProfile', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Contact Information */}
              <div className="border-b border-gray-700 pb-6">
                <h3 className="text-lg font-medium text-white mb-3">Contact Information</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">Hide Contact Information</label>
                      <p className="text-sm text-gray-400">Hide all contact details from non-premium users</p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={privacySettings.hideContactInfo}
                        onChange={(e) => handlePrivacyChange('hideContactInfo', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">Hide Email Address</label>
                      <p className="text-sm text-gray-400">Hide your email from public view</p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={privacySettings.hideEmail}
                        onChange={(e) => handlePrivacyChange('hideEmail', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">Hide Phone Number</label>
                      <p className="text-sm text-gray-400">Hide your phone number from public view</p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={privacySettings.hidePhone}
                        onChange={(e) => handlePrivacyChange('hidePhone', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">Hide Address</label>
                      <p className="text-sm text-gray-400">Hide your address from public view</p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={privacySettings.hideAddress}
                        onChange={(e) => handlePrivacyChange('hideAddress', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Data Privacy */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Data Privacy</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">Data Retention</label>
                      <p className="text-sm text-gray-400">Allow us to retain your data for service improvement</p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={privacySettings.dataRetention}
                        onChange={(e) => handlePrivacyChange('dataRetention', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">Marketing Communications</label>
                      <p className="text-sm text-gray-400">Receive marketing emails and promotional content</p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={privacySettings.marketingOptIn}
                        onChange={(e) => handlePrivacyChange('marketingOptIn', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Notification Preferences</h2>
              
              {/* Email Notifications */}
              <div className="border-b border-gray-700 pb-6">
                <h3 className="text-lg font-medium text-white mb-3">Email Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">Enable Email Notifications</label>
                      <p className="text-sm text-gray-400">Receive all notifications via email</p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailNotifications}
                        onChange={(e) => handleNotificationChange('emailNotifications', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">Job Alerts</label>
                      <p className="text-sm text-gray-400">Get notified about new job opportunities</p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailJobAlerts}
                        onChange={(e) => handleNotificationChange('emailJobAlerts', e.target.checked)}
                        disabled={!notificationSettings.emailNotifications}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 disabled:opacity-50"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">Resume Alerts</label>
                      <p className="text-sm text-gray-400">Get notified about resume views and matches</p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailResumeAlerts}
                        onChange={(e) => handleNotificationChange('emailResumeAlerts', e.target.checked)}
                        disabled={!notificationSettings.emailNotifications}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 disabled:opacity-50"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">Application Updates</label>
                      <p className="text-sm text-gray-400">Get notified about application status changes</p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailApplications}
                        onChange={(e) => handleNotificationChange('emailApplications', e.target.checked)}
                        disabled={!notificationSettings.emailNotifications}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 disabled:opacity-50"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">Marketing Emails</label>
                      <p className="text-sm text-gray-400">Receive promotional content and newsletters</p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notificationSettings.emailMarketing}
                        onChange={(e) => handleNotificationChange('emailMarketing', e.target.checked)}
                        disabled={!notificationSettings.emailNotifications}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500 disabled:opacity-50"
                      />
                    </div>
                  </div>
                </div>
              </div>

              {/* Push Notifications */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Push Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">Job Alerts</label>
                      <p className="text-sm text-gray-400">Get push notifications for new jobs</p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notificationSettings.pushJobAlerts}
                        onChange={(e) => handleNotificationChange('pushJobAlerts', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">Application Updates</label>
                      <p className="text-sm text-gray-400">Get push notifications for application changes</p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notificationSettings.pushApplications}
                        onChange={(e) => handleNotificationChange('pushApplications', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      />
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">Messages</label>
                      <p className="text-sm text-gray-400">Get push notifications for new messages</p>
                    </div>
                    <div className="flex items-center">
                      <input
                        type="checkbox"
                        checked={notificationSettings.pushMessages}
                        onChange={(e) => handleNotificationChange('pushMessages', e.target.checked)}
                        className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-6">
              <h2 className="text-xl font-semibold text-white mb-4">Account Management</h2>
              
              {/* Account Status */}
              <div className="border-b border-gray-700 pb-6">
                <h3 className="text-lg font-medium text-white mb-3">Account Status</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">Current Status</label>
                      <p className="text-sm text-gray-400">Your account is currently active</p>
                    </div>
                    <span className="px-3 py-1 bg-green-900 text-green-300 rounded-full text-sm font-medium">
                      Active
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">Member Since</label>
                      <p className="text-sm text-gray-400">
                        {user?.createdAt ? new Date(user.createdAt).toLocaleDateString() : 'N/A'}
                      </p>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">Subscription</label>
                      <p className="text-sm text-gray-400">
                        {subscription?.plan?.name || 'Free Plan'}
                      </p>
                    </div>
                    {subscription?.plan?.planType !== 'free' && (
                      <span className="px-3 py-1 bg-blue-900 text-blue-300 rounded-full text-sm font-medium">
                        Premium
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {/* Account Actions */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Account Actions</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">Deactivate Account</label>
                      <p className="text-sm text-gray-400">
                        Temporarily deactivate your account. You can reactivate it later.
                      </p>
                    </div>
                    <button
                      onClick={() => handleAccountAction('deactivate')}
                      className="px-4 py-2 bg-yellow-600 hover:bg-yellow-700 text-white rounded-md font-medium transition-colors duration-200"
                    >
                      Deactivate
                    </button>
                  </div>
                  
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="text-white font-medium">Delete Account</label>
                      <p className="text-sm text-gray-400">
                        Permanently delete your account and all associated data. This action cannot be undone.
                      </p>
                    </div>
                    <button
                      onClick={() => handleAccountAction('delete')}
                      className="px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded-md font-medium transition-colors duration-200"
                    >
                      Delete Account
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
