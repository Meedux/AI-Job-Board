'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import { 
  Users, 
  Calendar, 
  FileText, 
  Search,
  Filter,
  Eye,
  Star,
  Clock,
  CheckCircle,
  XCircle,
  AlertCircle,
  MessageSquare,
  Video,
  Phone,
  MapPin,
  Mail,
  User,
  Briefcase,
  TrendingUp,
  BarChart3,
  Plus,
  ChevronDown,
  ChevronRight,
  Edit,
  Trash2,
  Download,
  Send,
  PlayCircle,
  PauseCircle,
  Award,
  Target,
  Activity
} from 'lucide-react';

export default function ATSDashboard() {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);
  const [applications, setApplications] = useState([]);
  const [isLoading, setIsLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('overview');
  const [selectedApplication, setSelectedApplication] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');

  // Animation states
  const [animateCards, setAnimateCards] = useState(false);

  useEffect(() => {
    setMounted(true);
    // Trigger card animations after mount
    setTimeout(() => setAnimateCards(true), 100);
  }, []);

  useEffect(() => {
    if (mounted && user && user.role === 'employer_admin') {
      fetchApplications();
    }
  }, [mounted, user, statusFilter]);

  const fetchApplications = async () => {
    setIsLoading(true);
    try {
      // Use the ATS API endpoint for actual data
      let url = '/api/ats/applications?';
      if (statusFilter !== 'all') url += `status=${statusFilter}&`;
      
      const response = await fetch(url);
      if (response.ok) {
        const data = await response.json();
        setApplications(data.applications || []);
      } else {
        console.error('Failed to fetch applications:', response.statusText);
        setApplications([]);
      }
    } catch (error) {
      console.error('Error fetching applications:', error);
      setApplications([]);
    } finally {
      setIsLoading(false);
    }
  };

  const updateApplicationStatus = async (applicationId, updates) => {
    try {
      const response = await fetch('/api/ats/applications', {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          applicationId,
          ...updates
        }),
      });

      if (response.ok) {
        // Refresh applications after successful update
        await fetchApplications();
        setIsModalOpen(false);
        setSelectedApplication(null);
      } else {
        console.error('Failed to update application:', response.statusText);
        const errorData = await response.json();
        console.error('Error details:', errorData);
      }
    } catch (error) {
      console.error('Error updating application:', error);
    }
  };

  const getStatusColor = (status) => {
    const colors = {
      pending: 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30',
      reviewed: 'bg-blue-500/20 text-blue-400 border-blue-500/30',
      shortlisted: 'bg-purple-500/20 text-purple-400 border-purple-500/30',
      interview_scheduled: 'bg-indigo-500/20 text-indigo-400 border-indigo-500/30',
      interviewed: 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
      offered: 'bg-green-500/20 text-green-400 border-green-500/30',
      hired: 'bg-emerald-500/20 text-emerald-400 border-emerald-500/30',
      rejected: 'bg-red-500/20 text-red-400 border-red-500/30',
      withdrawn: 'bg-gray-500/20 text-gray-400 border-gray-500/30'
    };
    return colors[status] || colors.pending;
  };

  const getPriorityColor = (priority) => {
    const colors = {
      low: 'text-gray-400',
      normal: 'text-blue-400',
      high: 'text-yellow-400',
      urgent: 'text-red-400'
    };
    return colors[priority] || colors.normal;
  };

  const filteredApplications = applications.filter(app => {
    const matchesSearch = searchTerm === '' || 
      app.applicant.firstName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant.lastName?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.applicant.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      app.job.title?.toLowerCase().includes(searchTerm.toLowerCase());
    
    return matchesSearch;
  });

  if (loading || !mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <div className="flex items-center justify-center min-h-screen">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500"></div>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'employer_admin') {
    return (
      <div className="min-h-screen bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900">
        <Header />
        <div className="flex items-center justify-center min-h-screen">
          <div className="text-center">
            <AlertCircle className="w-16 h-16 text-red-400 mx-auto mb-4" />
            <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
            <p className="text-gray-400">ATS access requires Employer Admin privileges</p>
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
          <div className={`mb-8 transition-all duration-500 ${animateCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4'}`}>
            <div className="flex flex-col mt-10 sm:flex-row justify-between items-start sm:items-center">
              <div>
                <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
                  <Users className="w-8 h-8 text-blue-400" />
                  Applicant Tracking System
                </h1>
                <p className="text-gray-400">Manage applications, track candidates, and streamline your hiring process</p>
              </div>
              
              <div className="flex items-center space-x-4 mt-4 sm:mt-0">
                <button className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 hover:scale-105">
                  <Plus className="w-4 h-4" />
                  Schedule Interview
                </button>
                <button className="bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-lg transition-all duration-300 flex items-center gap-2 hover:scale-105">
                  <Download className="w-4 h-4" />
                  Export Data
                </button>
              </div>
            </div>
          </div>

          {/* Stats Cards */}
          <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8 transition-all duration-700 delay-100 ${animateCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-blue-500/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Total Applications</p>
                  <p className="text-3xl font-bold text-white mt-1">{applications.length}</p>
                  <p className="text-blue-400 text-sm mt-2 flex items-center gap-1">
                    <TrendingUp className="w-4 h-4" />
                    +12% this month
                  </p>
                </div>
                <div className="bg-blue-500/20 p-3 rounded-full">
                  <FileText className="w-6 h-6 text-blue-400" />
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 hover:border-yellow-500/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-yellow-500/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Pending Review</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {applications.filter(app => app.status === 'pending').length}
                  </p>
                  <p className="text-yellow-400 text-sm mt-2 flex items-center gap-1">
                    <Clock className="w-4 h-4" />
                    Requires attention
                  </p>
                </div>
                <div className="bg-yellow-500/20 p-3 rounded-full">
                  <Clock className="w-6 h-6 text-yellow-400" />
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 hover:border-purple-500/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-purple-500/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">In Progress</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {applications.filter(app => ['reviewed', 'shortlisted'].includes(app.status)).length}
                  </p>
                  <p className="text-purple-400 text-sm mt-2 flex items-center gap-1">
                    <Activity className="w-4 h-4" />
                    Active candidates
                  </p>
                </div>
                <div className="bg-purple-500/20 p-3 rounded-full">
                  <PlayCircle className="w-6 h-6 text-purple-400" />
                </div>
              </div>
            </div>

            <div className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 hover:border-green-500/30 transition-all duration-300 hover:scale-105 hover:shadow-lg hover:shadow-green-500/10">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-gray-400 text-sm font-medium">Hired</p>
                  <p className="text-3xl font-bold text-white mt-1">
                    {applications.filter(app => app.status === 'hired').length}
                  </p>
                  <p className="text-green-400 text-sm mt-2 flex items-center gap-1">
                    <Award className="w-4 h-4" />
                    Success rate: 15%
                  </p>
                </div>
                <div className="bg-green-500/20 p-3 rounded-full">
                  <CheckCircle className="w-6 h-6 text-green-400" />
                </div>
              </div>
            </div>
          </div>

          {/* Tab Navigation */}
          <div className={`mb-6 transition-all duration-700 delay-200 ${animateCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-1">
              <div className="flex space-x-1">
                <button
                  onClick={() => setActiveTab('overview')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                    activeTab === 'overview'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <BarChart3 className="w-4 h-4" />
                  Overview
                </button>
                <button
                  onClick={() => setActiveTab('applications')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                    activeTab === 'applications'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <FileText className="w-4 h-4" />
                  Applications
                </button>
                <button
                  onClick={() => setActiveTab('pipeline')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                    activeTab === 'pipeline'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <Target className="w-4 h-4" />
                  Pipeline
                </button>
                <button
                  onClick={() => setActiveTab('interviews')}
                  className={`px-6 py-3 rounded-lg font-medium transition-all duration-300 flex items-center gap-2 ${
                    activeTab === 'interviews'
                      ? 'bg-blue-600 text-white shadow-lg'
                      : 'text-gray-400 hover:text-white hover:bg-gray-700/50'
                  }`}
                >
                  <Calendar className="w-4 h-4" />
                  Interviews
                </button>
              </div>
            </div>
          </div>

          {/* Content based on active tab */}
          <div className={`transition-all duration-700 delay-400 ${animateCards ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-8'}`}>
            {activeTab === 'overview' && <OverviewTab applications={applications} />}
            {activeTab === 'applications' && (
              <ApplicationsTab 
                applications={filteredApplications}
                isLoading={isLoading}
                searchTerm={searchTerm}
                setSearchTerm={setSearchTerm}
                statusFilter={statusFilter}
                setStatusFilter={setStatusFilter}
                onSelectApplication={setSelectedApplication}
                onOpenModal={() => setIsModalOpen(true)}
                getStatusColor={getStatusColor}
                getPriorityColor={getPriorityColor}
              />
            )}
            {activeTab === 'pipeline' && <PipelineTab applications={applications} />}
            {activeTab === 'interviews' && <InterviewsTab />}
          </div>
        </div>
      </div>

      {/* Application Detail Modal */}
      {isModalOpen && selectedApplication && (
        <ApplicationModal
          application={selectedApplication}
          onClose={() => {
            setIsModalOpen(false);
            setSelectedApplication(null);
          }}
          onUpdate={updateApplicationStatus}
          getStatusColor={getStatusColor}
        />
      )}
    </div>
  );
}

// Overview Tab Component
function OverviewTab({ applications }) {
  const [recentActivities, setRecentActivities] = useState([]);
  const [isLoadingActivity, setIsLoadingActivity] = useState(true);

  useEffect(() => {
    fetchRecentActivity();
  }, []);

  const fetchRecentActivity = async () => {
    setIsLoadingActivity(true);
    try {
      // Fetch recent activity from applications
      const activities = [];
      
      // Add recent applications
      applications.slice(0, 4).forEach(app => {
        const daysDiff = Math.floor((new Date() - new Date(app.appliedAt)) / (1000 * 60 * 60 * 24));
        const timeAgo = daysDiff === 0 ? 'Today' : 
                       daysDiff === 1 ? '1 day ago' : 
                       daysDiff < 7 ? `${daysDiff} days ago` : 
                       `${Math.floor(daysDiff / 7)} week${Math.floor(daysDiff / 7) > 1 ? 's' : ''} ago`;
        
        activities.push({
          action: 'New application received',
          candidate: `${app.applicant.firstName} ${app.applicant.lastName}`,
          time: timeAgo,
          type: 'application'
        });
      });

      // Add status change activities based on application status
      applications.forEach(app => {
        if (app.status === 'reviewed') {
          activities.push({
            action: 'Application reviewed',
            candidate: `${app.applicant.firstName} ${app.applicant.lastName}`,
            time: 'Recently',
            type: 'review'
          });
        } else if (app.status === 'interview_scheduled') {
          activities.push({
            action: 'Interview scheduled',
            candidate: `${app.applicant.firstName} ${app.applicant.lastName}`,
            time: 'Recently',
            type: 'interview'
          });
        } else if (app.status === 'hired') {
          activities.push({
            action: 'Candidate hired',
            candidate: `${app.applicant.firstName} ${app.applicant.lastName}`,
            time: 'Recently',
            type: 'hire'
          });
        }
      });

      // Sort and limit to most recent 4 activities
      setRecentActivities(activities.slice(0, 4));
    } catch (error) {
      console.error('Error fetching recent activity:', error);
    } finally {
      setIsLoadingActivity(false);
    }
  };

  const statusCounts = applications.reduce((acc, app) => {
    acc[app.status] = (acc[app.status] || 0) + 1;
    return acc;
  }, {});

  const stageCounts = applications.reduce((acc, app) => {
    acc[app.stage] = (acc[app.stage] || 0) + 1;
    return acc;
  }, {});

  // Calculate real metrics from actual data
  const totalApplications = applications.length;
  const reviewedApplications = applications.filter(a => a.status === 'reviewed').length;
  const interviewedApplications = applications.filter(a => a.status === 'interviewed').length;
  const offeredApplications = applications.filter(a => a.status === 'offered').length;
  const hiredApplications = applications.filter(a => a.status === 'hired').length;

  const conversionRates = {
    reviewRate: totalApplications > 0 ? Math.round((reviewedApplications / totalApplications) * 100) : 0,
    interviewRate: totalApplications > 0 ? Math.round((interviewedApplications / totalApplications) * 100) : 0,
    offerRate: totalApplications > 0 ? Math.round((offeredApplications / totalApplications) * 100) : 0,
    hireRate: totalApplications > 0 ? Math.round((hiredApplications / totalApplications) * 100) : 0
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {/* Hiring Funnel */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Target className="w-5 h-5 text-blue-400" />
          Hiring Funnel
        </h3>
        <div className="space-y-4">
          {[
            { stage: 'Applied', count: totalApplications, percentage: 100 },
            { stage: 'Reviewed', count: reviewedApplications, percentage: conversionRates.reviewRate },
            { stage: 'Interviewed', count: interviewedApplications, percentage: conversionRates.interviewRate },
            { stage: 'Offered', count: offeredApplications, percentage: conversionRates.offerRate },
            { stage: 'Hired', count: hiredApplications, percentage: conversionRates.hireRate }
          ].map((stage, index) => (
            <div key={stage.stage} className="relative">
              <div className="flex items-center justify-between mb-2">
                <span className="text-white font-medium">{stage.stage}</span>
                <span className="text-gray-400">{stage.count} candidates</span>
              </div>
              <div className="relative">
                <div className="w-full bg-gray-700 rounded-full h-3">
                  <div 
                    className="bg-gradient-to-r from-blue-500 to-purple-500 h-3 rounded-full transition-all duration-1000 ease-out"
                    style={{ 
                      width: `${stage.percentage}%`,
                      animationDelay: `${index * 200}ms`
                    }}
                  ></div>
                </div>
                <span className="absolute right-2 top-0 text-xs text-white font-medium">
                  {stage.percentage}%
                </span>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Activity */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <Activity className="w-5 h-5 text-green-400" />
          Recent Activity
        </h3>
        {isLoadingActivity ? (
          <div className="space-y-4">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="h-4 bg-gray-700 rounded w-3/4 mb-2"></div>
                <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        ) : recentActivities.length === 0 ? (
          <div className="text-center py-8">
            <Activity className="w-12 h-12 text-gray-400 mx-auto mb-3 opacity-50" />
            <p className="text-gray-400">No recent activity</p>
          </div>
        ) : (
          <div className="space-y-4">
            {recentActivities.map((activity, index) => (
              <div key={index} className="flex items-start space-x-3 p-3 bg-gray-700/30 rounded-lg hover:bg-gray-700/50 transition-colors">
                <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm ${
                  activity.type === 'application' ? 'bg-blue-500/20 text-blue-400' :
                  activity.type === 'interview' ? 'bg-purple-500/20 text-purple-400' :
                  activity.type === 'review' ? 'bg-yellow-500/20 text-yellow-400' :
                  'bg-green-500/20 text-green-400'
                }`}>
                  {activity.type === 'application' && <FileText className="w-4 h-4" />}
                  {activity.type === 'interview' && <Calendar className="w-4 h-4" />}
                  {activity.type === 'review' && <Eye className="w-4 h-4" />}
                  {activity.type === 'hire' && <CheckCircle className="w-4 h-4" />}
                </div>
                <div className="flex-1">
                  <p className="text-white font-medium">{activity.action}</p>
                  <p className="text-gray-400 text-sm">{activity.candidate} • {activity.time}</p>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Performance Metrics */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6 lg:col-span-2">
        <h3 className="text-lg font-semibold text-white mb-6 flex items-center gap-2">
          <TrendingUp className="w-5 h-5 text-purple-400" />
          Performance Metrics
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="text-center">
            <div className="text-3xl font-bold text-blue-400 mb-2">
              {totalApplications > 0 ? Math.round(totalApplications / 30) : 0}
            </div>
            <div className="text-gray-400 text-sm">Avg. Applications/Month</div>
            <div className="text-blue-400 text-xs mt-1">Based on current data</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-purple-400 mb-2">{conversionRates.reviewRate}%</div>
            <div className="text-gray-400 text-sm">Review Rate</div>
            <div className="text-purple-400 text-xs mt-1">Applications reviewed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-yellow-400 mb-2">{conversionRates.interviewRate}%</div>
            <div className="text-gray-400 text-sm">Interview Rate</div>
            <div className="text-yellow-400 text-xs mt-1">Candidates interviewed</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-green-400 mb-2">{conversionRates.hireRate}%</div>
            <div className="text-gray-400 text-sm">Hire Rate</div>
            <div className="text-green-400 text-xs mt-1">Successful hires</div>
          </div>
        </div>
      </div>
    </div>
  );
}

// Applications Tab Component
function ApplicationsTab({ 
  applications, 
  isLoading, 
  searchTerm, 
  setSearchTerm, 
  statusFilter, 
  setStatusFilter, 
  onSelectApplication, 
  onOpenModal, 
  getStatusColor, 
  getPriorityColor 
}) {
  return (
    <div className="space-y-6">
      {/* Filters */}
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-6">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search applications..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="reviewed">Reviewed</option>
            <option value="shortlisted">Shortlisted</option>
            <option value="interview_scheduled">Interview Scheduled</option>
            <option value="interviewed">Interviewed</option>
            <option value="offered">Offered</option>
            <option value="hired">Hired</option>
            <option value="rejected">Rejected</option>
          </select>

          <select className="w-full px-4 py-2 bg-gray-700/50 border border-gray-600/50 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all duration-300">
            <option value="all">All Positions</option>
            <option value="frontend">Frontend Developer</option>
            <option value="backend">Backend Developer</option>
            <option value="fullstack">Full Stack Developer</option>
            <option value="designer">UX/UI Designer</option>
          </select>

          <button className="px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-all duration-300 flex items-center justify-center gap-2 hover:scale-105">
            <Filter className="w-4 h-4" />
            Apply Filters
          </button>
        </div>
      </div>

      {/* Applications List */}
      {isLoading ? (
        <div className="grid grid-cols-1 gap-4">
          {[...Array(5)].map((_, i) => (
            <div key={i} className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 animate-pulse">
              <div className="flex items-center space-x-4">
                <div className="w-12 h-12 bg-gray-700 rounded-full"></div>
                <div className="flex-1">
                  <div className="h-4 bg-gray-700 rounded w-1/4 mb-2"></div>
                  <div className="h-3 bg-gray-700 rounded w-1/2"></div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : applications.length === 0 ? (
        <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-12 text-center">
          <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
          <h3 className="text-xl font-semibold text-white mb-2">No Applications Found</h3>
          <p className="text-gray-400">Applications will appear here when candidates apply for your jobs.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {applications.map((application, index) => (
            <div
              key={application.id}
              className={`bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300 cursor-pointer hover:scale-[1.02] opacity-0 animate-fade-in hover:shadow-lg hover:shadow-blue-500/10`}
              style={{ animationDelay: `${index * 100}ms` }}
              onClick={() => {
                onSelectApplication(application);
                onOpenModal();
              }}
            >
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    <div className="w-12 h-12 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-lg">
                      {application.applicant.firstName?.[0]}{application.applicant.lastName?.[0]}
                    </div>
                    <div>
                      <h3 className="text-lg font-semibold text-white mb-1">
                        {application.applicant.firstName} {application.applicant.lastName}
                      </h3>
                      <p className="text-gray-400 mb-2">{application.applicant.email}</p>
                      <p className="text-blue-400 font-medium">{application.job.title}</p>
                      <div className="flex items-center space-x-4 mt-2 text-sm text-gray-400">
                        <span className="flex items-center gap-1">
                          <Calendar className="w-4 h-4" />
                          Applied {new Date(application.appliedAt).toLocaleDateString()}
                        </span>
                        {application.applicant.location && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-4 h-4" />
                            {application.applicant.location}
                          </span>
                        )}
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center space-x-3">
                    {application.rating && (
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < application.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'
                            }`}
                          />
                        ))}
                      </div>
                    )}
                    <span className={`px-3 py-1 text-xs font-medium rounded-full border ${getStatusColor(application.status)}`}>
                      {application.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className={`px-3 py-1 text-xs font-medium rounded-full ${getPriorityColor(application.priority)}`}>
                      {application.priority.toUpperCase()}
                    </span>
                  </div>
                </div>

                {application.notes && (
                  <div className="mt-4 p-3 bg-gray-700/30 rounded-lg">
                    <p className="text-gray-300 text-sm">{application.notes}</p>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// Pipeline Tab Component
function PipelineTab({ applications }) {
  const stages = [
    { id: 'application', name: 'Application', color: 'blue' },
    { id: 'screening', name: 'Screening', color: 'yellow' },
    { id: 'interview', name: 'Interview', color: 'purple' },
    { id: 'offer', name: 'Offer', color: 'green' },
    { id: 'onboarding', name: 'Onboarding', color: 'cyan' }
  ];

  const getStageApplications = (stageId) => {
    return applications.filter(app => app.stage === stageId);
  };

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-500/20 border-blue-500/30 text-blue-400',
      yellow: 'bg-yellow-500/20 border-yellow-500/30 text-yellow-400',
      purple: 'bg-purple-500/20 border-purple-500/30 text-purple-400',
      green: 'bg-green-500/20 border-green-500/30 text-green-400',
      cyan: 'bg-cyan-500/20 border-cyan-500/30 text-cyan-400'
    };
    return colors[color];
  };

  return (
    <div className="grid grid-cols-1 lg:grid-cols-5 gap-6">
      {stages.map((stage) => {
        const stageApplications = getStageApplications(stage.id);
        return (
          <div key={stage.id} className="space-y-4">
            <div className={`p-4 rounded-xl border ${getColorClasses(stage.color)}`}>
              <h3 className="font-semibold text-center">{stage.name}</h3>
              <p className="text-center text-sm opacity-75">{stageApplications.length} candidates</p>
            </div>
            
            <div className="space-y-3 max-h-96 overflow-y-auto">
              {stageApplications.map((application, index) => (
                <div
                  key={application.id}
                  className="bg-gray-800/50 backdrop-blur-sm p-4 rounded-lg border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300 cursor-pointer hover:scale-105"
                >
                  <div className="flex items-center space-x-3">
                    <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-xs">
                      {application.applicant.firstName?.[0]}{application.applicant.lastName?.[0]}
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-white font-medium text-sm truncate">
                        {application.applicant.firstName} {application.applicant.lastName}
                      </p>
                      <p className="text-gray-400 text-xs truncate">{application.job.title}</p>
                    </div>
                  </div>
                  {application.rating && (
                    <div className="flex items-center mt-2">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className={`w-3 h-3 ${
                            i < application.rating ? 'text-yellow-400 fill-current' : 'text-gray-600'
                          }`}
                        />
                      ))}
                    </div>
                  )}
                </div>
              ))}
              
              {stageApplications.length === 0 && (
                <div className="text-center p-4 text-gray-400 text-sm">
                  No candidates in this stage
                </div>
              )}
            </div>
          </div>
        );
      })}
    </div>
  );
}

// Interviews Tab Component
function InterviewsTab() {
  const [interviews, setInterviews] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    fetchInterviews();
  }, []);

  const fetchInterviews = async () => {
    setIsLoading(true);
    try {
      const response = await fetch('/api/ats/interviews');
      if (response.ok) {
        const data = await response.json();
        setInterviews(data.interviews || []);
      } else {
        console.error('Failed to fetch interviews:', response.statusText);
        setInterviews([]);
      }
    } catch (error) {
      console.error('Error fetching interviews:', error);
      setInterviews([]);
    } finally {
      setIsLoading(false);
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {[...Array(4)].map((_, i) => (
          <div key={i} className="bg-gray-800/50 backdrop-blur-sm p-6 rounded-xl border border-gray-700/50 animate-pulse">
            <div className="space-y-3">
              <div className="h-4 bg-gray-700 rounded w-3/4"></div>
              <div className="h-3 bg-gray-700 rounded w-1/2"></div>
              <div className="h-3 bg-gray-700 rounded w-2/3"></div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (interviews.length === 0) {
    return (
      <div className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 p-12 text-center">
        <Calendar className="w-16 h-16 text-gray-400 mx-auto mb-4 opacity-50" />
        <h3 className="text-xl font-semibold text-white mb-2">No Interviews Scheduled</h3>
        <p className="text-gray-400">Interviews will appear here when you schedule them with candidates.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
      {interviews.map((interview, index) => (
        <div
          key={interview.id}
          className="bg-gray-800/50 backdrop-blur-sm rounded-xl border border-gray-700/50 hover:border-blue-500/30 transition-all duration-300 hover:scale-105"
        >
          <div className="p-6">
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center space-x-3">
                {interview.type === 'video' && <Video className="w-5 h-5 text-blue-400" />}
                {interview.type === 'phone' && <Phone className="w-5 h-5 text-green-400" />}
                {interview.type === 'in_person' && <User className="w-5 h-5 text-purple-400" />}
                <h3 className="text-lg font-semibold text-white capitalize">
                  {interview.type.replace('_', ' ')} Interview
                </h3>
              </div>
              <span className={`px-3 py-1 text-xs font-medium rounded-full border ${
                interview.status === 'scheduled' ? 'bg-blue-500/20 text-blue-400 border-blue-500/30' :
                interview.status === 'completed' ? 'bg-green-500/20 text-green-400 border-green-500/30' :
                interview.status === 'cancelled' ? 'bg-red-500/20 text-red-400 border-red-500/30' :
                'bg-yellow-500/20 text-yellow-400 border-yellow-500/30'
              }`}>
                {interview.status.toUpperCase()}
              </span>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Candidate:</span>
                <span className="text-white font-medium">{interview.candidate}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Position:</span>
                <span className="text-white">{interview.position}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Date:</span>
                <span className="text-white">{interview.date}</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Time:</span>
                <span className="text-white">{interview.time}</span>
              </div>
              {interview.interviewer && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Interviewer:</span>
                  <span className="text-white">{interview.interviewer.name}</span>
                </div>
              )}
              {interview.meetingLink && (
                <div className="flex items-center justify-between">
                  <span className="text-gray-400">Meeting Link:</span>
                  <a 
                    href={interview.meetingLink}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-400 hover:text-blue-300 transition-colors"
                  >
                    Join Meeting
                  </a>
                </div>
              )}
            </div>

            {interview.notes && (
              <div className="mt-4 p-3 bg-gray-700/30 rounded-lg">
                <p className="text-gray-300 text-sm">{interview.notes}</p>
              </div>
            )}

            <div className="flex space-x-2 mt-6">
              <button className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm">
                View Details
              </button>
              <button className="px-4 py-2 bg-gray-700 hover:bg-gray-600 text-white rounded-lg transition-colors text-sm">
                <Edit className="w-4 h-4" />
              </button>
              {interview.status === 'scheduled' && (
                <button className="px-4 py-2 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm">
                  Mark Complete
                </button>
              )}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

// Application Modal Component
function ApplicationModal({ application, onClose, onUpdate, getStatusColor }) {
  const [status, setStatus] = useState(application.status);
  const [stage, setStage] = useState(application.stage);
  const [priority, setPriority] = useState(application.priority);
  const [rating, setRating] = useState(application.rating || 0);
  const [notes, setNotes] = useState(application.notes || '');

  const handleSubmit = (e) => {
    e.preventDefault();
    onUpdate(application.id, { status, stage, priority, rating, notes });
  };

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm flex items-center justify-center p-4 z-50">
      <div className="bg-gray-800 rounded-xl border border-gray-700 w-full max-w-2xl max-h-[90vh] overflow-y-auto animate-scale-in">
        <div className="p-6 border-b border-gray-700">
          <div className="flex items-center justify-between">
            <h2 className="text-xl font-bold text-white">Application Details</h2>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white transition-colors"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 space-y-6">
          {/* Candidate Info */}
          <div className="flex items-start space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-bold text-xl">
              {application.applicant.firstName?.[0]}{application.applicant.lastName?.[0]}
            </div>
            <div>
              <h3 className="text-xl font-semibold text-white">
                {application.applicant.firstName} {application.applicant.lastName}
              </h3>
              <p className="text-gray-400">{application.applicant.email}</p>
              <p className="text-blue-400 font-medium">{application.job.title}</p>
              {application.applicant.phoneNumber && (
                <p className="text-gray-400">{application.applicant.phoneNumber}</p>
              )}
            </div>
          </div>

          {/* Application Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Status</label>
                <select
                  value={status}
                  onChange={(e) => setStatus(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="pending">Pending</option>
                  <option value="reviewed">Reviewed</option>
                  <option value="shortlisted">Shortlisted</option>
                  <option value="interview_scheduled">Interview Scheduled</option>
                  <option value="interviewed">Interviewed</option>
                  <option value="offered">Offered</option>
                  <option value="hired">Hired</option>
                  <option value="rejected">Rejected</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Stage</label>
                <select
                  value={stage}
                  onChange={(e) => setStage(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="application">Application</option>
                  <option value="screening">Screening</option>
                  <option value="interview">Interview</option>
                  <option value="offer">Offer</option>
                  <option value="onboarding">Onboarding</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Priority</label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value)}
                  className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                >
                  <option value="low">Low</option>
                  <option value="normal">Normal</option>
                  <option value="high">High</option>
                  <option value="urgent">Urgent</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-300 mb-2">Rating</label>
                <div className="flex items-center space-x-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      className={`w-8 h-8 ${
                        star <= rating ? 'text-yellow-400' : 'text-gray-600'
                      } hover:text-yellow-400 transition-colors`}
                    >
                      <Star className="w-6 h-6 fill-current" />
                    </button>
                  ))}
                </div>
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Notes</label>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={4}
                className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="Add notes about this candidate..."
              />
            </div>

            <div className="flex space-x-3 pt-4">
              <button
                type="submit"
                className="flex-1 px-4 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
              >
                Update Application
              </button>
              <button
                type="button"
                onClick={onClose}
                className="px-4 py-2 bg-gray-600 hover:bg-gray-700 text-white rounded-lg transition-colors"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
}

// Add custom CSS for animations
const styles = `
  @keyframes fade-in {
    from {
      opacity: 0;
      transform: translateY(20px);
    }
    to {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @keyframes scale-in {
    from {
      opacity: 0;
      transform: scale(0.95);
    }
    to {
      opacity: 1;
      transform: scale(1);
    }
  }

  .animate-fade-in {
    animation: fade-in 0.5s ease-out forwards;
  }

  .animate-scale-in {
    animation: scale-in 0.3s ease-out;
  }
`;

if (typeof document !== 'undefined') {
  const styleSheet = document.createElement('style');
  styleSheet.textContent = styles;
  document.head.appendChild(styleSheet);
}
