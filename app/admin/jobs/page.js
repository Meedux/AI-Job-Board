"use client";

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import Header from '@/components/Header';
import JobManagement from '@/components/JobManagement';
import Link from 'next/link';
import { colors } from '@/utils/designSystem';

export default function AdminJobsPage() {
  const { user, loading } = useAuth();
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
  }, []);

  if (!mounted || loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className={`animate-spin rounded-full h-8 w-8 border-b-2 ${colors.primary[600].replace('bg-','border-')}`}></div>
      </div>
    );
  }

  if (!user || !['employer_admin', 'sub_user', 'super_admin'].includes(user.role)) {
    return (
      <div className={`min-h-screen ${colors.neutral.background} flex items-center justify-center`}>
        <div className="text-center">
          <h1 className="text-2xl font-bold text-white mb-4">Access Denied</h1>
          <p className="text-gray-300 mb-4">You need to be an employer to access this page.</p>
          <Link 
            href="/login" 
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Login
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className={`min-h-screen mt-10 ${colors.neutral.background} ${colors.neutral.textPrimary}`}>
      <Header />
      <JobManagement />
    </div>
  );
}

