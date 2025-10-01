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
      const response = await fetch('/api/admin/users', {
        credentials: 'include' // Include cookies for authentication
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
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'DELETE',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include' // Include cookies for authentication
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
      const response = await fetch(`/api/admin/users/${userId}`, {
        method: 'PUT',
        headers: { 
          'Content-Type': 'application/json'
        },
        credentials: 'include', // Include cookies for authentication
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

        {/* Enhanced Employer Features */}
        <div className="bg-gradient-to-r from-purple-800 to-blue-800 rounded-lg p-6 mb-8 border border-purple-600">
          <h2 className="text-xl font-semibold text-white mb-4">🚀 Enhanced Employer Features</h2>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            
            {/* Advanced Job Management */}
            <div className="bg-black bg-opacity-30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-blue-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold">Advanced Job Management</h3>
              </div>
              <p className="text-purple-100 text-sm mb-4">
                Edit, duplicate, and manage jobs with enhanced controls. Perfect for template-based job creation.
              </p>
              <div className="space-y-2 text-sm text-purple-200 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                  <span>Edit existing jobs</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                  <span>One-click job duplication</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-green-400 rounded-full"></span>
                  <span>Status management</span>
                </div>
              </div>
              <a
                href="/admin/jobs"
                className="inline-flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                Manage Jobs
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            {/* Resume Database Search */}
            <div className="bg-black bg-opacity-30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-green-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold">Resume Database Search</h3>
              </div>
              <p className="text-purple-100 text-sm mb-4">
                Search qualified candidates with AI-powered matching and credit-based contact reveals.
              </p>
              <div className="space-y-2 text-sm text-purple-200 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
                  <span>Basic Search (Free)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
                  <span>Advanced Search (1 credit)</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-yellow-400 rounded-full"></span>
                  <span>AI Search (2 credits)</span>
                </div>
              </div>
              <a
                href="/admin/resume-search"
                className="inline-flex items-center px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Search Resumes
                <svg className="w-4 h-4 ml-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 5l7 7-7 7" />
                </svg>
              </a>
            </div>

            {/* Contact Reveal System */}
            <div className="bg-black bg-opacity-30 rounded-lg p-4">
              <div className="flex items-center gap-3 mb-3">
                <div className="w-10 h-10 bg-yellow-500 rounded-lg flex items-center justify-center">
                  <svg className="w-6 h-6 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </div>
                <h3 className="text-white font-semibold">Contact Reveal System</h3>
              </div>
              <p className="text-purple-100 text-sm mb-4">
                Reveal candidate contact information with smart credit management for your team.
              </p>
              <div className="space-y-2 text-sm text-purple-200 mb-4">
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                  <span>1 credit per contact reveal</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                  <span>No duplicate charges</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="w-1.5 h-1.5 bg-red-400 rounded-full"></span>
                  <span>Sub-user credit sharing</span>
                </div>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-sm text-purple-200">
                  {getAvailableCredits(user, 'resume')} credits available
                </span>
                <a
                  href="/admin/credits"
                  className="px-3 py-1 bg-yellow-600 text-white rounded text-sm hover:bg-yellow-700 transition-colors"
                >
                  Buy Credits
                </a>
              </div>
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
  const [mode, setMode] = useState('create'); // 'create' or 'existing'
  const [formData, setFormData] = useState({
    email: '',
    fullName: '',
    password: '',
    userType: SUB_USER_TYPES.STAFF,
    allocatedResumeCredits: 10,
    allocatedAiCredits: 5
  });
  const [searchQuery, setSearchQuery] = useState('');
  const [searchResults, setSearchResults] = useState([]);
  const [selectedUser, setSelectedUser] = useState(null);
  const [loading, setLoading] = useState(false);
  const [searching, setSearching] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  // Search for existing users
  const searchUsers = async (query) => {
    if (query.length < 2) {
      setSearchResults([]);
      return;
    }

    setSearching(true);
    try {
      const response = await fetch(`/api/admin/users/search?q=${encodeURIComponent(query)}&limit=10`, {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        setSearchResults(data.users || []);
        setShowDropdown(true);
      } else {
        console.error('Search failed:', response.status);
        setSearchResults([]);
        setShowDropdown(false);
      }
    } catch (error) {
      console.error('Error searching users:', error);
      setSearchResults([]);
    } finally {
      setSearching(false);
    }
  };

  // Handle search input change with debouncing
  const handleSearchChange = (value) => {
    setSearchQuery(value);
    setSelectedUser(null);
    
    if (value.length < 2) {
      setSearchResults([]);
      setShowDropdown(false);
      return;
    }
    
    // Clear existing timeout
    if (window.searchTimeout) {
      clearTimeout(window.searchTimeout);
    }
    
    // Debounce search
    window.searchTimeout = setTimeout(() => {
      searchUsers(value);
    }, 300);
  };

  // Select an existing user
  const handleSelectUser = (user) => {
    setSelectedUser(user);
    setSearchQuery(user.email);
    setSearchResults([]);
    setShowDropdown(false);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);

    try {
      let response;
      
      if (mode === 'create') {
        // Create new sub-user
        response = await fetch('/api/admin/users', {
          method: 'POST',
          headers: { 
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            ...formData,
            role: USER_ROLES.SUB_USER
          })
        });
      } else if (mode === 'existing' && selectedUser) {
        // Convert existing user to sub-user
        response = await fetch(`/api/admin/users/${selectedUser.id}`, {
          method: 'PUT',
          headers: { 
            'Content-Type': 'application/json'
          },
          credentials: 'include',
          body: JSON.stringify({
            role: USER_ROLES.SUB_USER,
            userType: formData.userType,
            allocatedResumeCredits: formData.allocatedResumeCredits,
            allocatedAiCredits: formData.allocatedAiCredits,
            convertToSubUser: true // Flag to indicate conversion
          })
        });
      } else {
        alert('Please select a user or switch to create mode');
        setLoading(false);
        return;
      }

      if (response.ok) {
        const data = await response.json();
        console.log('Sub-user created successfully:', data);
        onSuccess();
        onClose();
      } else {
        const data = await response.json();
        console.error('Sub-user creation failed:', data);
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
      <div className="bg-gray-800 rounded-lg p-6 w-full max-w-lg border border-gray-700 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-lg font-semibold text-white">Create Sub-User</h3>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-white"
          >
            ✕
          </button>
        </div>

        {/* Mode Selection */}
        <div className="mb-6">
          <div className="flex space-x-4 bg-gray-700 rounded-lg p-1">
            <button
              type="button"
              onClick={() => {
                setMode('create');
                setSelectedUser(null);
                setSearchQuery('');
                setSearchResults([]);
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === 'create' 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Create New Account
            </button>
            <button
              type="button"
              onClick={() => {
                setMode('existing');
                setFormData(prev => ({ ...prev, email: '', fullName: '', password: '' }));
              }}
              className={`flex-1 py-2 px-4 rounded-md text-sm font-medium transition-colors ${
                mode === 'existing' 
                  ? 'bg-indigo-600 text-white' 
                  : 'text-gray-300 hover:text-white'
              }`}
            >
              Convert Existing User
            </button>
          </div>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          {mode === 'create' ? (
            // Create new user fields
            <>
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
            </>
          ) : (
            // Existing user search and selection
            <div className="relative">
              <label className="block text-sm font-medium text-gray-300 mb-1">
                Search User (Job Seeker or Employer)
                <span className="text-gray-500 text-xs ml-1">- Search by email, name, or username</span>
              </label>
              <div className="relative">
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => handleSearchChange(e.target.value)}
                  onFocus={() => {
                    if (searchResults.length > 0 && !selectedUser) {
                      setShowDropdown(true);
                    }
                  }}
                  onBlur={() => {
                    // Delay hiding dropdown to allow click on results
                    setTimeout(() => setShowDropdown(false), 150);
                  }}
                  placeholder="Type email, name, or username to search..."
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-md text-white focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  required
                />
                {searching && (
                  <div className="absolute right-3 top-3 text-gray-400">
                    Searching...
                  </div>
                )}
              </div>
              
              {/* Search Results Dropdown */}
              {showDropdown && searchResults.length > 0 && !selectedUser && (
                <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg max-h-60 overflow-y-auto">
                  <div className="py-1">
                    {searchResults.map((user) => (
                      <div
                        key={user.id}
                        onClick={() => handleSelectUser(user)}
                        className="px-4 py-3 hover:bg-gray-600 cursor-pointer transition-colors border-b border-gray-600 last:border-b-0"
                      >
                        <div className="flex items-center justify-between">
                          <div className="flex-1 min-w-0">
                            <div className="text-white font-medium truncate">
                              {user.fullName || user.username || 'No name provided'}
                            </div>
                            <div className="text-gray-400 text-sm truncate">{user.email}</div>
                            {user.username && user.fullName && (
                              <div className="text-gray-500 text-xs truncate">@{user.username}</div>
                            )}
                          </div>
                          <div className="ml-3 flex-shrink-0">
                            <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 capitalize">
                              {user.role.replace('_', ' ')}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  {searchResults.length === 10 && (
                    <div className="px-4 py-2 text-gray-400 text-sm border-t border-gray-600 bg-gray-800">
                      Showing first 10 results. Type more to narrow down.
                    </div>
                  )}
                </div>
              )}
              
              {/* No Results Message */}
              {showDropdown && searchQuery.length >= 2 && searchResults.length === 0 && !searching && !selectedUser && (
                <div className="absolute z-10 w-full mt-1 bg-gray-700 border border-gray-600 rounded-md shadow-lg">
                  <div className="px-4 py-3 text-gray-400 text-sm">
                    No users found for "{searchQuery}". Try searching by email, name, or username.
                  </div>
                </div>
              )}
              
              {/* Selected User Display */}
              {selectedUser && (
                <div className="mt-3 p-4 bg-gradient-to-r from-indigo-900/40 to-purple-900/40 border border-indigo-500/50 rounded-lg">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-indigo-600 rounded-full flex items-center justify-center">
                        <span className="text-white font-bold text-lg">
                          {(selectedUser.fullName || selectedUser.username || selectedUser.email || 'U')[0].toUpperCase()}
                        </span>
                      </div>
                      <div>
                        <div className="text-white font-semibold">
                          {selectedUser.fullName || selectedUser.username || 'No name provided'}
                        </div>
                        <div className="text-gray-300 text-sm">{selectedUser.email}</div>
                        {selectedUser.username && (
                          <div className="text-gray-400 text-xs">@{selectedUser.username}</div>
                        )}
                        <div className="flex items-center mt-1">
                          <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800 capitalize">
                            {selectedUser.role.replace('_', ' ')}
                          </span>
                        </div>
                      </div>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        setSelectedUser(null);
                        setSearchQuery('');
                        setSearchResults([]);
                      }}
                      className="text-gray-400 hover:text-white transition-colors p-1"
                      title="Clear selection"
                    >
                      <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                      </svg>
                    </button>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* Common fields for both modes */}
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
              disabled={loading || (mode === 'existing' && !selectedUser)}
              className="flex-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 transition-colors disabled:opacity-50"
            >
              {loading ? (
                mode === 'create' ? 'Creating...' : 'Converting...'
              ) : (
                mode === 'create' ? 'Create Sub-User' : 'Convert to Sub-User'
              )}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
