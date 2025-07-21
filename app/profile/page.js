'use client';

import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { useSubscription } from '../../contexts/SubscriptionContext';
import { maskUserData, canUseContentMasking } from '../../utils/userContentMasking';
import { colors, typography, components, layout, combineClasses } from '../../utils/designSystem';

export default function ProfilePage() {
  const { user, updateProfile } = useAuth();
  const { subscription } = useSubscription();
  const [isEditing, setIsEditing] = useState(false);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    nickname: user?.nickname || '',
    email: user?.email || '',
    dateOfBirth: user?.dateOfBirth || '',
    fullAddress: user?.fullAddress || '',
  });
  const [contentMasking, setContentMasking] = useState(false);
  const [canUseMasking, setCanUseMasking] = useState(false);
  const [maskingLoading, setMaskingLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [profileLoading, setProfileLoading] = useState(false);

  // Function to fetch fresh user profile data
  const fetchUserProfile = async () => {
    try {
      setProfileLoading(true);
      const response = await fetch('/api/user/profile');
      if (response.ok) {
        const data = await response.json();
        if (data.success && data.user) {
          // Format date for input field
          const formattedUser = {
            ...data.user,
            dateOfBirth: data.user.dateOfBirth ? 
              new Date(data.user.dateOfBirth).toISOString().split('T')[0] : ''
          };
          
          setFormData({
            fullName: formattedUser.fullName || '',
            nickname: formattedUser.nickname || '',
            email: formattedUser.email || '',
            dateOfBirth: formattedUser.dateOfBirth || '',
            fullAddress: formattedUser.fullAddress || '',
          });
        }
      }
    } catch (error) {
      console.error('Error fetching user profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  useEffect(() => {
    if (user) {
      // Format date for input field
      const formattedDateOfBirth = user.dateOfBirth ? 
        new Date(user.dateOfBirth).toISOString().split('T')[0] : '';
      
      setFormData({
        fullName: user?.fullName || '',
        nickname: user?.nickname || '',
        email: user?.email || '',
        dateOfBirth: formattedDateOfBirth,
        fullAddress: user?.fullAddress || '',
      });
      
      // Load content masking settings
      loadContentMaskingSettings();
      
      // Also fetch fresh profile data to ensure we have the latest information
      fetchUserProfile();
    }
  }, [user]);

  const loadContentMaskingSettings = async () => {
    try {
      const response = await fetch('/api/user/content-masking');
      if (response.ok) {
        const data = await response.json();
        console.log('Content masking data:', data); // Debug log
        setContentMasking(data.contentMasking);
        setCanUseMasking(data.canUseMasking);
      } else {
        console.error('Failed to load content masking settings:', response.status);
      }
    } catch (error) {
      console.error('Error loading content masking settings:', error);
    }
  };

  const handleContentMaskingToggle = async (enabled) => {
    if (!canUseMasking && enabled) {
      setMessage('Content masking is a premium feature. Please upgrade your subscription.');
      return;
    }

    setMaskingLoading(true);
    try {
      const response = await fetch('/api/user/content-masking', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contentMasking: enabled }),
      });

      const data = await response.json();

      if (response.ok) {
        setContentMasking(data.contentMasking);
        setMessage(data.message);
      } else {
        setMessage(data.error || 'Failed to update content masking setting');
      }
    } catch (error) {
      console.error('Error updating content masking:', error);
      setMessage('An error occurred while updating content masking setting');
    } finally {
      setMaskingLoading(false);
    }
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Prepare data for update (exclude email as it shouldn't be changed here)
      const updateData = {
        fullName: formData.fullName,
        nickname: formData.nickname,
        dateOfBirth: formData.dateOfBirth,
        fullAddress: formData.fullAddress,
      };

      // Call the updateProfile method from AuthContext
      const result = await updateProfile(updateData);

      if (result.success) {
        setMessage('Profile updated successfully!');
        setIsEditing(false);
        
        // Fetch fresh profile data to ensure form is updated with latest info
        await fetchUserProfile();
        
        // Clear success message after 3 seconds
        setTimeout(() => {
          setMessage('');
        }, 3000);
      } else {
        setMessage(result.error || 'Failed to update profile');
      }
    } catch (error) {
      console.error('Error updating profile:', error);
      setMessage('An unexpected error occurred while updating your profile');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    // Reset form data with properly formatted date
    const formattedDateOfBirth = user?.dateOfBirth ? 
      new Date(user.dateOfBirth).toISOString().split('T')[0] : '';
    
    setFormData({
      fullName: user?.fullName || '',
      nickname: user?.nickname || '',
      email: user?.email || '',
      dateOfBirth: formattedDateOfBirth,
      fullAddress: user?.fullAddress || '',
    });
    setIsEditing(false);
  };

  return (
    <ProtectedRoute>
      <div className={`min-h-screen ${colors.neutral.background} font-sans`}>
        <Header />
        
        <main className={layout.container}>
          <div className="max-w-4xl mx-auto py-12">
            <div className={`${components.card.base} ${components.card.padding}`}>
              <div className="flex justify-between items-center mb-8">
                <h1 className={`${typography.h2} ${colors.neutral.textPrimary}`}>
                  Profile Settings
                </h1>
                {!isEditing && (
                  <button
                    onClick={() => setIsEditing(true)}
                    className={`${components.button.base} ${components.button.secondary} ${components.button.sizes.medium}`}
                  >
                    Edit Profile
                  </button>
                )}
              </div>

              <form onSubmit={handleSave} className="space-y-6">
                {/* Profile Avatar */}
                <div className="flex items-center space-x-6">
                  <div className={combineClasses(
                    'w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold',
                    colors.primary[500]
                  )}>
                    {(formData.nickname || formData.fullName) ? 
                      (formData.nickname || formData.fullName).charAt(0).toUpperCase() : 
                      '?'
                    }
                  </div>
                  <div>
                    <h3 className={combineClasses(typography.h4, colors.neutral.textPrimary)}>
                      {formData.fullName || 'No name set'}
                    </h3>
                    <p className={combineClasses(typography.bodyBase, colors.neutral.textSecondary)}>
                      {formData.email}
                    </p>
                    {formData.nickname && (
                      <p className={combineClasses(typography.bodySmall, colors.neutral.textSecondary)}>
                        Nickname: {formData.nickname}
                      </p>
                    )}
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={combineClasses(components.label.base)}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      disabled={!isEditing || loading}
                      className={combineClasses(
                        components.input.base,
                        (!isEditing || loading) && colors.neutral.backgroundSecondary
                      )}
                    />
                  </div>

                  <div>
                    <label className={combineClasses(components.label.base)}>
                      Nickname
                    </label>
                    <input
                      type="text"
                      name="nickname"
                      value={formData.nickname}
                      onChange={handleChange}
                      disabled={!isEditing || loading}
                      className={combineClasses(
                        components.input.base,
                        (!isEditing || loading) && colors.neutral.backgroundSecondary
                      )}
                    />
                  </div>

                  <div>
                    <label className={combineClasses(components.label.base)}>
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={true}
                      className={combineClasses(
                        components.input.base,
                        colors.neutral.backgroundSecondary
                      )}
                    />
                    <p className="text-sm text-gray-400 mt-1">
                      Email cannot be changed here. Contact support if you need to update your email.
                    </p>
                  </div>

                  <div>
                    <label className={combineClasses(components.label.base)}>
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      disabled={!isEditing || loading}
                      className={combineClasses(
                        components.input.base,
                        (!isEditing || loading) && colors.neutral.backgroundSecondary
                      )}
                    />
                  </div>
                </div>

                <div>
                  <label className={combineClasses(components.label.base)}>
                    Full Address
                  </label>
                  <textarea
                    name="fullAddress"
                    rows="3"
                    value={formData.fullAddress}
                    onChange={handleChange}
                    disabled={!isEditing || loading}
                    className={combineClasses(
                      components.input.base,
                      (!isEditing || loading) && colors.neutral.backgroundSecondary
                    )}
                  />
                </div>

                {/* Success/Error Message */}
                {message && (
                  <div className={`p-4 rounded-lg border ${
                    message.includes('successfully') 
                      ? 'bg-green-900 text-green-300 border-green-700' 
                      : 'bg-red-900 text-red-300 border-red-700'
                  }`}>
                    {message}
                  </div>
                )}

                {/* Privacy Settings Section */}
                <div className="mt-8 pt-8 border-t border-gray-700">
                  <h3 className={`${typography.h4} text-white mb-4`}>
                    Privacy Settings
                  </h3>
                  
                  {/* Content Masking Toggle */}
                  <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
                    <div className="flex items-center justify-between">
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className={`${typography.bodyLarge} text-white`}>
                            Content Masking
                          </h4>
                          {!canUseMasking && (
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-900 text-yellow-300 border border-yellow-700">
                              Premium Only
                            </span>
                          )}
                        </div>
                        <p className={`${typography.bodySmall} text-gray-300 mt-1`}>
                          Hide sensitive information like email and contact details when viewing your profile. 
                          {!canUseMasking && ' This feature is available for Basic, Premium, and Enterprise subscribers.'}
                        </p>
                      </div>
                      <div className="ml-4">
                        <button
                          type="button"
                          onClick={() => handleContentMaskingToggle(!contentMasking)}
                          disabled={maskingLoading || !canUseMasking}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors focus:outline-none focus:ring-2 focus:ring-indigo-400 focus:ring-offset-2 focus:ring-offset-gray-900 ${
                            contentMasking 
                              ? 'bg-indigo-600' 
                              : canUseMasking 
                                ? 'bg-gray-600' 
                                : 'bg-gray-700 cursor-not-allowed'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-gray-200 transition-transform ${
                              contentMasking ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                    
                    {/* Show masked preview if enabled */}
                    {contentMasking && (
                      <div className="mt-4 pt-4 border-t border-gray-700">
                        <p className={`${typography.bodySmall} text-gray-400 mb-2`}>
                          Preview (how others see your information):
                        </p>
                        <div className="bg-gray-900 p-3 rounded border border-gray-600 text-sm">
                          {(() => {
                            const maskedData = maskUserData({
                              fullName: formData.fullName,
                              email: formData.email,
                              fullAddress: formData.fullAddress
                            }, true);
                            return (
                              <div className="space-y-1">
                                <div className="text-gray-300"><strong className="text-white">Name:</strong> {maskedData.fullName}</div>
                                <div className="text-gray-300"><strong className="text-white">Email:</strong> {maskedData.email}</div>
                                {maskedData.fullAddress && (
                                  <div className="text-gray-300"><strong className="text-white">Address:</strong> {maskedData.fullAddress}</div>
                                )}
                              </div>
                            );
                          })()}
                        </div>
                      </div>
                    )}
                  </div>
                  
                  {/* Message Display */}
                  {message && (
                    <div className={`mt-4 p-3 rounded-md ${
                      message.includes('error') || message.includes('Failed') 
                        ? 'bg-red-900 text-red-300 border border-red-700' 
                        : 'bg-green-900 text-green-300 border border-green-700'
                    }`}>
                      {message}
                    </div>
                  )}
                </div>

                {isEditing && (
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      disabled={loading}
                      className={combineClasses(
                        components.button.base,
                        components.button.primary,
                        components.button.sizes.medium,
                        loading && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      {loading ? (
                        <div className="flex items-center">
                          <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                          Saving...
                        </div>
                      ) : (
                        'Save Changes'
                      )}
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      disabled={loading}
                      className={combineClasses(
                        components.button.base,
                        components.button.secondary,
                        components.button.sizes.medium,
                        loading && 'opacity-50 cursor-not-allowed'
                      )}
                    >
                      Cancel
                    </button>
                  </div>
                )}
              </form>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
