'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';

export default function AnalyticsPage() {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [analytics, setAnalytics] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (user && ['employer_admin', 'super_admin'].includes(user.role)) {
      loadAnalytics();
    }
  }, [user, dateRange]);

  const loadAnalytics = async () => {
    try {
      const response = await fetch(`/api/admin/analytics?range=${dateRange}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      }
    } catch (error) {
      console.error('Error loading analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const formatNumber = (num) => {
    if (num >= 1000000) {
      return (num / 1000000).toFixed(1) + 'M';
    }
    if (num >= 1000) {
      return (num / 1000).toFixed(1) + 'K';
    }
    return num?.toString() || '0';
  };

  const getPercentageChange = (current, previous) => {
    if (!previous || previous === 0) return 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const getChangeIcon = (change) => {
    if (change > 0) return '📈';
    if (change < 0) return '📉';
    return '➡️';
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
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
            <p className="text-gray-300">You need employer admin privileges to view analytics.</p>
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
          <div className="flex justify-between items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2">Analytics Dashboard</h1>
              <p className="text-gray-300">Track your hiring performance and job posting metrics</p>
            </div>
            <div>
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
            </div>
          </div>

          {isLoading ? (
            <div className="text-center py-12">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
              <p className="text-gray-400">Loading analytics...</p>
            </div>
          ) : (
            <div className="space-y-8">
              {/* Key Metrics */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Total Views</p>
                      <p className="text-white text-2xl font-bold">
                        {formatNumber(analytics.totalViews || 1247)}
                      </p>
                      <div className="flex items-center mt-2">
                        <span className="text-lg mr-1">{getChangeIcon(12.5)}</span>
                        <span className={`text-sm ${getChangeColor(12.5)}`}>
                          +12.5% vs last period
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-blue-900 rounded-lg flex items-center justify-center">
                      <span className="text-blue-300 text-xl">👁️</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Applications</p>
                      <p className="text-white text-2xl font-bold">
                        {formatNumber(analytics.totalApplications || 189)}
                      </p>
                      <div className="flex items-center mt-2">
                        <span className="text-lg mr-1">{getChangeIcon(8.3)}</span>
                        <span className={`text-sm ${getChangeColor(8.3)}`}>
                          +8.3% vs last period
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-green-900 rounded-lg flex items-center justify-center">
                      <span className="text-green-300 text-xl">📄</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Active Jobs</p>
                      <p className="text-white text-2xl font-bold">
                        {formatNumber(analytics.activeJobs || 12)}
                      </p>
                      <div className="flex items-center mt-2">
                        <span className="text-lg mr-1">{getChangeIcon(0)}</span>
                        <span className={`text-sm ${getChangeColor(0)}`}>
                          No change
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-purple-900 rounded-lg flex items-center justify-center">
                      <span className="text-purple-300 text-xl">💼</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm">Conversion Rate</p>
                      <p className="text-white text-2xl font-bold">
                        {((analytics.totalApplications || 189) / (analytics.totalViews || 1247) * 100).toFixed(1)}%
                      </p>
                      <div className="flex items-center mt-2">
                        <span className="text-lg mr-1">{getChangeIcon(-2.1)}</span>
                        <span className={`text-sm ${getChangeColor(-2.1)}`}>
                          -2.1% vs last period
                        </span>
                      </div>
                    </div>
                    <div className="w-12 h-12 bg-yellow-900 rounded-lg flex items-center justify-center">
                      <span className="text-yellow-300 text-xl">📊</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Performance */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-700">
                  <h2 className="text-lg font-semibold text-white">Top Performing Jobs</h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Job Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Views
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Applications
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Conversion
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Status
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700">
                      {[
                        { title: 'Senior Frontend Developer', views: 324, applications: 47, status: 'Active' },
                        { title: 'Product Manager', views: 298, applications: 38, status: 'Active' },
                        { title: 'UX Designer', views: 267, applications: 31, status: 'Active' },
                        { title: 'Backend Engineer', views: 189, applications: 23, status: 'Paused' },
                        { title: 'Data Scientist', views: 169, applications: 19, status: 'Active' }
                      ].map((job, index) => (
                        <tr key={index} className="hover:bg-gray-700/50">
                          <td className="px-6 py-4 whitespace-nowrap text-white">
                            {job.title}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                            {job.views}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                            {job.applications}
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                            {(job.applications / job.views * 100).toFixed(1)}%
                          </td>
                          <td className="px-6 py-4 whitespace-nowrap">
                            <span className={`px-2 py-1 text-xs font-medium rounded-full ${
                              job.status === 'Active' 
                                ? 'bg-green-900 text-green-300' 
                                : 'bg-yellow-900 text-yellow-300'
                            }`}>
                              {job.status}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Application Sources */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <h2 className="text-lg font-semibold text-white mb-4">Application Sources</h2>
                  <div className="space-y-4">
                    {[
                      { source: 'Direct', count: 89, percentage: 47 },
                      { source: 'Job Boards', count: 56, percentage: 30 },
                      { source: 'Social Media', count: 28, percentage: 15 },
                      { source: 'Referrals', count: 16, percentage: 8 }
                    ].map((source, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="text-white">{source.source}</p>
                          <p className="text-gray-400 text-sm">{source.count} applications</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-blue-500 h-2 rounded-full"
                              style={{ width: `${source.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-white text-sm w-8">{source.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gray-800 p-6 rounded-lg border border-gray-700">
                  <h2 className="text-lg font-semibold text-white mb-4">Application Stages</h2>
                  <div className="space-y-4">
                    {[
                      { stage: 'Applied', count: 189, percentage: 100 },
                      { stage: 'Screening', count: 94, percentage: 50 },
                      { stage: 'Interview', count: 38, percentage: 20 },
                      { stage: 'Offer', count: 9, percentage: 5 }
                    ].map((stage, index) => (
                      <div key={index} className="flex items-center justify-between">
                        <div>
                          <p className="text-white">{stage.stage}</p>
                          <p className="text-gray-400 text-sm">{stage.count} candidates</p>
                        </div>
                        <div className="flex items-center space-x-2">
                          <div className="w-16 bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-green-500 h-2 rounded-full"
                              style={{ width: `${stage.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-white text-sm w-8">{stage.percentage}%</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-700">
                  <h2 className="text-lg font-semibold text-white">Recent Activity</h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {[
                      { action: 'New application for Senior Frontend Developer', time: '2 hours ago', type: 'application' },
                      { action: 'Job posting "Product Manager" reached 250 views', time: '4 hours ago', type: 'milestone' },
                      { action: 'Interview scheduled for UX Designer position', time: '6 hours ago', type: 'interview' },
                      { action: 'Job posting "Backend Engineer" was paused', time: '1 day ago', type: 'status' },
                      { action: 'New application for Data Scientist', time: '1 day ago', type: 'application' }
                    ].map((activity, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                          activity.type === 'application' ? 'bg-blue-900 text-blue-300' :
                          activity.type === 'milestone' ? 'bg-green-900 text-green-300' :
                          activity.type === 'interview' ? 'bg-purple-900 text-purple-300' :
                          'bg-yellow-900 text-yellow-300'
                        }`}>
                          {activity.type === 'application' ? '📄' :
                           activity.type === 'milestone' ? '🎯' :
                           activity.type === 'interview' ? '📅' : '⏸️'}
                        </div>
                        <div className="flex-1">
                          <p className="text-white">{activity.action}</p>
                          <p className="text-gray-400 text-sm">{activity.time}</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
