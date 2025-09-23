'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import ResumeScanner from '@/components/ResumeScanner';
import ResumeDatabaseSearch from '@/components/ResumeDatabaseSearch';
import EnhancedATSWorkspace from '@/components/EnhancedATSWorkspace';
import TagManagementSystem from '@/components/TagManagementSystem';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  LayoutDashboard, 
  Search, 
  FileText, 
  Workflow, 
  Tags,
  Sparkles 
} from 'lucide-react';

export default function ATSPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [activeTab, setActiveTab] = useState('dashboard');

  const tabs = [
    {
      id: 'dashboard',
      label: 'ATS Dashboard',
      icon: LayoutDashboard,
      description: 'Advanced Kanban workspace with analytics and collaboration',
      badge: 'Enhanced'
    },
    {
      id: 'resume-scanner',
      label: 'Resume Scanner',
      icon: FileText,
      description: 'AI-powered resume comparison and ranking',
      badge: 'AI'
    },
    {
      id: 'database-search',
      label: 'Resume Database',
      icon: Search,
      description: 'Advanced candidate search and filtering',
      badge: 'Pro'
    },
    {
      id: 'tag-management',
      label: 'Tag Management',
      icon: Tags,
      description: 'Comprehensive tagging and categorization system'
    }
  ];

  const renderActiveComponent = () => {
    switch (activeTab) {
      case 'dashboard':
        return <EnhancedATSWorkspace />;
      case 'resume-scanner':
        return <ResumeScanner />;
      case 'database-search':
        return <ResumeDatabaseSearch />;
      case 'tag-management':
        return <TagManagementSystem />;
      default:
        return <EnhancedATSWorkspace />;
    }
  };

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
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-500 mx-auto mb-4"></div>
          <p className="text-gray-400">Loading ATS Dashboard...</p>
        </div>
      </div>
    );
  }

  if (!user || !['employer_admin', 'sub_user'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <div className="bg-red-900/20 border border-red-500/30 text-red-300 p-6 rounded-xl max-w-md">
            <h2 className="text-xl font-semibold mb-2">Access Denied</h2>
            <p>You don't have permission to access the ATS Dashboard.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <div className="min-h-screen bg-gray-900 mt-16">
        {/* Enhanced Header with Tab Navigation */}
        <div className="bg-gray-800 border-b border-gray-700 sticky top-0 z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="py-4">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h1 className="text-2xl font-bold text-white">ATS Dashboard</h1>
                  <p className="text-gray-400 text-sm">Enhanced Applicant Tracking System</p>
                </div>
              </div>
            </div>

            {/* Tab Navigation */}
            <div className="flex space-x-1 bg-gray-900 p-1 rounded-xl overflow-x-auto">
              {tabs.map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative flex items-center space-x-2 px-4 py-2 rounded-lg whitespace-nowrap transition-all duration-200 ${
                      isActive
                        ? 'bg-blue-600 text-white shadow-lg'
                        : 'text-gray-400 hover:text-white hover:bg-gray-700'
                    }`}
                  >
                    <Icon className="w-4 h-4" />
                    <span className="font-medium">{tab.label}</span>
                    {tab.badge && (
                      <span className={`px-2 py-0.5 text-xs font-bold rounded-full ${
                        tab.badge === 'New' ? 'bg-green-500 text-white' :
                        tab.badge === 'AI' ? 'bg-purple-500 text-white' :
                        tab.badge === 'Pro' ? 'bg-yellow-500 text-black' : ''
                      }`}>
                        {tab.badge}
                      </span>
                    )}
                  </button>
                );
              })}
            </div>

            {/* Tab Description */}
            <div className="mt-3">
              {tabs.map((tab) => (
                activeTab === tab.id && (
                  <motion.p
                    key={tab.id}
                    initial={{ opacity: 0, y: -10 }}
                    animate={{ opacity: 1, y: 0 }}
                    className="text-gray-400 text-sm"
                  >
                    {tab.description}
                  </motion.p>
                )
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Content Area */}
      <AnimatePresence mode="wait">
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.3 }}
          className="relative"
        >
          {renderActiveComponent()}
        </motion.div>
      </AnimatePresence>
      </div>
    </>
  );
}
