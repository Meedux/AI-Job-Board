"use client";

import { Suspense, useEffect, useMemo, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';

const emptyRepresentative = { name: '', email: '', designation: '', phone: '' };
const emptyProfile = {
  companyName: '',
  businessAddress: '',
  city: '',
  country: 'Philippines',
  businessPhone: '',
  taxId: '',
  employerTypeId: '',
  authorizedRepEmail: '',
  industry: '',
  websiteUrl: '',
  authorizedRepresentatives: [emptyRepresentative]
};

function EmployerOnboardingInner() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const [profile, setProfile] = useState(emptyProfile);
  const [employerTypes, setEmployerTypes] = useState([]);
  const [requirements, setRequirements] = useState([]);
  const [uploads, setUploads] = useState({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const nextPath = useMemo(() => searchParams.get('next') || '/', [searchParams]);

  useEffect(() => {
    const init = async () => {
      await Promise.all([loadProfile(), loadEmployerTypes()]);
      await loadRequirements();
      setLoading(false);
    };
    init();
  }, []);

  const loadProfile = async () => {
    try {
      const res = await fetch('/api/profile/employer');
      if (res.status === 401) {
        router.push('/login?redirect=onboarding/employer');
        return;
      }
      const data = await res.json();
      setProfile((prev) => ({
        ...prev,
        companyName: data.companyName || '',
        businessAddress: data.businessAddress || '',
        city: data.city || '',
        country: data.country || 'Philippines',
        businessPhone: data.businessPhone || '',
        taxId: data.taxId || '',
        employerTypeId: data.employerType?.id || '',
        authorizedRepEmail: data.authorizedRepEmail || '',
        industry: data.industry || '',
        websiteUrl: data.websiteUrl || '',
        authorizedRepresentatives: Array.isArray(data.authorizedRepresentatives) && data.authorizedRepresentatives.length > 0
          ? data.authorizedRepresentatives
          : [emptyRepresentative]
      }));
    } catch (err) {
      console.error('Profile load error', err);
      setError('Could not load your profile.');
    }
  };

  const loadEmployerTypes = async () => {
    try {
      const res = await fetch('/api/employer-types');
      const data = await res.json();
      if (data.success && Array.isArray(data.employerTypes)) {
        setEmployerTypes(data.employerTypes);
      }
    } catch (err) {
      console.error('Employer types load error', err);
    }
  };

  const loadRequirements = async () => {
    try {
      const res = await fetch('/api/verification/requirements');
      if (!res.ok) return;
      const data = await res.json();
      if (data.success && Array.isArray(data.requirements)) {
        setRequirements(data.requirements);
      }
    } catch (err) {
      console.error('Requirements load error', err);
    }
  };

  const updateProfileField = (field, value) => {
    setProfile((prev) => ({ ...prev, [field]: value }));
  };

  const updateRepresentative = (index, field, value) => {
    setProfile((prev) => {
      const reps = [...prev.authorizedRepresentatives];
      reps[index] = { ...reps[index], [field]: value };
      return { ...prev, authorizedRepresentatives: reps };
    });
  };

  const addRepresentative = () => {
    setProfile((prev) => ({
      ...prev,
      authorizedRepresentatives: [...prev.authorizedRepresentatives, emptyRepresentative]
    }));
  };

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError('');
    setSuccess('');

    const payload = {
      companyName: profile.companyName,
      businessAddress: profile.businessAddress,
      city: profile.city,
      country: profile.country,
      businessPhone: profile.businessPhone,
      taxId: profile.taxId,
      employerTypeId: profile.employerTypeId || null,
      authorizedRepEmail: profile.authorizedRepEmail,
      industry: profile.industry,
      websiteUrl: profile.websiteUrl,
      authorizedRepresentatives: profile.authorizedRepresentatives
    };

    try {
      const res = await fetch('/api/profile/employer', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });

      const data = await res.json();
      if (res.ok && data.success) {
        setSuccess('Profile saved. Continue with document uploads to verify.');
        await loadRequirements();
      } else {
        setError(data.error || 'Unable to save profile.');
      }
    } catch (err) {
      console.error('Save error', err);
      setError('Unable to save profile.');
    } finally {
      setSaving(false);
    }
  };

  const handleUpload = async (req, file) => {
    if (!file) return;
    setUploads((prev) => ({ ...prev, [req.code]: 'preparing' }));
    try {
      const prepareRes = await fetch('/api/verification/upload/prepare', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          filename: file.name,
          fileType: file.type,
          size: file.size,
          category: (req.provider || req.code || 'license').toLowerCase()
        })
      });

      const prep = await prepareRes.json();
      if (!prepareRes.ok || !prep.uploadUrl) {
        setUploads((prev) => ({ ...prev, [req.code]: 'error' }));
        setError(prep.error || 'Upload preparation failed');
        return;
      }

      const uploadMethod = prep.uploadMethod || 'PUT';
      const uploadRes = await fetch(prep.uploadUrl, {
        method: uploadMethod,
        headers: uploadMethod === 'PUT' ? { 'Content-Type': file.type } : undefined,
        body: file
      });

      if (!uploadRes.ok) {
        setUploads((prev) => ({ ...prev, [req.code]: 'error' }));
        setError('Upload failed. Please try again.');
        return;
      }

      setUploads((prev) => ({ ...prev, [req.code]: 'uploaded' }));
      setSuccess('Document uploaded. Save your profile to refresh verification status.');
    } catch (err) {
      console.error('Upload error', err);
      setUploads((prev) => ({ ...prev, [req.code]: 'error' }));
      setError('Upload failed.');
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-200">
        Loading onboarding...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100 py-10 px-4 sm:px-8">
      <div className="max-w-5xl mx-auto space-y-8">
        <header className="bg-indigo-800 rounded-2xl p-6 shadow-lg border border-indigo-700/60">
          <p className="text-sm uppercase tracking-wide text-indigo-100">Employer onboarding</p>
          <h1 className="text-3xl font-bold">Complete verification to start hiring</h1>
          <p className="text-indigo-100 mt-2">Finish your profile and upload the required compliance documents. You can save and return anytime.</p>
        </header>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <section className="lg:col-span-2 bg-gray-900 border border-gray-800 rounded-xl p-6 space-y-6 shadow">
            <div className="flex items-center justify-between">
              <div>
                <h2 className="text-xl font-semibold">Company details</h2>
                <p className="text-sm text-gray-400">Tell us about your business.</p>
              </div>
              <span className="text-xs px-3 py-1 rounded-full bg-gray-800 border border-gray-700">Step 1</span>
            </div>

            <form className="space-y-5" onSubmit={handleSave}>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Company name</label>
                  <input
                    className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={profile.companyName}
                    onChange={(e) => updateProfileField('companyName', e.target.value)}
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Website (optional)</label>
                  <input
                    className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={profile.websiteUrl}
                    onChange={(e) => updateProfileField('websiteUrl', e.target.value)}
                    placeholder="https://"
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Industry</label>
                  <input
                    className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={profile.industry}
                    onChange={(e) => updateProfileField('industry', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Business phone</label>
                  <input
                    className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={profile.businessPhone}
                    onChange={(e) => updateProfileField('businessPhone', e.target.value)}
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm text-gray-300 mb-1">Business address</label>
                <input
                  className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                  value={profile.businessAddress}
                  onChange={(e) => updateProfileField('businessAddress', e.target.value)}
                />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">City</label>
                  <input
                    className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={profile.city}
                    onChange={(e) => updateProfileField('city', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Country</label>
                  <input
                    className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={profile.country}
                    onChange={(e) => updateProfileField('country', e.target.value)}
                  />
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Tax ID / TIN</label>
                  <input
                    className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={profile.taxId}
                    onChange={(e) => updateProfileField('taxId', e.target.value)}
                    placeholder="123-456-789"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Employer type</label>
                  <select
                    className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={profile.employerTypeId}
                    onChange={(e) => updateProfileField('employerTypeId', e.target.value)}
                  >
                    <option value="">Select employer type</option>
                    {employerTypes.map((et) => (
                      <option key={et.id} value={et.id}>
                        {et.label} {et.category ? `• ${et.category}` : ''}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm text-gray-300 mb-1">Authorized representative email</label>
                  <input
                    className="w-full rounded-md bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                    value={profile.authorizedRepEmail}
                    onChange={(e) => updateProfileField('authorizedRepEmail', e.target.value)}
                    placeholder="rep@company.com"
                  />
                </div>
              </div>

              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-gray-300">Authorized representatives</p>
                    <p className="text-xs text-gray-400">Add at least one point of contact.</p>
                  </div>
                  <button
                    type="button"
                    onClick={addRepresentative}
                    className="text-sm px-3 py-1 rounded-md bg-gray-800 border border-gray-700 hover:border-indigo-500"
                  >
                    Add
                  </button>
                </div>
                {profile.authorizedRepresentatives.map((rep, idx) => (
                  <div key={idx} className="grid grid-cols-1 md:grid-cols-4 gap-3 bg-gray-900 border border-gray-800 rounded-lg p-3">
                    <input
                      className="rounded-md bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Name"
                      value={rep.name}
                      onChange={(e) => updateRepresentative(idx, 'name', e.target.value)}
                    />
                    <input
                      className="rounded-md bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Email"
                      value={rep.email}
                      onChange={(e) => updateRepresentative(idx, 'email', e.target.value)}
                    />
                    <input
                      className="rounded-md bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Designation"
                      value={rep.designation}
                      onChange={(e) => updateRepresentative(idx, 'designation', e.target.value)}
                    />
                    <input
                      className="rounded-md bg-gray-800 border border-gray-700 px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                      placeholder="Phone"
                      value={rep.phone}
                      onChange={(e) => updateRepresentative(idx, 'phone', e.target.value)}
                    />
                  </div>
                ))}
              </div>

              {error && <div className="bg-red-900/50 border border-red-700 text-red-100 px-4 py-2 rounded">{error}</div>}
              {success && <div className="bg-green-900/50 border border-green-700 text-green-100 px-4 py-2 rounded">{success}</div>}

              <div className="flex items-center gap-3">
                <button
                  type="submit"
                  disabled={saving}
                  className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white disabled:opacity-60"
                >
                  {saving ? 'Saving...' : 'Save company info'}
                </button>
                <p className="text-xs text-gray-400">Save before uploading documents.</p>
              </div>
            </form>
          </section>

          <aside className="bg-gray-900 border border-gray-800 rounded-xl p-5 space-y-4 shadow">
            <div>
              <h3 className="text-lg font-semibold">What to expect</h3>
              <ul className="mt-2 space-y-2 text-sm text-gray-300 list-disc list-inside">
                <li>Save your company details first.</li>
                <li>Upload required compliance documents.</li>
                <li>We auto-verify when requirements are complete.</li>
              </ul>
            </div>
            <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 text-sm text-gray-200">
              Tip: If you need to pause, you can return to this page anytime from your account menu.
            </div>
          </aside>
        </div>

        <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-semibold">Compliance documents</h2>
              <p className="text-sm text-gray-400">Upload the files listed for your employer type.</p>
            </div>
            <span className="text-xs px-3 py-1 rounded-full bg-gray-800 border border-gray-700">Step 2</span>
          </div>

          {requirements.length === 0 ? (
            <p className="text-sm text-gray-400">Select an employer type and save to see document requirements.</p>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {requirements.map((req) => (
                <div key={`${req.provider}-${req.code}`} className="border border-gray-800 rounded-lg p-4 bg-gray-850 bg-gray-800">
                  <div className="flex items-center justify-between">
                    <div>
                      <p className="text-sm font-semibold text-gray-100">{req.label || req.code}</p>
                      <p className="text-xs text-gray-400">{req.provider}</p>
                    </div>
                    {req.required && <span className="text-xs px-2 py-1 rounded-full bg-indigo-600 text-white">Required</span>}
                  </div>
                  <div className="mt-3 flex items-center justify-between gap-3">
                    <input
                      type="file"
                      accept=".pdf,.png,.jpg,.jpeg"
                      className="text-xs text-gray-300"
                      onChange={(e) => handleUpload(req, e.target.files?.[0])}
                    />
                    <span className="text-xs text-gray-400">
                      {uploads[req.code] === 'uploaded' ? 'Uploaded' : uploads[req.code] === 'preparing' ? 'Uploading…' : 'Pending'}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </section>

        <section className="bg-gray-900 border border-gray-800 rounded-xl p-6 shadow flex flex-col md:flex-row md:items-center md:justify-between gap-4">
          <div>
            <h3 className="text-lg font-semibold">Ready to continue?</h3>
            <p className="text-sm text-gray-400">We will finalize verification once all required items are provided.</p>
          </div>
          <div className="flex gap-3">
            <button
              onClick={() => router.push('/dashboard')}
              className="px-4 py-2 rounded-md border border-gray-700 text-gray-200 hover:border-indigo-500"
            >
              Save and return later
            </button>
            <button
              onClick={() => router.push(nextPath || '/')}
              className="px-4 py-2 rounded-md bg-indigo-600 hover:bg-indigo-700 text-white"
            >
              Finish and continue
            </button>
          </div>
        </section>
      </div>
    </div>
  );
}

export default function EmployerOnboardingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-950 flex items-center justify-center text-gray-200">
        Loading onboarding...
      </div>
    }>
      <EmployerOnboardingInner />
    </Suspense>
  );
}
