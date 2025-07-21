'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { 
  Eye, 
  FileText, 
  Briefcase, 
  TrendingUp, 
  TrendingDown, 
  Minus,
  Calendar,
  Users,
  Target,
  BarChart3,
  PieChart,
  Activity
} from 'lucide-react';

// Helper function to format time ago
const formatTimeAgo = (dateString) => {
  const now = new Date();
  const date = new Date(dateString);
  const diffInSeconds = Math.floor((now - date) / 1000);
  
  if (diffInSeconds < 60) return 'Just now';
  if (diffInSeconds < 3600) return `${Math.floor(diffInSeconds / 60)} minutes ago`;
  if (diffInSeconds < 86400) return `${Math.floor(diffInSeconds / 3600)} hours ago`;
  if (diffInSeconds < 604800) return `${Math.floor(diffInSeconds / 86400)} days ago`;
  return `${Math.floor(diffInSeconds / 604800)} weeks ago`;
};

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
    setIsLoading(true);
    try {
      const response = await fetch(`/api/admin/analytics?range=${dateRange}`, {
        credentials: 'include'
      });
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        console.error('Failed to load analytics');
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
    if (!previous || previous === 0) return current > 0 ? 100 : 0;
    return ((current - previous) / previous * 100).toFixed(1);
  };

  const getChangeIcon = (change) => {
    if (change > 0) return TrendingUp;
    if (change < 0) return TrendingDown;
    return Minus;
  };

  const getChangeColor = (change) => {
    if (change > 0) return 'text-green-400';
    if (change < 0) return 'text-red-400';
    return 'text-gray-400';
  };

  const formatTimeAgo = (date) => {
    const now = new Date();
    const past = new Date(date);
    const diffInMinutes = Math.floor((now - past) / (1000 * 60));
    
    if (diffInMinutes < 60) return `${diffInMinutes} minutes ago`;
    if (diffInMinutes < 1440) return `${Math.floor(diffInMinutes / 60)} hours ago`;
    return `${Math.floor(diffInMinutes / 1440)} days ago`;
  };

  if (!mounted || loading) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Header />
        <div className="flex items-center justify-center pt-16 min-h-screen">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
            <p className="text-gray-300">Loading...</p>
          </div>
        </div>
      </div>
    );
  }

  if (!user || !['employer_admin', 'super_admin'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-950">
        <Header />
        <div className="flex items-center justify-center pt-16 min-h-screen">
          <div className="text-center">
            <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
            <p className="text-gray-300">You need employer admin privileges to view analytics.</p>
          </div>
        </div>
      </div>
    );
  }

  const applicationsChange = getPercentageChange(analytics.totalApplications, analytics.previousApplications);
  const viewsChange = getPercentageChange(analytics.totalViews, analytics.previousViews);
  const conversionRate = analytics.totalViews > 0 ? 
    ((analytics.totalApplications / analytics.totalViews) * 100).toFixed(1) : '0.0';

  return (
    <div className="min-h-screen bg-gray-950">
      <Header />
      <div className="text-white pt-16 min-h-screen">
        <div className="container mx-auto px-4 py-8">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8 gap-4">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-blue-400" />
                Analytics Dashboard
              </h1>
              <p className="text-gray-400">Track your hiring performance and job posting metrics</p>
            </div>
            <div className="flex items-center gap-3">
              <Calendar className="w-5 h-5 text-gray-400" />
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-gray-800 text-white border border-gray-700 rounded-lg px-4 py-2 focus:outline-none focus:ring-2 focus:ring-blue-500"
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
                <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Total Views</p>
                      <p className="text-white text-3xl font-bold mt-1">
                        {formatNumber(analytics.totalViews || 0)}
                      </p>
                      <div className="flex items-center mt-3">
                        {(() => {
                          const ChangeIcon = getChangeIcon(viewsChange);
                          return (
                            <>
                              <ChangeIcon className={`w-4 h-4 mr-2 ${getChangeColor(viewsChange)}`} />
                              <span className={`text-sm font-medium ${getChangeColor(viewsChange)}`}>
                                {viewsChange > 0 ? '+' : ''}{viewsChange}% vs last period
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="w-14 h-14 bg-blue-500/20 rounded-xl flex items-center justify-center">
                      <Eye className="w-7 h-7 text-blue-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Applications</p>
                      <p className="text-white text-3xl font-bold mt-1">
                        {formatNumber(analytics.totalApplications || 0)}
                      </p>
                      <div className="flex items-center mt-3">
                        {(() => {
                          const ChangeIcon = getChangeIcon(applicationsChange);
                          return (
                            <>
                              <ChangeIcon className={`w-4 h-4 mr-2 ${getChangeColor(applicationsChange)}`} />
                              <span className={`text-sm font-medium ${getChangeColor(applicationsChange)}`}>
                                {applicationsChange > 0 ? '+' : ''}{applicationsChange}% vs last period
                              </span>
                            </>
                          );
                        })()}
                      </div>
                    </div>
                    <div className="w-14 h-14 bg-green-500/20 rounded-xl flex items-center justify-center">
                      <FileText className="w-7 h-7 text-green-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Active Jobs</p>
                      <p className="text-white text-3xl font-bold mt-1">
                        {formatNumber(analytics.activeJobs || 0)}
                      </p>
                      <div className="flex items-center mt-3">
                        <Minus className="w-4 h-4 mr-2 text-gray-400" />
                        <span className="text-sm font-medium text-gray-400">
                          Current active postings
                        </span>
                      </div>
                    </div>
                    <div className="w-14 h-14 bg-purple-500/20 rounded-xl flex items-center justify-center">
                      <Briefcase className="w-7 h-7 text-purple-400" />
                    </div>
                  </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 hover:border-gray-600/50 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Conversion Rate</p>
                      <p className="text-white text-3xl font-bold mt-1">
                        {conversionRate}%
                      </p>
                      <div className="flex items-center mt-3">
                        <Target className="w-4 h-4 mr-2 text-yellow-400" />
                        <span className="text-sm font-medium text-gray-400">
                          Views to applications
                        </span>
                      </div>
                    </div>
                    <div className="w-14 h-14 bg-yellow-500/20 rounded-xl flex items-center justify-center">
                      <Target className="w-7 h-7 text-yellow-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* Job Performance */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-700/50 bg-gray-800/30">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Briefcase className="w-5 h-5 text-blue-400" />
                    Top Performing Jobs
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700/30">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Job Title
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Company
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
                    <tbody className="divide-y divide-gray-700/50">
                      {analytics.topPerformingJobs && analytics.topPerformingJobs.length > 0 ? 
                        analytics.topPerformingJobs.map((job, index) => (
                          <tr key={job.id} className="hover:bg-gray-700/30 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-white font-medium">{job.title}</div>
                                <div className="text-gray-400 text-sm">{job.location || 'Remote'}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                              {job.company}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                              {job.views}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                              {job.applications}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`font-medium ${
                                parseFloat(job.conversionRate) > 15 ? 'text-green-400' :
                                parseFloat(job.conversionRate) > 10 ? 'text-yellow-400' : 'text-gray-300'
                              }`}>
                                {job.conversionRate}%
                              </span>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap">
                              <span className={`px-3 py-1 text-xs font-medium rounded-full ${
                                job.status === 'active' 
                                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                                  : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                              }`}>
                                {job.status.charAt(0).toUpperCase() + job.status.slice(1)}
                              </span>
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="6" className="px-6 py-12 text-center text-gray-400">
                              No job data available for the selected period
                            </td>
                          </tr>
                        )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Application Sources & Stages */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50">
                  <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-green-400" />
                    Application Sources
                  </h2>
                  <div className="space-y-4">
                    {/* For now showing application statuses since sources data needs tracking */}
                    {analytics.applicationsByStatus && analytics.applicationsByStatus.map((source, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{source.status}</p>
                          <p className="text-gray-400 text-sm">{source.count} applications</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-20 bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.round((source.count / analytics.totalApplications) * 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-white text-sm font-medium w-10">
                            {Math.round((source.count / analytics.totalApplications) * 100)}%
                          </span>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-gray-400">
                        <PieChart className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No application data available</p>
                      </div>
                    )}
                  </div>
                </div>

                <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50">
                  <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <Users className="w-5 h-5 text-purple-400" />
                    Application Stages
                  </h2>
                  <div className="space-y-4">
                    {analytics.applicationStages && analytics.applicationStages.map((stage, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                        <div>
                          <p className="text-white font-medium">{stage.stage}</p>
                          <p className="text-gray-400 text-sm">{stage.count} candidates</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-20 bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${Math.round((stage.count / analytics.totalApplications) * 100)}%` }}
                            ></div>
                          </div>
                          <span className="text-white text-sm font-medium w-10">
                            {Math.round((stage.count / analytics.totalApplications) * 100)}%
                          </span>
                        </div>
                      </div>
                    )) || (
                      <div className="text-center py-8 text-gray-400">
                        <Users className="w-12 h-12 mx-auto mb-3 opacity-50" />
                        <p>No stage data available</p>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Recent Activity */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-700/50 bg-gray-800/30">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-yellow-400" />
                    Recent Activity
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {analytics.recentActivities && analytics.recentActivities.length > 0 ? 
                      analytics.recentActivities.map((activity, index) => (
                        <div key={activity.id || index} className="flex items-start space-x-4 p-3 bg-gray-700/20 rounded-lg hover:bg-gray-700/30 transition-colors">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${
                            activity.type === 'application' ? 'bg-blue-500/20 text-blue-400' :
                            activity.type === 'milestone' ? 'bg-green-500/20 text-green-400' :
                            activity.type === 'interview' ? 'bg-purple-500/20 text-purple-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            <FileText className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium">{activity.action}</p>
                            <p className="text-gray-400 text-sm">
                              {activity.applicant && `by ${activity.applicant} • `}
                              {activity.time ? formatTimeAgo(activity.time) : 'Recently'}
                            </p>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-8 text-gray-400">
                          <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No recent activity to display</p>
                        </div>
                      )}
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
