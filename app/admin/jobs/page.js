'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { USER_ROLES } from '@/utils/roleSystem';
import Header from '@/components/Header';
import Link from 'next/link';

export default function ManageJobsPage() {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [jobs, setJobs] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [stats, setStats] = useState({
    totalJobs: 0,
    activeJobs: 0,
    expiredJobs: 0,
    totalApplications: 0
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user && ['employer_admin', 'super_admin'].includes(user.role)) {
      loadJobs();
    }
  }, [user]);

  const loadJobs = async () => {
    try {
      const response = await fetch('/api/admin/jobs');
      if (response.ok) {
        const data = await response.json();
        setJobs(data.jobs || []);
        calculateStats(data.jobs || []);
      }
    } catch (error) {
      console.error('Error loading jobs:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (jobList) => {
    const now = new Date();
    const stats = {
      totalJobs: jobList.length,
      activeJobs: jobList.filter(job => job.status === 'active' && new Date(job.expiresAt) > now).length,
      expiredJobs: jobList.filter(job => job.status === 'expired' || new Date(job.expiresAt) <= now).length,
      totalApplications: jobList.reduce((sum, job) => sum + (job.applicationCount || 0), 0)
    };
    setStats(stats);
  };

  const deleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job?')) return;

    try {
      const response = await fetch(`/api/admin/jobs/${jobId}`, {
        method: 'DELETE',
      });

      if (response.ok) {
        loadJobs(); // Reload the jobs list
        alert('Job deleted successfully');
      } else {
        alert('Failed to delete job');
      }
    } catch (error) {
      console.error('Error deleting job:', error);
      alert('Error deleting job');
    }
  };

  const toggleJobStatus = async (jobId, currentStatus) => {
    const newStatus = currentStatus === 'active' ? 'inactive' : 'active';
    
    try {
      const response = await fetch(`/api/admin/jobs/${jobId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        loadJobs(); // Reload the jobs list
      } else {
        alert('Failed to update job status');
      }
    } catch (error) {
      console.error('Error updating job status:', error);
      alert('Error updating job status');
    }
  };

  const getStatusBadge = (job) => {
    const isExpired = new Date(job.expiresAt) <= new Date();
    
    if (isExpired) {
      return <span className="px-2 py-1 bg-red-900 text-red-300 rounded-full text-xs font-medium">Expired</span>;
    }
    
    switch (job.status) {
      case 'active':
        return <span className="px-2 py-1 bg-green-900 text-green-300 rounded-full text-xs font-medium">Active</span>;
      case 'inactive':
        return <span className="px-2 py-1 bg-gray-900 text-gray-300 rounded-full text-xs font-medium">Inactive</span>;
      default:
        return <span className="px-2 py-1 bg-yellow-900 text-yellow-300 rounded-full text-xs font-medium">Draft</span>;
    }
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="bg-gray-900 flex items-center justify-center pt-16 min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !['employer_admin', 'super_admin'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header />
        <div className="bg-gray-900 flex items-center justify-center pt-16 min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-gray-300">You need employer admin privileges to manage jobs.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Header />
      <div className="bg-gray-900 text-white pt-16 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="mb-8">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2">Manage Jobs</h1>
                <p className="text-gray-300">Manage your job postings and track applications</p>
              </div>
              <Link
                href="/admin/post-job"
                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors flex items-center space-x-2"
              >
                <span>➕</span>
                <span>Post New Job</span>
              </Link>
            </div>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-blue-900 rounded-lg flex items-center justify-center">
                  <span className="text-blue-300 text-lg">📋</span>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Jobs</p>
                  <p className="text-white text-2xl font-bold">{stats.totalJobs}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-green-900 rounded-lg flex items-center justify-center">
                  <span className="text-green-300 text-lg">✅</span>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Active Jobs</p>
                  <p className="text-white text-2xl font-bold">{stats.activeJobs}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-red-900 rounded-lg flex items-center justify-center">
                  <span className="text-red-300 text-lg">⏰</span>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Expired Jobs</p>
                  <p className="text-white text-2xl font-bold">{stats.expiredJobs}</p>
                </div>
              </div>
            </div>

            <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-purple-900 rounded-lg flex items-center justify-center">
                  <span className="text-purple-300 text-lg">📄</span>
                </div>
                <div>
                  <p className="text-gray-400 text-sm">Total Applications</p>
                  <p className="text-white text-2xl font-bold">{stats.totalApplications}</p>
                </div>
              </div>
            </div>
          </div>

          {/* Jobs Table */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">Job Listings</h2>
            </div>

            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading jobs...</p>
              </div>
            ) : jobs.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-400 mb-4">No jobs posted yet</p>
                <Link
                  href="/admin/post-job"
                  className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-2 px-4 rounded-lg transition-colors"
                >
                  Post Your First Job
                </Link>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Job Title
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Company
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Location
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Applications
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Posted
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Expires
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {jobs.map((job) => (
                      <tr key={job.id} className="hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-white font-medium">{job.title}</p>
                            <p className="text-gray-400 text-sm">{job.jobType} • {job.experienceLevel}</p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {job.company}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {job.location}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(job)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {job.applicationCount || 0}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {formatDate(job.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {job.expiresAt ? formatDate(job.expiresAt) : 'No expiry'}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => toggleJobStatus(job.id, job.status)}
                              className={`px-3 py-1 rounded text-xs font-medium transition-colors ${
                                job.status === 'active'
                                  ? 'bg-yellow-900 text-yellow-300 hover:bg-yellow-800'
                                  : 'bg-green-900 text-green-300 hover:bg-green-800'
                              }`}
                            >
                              {job.status === 'active' ? 'Deactivate' : 'Activate'}
                            </button>
                            <button
                              onClick={() => deleteJob(job.id)}
                              className="px-3 py-1 bg-red-900 text-red-300 hover:bg-red-800 rounded text-xs font-medium transition-colors"
                            >
                              Delete
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
