'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '../../contexts/AuthContext';

export default function ProfilePage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        // Redirect to login if user is not authenticated
        router.push('/login');
        return;
      }

      // Redirect to the appropriate profile page based on user role
      switch (user.role) {
        case 'job_seeker':
          router.push('/profile/job-seeker');
          break;
        case 'employer_admin':
        case 'sub_user':
          router.push('/profile/employer');
          break;
        case 'super_admin':
          router.push('/super-admin'); // or wherever super admin profiles should go
          break;
        default:
          // Default to job seeker profile if role is unclear
          router.push('/profile/job-seeker');
          break;
      }
    }
  }, [user, loading, router]);

  // Show loading while determining redirect
  if (loading || !user) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-slate-300 text-lg">Loading your profile...</p>
        </div>
      </div>
    );
  }

  return null; // This component will redirect, so no content needed
}
