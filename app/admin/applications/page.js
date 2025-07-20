'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { USER_ROLES } from '@/utils/roleSystem';
import Header from '@/components/Header';

export default function ApplicationsPage() {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [filter, setFilter] = useState('all');
  const [stats, setStats] = useState({
    total: 0,
    pending: 0,
    reviewed: 0,
    shortlisted: 0,
    rejected: 0
  });

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user && ['employer_admin', 'super_admin'].includes(user.role)) {
      loadApplications();
    }
  }, [user, filter]);

  const loadApplications = async () => {
    try {
      const url = filter === 'all' 
        ? '/api/admin/applications'
        : `/api/admin/applications?status=${filter}`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
        calculateStats(data.applications || []);
      }
    } catch (error) {
      console.error('Error loading applications:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const calculateStats = (applicationList) => {
    const stats = {
      total: applicationList.length,
      pending: applicationList.filter(app => app.status === 'pending').length,
      reviewed: applicationList.filter(app => app.status === 'reviewed').length,
      shortlisted: applicationList.filter(app => app.status === 'shortlisted').length,
      rejected: applicationList.filter(app => app.status === 'rejected').length
    };
    setStats(stats);
  };

  const updateApplicationStatus = async (applicationId, newStatus) => {
    try {
      const response = await fetch(`/api/admin/applications/${applicationId}`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (response.ok) {
        loadApplications(); // Reload applications
      } else {
        alert('Failed to update application status');
      }
    } catch (error) {
      console.error('Error updating application status:', error);
      alert('Error updating application status');
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      pending: 'bg-yellow-900 text-yellow-300',
      reviewed: 'bg-blue-900 text-blue-300',
      shortlisted: 'bg-green-900 text-green-300',
      rejected: 'bg-red-900 text-red-300'
    };
    
    return (
      <span className={`px-2 py-1 rounded-full text-xs font-medium ${badges[status] || 'bg-gray-900 text-gray-300'}`}>
        {status.charAt(0).toUpperCase() + status.slice(1)}
      </span>
    );
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
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
            <p className="text-gray-300">You need employer admin privileges to view applications.</p>
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
            <h1 className="text-3xl font-bold text-white mb-2">Job Applications</h1>
            <p className="text-gray-300">Review and manage applications for your job postings</p>
          </div>

          {/* Stats Cards */}
          <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-8">
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="text-center">
                <p className="text-gray-400 text-sm">Total</p>
                <p className="text-white text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="text-center">
                <p className="text-yellow-400 text-sm">Pending</p>
                <p className="text-white text-2xl font-bold">{stats.pending}</p>
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="text-center">
                <p className="text-blue-400 text-sm">Reviewed</p>
                <p className="text-white text-2xl font-bold">{stats.reviewed}</p>
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="text-center">
                <p className="text-green-400 text-sm">Shortlisted</p>
                <p className="text-white text-2xl font-bold">{stats.shortlisted}</p>
              </div>
            </div>
            <div className="bg-gray-800 p-4 rounded-lg border border-gray-700">
              <div className="text-center">
                <p className="text-red-400 text-sm">Rejected</p>
                <p className="text-white text-2xl font-bold">{stats.rejected}</p>
              </div>
            </div>
          </div>

          {/* Filter Buttons */}
          <div className="mb-6">
            <div className="flex flex-wrap gap-2">
              {['all', 'pending', 'reviewed', 'shortlisted', 'rejected'].map((filterOption) => (
                <button
                  key={filterOption}
                  onClick={() => setFilter(filterOption)}
                  className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                    filter === filterOption
                      ? 'bg-blue-600 text-white'
                      : 'bg-gray-700 text-gray-300 hover:bg-gray-600'
                  }`}
                >
                  {filterOption.charAt(0).toUpperCase() + filterOption.slice(1)}
                </button>
              ))}
            </div>
          </div>

          {/* Applications Table */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
            <div className="px-6 py-4 border-b border-gray-700">
              <h2 className="text-lg font-semibold text-white">Applications</h2>
            </div>

            {isLoading ? (
              <div className="p-8 text-center">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500 mx-auto mb-4"></div>
                <p className="text-gray-400">Loading applications...</p>
              </div>
            ) : applications.length === 0 ? (
              <div className="p-8 text-center">
                <p className="text-gray-400">No applications found for the selected filter</p>
              </div>
            ) : (
              <div className="overflow-x-auto">
                <table className="w-full">
                  <thead className="bg-gray-700">
                    <tr>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Candidate
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Job Position
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Applied
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Status
                      </th>
                      <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                        Actions
                      </th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-gray-700">
                    {applications.map((application) => (
                      <tr key={application.id} className="hover:bg-gray-700/50">
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-white font-medium">
                              {application.candidateName || application.user?.fullName || 'Anonymous'}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {application.candidateEmail || application.user?.email}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div>
                            <p className="text-white font-medium">
                              {application.job?.title || 'Job Title N/A'}
                            </p>
                            <p className="text-gray-400 text-sm">
                              {application.job?.company || 'Company N/A'}
                            </p>
                          </div>
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                          {formatDate(application.createdAt)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          {getStatusBadge(application.status)}
                        </td>
                        <td className="px-6 py-4 whitespace-nowrap">
                          <div className="flex items-center space-x-1">
                            {application.status === 'pending' && (
                              <>
                                <button
                                  onClick={() => updateApplicationStatus(application.id, 'reviewed')}
                                  className="px-2 py-1 bg-blue-900 text-blue-300 hover:bg-blue-800 rounded text-xs font-medium transition-colors"
                                >
                                  Review
                                </button>
                                <button
                                  onClick={() => updateApplicationStatus(application.id, 'shortlisted')}
                                  className="px-2 py-1 bg-green-900 text-green-300 hover:bg-green-800 rounded text-xs font-medium transition-colors"
                                >
                                  Shortlist
                                </button>
                                <button
                                  onClick={() => updateApplicationStatus(application.id, 'rejected')}
                                  className="px-2 py-1 bg-red-900 text-red-300 hover:bg-red-800 rounded text-xs font-medium transition-colors"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            
                            {application.status === 'reviewed' && (
                              <>
                                <button
                                  onClick={() => updateApplicationStatus(application.id, 'shortlisted')}
                                  className="px-2 py-1 bg-green-900 text-green-300 hover:bg-green-800 rounded text-xs font-medium transition-colors"
                                >
                                  Shortlist
                                </button>
                                <button
                                  onClick={() => updateApplicationStatus(application.id, 'rejected')}
                                  className="px-2 py-1 bg-red-900 text-red-300 hover:bg-red-800 rounded text-xs font-medium transition-colors"
                                >
                                  Reject
                                </button>
                              </>
                            )}
                            
                            {application.status === 'shortlisted' && (
                              <button
                                onClick={() => updateApplicationStatus(application.id, 'rejected')}
                                className="px-2 py-1 bg-red-900 text-red-300 hover:bg-red-800 rounded text-xs font-medium transition-colors"
                              >
                                Reject
                              </button>
                            )}
                            
                            {application.status === 'rejected' && (
                              <button
                                onClick={() => updateApplicationStatus(application.id, 'pending')}
                                className="px-2 py-1 bg-yellow-900 text-yellow-300 hover:bg-yellow-800 rounded text-xs font-medium transition-colors"
                              >
                                Restore
                              </button>
                            )}
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
