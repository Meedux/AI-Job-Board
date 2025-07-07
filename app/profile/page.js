'use client';

import { useState } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProtectedRoute from '../../components/ProtectedRoute';
import { useAuth } from '../../contexts/AuthContext';
import { colors, typography, components, layout, combineClasses } from '../../utils/designSystem';

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
                  <div className={combineClasses(
                    'w-20 h-20 rounded-full flex items-center justify-center text-white text-2xl font-bold',
                    colors.primary[500]
                  )}>
                    {user?.nickname ? user.nickname.charAt(0).toUpperCase() : user?.fullName.charAt(0).toUpperCase()}
                  </div>
                  <div>
                    <h3 className={combineClasses(typography.h4, colors.neutral.textPrimary)}>
                      {user?.fullName}
                    </h3>
                    <p className={combineClasses(typography.bodyBase, colors.neutral.textSecondary)}>
                      {user?.email}
                    </p>
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
                      disabled={!isEditing}
                      className={combineClasses(
                        components.input.base,
                        !isEditing && colors.neutral.backgroundSecondary
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
                      disabled={!isEditing}
                      className={combineClasses(
                        components.input.base,
                        !isEditing && colors.neutral.backgroundSecondary
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
                      disabled={!isEditing}
                      className={combineClasses(
                        components.input.base,
                        !isEditing && colors.neutral.backgroundSecondary
                      )}
                    />
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
                      disabled={!isEditing}
                      className={combineClasses(
                        components.input.base,
                        !isEditing && colors.neutral.backgroundSecondary
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
                    disabled={!isEditing}
                    className={combineClasses(
                      components.input.base,
                      !isEditing && colors.neutral.backgroundSecondary
                    )}
                  />
                </div>

                {isEditing && (
                  <div className="flex space-x-4">
                    <button
                      type="submit"
                      className={combineClasses(
                        components.button.base,
                        components.button.primary,
                        components.button.sizes.medium
                      )}
                    >
                      Save Changes
                    </button>
                    <button
                      type="button"
                      onClick={handleCancel}
                      className={combineClasses(
                        components.button.base,
                        components.button.secondary,
                        components.button.sizes.medium
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
