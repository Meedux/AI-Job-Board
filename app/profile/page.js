'use client';

import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { colors, typography, components, layout } from '../../utils/designSystem';

export default function ProfilePage() {
  const { user } = useAuth();
  const [isEditing, setIsEditing] = useState(false);
  const [formData, setFormData] = useState({
    fullName: user?.fullName || '',
    nickname: user?.nickname || '',
    email: user?.email || '',
    dateOfBirth: user?.dateOfBirth || '',
    fullAddress: user?.fullAddress || '',
  });

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    // TODO: Implement profile update API
    console.log('Profile update:', formData);
    setIsEditing(false);
  };

  const handleCancel = () => {
    setFormData({
      fullName: user?.fullName || '',
      nickname: user?.nickname || '',
      email: user?.email || '',
      dateOfBirth: user?.dateOfBirth || '',
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
                  <div className={`w-20 h-20 ${colors.primary[500]} rounded-full flex items-center justify-center text-white text-2xl font-bold`}>
                    {user?.nickname ? user.nickname.charAt(0).toUpperCase() : user?.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className={`${typography.h4} ${colors.neutral.textPrimary}`}>
                      {user?.fullName}
                    </h3>
                    <p className={`${typography.bodyBase} ${colors.neutral.textSecondary}`}>
                      {user?.email}
                    </p>
                  </div>
                </div>

                {/* Form Fields */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div>
                    <label className={`block ${typography.bodyBase} font-medium ${colors.neutral.textPrimary} mb-2`}>
                      Full Name
                    </label>
                    <input
                      type="text"
                      name="fullName"
                      value={formData.fullName}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`${components.input.base} ${!isEditing ? 'bg-gray-50' : ''}`}
                    />
                  </div>

                  <div>
                    <label className={`block ${typography.bodyBase} font-medium ${colors.neutral.textPrimary} mb-2`}>
                      Nickname
                    </label>
                    <input
                      type="text"
                      name="nickname"
                      value={formData.nickname}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`${components.input.base} ${!isEditing ? 'bg-gray-50' : ''}`}
                    />
                  </div>

                  <div>
                    <label className={`block ${typography.bodyBase} font-medium ${colors.neutral.textPrimary} mb-2`}>
                      Email
                    </label>
                    <input
                      type="email"
                      name="email"
                      value={formData.email}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`${components.input.base} ${!isEditing ? 'bg-gray-50' : ''}`}
                    />
                  </div>

                  <div>
                    <label className={`block ${typography.bodyBase} font-medium ${colors.neutral.textPrimary} mb-2`}>
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      name="dateOfBirth"
                      value={formData.dateOfBirth}
                      onChange={handleChange}
                      disabled={!isEditing}
                      className={`${components.input.base} ${!isEditing ? 'bg-gray-50' : ''}`}
                    />
                  </div>
                </div>

                <div>
                  <label className={`block ${typography.bodyBase} font-medium ${colors.neutral.textPrimary} mb-2`}>
                    Full Address
                  </label>
                  <textarea
                    name="fullAddress"
                    rows="3"
                    value={formData.fullAddress}
                    onChange={handleChange}
                    disabled={!isEditing}
                    className={`${components.input.base} ${!isEditing ? 'bg-gray-50' : ''}`}
                  />
                </div>

                {isEditing && (
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className={`${components.button.base} ${components.button.primary} ${components.button.sizes.medium}`}
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className={`${components.button.base} ${components.button.secondary} ${components.button.sizes.medium}`}
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
