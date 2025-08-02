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
  const [jobs, setJobs] = useState([]);
  const [applications, setApplications] = useState([]);
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [stats, setStats] = useState({
    totalSubUsers: 0,
    activeSubUsers: 0,
    staffUsers: 0,
    vendorUsers: 0,
    customerUsers: 0,
    usedResumeCredits: 0,
    usedAiCredits: 0,
    totalJobs: 0,
    activeJobs: 0,
    totalApplications: 0,
    pendingApplications: 0,
    totalCompanies: 0
  });

  useEffect(() => {
    if (user?.role === USER_ROLES.EMPLOYER_ADMIN) {
      loadDashboardData();
    }
  }, [user]);

  const loadDashboardData = async () => {
    try {
      // Load all data in parallel
      await Promise.all([
        loadSubUsers(),
        loadJobs(),
        loadApplications(),
        loadCompanies()
      ]);
    } catch (error) {
      console.error('Error loading dashboard data:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadSubUsers = async () => {
    try {
      // Get authentication token for the request
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/admin/users', {
        headers
      });
      if (response.ok) {
        const data = await response.json();
        setSubUsers(data.users || []);
        return data.users || [];
      }
    } catch (error) {
      console.error('Error loading sub-users:', error);
    }
    return [];
  };

  const loadJobs = async () => {
    try {
      // Get authentication token for the request
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/jobs?employer=true', {
        headers
      });
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
        return data.jobs || [];
      } else if (response.status === 401) {
        console.error('Unauthorized access to employer jobs');
        // Handle authentication error - perhaps redirect to login
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    }
    return [];
  };

  const loadApplications = async () => {
    try {
      // Get authentication token for the request
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/ats/applications', {
        headers
      });
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
        return data.applications || [];
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    }
    return [];
  };

  const loadCompanies = async () => {
    try {
      // Get authentication token for the request
      const token = localStorage.getItem('token');
      const headers = {};
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/companies', {
        headers
      });
      if (response.ok) {
        const data = await response.json();
        setCompanies(data.companies || []);
        return data.companies || [];
      }
    } catch (error) {
      console.error('Error loading companies:', error);
    }
    return [];
  };

  const calculateStats = (userData = subUsers, jobsData = jobs, applicationsData = applications, companiesData = companies) => {
    const stats = {
      // Sub-user stats
      totalSubUsers: userData.length,
      activeSubUsers: userData.filter(u => u.isActive).length,
      staffUsers: userData.filter(u => u.userType === SUB_USER_TYPES.STAFF).length,
      vendorUsers: userData.filter(u => u.userType === SUB_USER_TYPES.VENDOR).length,
      customerUsers: userData.filter(u => u.userType === SUB_USER_TYPES.CUSTOMER).length,
      usedResumeCredits: userData.reduce((sum, u) => sum + (u.usedResumeCredits || 0), 0),
      usedAiCredits: userData.reduce((sum, u) => sum + (u.usedAiCredits || 0), 0),
      
      // Job stats
      totalJobs: jobsData.length,
      activeJobs: jobsData.filter(j => j.status === 'active').length,
      
      // Application stats
      totalApplications: applicationsData.length,
      pendingApplications: applicationsData.filter(a => a.status === 'pending' || a.status === 'under_review').length,
      
      // Company stats
      totalCompanies: companiesData.length
    };
    setStats(stats);
    return stats;
  };

  // Calculate stats when data changes
  useEffect(() => {
    if (!loading) {
      calculateStats();
    }
  }, [subUsers, jobs, applications, companies, loading]);

  const handleDeleteSubUser = async (userId) => {
    if (!confirm('Are you sure you want to delete this sub-user?')) return;

    try {
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers
      });

      if (response.ok) {
        loadDashboardData();
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
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers,
        body: JSON.stringify({
          allocatedResumeCredits: resumeCredits,
          allocatedAiCredits: aiCredits
        })
      });

      if (response.ok) {
        loadDashboardData();
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

        {/* New Features Showcase */}
        <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-8">
          <div className="flex items-center justify-between mb-4">
            <div>
              <h2 className="text-xl font-bold text-white mb-2">🚀 New: Comprehensive Job Posting System</h2>
              <p className="text-blue-100">
                Experience our enhanced job posting with 5-step wizard, AI assistance, and employer type adaptation
              </p>
            </div>
            <div className="flex gap-3">
              <a
                href="/admin/post-job"
                className="px-4 py-2 bg-white text-blue-600 rounded-lg hover:bg-gray-100 transition-colors font-medium"
              >
                Post Job
              </a>
              <a
                href="/demo/comprehensive-job-posting"
                className="px-4 py-2 bg-blue-700 text-white rounded-lg hover:bg-blue-800 transition-colors font-medium"
              >
                Try Demo
              </a>
            </div>
          </div>
          
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
            <div className="flex items-center gap-2 text-blue-100">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              Manual & AI Modes
            </div>
            <div className="flex items-center gap-2 text-blue-100">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              Employer Type Adaptation
            </div>
            <div className="flex items-center gap-2 text-blue-100">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              Philippine Compliance
            </div>
            <div className="flex items-center gap-2 text-blue-100">
              <span className="w-2 h-2 bg-green-400 rounded-full"></span>
              Advanced Preview
            </div>
          </div>
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
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Total Jobs</h3>
            <div className="text-2xl font-bold text-white">{stats.totalJobs}</div>
            <p className="text-xs text-gray-500 mt-1">{stats.activeJobs} active</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Applications</h3>
            <div className="text-2xl font-bold text-blue-400">{stats.totalApplications}</div>
            <p className="text-xs text-gray-500 mt-1">{stats.pendingApplications} pending</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Companies</h3>
            <div className="text-2xl font-bold text-green-400">{stats.totalCompanies}</div>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Sub-Users</h3>
            <div className="text-2xl font-bold text-purple-400">{stats.totalSubUsers}</div>
            <p className="text-xs text-gray-500 mt-1">{stats.activeSubUsers} active</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-2">Resume Credits</h3>
            <div className="text-2xl font-bold text-yellow-400">{getAvailableCredits(user, 'resume')}</div>
            <p className="text-xs text-gray-500 mt-1">{stats.usedResumeCredits} used</p>
          </div>
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <h3 className="text-sm font-medium text-gray-400 mb-2">AI Credits</h3>
            <div className="text-2xl font-bold text-cyan-400">{getAvailableCredits(user, 'ai')}</div>
            <p className="text-xs text-gray-500 mt-1">{stats.usedAiCredits} used</p>
          </div>
        </div>

        {/* Job Management Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
          <h2 className="text-lg font-semibold text-white mb-4">Job Management</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
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
                href="/admin/jobs"
                className="inline-flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                <svg className="w-4 h-4 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                </svg>
                Manage Jobs
              </a>
            </div>
          </div>
          
          {/* Recent Jobs */}
          <div className="bg-gray-700 rounded-lg p-4">
            <h3 className="text-white font-medium mb-4">Recent Job Postings</h3>
            <div className="space-y-3">
              {jobs.slice(0, 5).map((job) => (
                <div key={job.id} className="flex items-center justify-between p-3 bg-gray-600 rounded-lg">
                  <div className="flex-1">
                    <h4 className="text-white font-medium">{job.title}</h4>
                    <div className="flex items-center gap-4 text-sm text-gray-400 mt-1">
                      <span>{job.company?.name || 'Unknown Company'}</span>
                      <span>{job.location || 'Remote'}</span>
                      <span className={`px-2 py-1 rounded-full text-xs ${
                        job.status === 'active' ? 'bg-green-900 text-green-200' :
                        job.status === 'draft' ? 'bg-yellow-900 text-yellow-200' :
                        'bg-red-900 text-red-200'
                      }`}>
                        {job.status}
                      </span>
                    </div>
                  </div>
                  <div className="text-right text-sm text-gray-400">
                    <div>{job.applications?.length || 0} applications</div>
                    <div>{new Date(job.createdAt).toLocaleDateString()}</div>
                  </div>
                </div>
              ))}
              {jobs.length === 0 && (
                <div className="text-center text-gray-400 py-8">
                  <p>No jobs posted yet. Create your first job posting to get started!</p>
                </div>
              )}
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

        {/* ATS Section */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8 border border-gray-700">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-lg font-semibold text-white">ATS (Applicant Tracking System)</h2>
            <a
              href="/ats"
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Open ATS Dashboard
            </a>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Applications Overview */}
            <div className="bg-gray-700 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h3 className="text-white font-medium">Applications</h3>
                <div className="text-2xl text-blue-400">{stats.totalApplications}</div>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Pending Review:</span>
                  <span className="text-yellow-400">{stats.pendingApplications}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Under Review:</span>
                  <span className="text-blue-400">
                    {applications.filter(a => a.status === 'under_review').length}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-400">Shortlisted:</span>
                  <span className="text-green-400">
                    {applications.filter(a => a.status === 'shortlisted').length}
                  </span>
                </div>
              </div>
            </div>

            {/* Recent Applications */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-white font-medium mb-3">Recent Applications</h3>
              <div className="space-y-2">
                {applications.slice(0, 3).map((app, index) => (
                  <div key={index} className="flex items-center justify-between text-sm">
                    <div>
                      <div className="text-white truncate max-w-32">
                        {app.applicantName || app.user?.fullName || 'Unknown'}
                      </div>
                      <div className="text-gray-400 text-xs">
                        {app.job?.title || 'Job Title'}
                      </div>
                    </div>
                    <span className={`px-2 py-1 text-xs rounded-full ${
                      app.status === 'pending' ? 'bg-yellow-900 text-yellow-200' :
                      app.status === 'under_review' ? 'bg-blue-900 text-blue-200' :
                      app.status === 'shortlisted' ? 'bg-green-900 text-green-200' :
                      'bg-gray-800 text-gray-300'
                    }`}>
                      {app.status}
                    </span>
                  </div>
                ))}
                {applications.length === 0 && (
                  <div className="text-gray-400 text-sm">No applications yet</div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-700 rounded-lg p-4">
              <h3 className="text-white font-medium mb-3">Quick Actions</h3>
              <div className="space-y-3">
                <a
                  href="/ats?tab=applications"
                  className="block w-full px-3 py-2 bg-blue-600 text-white rounded text-sm text-center hover:bg-blue-700 transition-colors"
                >
                  Review Applications
                </a>
                <a
                  href="/ats?tab=pipeline"
                  className="block w-full px-3 py-2 bg-green-600 text-white rounded text-sm text-center hover:bg-green-700 transition-colors"
                >
                  Manage Pipeline
                </a>
                <a
                  href="/ats?tab=interviews"
                  className="block w-full px-3 py-2 bg-purple-600 text-white rounded text-sm text-center hover:bg-purple-700 transition-colors"
                >
                  Schedule Interviews
                </a>
              </div>
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
          onSuccess={loadDashboardData}
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
      const token = localStorage.getItem('token');
      const headers = { 'Content-Type': 'application/json' };
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/admin/users', {
        method: 'POST',
        headers,
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
