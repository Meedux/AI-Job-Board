'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { 
  USER_ROLES, 
  SUB_USER_TYPES,
  canCreateSubUsers,
  getAvailableCredits
} from '@/utils/roleSystem';

export default function EmployerAdminDashboard() {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [subUsers, setSubUsers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stats, setStats] = useState({
    totalSubUsers: 0,
    activeSubUsers: 0,
    staffUsers: 0,
    vendorUsers: 0,
    customerUsers: 0,
    usedResumeCredits: 0,
    usedAiCredits: 0
  });

  useEffect(() => {
    if (user?.role === USER_ROLES.EMPLOYER_ADMIN) {
      loadSubUsers();
    }
  }, [user]);

  const loadSubUsers = async () => {
    try {
      const response = await fetch('/api/admin/users');
      if (response.ok) {
        const data = await response.json();
        setSubUsers(data.users);
        calculateStats(data.users);
      }
    } catch (error) {
      console.error('Error loading sub-users:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateStats = (userList) => {
    const stats = {
      totalSubUsers: userList.length,
      activeSubUsers: userList.filter(u => u.isActive).length,
      staffUsers: userList.filter(u => u.userType === SUB_USER_TYPES.STAFF).length,
      vendorUsers: userList.filter(u => u.userType === SUB_USER_TYPES.VENDOR).length,
      customerUsers: userList.filter(u => u.userType === SUB_USER_TYPES.CUSTOMER).length,
      usedResumeCredits: userList.reduce((sum, u) => sum + (u.usedResumeCredits || 0), 0),
      usedAiCredits: userList.reduce((sum, u) => sum + (u.usedAiCredits || 0), 0)
    };
    setStats(stats);
  };

  const handleDeleteSubUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this sub-user?')) return;

    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE'
      });

      if (response.ok) {
        loadSubUsers();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to delete sub-user');
      }
    } catch (error) {
      console.error('Error deleting sub-user:', error);
      alert('Error deleting sub-user');
    }
  };

  const allocateCredits = async (userId, resumeCredits, aiCredits) => {
    try {
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          allocatedResumeCredits: resumeCredits,
          allocatedAiCredits: aiCredits
        })
      });

      if (response.ok) {
        loadSubUsers();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to allocate credits');
      }
    } catch (error) {
      console.error('Error allocating credits:', error);
      alert('Error allocating credits');
    }
  };

  if (user?.role !== USER_ROLES.EMPLOYER_ADMIN) {
    return (
      <div className="bg-gray-900 flex items-center justify-center pt-16 min-h-screen">
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-300">You need to be an Employer Admin to access this page.</p>
        </div>
      </div>
    );
  }

  const canCreateSubs = canCreateSubUsers(user, subscription);

  return (
    <div className="bg-gray-900 text-white pt-16 min-h-screen">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-white mb-2">Employer Admin Dashboard</h1>
          <p className="text-gray-300">Manage your sub-users and team access</p>
        </div>

        {/* Subscription Info */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">Subscription Status</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <span className="text-sm text-gray-400">Current Plan:</span>
              <div className="text-lg font-medium text-white capitalize">
                {subscription?.plan?.planType || 'Free'}
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-400">Available Resume Credits:</span>
              <div className="text-lg font-medium text-green-400">
                {getAvailableCredits(user, 'resume')}
              </div>
            </div>
            <div>
              <span className="text-sm text-gray-400">Available AI Credits:</span>
              <div className="text-lg font-medium text-blue-400">
                {getAvailableCredits(user, 'ai')}
              </div>
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Total Sub-Users</h3>
            <div className="text-2xl font-bold text-white">{stats.totalSubUsers}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Active Sub-Users</h3>
            <div className="text-2xl font-bold text-green-400">{stats.activeSubUsers}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Staff</h3>
            <div className="text-2xl font-bold text-blue-400">{stats.staffUsers}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Vendors</h3>
            <div className="text-2xl font-bold text-yellow-400">{stats.vendorUsers}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Customers</h3>
            <div className="text-2xl font-bold text-purple-400">{stats.customerUsers}</div>
          </div>
        </div>

        {/* Job Management Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">Job Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">Post a New Job</h3>
              <p className="text-gray-300 text-sm mb-4">
                Create a new job posting with custom application forms and reach qualified candidates.
              </p>
              <a
                href="/admin/post-job"
                className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
                </svg>
                Create Job Posting
              </a>
            </div>
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-white font-medium mb-2">Manage Job Listings</h3>
              <p className="text-gray-300 text-sm mb-4">
                View, edit, and manage all your published job listings and applications.
              </p>
              <a
                href="/jobs"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Browse All Jobs
              </a>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="mb-6 flex space-x-4">
          <button
            onClick={() => setShowCreateModal(true)}
            disabled={!canCreateSubs}
            className={`px-4 py-2 rounded-lg font-medium transition-colors ${
              canCreateSubs 
                ? 'bg-indigo-600 hover:bg-indigo-700 text-white' 
                : 'bg-gray-700 text-gray-400 cursor-not-allowed'
            }`}
          >
            Create Sub-User
          </button>
          {!canCreateSubs && (
            <span className="text-sm text-gray-400 self-center">
              Upgrade subscription to create sub-users
            </span>
          )}
        </div>

        {/* ATS Placeholder */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">ATS (Applicant Tracking System)</h2>
          <div className="bg-gray-700 rounded-lg p-8 text-center border-2 border-dashed border-gray-600">
            <div className="text-4xl text-gray-500 mb-4">🏗️</div>
            <h3 className="text-lg font-medium text-gray-300 mb-2">ATS Module Coming Soon</h3>
            <p className="text-gray-400 mb-4">
              Complete applicant tracking system with candidate management, 
              interview scheduling, and resume processing.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-400">
              <div>✓ Candidate Pipeline Management</div>
              <div>✓ Resume Parsing & Matching</div>
              <div>✓ Interview Scheduling</div>
              <div>✓ Team Collaboration Tools</div>
              <div>✓ Custom Workflows</div>
              <div>✓ Analytics & Reporting</div>
            </div>
          </div>
        </div>

        {/* Sub-Users Table */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
          <div className="px-6 py-4 border-b border-gray-700">
            <h2 className="text-lg font-semibold text-white">Sub-User Management</h2>
          </div>
          
          {loading ? (
            <div className="p-8 text-center text-gray-400">Loading sub-users...</div>
          ) : subUsers.length === 0 ? (
            <div className="p-8 text-center text-gray-400">
              No sub-users found. Create your first sub-user to get started.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead className="bg-gray-700">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      User
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Type
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Resume Credits
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      AI Credits
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Last Login
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                      Actions
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-700">
                  {subUsers.map((subUser) => (
                    <tr key={subUser.id} className="hover:bg-gray-700">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div>
                          <div className="text-sm font-medium text-white">{subUser.fullName || 'N/A'}</div>
                          <div className="text-sm text-gray-400">{subUser.email}</div>
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          subUser.userType === SUB_USER_TYPES.STAFF ? 'bg-blue-900 text-blue-200' :
                          subUser.userType === SUB_USER_TYPES.VENDOR ? 'bg-yellow-900 text-yellow-200' :
                          subUser.userType === SUB_USER_TYPES.CUSTOMER ? 'bg-purple-900 text-purple-200' :
                          'bg-gray-700 text-gray-300'
                        }`}>
                          {subUser.userType?.charAt(0).toUpperCase() + subUser.userType?.slice(1) || 'N/A'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          subUser.isActive ? 'bg-green-900 text-green-200' : 'bg-red-900 text-red-200'
                        }`}>
                          {subUser.isActive ? 'Active' : 'Inactive'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {subUser.usedResumeCredits || 0} / {subUser.allocatedResumeCredits || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {subUser.usedAiCredits || 0} / {subUser.allocatedAiCredits || 0}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-300">
                        {subUser.lastLoginAt ? new Date(subUser.lastLoginAt).toLocaleDateString() : 'Never'}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm space-x-2">
                        <button
                          onClick={() => {
                            const resumeCredits = prompt('Allocate Resume Credits:', subUser.allocatedResumeCredits || 0);
                            const aiCredits = prompt('Allocate AI Credits:', subUser.allocatedAiCredits || 0);
                            if (resumeCredits !== null && aiCredits !== null) {
                              allocateCredits(subUser.id, parseInt(resumeCredits) || 0, parseInt(aiCredits) || 0);
                            }
                          }}
                          className="text-indigo-400 hover:text-indigo-300"
                        >
                          Allocate Credits
                        </button>
                        <button
                          onClick={() => handleDeleteSubUser(subUser.id)}
                          className="text-red-400 hover:text-red-300"
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </div>

      {/* Create Sub-User Modal */}
      {showCreateModal && (
        <CreateSubUserModal 
          onClose={() => setShowCreateModal(false)} 
          onSuccess={loadSubUsers}
        />
      )}
    </div>
  );
}

// Create Sub-User Modal Component
function CreateSubUserModal({ onClose, onSuccess }) {
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    userType: SUB_USER_TYPES.STAFF,
    allocatedResumeCredits: 10,
    allocatedAiCredits: 5
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({
          ...formData,
          role: USER_ROLES.SUB_USER
        })
      });

      if (response.ok) {
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        alert(data.error || 'Failed to create sub-user');
      }
    } catch (error) {
      console.error('Error creating sub-user:', error);
      alert('Error creating sub-user');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-md border border-gray-700">
        <h3 className="text-lg font-semibold text-white mb-4">Create Sub-User</h3>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
            <input
              type="email"
              value={formData.email}
              onChange={(e) => setFormData({...formData, email: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
            <input
              type="text"
              value={formData.fullName}
              onChange={(e) => setFormData({...formData, fullName: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Password</label>
            <input
              type="password"
              value={formData.password}
              onChange={(e) => setFormData({...formData, password: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-1">Sub-user Type</label>
            <select
              value={formData.userType}
              onChange={(e) => setFormData({...formData, userType: e.target.value})}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
            >
              <option value={SUB_USER_TYPES.STAFF}>Staff</option>
              <option value={SUB_USER_TYPES.VENDOR}>Vendor</option>
              <option value={SUB_USER_TYPES.CUSTOMER}>Customer</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">Resume Credits</label>
              <input
                type="number"
                value={formData.allocatedResumeCredits || 0}
                onChange={(e) => setFormData({...formData, allocatedResumeCredits: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="0"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-1">AI Credits</label>
              <input
                type="number"
                value={formData.allocatedAiCredits || 0}
                onChange={(e) => setFormData({...formData, allocatedAiCredits: parseInt(e.target.value) || 0})}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                min="0"
              />
            </div>
          </div>

          <div className="flex space-x-4 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 bg-gray-600 text-white rounded-md hover:bg-gray-700 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Creating...' : 'Create Sub-User'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
