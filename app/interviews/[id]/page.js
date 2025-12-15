'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import { AlertCircle, Loader2, Unlock } from 'lucide-react';

export default function PrescreenInterviewView() {
  const params = useParams();
  const interviewId = params?.id;
  const [interview, setInterview] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [requesting, setRequesting] = useState(false);
  const [requestMessage, setRequestMessage] = useState('Please grant me access to review this interview.');

  const loadInterview = async () => {
    if (!interviewId) return;
    setLoading(true);
    setError('');
    try {
      const res = await fetch(`/api/interviews/prescreen/${interviewId}`);
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Unable to load');
      setInterview(data.interview);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadInterview();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [interviewId]);

  const requestAccess = async () => {
    setRequesting(true);
    setError('');
    try {
      const res = await fetch(`/api/interviews/prescreen/${interviewId}/request-access`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message: requestMessage })
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || 'Request failed');
      alert('Request sent to the owner.');
    } catch (err) {
      setError(err.message);
    } finally {
      setRequesting(false);
    }
  };

  return (
    <div className="min-h-screen bg-linear-to-br from-gray-950 via-gray-900 to-gray-950 text-white">
      <div className="max-w-5xl mx-auto px-4 py-10">
        {loading && (
          <div className="flex items-center gap-2 text-gray-300">
            <Loader2 className="w-4 h-4 animate-spin" /> Loading interview...
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 text-red-300 bg-red-900/30 border border-red-700 rounded-lg p-3">
            <AlertCircle className="w-4 h-4" /> {error}
          </div>
        )}

        {interview && !error && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <div>
                <h1 className="text-xl font-semibold">Prescreen interview</h1>
                <p className="text-gray-400 text-sm">Access mode: {interview.accessMode}</p>
              </div>
              {interview.status === 'expired' && (
                <span className="px-3 py-1 rounded-full text-xs bg-amber-700 text-amber-50">Expired</span>
              )}
            </div>

            {interview.status !== 'expired' ? (
              <video
                src={interview.blobUrl}
                className="w-full rounded-lg border border-gray-700"
                controls
                controlsList={interview.accessMode === 'view_only' ? 'nodownload' : undefined}
              />
            ) : (
              <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 space-y-3">
                <p className="text-gray-300">This interview is expired. Request access to reopen.</p>
                <textarea
                  value={requestMessage}
                  onChange={(e) => setRequestMessage(e.target.value)}
                  rows={3}
                  className="w-full px-3 py-2 rounded-lg bg-gray-900 border border-gray-700 text-white"
                />
                <button
                  onClick={requestAccess}
                  disabled={requesting}
                  className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-500 flex items-center gap-2 disabled:opacity-60"
                >
                  <Unlock className="w-4 h-4" /> {requesting ? 'Requesting...' : 'Request access'}
                </button>
              </div>
            )}

            {interview.allowDownload && (
              <a
                href={interview.downloadUrl || interview.blobUrl}
                className="inline-flex items-center gap-2 px-3 py-2 rounded-lg bg-blue-600 text-white"
                download
                target="_blank"
                rel="noreferrer"
              >
                Download
              </a>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
