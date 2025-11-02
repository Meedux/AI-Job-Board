'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';

export default function AdminVerificationPage() {
  const { user } = useAuth();
  const [docs, setDocs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [notesById, setNotesById] = useState({});

  useEffect(() => {
    if (!user) return;
    if (user.role !== 'super_admin') return;
    fetchDocs();
  }, [user]);

  const fetchDocs = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/admin/verification', { headers: { 'Authorization': `Bearer ${user?.token}` } });
      if (!res.ok) {
        const e = await res.json();
        setError(e.error || 'Failed to load');
        return;
      }
      const data = await res.json();
      setDocs(data.documents || []);
    } catch (e) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  };

  const updateStatus = async (id, status) => {
    try {
      const res = await fetch(`/api/admin/verification/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${user?.token}` },
        body: JSON.stringify({ status, reviewerNotes: notesById[id] || '' })
      });
      if (!res.ok) {
        const e = await res.json();
        alert(e.error || 'Failed to update status');
        return;
      }
      await fetchDocs();
    } catch (e) {
      console.error(e);
      alert('Failed to update status');
    }
  };

  if (!user || user.role !== 'super_admin') {
    return <div className="p-6">Access denied</div>;
  }

  if (loading) return <div className="p-6">Loading...</div>;
  if (error) return <div className="p-6 text-red-400">{error}</div>;

  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-4">Verification Documents</h1>
      <div className="space-y-4">
        {docs.length === 0 && <div>No documents found</div>}
        {docs.map(doc => (
          <div key={doc.id} className="bg-gray-800 p-4 rounded shadow">
            <div className="flex items-start justify-between">
              <div className="w-full">
                <div className="text-sm text-gray-500">{doc.category} • Uploaded: {new Date(doc.uploadedAt).toLocaleString()}</div>
                <a href={doc.url} target="_blank" rel="noreferrer" className="text-blue-600">View file</a>
                <div className="text-sm text-gray-600 mb-2">By: {doc.user?.fullName || doc.user?.email || 'Unknown'}</div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Reviewer notes</label>
                <textarea
                  value={notesById[doc.id] || ''}
                  onChange={(e) => setNotesById(prev => ({ ...prev, [doc.id]: e.target.value }))}
                  className="w-full border rounded p-2 mb-2 text-sm"
                  rows={3}
                  placeholder="Add reviewer notes for the user (optional)"
                />
              </div>
              <div className="flex flex-col gap-2 ml-4">
                <button onClick={() => updateStatus(doc.id, 'verified')} className="px-3 py-1 bg-green-600 text-white rounded">Verify</button>
                <button onClick={() => updateStatus(doc.id, 'rejected')} className="px-3 py-1 bg-red-600 text-white rounded">Reject</button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
