"use client";

import { useEffect, useState } from 'react';

const DeviceSyncModal = ({ open, onClose }) => {
  const [session, setSession] = useState(null);
  const [syncUrl, setSyncUrl] = useState('');
  const [error, setError] = useState('');

  useEffect(() => {
    const createSession = async () => {
      try {
        const res = await fetch('/api/messages/device-sync', { method: 'POST' });
        if (res.ok) {
          const data = await res.json();
          setSession(data.session);
          setSyncUrl(data.syncUrl);
        } else {
          setError('Unable to start device sync');
        }
      } catch (err) {
        setError(err.message);
      }
    };
    if (open) {
      createSession();
    }
  }, [open]);

  if (!open) return null;

  const qrImage = syncUrl
    ? `https://api.qrserver.com/v1/create-qr-code/?size=240x240&data=${encodeURIComponent(syncUrl)}`
    : null;

  return (
    <div className="fixed inset-0 bg-black/70 flex items-center justify-center z-50">
      <div className="bg-slate-900 border border-slate-800 rounded-xl p-6 w-full max-w-lg space-y-4 text-slate-100">
        <div className="flex justify-between items-center">
          <h3 className="text-lg font-semibold">Device / SIM Sync</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-white">✕</button>
        </div>
        <p className="text-sm text-slate-300">
          Scan the QR code with your trusted device to sync SMS/voice notifications. You will be asked to consent on the device.
        </p>
        {error && <div className="text-red-400 text-sm">{error}</div>}
        {qrImage && (
          <div className="flex flex-col items-center space-y-2">
            <img src={qrImage} alt="Device sync QR" className="rounded-lg border border-slate-800" />
            <div className="text-xs text-slate-400 break-all">{syncUrl}</div>
          </div>
        )}
        <div className="bg-slate-800 border border-slate-700 rounded-lg p-3 text-xs text-slate-200">
          By scanning you consent to syncing SMS/voice notifications for verification purposes. You can revoke access anytime from account settings.
        </div>
      </div>
    </div>
  );
};

export default DeviceSyncModal;
