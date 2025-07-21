'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../../contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '../../components/Header';
import Footer from '../../components/Footer';
import ProtectedRoute from '../../components/ProtectedRoute';
import { 
  Users, 
  CreditCard, 
  DollarSign, 
  Settings, 
  BarChart3, 
  Package, 
  Building2,
  UserCheck,
  TrendingUp,
  Shield,
  Database,
  Bell
} from 'lucide-react';

export default function SuperAdminDashboard() {
  const { user } = useAuth();
  const router = useRouter();
  const [stats, setStats] = useState({
    totalUsers: 0,
    totalRevenue: 0,
    activeSubscriptions: 0,
    totalCreditsIssued: 0,
    totalJobs: 0,
    totalCompanies: 0
  });
  const [loading, setLoading] = useState(true);

  // Check if user is super admin
  useEffect(() => {
    if (user && user.role !== 'super_admin') {
      router.push('/dashboard');
    }
  }, [user, router]);

  useEffect(() => {
    if (user && user.role === 'super_admin') {
      loadDashboardStats();
    }
  }, [user]);

  const loadDashboardStats = async () => {
    try {
      const response = await fetch('/api/super-admin/stats', {
        credentials: 'include'
      });
      
      if (response.ok) {
        const data = await response.json();
        if (data.success) {
          setStats(data.stats);
        }
      }
    } catch (error) {
      console.error('Error loading dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (!user || user.role !== 'super_admin') {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center">
        <div className="text-center">
          <Shield className="mx-auto h-12 w-12 text-red-400 mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-4">Super Admin privileges required.</p>
        </div>
      </div>
    );
  }

  const adminCards = [
    {
      title: 'User Management',
      description: 'Manage users, roles, and permissions',
      icon: Users,
      href: '/super-admin/users',
      color: 'blue'
    },
    {
      title: 'Pricing Tiers',
      description: 'Create and manage subscription plans',
      icon: DollarSign,
      href: '/super-admin/pricing',
      color: 'green'
    },
    {
      title: 'Credit Packages',
      description: 'Manage credit packages and bundles',
      icon: Package,
      href: '/super-admin/credits',
      color: 'purple'
    },
    {
      title: 'Company Management',
      description: 'Oversee all companies and employers',
      icon: Building2,
      href: '/super-admin/companies',
      color: 'orange'
    },
    {
      title: 'Analytics & Reports',
      description: 'View detailed analytics and reports',
      icon: BarChart3,
      href: '/super-admin/analytics',
      color: 'cyan'
    },
    {
      title: 'System Settings',
      description: 'Configure system-wide settings',
      icon: Settings,
      href: '/super-admin/settings',
      color: 'red'
    }
  ];

  const statsCards = [
    {
      title: 'Total Users',
      value: stats.totalUsers.toLocaleString(),
      icon: Users,
      color: 'blue'
    },
    {
      title: 'Total Revenue',
      value: `₱${stats.totalRevenue.toLocaleString()}`,
      icon: DollarSign,
      color: 'green'
    },
    {
      title: 'Active Subscriptions',
      value: stats.activeSubscriptions.toLocaleString(),
      icon: UserCheck,
      color: 'purple'
    },
    {
      title: 'Credits Issued',
      value: stats.totalCreditsIssued.toLocaleString(),
      icon: CreditCard,
      color: 'orange'
    },
    {
      title: 'Total Jobs',
      value: stats.totalJobs.toLocaleString(),
      icon: TrendingUp,
      color: 'cyan'
    },
    {
      title: 'Total Companies',
      value: stats.totalCompanies.toLocaleString(),
      icon: Building2,
      color: 'pink'
    }
  ];

  const getColorClasses = (color) => {
    const colors = {
      blue: 'bg-blue-600/20 border-blue-500/30 text-blue-400',
      green: 'bg-green-600/20 border-green-500/30 text-green-400',
      purple: 'bg-purple-600/20 border-purple-500/30 text-purple-400',
      orange: 'bg-orange-600/20 border-orange-500/30 text-orange-400',
      cyan: 'bg-cyan-600/20 border-cyan-500/30 text-cyan-400',
      red: 'bg-red-600/20 border-red-500/30 text-red-400',
      pink: 'bg-pink-600/20 border-pink-500/30 text-pink-400'
    };
    return colors[color] || colors.blue;
  };

  return (
    <ProtectedRoute>
      <div className="min-h-screen bg-gray-950 text-white">
        <Header />
        
        <main className="pt-20 pb-16">
          <div className="max-w-7xl mx-auto px-4">
            {/* Header */}
            <div className="mb-8">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gradient-to-r from-red-600 to-orange-600 rounded-lg flex items-center justify-center">
                  <Shield className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h1 className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text text-transparent">
                    Super Admin Dashboard
                  </h1>
                  <p className="text-gray-400">Complete system administration and management</p>
                </div>
              </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {statsCards.map((stat, index) => {
                const Icon = stat.icon;
                return (
                  <div
                    key={index}
                    className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50"
                  >
                    <div className="flex items-center justify-between">
                      <div>
                        <p className="text-gray-400 text-sm font-medium">{stat.title}</p>
                        <p className="text-2xl font-bold text-white mt-1">
                          {loading ? '...' : stat.value}
                        </p>
                      </div>
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(stat.color)}`}>
                        <Icon className="w-6 h-6" />
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Admin Functions */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 mb-8">
              {adminCards.map((card, index) => {
                const Icon = card.icon;
                return (
                  <div
                    key={index}
                    onClick={() => router.push(card.href)}
                    className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50 hover:bg-gray-700/50 transition-all duration-200 cursor-pointer group"
                  >
                    <div className="flex items-start gap-4">
                      <div className={`w-12 h-12 rounded-lg flex items-center justify-center ${getColorClasses(card.color)} group-hover:scale-110 transition-transform`}>
                        <Icon className="w-6 h-6" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-lg font-semibold text-white mb-2 group-hover:text-gray-200">
                          {card.title}
                        </h3>
                        <p className="text-gray-400 text-sm">
                          {card.description}
                        </p>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800/50 rounded-xl p-6 border border-gray-700/50">
              <h2 className="text-xl font-bold text-white mb-4 flex items-center gap-2">
                <Bell className="w-5 h-5" />
                Quick Actions
              </h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                <button
                  onClick={() => router.push('/super-admin/users?action=create')}
                  className="px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Create New User
                </button>
                <button
                  onClick={() => router.push('/super-admin/pricing?action=create')}
                  className="px-4 py-3 bg-green-600 hover:bg-green-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Add Pricing Tier
                </button>
                <button
                  onClick={() => router.push('/super-admin/credits?action=create')}
                  className="px-4 py-3 bg-purple-600 hover:bg-purple-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  Create Credit Package
                </button>
                <button
                  onClick={() => router.push('/super-admin/analytics')}
                  className="px-4 py-3 bg-orange-600 hover:bg-orange-700 text-white rounded-lg transition-colors text-sm font-medium"
                >
                  View Analytics
                </button>
              </div>
            </div>
          </div>
        </main>
        
        <Footer />
      </div>
    </ProtectedRoute>
  );
}
