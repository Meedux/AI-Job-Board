"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { Eye, EyeOff, Shield, Trash2, Download, Settings, User, Bell, Lock, AlertTriangle } from 'lucide-react';

export default function JobSeekerDashboard() {
  const { user } = useAuth();
  const [privacySettings, setPrivacySettings] = useState({
    showSensitiveInfo: false,
    profileVisibility: 'public',
    hideProfile: false,
    hideContactInfo: true,
    hideEmail: true,
    hidePhone: true,
    hideAddress: true,
    emailNotifications: true,
    jobAlerts: true,
    resumeAlerts: true,
    marketingEmails: false,
    accountStatus: 'active'
  });
  
  const [isLoading, setIsLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [showDeactivateModal, setShowDeactivateModal] = useState(false);
  const [deleteReason, setDeleteReason] = useState('');
  const [deleteReasonDetails, setDeleteReasonDetails] = useState('');
  const [isUpdating, setIsUpdating] = useState(false);
  const [activeTab, setActiveTab] = useState('privacy');

  useEffect(() => {
    fetchPrivacySettings();
  }, []);

  const fetchPrivacySettings = async () => {
    try {
      const response = await fetch('/api/users/privacy-settings');
      if (response.ok) {
        const data = await response.json();
        setPrivacySettings(data);
      }
    } catch (error) {
      console.error('Error fetching privacy settings:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const updatePrivacySetting = async (key, value) => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/users/privacy-settings', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ [key]: value }),
      });

      if (response.ok) {
        setPrivacySettings(prev => ({ ...prev, [key]: value }));
      }
    } catch (error) {
      console.error('Error updating privacy setting:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAccountDeactivation = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/users/account-actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'deactivate' }),
      });

      if (response.ok) {
        setPrivacySettings(prev => ({ ...prev, accountStatus: 'deactivated' }));
        setShowDeactivateModal(false);
      }
    } catch (error) {
      console.error('Error deactivating account:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAccountReactivation = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/users/account-actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ action: 'reactivate' }),
      });

      if (response.ok) {
        setPrivacySettings(prev => ({ ...prev, accountStatus: 'active' }));
      }
    } catch (error) {
      console.error('Error reactivating account:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAccountDeletion = async () => {
    setIsUpdating(true);
    try {
      const response = await fetch('/api/users/account-actions', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ 
          action: 'delete',
          reason: deleteReason,
          reasonDetails: deleteReasonDetails
        }),
      });

      if (response.ok) {
        setShowDeleteModal(false);
        // Show success message and redirect
        alert('Account deletion request submitted. You will receive a confirmation email.');
        window.location.href = '/';
      }
    } catch (error) {
      console.error('Error requesting account deletion:', error);
    } finally {
      setIsUpdating(false);
    }
  };

  const handleDataExport = async () => {
    try {
      const response = await fetch('/api/users/data-export', {
        method: 'POST',
      });

      if (response.ok) {
        const blob = await response.blob();
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${user.email}-data-export.json`;
        a.click();
        window.URL.revokeObjectURL(url);
      }
    } catch (error) {
      console.error('Error exporting data:', error);
    }
  };

  const togglePrivacySetting = (key) => {
    const newValue = !privacySettings[key];
    updatePrivacySetting(key, newValue);
  };

  const handleVisibilityChange = (value) => {
    updatePrivacySetting('profileVisibility', value);
  };

  if (isLoading) {
    return (
      <div className="flex justify-center items-center min-h-screen">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-600"></div>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto p-6 bg-white">
      <div className="bg-white rounded-lg shadow-lg">
        <div className="border-b border-gray-200">
          <div className="p-6">
            <h1 className="text-2xl font-bold text-gray-900">Job Seeker Dashboard</h1>
            <p className="text-gray-600 mt-2">Manage your privacy settings and account preferences</p>
          </div>
          
          <div className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('privacy')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'privacy'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Shield className="inline w-4 h-4 mr-2" />
              Privacy Settings
            </button>
            <button
              onClick={() => setActiveTab('notifications')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'notifications'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <Bell className="inline w-4 h-4 mr-2" />
              Notifications
            </button>
            <button
              onClick={() => setActiveTab('account')}
              className={`py-4 px-2 border-b-2 font-medium text-sm ${
                activeTab === 'account'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700'
              }`}
            >
              <User className="inline w-4 h-4 mr-2" />
              Account Management
            </button>
          </div>
        </div>

        <div className="p-6">
          {activeTab === 'privacy' && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-2">Profile Visibility</h3>
                <div className="space-y-3">
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="profileVisibility"
                      value="public"
                      checked={privacySettings.profileVisibility === 'public'}
                      onChange={() => handleVisibilityChange('public')}
                      className="mr-3"
                    />
                    <span className="text-sm">Public - Visible to all users and employers</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="profileVisibility"
                      value="private"
                      checked={privacySettings.profileVisibility === 'private'}
                      onChange={() => handleVisibilityChange('private')}
                      className="mr-3"
                    />
                    <span className="text-sm">Private - Only visible to you</span>
                  </label>
                  <label className="flex items-center">
                    <input
                      type="radio"
                      name="profileVisibility"
                      value="premium_only"
                      checked={privacySettings.profileVisibility === 'premium_only'}
                      onChange={() => handleVisibilityChange('premium_only')}
                      className="mr-3"
                    />
                    <span className="text-sm">Premium Only - Only visible to premium employers</span>
                  </label>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Sensitive Information Display</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium text-gray-700">Show Sensitive Information</label>
                      <p className="text-sm text-gray-500">Display contact details and personal information</p>
                    </div>
                    <button
                      onClick={() => togglePrivacySetting('showSensitiveInfo')}
                      disabled={isUpdating}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        privacySettings.showSensitiveInfo ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          privacySettings.showSensitiveInfo ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium text-gray-700">Hide Contact Information</label>
                      <p className="text-sm text-gray-500">Hide email, phone, and address from public view</p>
                    </div>
                    <button
                      onClick={() => togglePrivacySetting('hideContactInfo')}
                      disabled={isUpdating}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        privacySettings.hideContactInfo ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          privacySettings.hideContactInfo ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium text-gray-700">Hide Email Address</label>
                      <p className="text-sm text-gray-500">Hide your email from employer searches</p>
                    </div>
                    <button
                      onClick={() => togglePrivacySetting('hideEmail')}
                      disabled={isUpdating}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        privacySettings.hideEmail ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          privacySettings.hideEmail ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium text-gray-700">Hide Phone Number</label>
                      <p className="text-sm text-gray-500">Hide your phone number from public view</p>
                    </div>
                    <button
                      onClick={() => togglePrivacySetting('hidePhone')}
                      disabled={isUpdating}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        privacySettings.hidePhone ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          privacySettings.hidePhone ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium text-gray-700">Hide Address</label>
                      <p className="text-sm text-gray-500">Hide your address from public view</p>
                    </div>
                    <button
                      onClick={() => togglePrivacySetting('hideAddress')}
                      disabled={isUpdating}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        privacySettings.hideAddress ? 'bg-blue-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          privacySettings.hideAddress ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="space-y-6">
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-900 mb-4">Email Notifications</h3>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium text-gray-700">Email Notifications</label>
                      <p className="text-sm text-gray-500">Receive general email notifications</p>
                    </div>
                    <button
                      onClick={() => togglePrivacySetting('emailNotifications')}
                      disabled={isUpdating}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        privacySettings.emailNotifications ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          privacySettings.emailNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium text-gray-700">Job Alerts</label>
                      <p className="text-sm text-gray-500">Get notified about new job opportunities</p>
                    </div>
                    <button
                      onClick={() => togglePrivacySetting('jobAlerts')}
                      disabled={isUpdating}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        privacySettings.jobAlerts ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          privacySettings.jobAlerts ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium text-gray-700">Resume Alerts</label>
                      <p className="text-sm text-gray-500">Get notified when employers view your resume</p>
                    </div>
                    <button
                      onClick={() => togglePrivacySetting('resumeAlerts')}
                      disabled={isUpdating}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        privacySettings.resumeAlerts ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          privacySettings.resumeAlerts ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>

                  <div className="flex items-center justify-between">
                    <div>
                      <label className="font-medium text-gray-700">Marketing Emails</label>
                      <p className="text-sm text-gray-500">Receive promotional emails and newsletters</p>
                    </div>
                    <button
                      onClick={() => togglePrivacySetting('marketingEmails')}
                      disabled={isUpdating}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                        privacySettings.marketingEmails ? 'bg-green-600' : 'bg-gray-200'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                          privacySettings.marketingEmails ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          )}

          {activeTab === 'account' && (
            <div className="space-y-6">
              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <h3 className="font-semibold text-gray-900 mb-4">Account Status</h3>
                <div className="flex items-center mb-4">
                  <div className={`w-3 h-3 rounded-full mr-3 ${
                    privacySettings.accountStatus === 'active' ? 'bg-green-500' : 'bg-yellow-500'
                  }`}></div>
                  <span className="font-medium capitalize">{privacySettings.accountStatus}</span>
                </div>
                
                {privacySettings.accountStatus === 'active' && (
                  <button
                    onClick={() => setShowDeactivateModal(true)}
                    className="bg-yellow-600 text-white px-4 py-2 rounded-md hover:bg-yellow-700 transition-colors"
                  >
                    Deactivate Account
                  </button>
                )}
                
                {privacySettings.accountStatus === 'deactivated' && (
                  <button
                    onClick={handleAccountReactivation}
                    disabled={isUpdating}
                    className="bg-green-600 text-white px-4 py-2 rounded-md hover:bg-green-700 transition-colors disabled:opacity-50"
                  >
                    Reactivate Account
                  </button>
                )}
              </div>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <h3 className="font-semibold text-blue-900 mb-4">Data Management</h3>
                <div className="space-y-3">
                  <button
                    onClick={handleDataExport}
                    className="flex items-center bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors"
                  >
                    <Download className="w-4 h-4 mr-2" />
                    Export My Data
                  </button>
                  <p className="text-sm text-blue-700">
                    Download a copy of all your data including profile information, applications, and activity history.
                  </p>
                </div>
              </div>

              <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <h3 className="font-semibold text-red-900 mb-4">
                  <AlertTriangle className="inline w-5 h-5 mr-2" />
                  Danger Zone
                </h3>
                <div className="space-y-3">
                  <button
                    onClick={() => setShowDeleteModal(true)}
                    className="flex items-center bg-red-600 text-white px-4 py-2 rounded-md hover:bg-red-700 transition-colors"
                  >
                    <Trash2 className="w-4 h-4 mr-2" />
                    Delete Account
                  </button>
                  <p className="text-sm text-red-700">
                    Permanently delete your account and all associated data. This action cannot be undone.
                  </p>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Deactivate Account Modal */}
      {showDeactivateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4">Deactivate Account</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to deactivate your account? You can reactivate it later.
            </p>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => setShowDeactivateModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAccountDeactivation}
                disabled={isUpdating}
                className="px-4 py-2 bg-yellow-600 text-white rounded-md hover:bg-yellow-700 disabled:opacity-50"
              >
                {isUpdating ? 'Deactivating...' : 'Deactivate'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Account Modal */}
      {showDeleteModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg max-w-md w-full p-6">
            <h3 className="text-lg font-semibold mb-4 text-red-600">Delete Account</h3>
            <p className="text-gray-600 mb-4">
              This action cannot be undone. All your data will be permanently deleted.
            </p>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Reason for deletion (optional)
                </label>
                <select
                  value={deleteReason}
                  onChange={(e) => setDeleteReason(e.target.value)}
                  className="w-full p-2 border border-gray-300 rounded-md"
                >
                  <option value="">Select a reason</option>
                  <option value="privacy">Privacy concerns</option>
                  <option value="not_useful">Not useful</option>
                  <option value="found_job">Found a job</option>
                  <option value="other">Other</option>
                </select>
              </div>
              {deleteReason === 'other' && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Please specify
                  </label>
                  <textarea
                    value={deleteReasonDetails}
                    onChange={(e) => setDeleteReasonDetails(e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded-md"
                    rows="3"
                    placeholder="Tell us more about your reason..."
                  />
                </div>
              )}
            </div>
            <div className="flex justify-end space-x-3 mt-6">
              <button
                onClick={() => setShowDeleteModal(false)}
                className="px-4 py-2 border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={handleAccountDeletion}
                disabled={isUpdating}
                className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 disabled:opacity-50"
              >
                {isUpdating ? 'Deleting...' : 'Delete Account'}
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
