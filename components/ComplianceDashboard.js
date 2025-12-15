"use client";

import { useEffect, useState } from 'react';

const ComplianceDashboard = () => {
  const [items, setItems] = useState([]);
  const [locks, setLocks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const fetchData = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/compliance/suspicious');
      if (!res.ok) throw new Error('Forbidden or failed');
      const data = await res.json();
      setItems(data.suspicious || []);
      const lockRes = await fetch('/api/compliance/lock');
      if (lockRes.ok) {
        const ld = await lockRes.json();
        setLocks(ld.locks || []);
      }
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const unlock = async (userId) => {
    await fetch('/api/compliance/lock', {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ userId })
    });
    fetchData();
  };

  if (loading) return <div className="text-sm text-slate-400">Loading compliance data…</div>;
  if (error) return <div className="text-sm text-red-400">{error}</div>;

  return (
    <div className="space-y-4 bg-slate-900 border border-slate-800 rounded-xl p-4 text-slate-100">
      <div className="flex items-center justify-between">
        <h3 className="font-semibold text-lg">Compliance & Abuse Control</h3>
        <button onClick={fetchData} className="text-xs px-3 py-1 rounded bg-slate-800 border border-slate-700">Refresh</button>
      </div>

      <div>
        <div className="text-sm text-slate-400 mb-2">Active Locks</div>
        <div className="divide-y divide-slate-800 border border-slate-800 rounded-lg">
          {locks.length === 0 && <div className="p-3 text-sm text-slate-400">No active locks.</div>}
          {locks.map((l) => (
            <div key={l.id} className="p-3 flex items-center justify-between">
              <div>
                <div className="font-semibold">User: {l.userId}</div>
                <div className="text-xs text-slate-400">Reason: {l.reason} • Severity: {l.severity}</div>
              </div>
              <button onClick={() => unlock(l.userId)} className="text-xs px-3 py-1 rounded bg-emerald-600 hover:bg-emerald-500">Unlock</button>
            </div>
          ))}
        </div>
      </div>

      <div>
        <div className="text-sm text-slate-400 mb-2">Suspicious Activity</div>
        <div className="divide-y divide-slate-800 border border-slate-800 rounded-lg max-h-96 overflow-auto">
          {items.length === 0 && <div className="p-3 text-sm text-slate-400">No suspicious events.</div>}
          {items.map((item) => (
            <div key={item.id} className="p-3">
              <div className="flex items-center justify-between">
                <div className="font-semibold">{item.type}</div>
                <span className="text-xs px-2 py-1 rounded bg-slate-800 border border-slate-700">{item.severity}</span>
              </div>
              <div className="text-xs text-slate-400 mt-1">{item.description}</div>
              <div className="text-[11px] text-slate-500 mt-1">User: {item.userId || 'N/A'} • Detected: {item.detectedBy}</div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ComplianceDashboard;
