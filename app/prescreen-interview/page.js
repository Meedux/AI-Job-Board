'use client';

import PrescreenInterviewManager from '@/components/PrescreenInterviewManager';

export default function PrescreenInterviewPage() {
  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-gray-950">
      <div className="max-w-6xl mx-auto px-4 py-10 space-y-8">
        <div>
          <h1 className="text-2xl font-semibold text-white">Prescreen Interview Engine</h1>
          <p className="text-gray-400 mt-2 text-sm">Upload, set privacy, expiry, and manage access — powered by Vercel Blob.</p>
        </div>
        <PrescreenInterviewManager />
      </div>
    </div>
  );
}
