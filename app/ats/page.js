'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ATSKanbanDashboard from '@/components/ATSKanbanDashboard';
import { Building2, Users, Briefcase, TrendingUp, Target, Award } from 'lucide-react';

export default function ATSPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [dashboardStats, setDashboardStats] = useState({
    totalApplications: 0,
    activeJobs: 0,
    scheduledInterviews: 0,
    hiredThisMonth: 0,
    conversionRate: 0,
    averageTimeToHire: 0
  });

  useEffect(() => {
    if (!loading && !user) {
      router.push('/login');
      return;
    }

    // Check if user has access to ATS
    if (user && !['employer_admin', 'sub_user'].includes(user.role)) {
      router.push('/dashboard');
      return;
    }

    // Load dashboard stats
    const loadStats = async () => {
      try {
        // Mock stats for now - in production, fetch from API
        setDashboardStats({
          totalApplications: 247,
          activeJobs: 8,
          scheduledInterviews: 12,
          hiredThisMonth: 3,
          conversionRate: 15.8,
          averageTimeToHire: 14
        });
      } catch (error) {
        console.error('Error loading dashboard stats:', error);
      }
    };

    if (user) {
      loadStats();
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading ATS Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !['employer_admin', 'sub_user'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-100 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-100 text-red-800 p-4 rounded-lg">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p>You don't have permission to access the ATS Dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100">
      {/* Quick Stats Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="px-6 py-6">
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            <div className="bg-blue-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-blue-100 rounded-lg">
                  <Users className="text-blue-600" size={20} />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Total Applications</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.totalApplications}</p>
                </div>
              </div>
            </div>

            <div className="bg-green-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-green-100 rounded-lg">
                  <Briefcase className="text-green-600" size={20} />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Active Jobs</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.activeJobs}</p>
                </div>
              </div>
            </div>

            <div className="bg-purple-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-purple-100 rounded-lg">
                  <Target className="text-purple-600" size={20} />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Interviews</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.scheduledInterviews}</p>
                </div>
              </div>
            </div>

            <div className="bg-emerald-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-emerald-100 rounded-lg">
                  <Award className="text-emerald-600" size={20} />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Hired This Month</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.hiredThisMonth}</p>
                </div>
              </div>
            </div>

            <div className="bg-orange-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-orange-100 rounded-lg">
                  <TrendingUp className="text-orange-600" size={20} />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Conversion Rate</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.conversionRate}%</p>
                </div>
              </div>
            </div>

            <div className="bg-indigo-50 p-4 rounded-lg">
              <div className="flex items-center">
                <div className="p-2 bg-indigo-100 rounded-lg">
                  <Building2 className="text-indigo-600" size={20} />
                </div>
                <div className="ml-3">
                  <p className="text-sm font-medium text-gray-600">Avg. Time to Hire</p>
                  <p className="text-2xl font-bold text-gray-900">{dashboardStats.averageTimeToHire} days</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Main Kanban Dashboard */}
      <ATSKanbanDashboard />
    </div>
  );
}
