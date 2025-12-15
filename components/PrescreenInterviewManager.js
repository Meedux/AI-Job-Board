'use client';

import { useEffect, useMemo, useState } from 'react';
import { Upload, Shield, Unlock, Clock, Calendar, Video, Link as LinkIcon, AlertCircle, Download } from 'lucide-react';

function Badge({ label, tone = 'gray' }) {
  const tones = {
    gray: 'bg-gray-700 text-gray-100 border-gray-600',
    blue: 'bg-blue-700/30 text-blue-200 border-blue-500/40',
    amber: 'bg-amber-700/30 text-amber-100 border-amber-500/40',
    green: 'bg-emerald-700/30 text-emerald-100 border-emerald-500/40',
    red: 'bg-red-700/30 text-red-100 border-red-500/40'
  };
  return (
    <span className={`px-2.5 py-1 rounded-full text-xs font-semibold border ${tones[tone] || tones.gray}`}>
      {label}
    </span>
  );
}

export default function PrescreenInterviewManager() {
  const [interviews, setInterviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState('');

  const [file, setFile] = useState(null);
  const [applicationId, setApplicationId] = useState('');
  const [accessMode, setAccessMode] = useState('view_only');
  const [expiresAt, setExpiresAt] = useState('');
  const [schedulingLink, setSchedulingLink] = useState('');
  const [notes, setNotes] = useState('');

  const expiredCount = useMemo(() => interviews.filter((i) => i.status === 'expired').length, [interviews]);

  const loadInterviews = async () => {
    setLoading(true);
    try {
      const res = await fetch('/api/interviews/prescreen');
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Failed to load');
      setInterviews(data.interviews || []);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInterviews();
  }, []);

  const handleUpload = async (e) => {
    e.preventDefault();
    if (!file) {
      setError('Please choose a video file.');
      return;
    }
    setUploading(true);
    setError('');
    try {
      const formData = new FormData();
      formData.append('file', file);
      if (applicationId) formData.append('applicationId', applicationId);
      if (accessMode) formData.append('accessMode', accessMode);
      if (expiresAt) formData.append('expiresAt', expiresAt);
      if (schedulingLink) formData.append('schedulingLink', schedulingLink);
      if (notes) formData.append('notes', notes);

      const res = await fetch('/api/interviews/prescreen', { method: 'POST', body: formData });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Upload failed');
      setInterviews((prev) => [data.interview, ...prev]);
      setFile(null);
      setNotes('');
    } catch (err) {
      setError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const updateAccessMode = async (id, mode) => {
    try {
      const res = await fetch(`/api/interviews/prescreen/${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ accessMode: mode })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Update failed');
      setInterviews((prev) => prev.map((i) => (i.id === id ? data.interview : i)));
    } catch (err) {
      setError(err.message);
    }
  };

  const requestAccess = async (id) => {
    try {
      const res = await fetch(`/api/interviews/prescreen/${id}/request-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: 'Requesting temporary access to review the video.' })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      alert('Access requested.');
      return data;
    } catch (err) {
      setError(err.message);
      return null;
    }
  };

  return (
    <div className="space-y-6">
      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Upload className="w-5 h-5 text-blue-400" />
          <div>
            <h2 className="text-white font-semibold text-lg">Upload prescreen interview</h2>
            <p className="text-gray-400 text-sm">Stores securely on Vercel Blob with privacy and expiry controls.</p>
          </div>
        </div>

        {error && (
          <div className="text-sm text-red-300 mb-3 flex items-center gap-2">
            <AlertCircle className="w-4 h-4" />
            {error}
          </div>
        )}

        <form className="grid grid-cols-1 md:grid-cols-2 gap-4" onSubmit={handleUpload}>
          <div className="col-span-1 md:col-span-2">
            <input
              type="file"
              accept="video/*"
              onChange={(e) => setFile(e.target.files?.[0] || null)}
              className="w-full text-sm text-gray-300"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Application ID (optional)</label>
            <input
              value={applicationId}
              onChange={(e) => setApplicationId(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
              placeholder="application cuid"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1">Privacy</label>
            <select
              value={accessMode}
              onChange={(e) => setAccessMode(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
            >
              <option value="view_only">View-only (no download)</option>
              <option value="downloadable">Downloadable</option>
            </select>
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1 flex items-center gap-2">
              <Clock className="w-4 h-4" /> Expiration (optional)
            </label>
            <input
              type="datetime-local"
              value={expiresAt}
              onChange={(e) => setExpiresAt(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
            />
          </div>

          <div>
            <label className="block text-sm text-gray-300 mb-1 flex items-center gap-2">
              <LinkIcon className="w-4 h-4" /> Scheduling link (optional)
            </label>
            <input
              value={schedulingLink}
              onChange={(e) => setSchedulingLink(e.target.value)}
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
              placeholder="https://cal.example.com/slot"
            />
          </div>

          <div className="md:col-span-2">
            <label className="block text-sm text-gray-300 mb-1">Notes (private)</label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              rows={3}
              className="w-full px-3 py-2 rounded-lg bg-gray-800 border border-gray-700 text-white"
              placeholder="Short summary or instructions"
            />
          </div>

          <div className="md:col-span-2 flex items-center gap-3">
            <button
              type="submit"
              disabled={uploading}
              className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 text-white disabled:opacity-60"
            >
              {uploading ? 'Uploading...' : 'Upload to Blob'}
            </button>
            <span className="text-sm text-gray-400">Expired: {expiredCount}</span>
          </div>
        </form>
      </div>

      <div className="bg-gray-900 border border-gray-700 rounded-2xl p-6 shadow-lg">
        <div className="flex items-center gap-3 mb-4">
          <Video className="w-5 h-5 text-purple-400" />
          <div>
            <h3 className="text-white font-semibold text-lg">Recorded interviews</h3>
            <p className="text-gray-400 text-sm">Privacy toggles, expirations, and access requests.</p>
          </div>
        </div>

        {loading && <p className="text-gray-400 text-sm">Loading interviews...</p>}
        {!loading && interviews.length === 0 && (
          <p className="text-gray-500 text-sm">No prescreen interviews yet.</p>
        )}

        <div className="space-y-4">
          {interviews.map((item) => {
            const expired = item.status === 'expired';
            return (
              <div key={item.id} className="border border-gray-700 rounded-xl p-4 bg-gray-800/60">
                <div className="flex items-center justify-between gap-3 flex-wrap">
                  <div className="flex items-center gap-2 flex-wrap">
                    <Badge label={item.status.toUpperCase()} tone={expired ? 'red' : 'green'} />
                    <Badge label={item.accessMode === 'downloadable' ? 'Downloadable' : 'View-only'} tone={item.accessMode === 'downloadable' ? 'blue' : 'gray'} />
                    {item.expiresAt && (
                      <Badge label={`Expires ${new Date(item.expiresAt).toLocaleString()}`} tone="amber" />
                    )}
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => updateAccessMode(item.id, item.accessMode === 'downloadable' ? 'view_only' : 'downloadable')}
                      className="px-3 py-1 text-xs rounded-lg bg-gray-700 text-gray-100 border border-gray-600"
                    >
                      {item.accessMode === 'downloadable' ? 'Make view-only' : 'Allow download'}
                    </button>
                    {item.allowDownload && (
                      <a
                        href={item.downloadUrl || item.blobUrl}
                        className="px-3 py-1 text-xs rounded-lg bg-blue-600 text-white flex items-center gap-1"
                        download
                        target="_blank"
                        rel="noreferrer"
                      >
                        <Download className="w-3 h-3" /> Download
                      </a>
                    )}
                  </div>
                </div>

                <div className="mt-3 grid grid-cols-1 lg:grid-cols-3 gap-4">
                  <div className="lg:col-span-2">
                    <video src={item.blobUrl} className="w-full rounded-lg border border-gray-700" controls controlsList={item.accessMode === 'view_only' ? 'nodownload' : undefined} />
                  </div>
                  <div className="space-y-2 text-sm text-gray-300">
                    {item.application?.applicant?.fullName && (
                      <div className="flex items-center gap-2">
                        <Shield className="w-4 h-4 text-emerald-400" />
                        <span>{item.application.applicant.fullName}</span>
                      </div>
                    )}
                    {item.application?.job?.title && (
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-blue-300" />
                        <span>{item.application.job.title}</span>
                      </div>
                    )}
                    {item.schedulingLink && (
                      <a
                        href={item.schedulingLink}
                        className="flex items-center gap-2 text-blue-300 hover:text-blue-200"
                        target="_blank"
                        rel="noreferrer"
                      >
                        <LinkIcon className="w-4 h-4" /> Scheduling link
                      </a>
                    )}
                    {expired && (
                      <button
                        onClick={() => requestAccess(item.id)}
                        className="flex items-center gap-2 px-3 py-2 rounded-lg bg-amber-700 text-white"
                      >
                        <Unlock className="w-4 h-4" /> Request access
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
