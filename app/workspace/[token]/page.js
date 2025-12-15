'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AlertCircle, Loader2, Shield } from 'lucide-react';

export default function WorkspaceTokenPage() {
  const params = useParams();
  const token = params?.token;
  const [workspace, setWorkspace] = useState(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const load = async () => {
      if (!token) return;
      setLoading(true);
      try {
        const res = await fetch(`/api/workspaces/${token}`);
        const data = await res.json();
        if (!res.ok) throw new Error(data.error || 'Unable to load workspace');
        setWorkspace(data.workspace);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    };
    load();
  }, [token]);

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <div className="max-w-3xl mx-auto px-4 py-10 space-y-4">
        {loading && (
          <div className="flex items-center gap-2 text-gray-300">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading workspace...
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-300 bg-red-900/30 border border-red-700 rounded-lg p-3">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        {workspace && !error && (
          <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 space-y-3">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Shield className="w-4 h-4 text-blue-300" /> Isolated vendor/client workspace
            </div>
            <h1 className="text-xl font-semibold">{workspace.name}</h1>
            <p className="text-gray-400 text-sm">Role: {workspace.assignedRole || 'n/a'}</p>
            {workspace.wipedAt && (
              <p className="text-amber-300 text-sm">Workspace was wiped on {new Date(workspace.wipedAt).toLocaleString()}</p>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
