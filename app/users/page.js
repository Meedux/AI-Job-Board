'use client';

import { useState, useEffect } from 'react';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProtectedRoute from '../../components/ProtectedRoute';
import { colors, typography, components, layout } from '../../utils/designSystem';

export default function UsersPage() {
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      // This would be an admin-only API endpoint in a real application
      const response = await fetch('/api/users');
      if (response.ok) {
        const data = await response.json();
        setUsers(data.users || []);
      } else {
        setError('Failed to fetch users');
      }
    } catch (err) {
      setError('Network error');
      console.error('Error fetching users:', err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <ProtectedRoute>
      <div className={`min-h-screen ${colors.neutral.background} font-sans`}>
        <Header />
        
        <main className={layout.container}>
          <div className="max-w-6xl mx-auto py-12">
            <div className={`${components.card.base} ${components.card.padding}`}>
              <h1 className={`${typography.h2} ${colors.neutral.textPrimary} mb-8`}>
                User Management
              </h1>

              {loading && (
                <div className="text-center py-8">
                  <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-4"></div>
                  <p className={`${typography.bodyBase} ${colors.neutral.textSecondary}`}>
                    Loading users...
                  </p>
                </div>
              )}

              {error && (
                <div className={`${colors.error.background} ${colors.error.text} p-4 rounded-lg mb-6`}>
                  {error}
                </div>
              )}

              {!loading && !error && (
                <div className="overflow-x-auto">
                  <table className="min-w-full divide-y divide-gray-200">
                    <thead className={colors.neutral.backgroundSecondary}>
                      <tr>
                        <th className={`px-6 py-3 text-left text-xs font-medium ${colors.neutral.textMuted} uppercase tracking-wider`}>
                          Name
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium ${colors.neutral.textMuted} uppercase tracking-wider`}>
                          Email
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium ${colors.neutral.textMuted} uppercase tracking-wider`}>
                          Age
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium ${colors.neutral.textMuted} uppercase tracking-wider`}>
                          Date of Birth
                        </th>
                        <th className={`px-6 py-3 text-left text-xs font-medium ${colors.neutral.textMuted} uppercase tracking-wider`}>
                          Address
                        </th>
                      </tr>
                    </thead>
                    <tbody className={`${colors.neutral.surface} divide-y divide-gray-200`}>
                      {users.length === 0 ? (
                        <tr>
                          <td colSpan="5" className="px-6 py-8 text-center">
                            <div className={`${typography.bodyBase} ${colors.neutral.textSecondary}`}>
                              No users found. Users will appear here after registration.
                            </div>
                          </td>
                        </tr>
                      ) : (
                        users.map((user, index) => (
                          <tr key={user.uid || index}>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div className="flex items-center">
                                <div className={`w-10 h-10 ${colors.primary[500]} rounded-full flex items-center justify-center text-white font-semibold mr-3`}>
                                  {user.nickname ? user.nickname.charAt(0).toUpperCase() : user.fullName.charAt(0).toUpperCase()}
                                </div>
                                <div>
                                  <div className={`${typography.bodyBase} font-medium ${colors.neutral.textPrimary}`}>
                                    {user.fullName}
                                  </div>
                                  {user.nickname && (
                                    <div className={`${typography.bodySmall} ${colors.neutral.textSecondary}`}>
                                      `${user.nickname}`
                                    </div>
                                  )}
                                </div>
                              </div>
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap ${typography.bodyBase} ${colors.neutral.textSecondary}`}>
                              {user.email}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap ${typography.bodyBase} ${colors.neutral.textSecondary}`}>
                              {user.age}
                            </td>
                            <td className={`px-6 py-4 whitespace-nowrap ${typography.bodyBase} ${colors.neutral.textSecondary}`}>
                              {user.dateOfBirth}
                            </td>
                            <td className={`px-6 py-4 ${typography.bodyBase} ${colors.neutral.textSecondary}`}>
                              <div className="max-w-xs truncate" title={user.fullAddress}>
                                {user.fullAddress || 'Not provided'}
                              </div>
                            </td>
                          </tr>
                        ))
                      )}
                    </tbody>
                  </table>
                </div>
              )}

              {!loading && !error && users.length > 0 && (
                <div className={`mt-6 p-4 ${colors.neutral.backgroundSecondary} rounded-lg`}>
                  <p className={`${typography.bodySmall} ${colors.neutral.textSecondary}`}>
                    Total users: {users.length}
                  </p>
                </div>
              )}
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
