'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ATSKanbanDashboard from '@/components/ATSKanbanDashboard';

export default function ATSPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

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

  return <ATSKanbanDashboard />;
}
