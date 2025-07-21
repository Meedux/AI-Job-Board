'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { 
  Users, 
  Briefcase, 
  FileText, 
  Building2,
  TrendingUp, 
  TrendingDown, 
  Minus,
  Calendar,
  Target,
  BarChart3,
  PieChart,
  Activity,
  DollarSign,
  Shield,
  Server,
  Zap,
  Eye,
  Clock,
  CheckCircle,
  AlertCircle,
  Settings
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

// Helper function to format numbers
const formatNumber = (num) => {
  if (num >= 1000000) return `${(num / 1000000).toFixed(1)}M`;
  if (num >= 1000) return `${(num / 1000).toFixed(1)}K`;
  return num.toString();
};

export default function SuperAdminAnalyticsPage() {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [analytics, setAnalytics] = useState({});
  const [isLoading, setIsLoading] = useState(true);
  const [dateRange, setDateRange] = useState('30d');

  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (mounted && user && user.role === 'super_admin') {
      fetchAnalytics();
    }
  }, [mounted, user, dateRange]);

  const fetchAnalytics = async () => {
    setIsLoading(true);
    try {
      const response = await fetch(`/api/super-admin/analytics?dateRange=${dateRange}`);
      if (response.ok) {
        const data = await response.json();
        setAnalytics(data);
      } else {
        console.error('Failed to fetch analytics');
      }
    } catch (error) {
      console.error('Error fetching analytics:', error);
    } finally {
      setIsLoading(false);
    }
  };

  if (loading || !mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <Shield className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
            <p className="text-gray-400">Super admin access required</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
      <Header />
      
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-7xl mx-auto">
          {/* Header */}
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-8">
            <div>
              <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                <BarChart3 className="w-8 h-8 text-blue-400" />
                Super Admin Analytics
              </h1>
              <p className="text-gray-400">System-wide performance and statistics</p>
            </div>
            
            <div className="flex items-center space-x-4 mt-4 sm:mt-0">
              <select
                value={dateRange}
                onChange={(e) => setDateRange(e.target.value)}
                className="bg-gray-800/50 border border-gray-700/50 text-white px-4 py-2 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500/50"
              >
                <option value="7d">Last 7 days</option>
                <option value="30d">Last 30 days</option>
                <option value="90d">Last 90 days</option>
                <option value="1y">Last year</option>
              </select>
              
              <button
                onClick={fetchAnalytics}
                className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-colors flex items-center gap-2"
              >
                <Activity className="w-4 h-4" />
                Refresh
              </button>
            </div>
          </div>

          {isLoading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {[...Array(8)].map((_, i) => (
                <div key={i} className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 animate-pulse">
                  <div className="w-8 h-8 bg-gray-700 rounded-lg mb-4"></div>
                  <div className="h-6 bg-gray-700 rounded mb-2"></div>
                  <div className="h-4 bg-gray-700 rounded w-3/4"></div>
                </div>
              ))}
            </div>
          ) : (
            <div className="space-y-8">
              {/* Overview Cards */}
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                {/* Total Users */}
                <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Total Users</p>
                      <p className="text-3xl font-bold text-white mt-1">
                        {formatNumber(analytics.overview?.totalUsers || 0)}
                      </p>
                      <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        +{analytics.overview?.recentUsers || 0} this period
                      </p>
                    </div>
                    <div className="bg-blue-500/20 p-3 rounded-full">
                      <Users className="w-6 h-6 text-blue-400" />
                    </div>
                  </div>
                </div>

                {/* Total Jobs */}
                <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 hover:border-green-500/30 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Total Jobs</p>
                      <p className="text-3xl font-bold text-white mt-1">
                        {formatNumber(analytics.overview?.totalJobs || 0)}
                      </p>
                      <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        +{analytics.overview?.recentJobs || 0} this period
                      </p>
                    </div>
                    <div className="bg-green-500/20 p-3 rounded-full">
                      <Briefcase className="w-6 h-6 text-green-400" />
                    </div>
                  </div>
                </div>

                {/* Total Applications */}
                <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Total Applications</p>
                      <p className="text-3xl font-bold text-white mt-1">
                        {formatNumber(analytics.overview?.totalApplications || 0)}
                      </p>
                      <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
                        <TrendingUp className="w-4 h-4" />
                        +{analytics.overview?.recentApplications || 0} this period
                      </p>
                    </div>
                    <div className="bg-purple-500/20 p-3 rounded-full">
                      <FileText className="w-6 h-6 text-purple-400" />
                    </div>
                  </div>
                </div>

                {/* Active Companies */}
                <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 hover:border-yellow-500/30 transition-all duration-300">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-gray-400 text-sm font-medium">Companies</p>
                      <p className="text-3xl font-bold text-white mt-1">
                        {formatNumber(analytics.overview?.totalCompanies || 0)}
                      </p>
                      <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
                        <Eye className="w-4 h-4" />
                        {analytics.overview?.activeUsers || 0} active
                      </p>
                    </div>
                    <div className="bg-yellow-500/20 p-3 rounded-full">
                      <Building2 className="w-6 h-6 text-yellow-400" />
                    </div>
                  </div>
                </div>
              </div>

              {/* System Health & Revenue */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {/* System Health */}
                <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50">
                  <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <Server className="w-5 h-5 text-green-400" />
                    System Health
                  </h2>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <span className="text-white">Active Jobs</span>
                      </div>
                      <span className="text-white font-semibold">
                        {analytics.systemHealth?.activeJobsCount || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Clock className="w-5 h-5 text-yellow-400" />
                        <span className="text-white">Pending Applications</span>
                      </div>
                      <span className="text-white font-semibold">
                        {analytics.systemHealth?.pendingApplicationsCount || 0}
                      </span>
                    </div>
                    <div className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                      <div className="flex items-center gap-3">
                        <Zap className="w-5 h-5 text-blue-400" />
                        <span className="text-white">Credits Utilization</span>
                      </div>
                      <span className="text-white font-semibold">
                        {analytics.systemHealth?.creditsUtilization || 0}%
                      </span>
                    </div>
                  </div>
                </div>

                {/* User Types Breakdown */}
                <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50">
                  <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <PieChart className="w-5 h-5 text-purple-400" />
                    User Types
                  </h2>
                  <div className="space-y-4">
                    {analytics.usersByRole && analytics.usersByRole.map((userType, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-gray-700/30 rounded-lg">
                        <div>
                          <p className="text-white font-medium capitalize">
                            {userType.role.replace('_', ' ')}
                          </p>
                          <p className="text-gray-400 text-sm">{userType.count} users</p>
                        </div>
                        <div className="flex items-center space-x-3">
                          <div className="w-20 bg-gray-700 rounded-full h-2">
                            <div 
                              className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-500"
                              style={{ width: `${userType.percentage}%` }}
                            ></div>
                          </div>
                          <span className="text-white text-sm font-medium w-10">
                            {userType.percentage}%
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Revenue Stats */}
                <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50">
                  <h2 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
                    <DollarSign className="w-5 h-5 text-green-400" />
                    Revenue Overview
                  </h2>
                  {analytics.revenue ? (
                    <div className="space-y-4">
                      <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                        <p className="text-3xl font-bold text-green-400">
                          ₱{(analytics.revenue.total || 0).toLocaleString()}
                        </p>
                        <p className="text-gray-400 text-sm">Total Revenue</p>
                      </div>
                      <div className="text-center p-4 bg-gray-700/30 rounded-lg">
                        <p className="text-2xl font-bold text-white">
                          {analytics.revenue.transactionCount || 0}
                        </p>
                        <p className="text-gray-400 text-sm">Transactions</p>
                      </div>
                    </div>
                  ) : (
                    <div className="text-center py-8 text-gray-400">
                      <DollarSign className="w-12 h-12 mx-auto mb-3 opacity-50" />
                      <p>No revenue data available</p>
                    </div>
                  )}
                </div>
              </div>

              {/* Top Companies */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-700/50 bg-gray-800/30">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Building2 className="w-5 h-5 text-yellow-400" />
                    Top Performing Companies
                  </h2>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full">
                    <thead className="bg-gray-700/30">
                      <tr>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Company
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Jobs Posted
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Applications
                        </th>
                        <th className="px-6 py-3 text-left text-xs font-medium text-gray-300 uppercase tracking-wider">
                          Joined Date
                        </th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-700/50">
                      {analytics.topCompanies && analytics.topCompanies.length > 0 ? 
                        analytics.topCompanies.map((company, index) => (
                          <tr key={company.id} className="hover:bg-gray-700/30 transition-colors">
                            <td className="px-6 py-4 whitespace-nowrap">
                              <div>
                                <div className="text-white font-medium">{company.name}</div>
                                <div className="text-gray-400 text-sm">{company.email}</div>
                              </div>
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                              {company.jobsPosted}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                              {company.totalApplications}
                            </td>
                            <td className="px-6 py-4 whitespace-nowrap text-gray-300">
                              {new Date(company.joinedDate).toLocaleDateString()}
                            </td>
                          </tr>
                        )) : (
                          <tr>
                            <td colSpan="4" className="px-6 py-12 text-center text-gray-400">
                              No company data available
                            </td>
                          </tr>
                        )}
                    </tbody>
                  </table>
                </div>
              </div>

              {/* Recent Platform Activities */}
              <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-700/50 bg-gray-800/30">
                  <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                    <Activity className="w-5 h-5 text-blue-400" />
                    Recent Platform Activity
                  </h2>
                </div>
                <div className="p-6">
                  <div className="space-y-4">
                    {analytics.recentActivities && analytics.recentActivities.length > 0 ? 
                      analytics.recentActivities.map((activity, index) => (
                        <div key={activity.id} className="flex items-start space-x-4 p-3 bg-gray-700/20 rounded-lg hover:bg-gray-700/30 transition-colors">
                          <div className={`w-10 h-10 rounded-full flex items-center justify-center text-sm ${
                            activity.type.includes('user') ? 'bg-blue-500/20 text-blue-400' :
                            activity.type.includes('job') ? 'bg-green-500/20 text-green-400' :
                            activity.type.includes('application') ? 'bg-purple-500/20 text-purple-400' :
                            'bg-yellow-500/20 text-yellow-400'
                          }`}>
                            {activity.type.includes('user') ? <Users className="w-5 h-5" /> :
                             activity.type.includes('job') ? <Briefcase className="w-5 h-5" /> :
                             activity.type.includes('application') ? <FileText className="w-5 h-5" /> :
                             <Settings className="w-5 h-5" />}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-white font-medium">{activity.description}</p>
                            <p className="text-gray-400 text-sm">
                              {activity.user.companyName || activity.user.email} ({activity.user.role}) • {formatTimeAgo(activity.createdAt)}
                            </p>
                          </div>
                        </div>
                      )) : (
                        <div className="text-center py-8 text-gray-400">
                          <Activity className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No recent platform activity to display</p>
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
