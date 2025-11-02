'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  Building2, 
  MapPin, 
  Globe, 
  Mail, 
  Phone, 
  Users, 
  Award,
  Calendar,
  Camera,
  Edit3,
  Save,
  X,
  Shield,
  Star,
  ExternalLink
} from 'lucide-react';

export default function EmployerProfile() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [uploadingLogo, setUploadingLogo] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState(false);
  const [profile, setProfile] = useState({
    // Company Information
    companyName: '',
    companyDescription: '',
    industry: '',
    companySize: '',
    foundedYear: '',
    websiteUrl: '',
    logoUrl: '',
    
    // Contact Information
    businessAddress: '',
    city: '',
    state: '',
    country: 'Philippines',
    postalCode: '',
    businessPhone: '',
    businessEmail: '',
    
  // Business Details
  businessRegistrationNumber: '',
  taxId: '',
  licenseNumber: '',
  licenseExpirationDate: '',
    
    // Profile Settings
    showContactOnProfile: false,
    allowDirectContact: true,
    profileVisibility: 'public',
    
    // Social Media
    linkedinUrl: '',
    facebookUrl: '',
    twitterUrl: '',
    
    // Statistics (read-only)
    totalJobsPosted: 0,
    activeJobs: 0,
    totalApplications: 0,
    memberSince: null
    // verificationDocuments will be loaded from the profile API when available
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (!['employer_admin', 'employer_staff', 'super_admin'].includes(user.role)) {
      router.push('/dashboard');
      return;
    }

    fetchProfile();
  }, [user, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile/employer', {
        headers: {
          'Authorization': `Bearer ${user.token}`
        }
      });

      if (response.ok) {
        const data = await response.json();
        setProfile(prev => ({ ...prev, ...data }));
      }
    } catch (error) {
      console.error('Error fetching profile:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const response = await fetch('/api/profile/employer', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user.token}`
        },
        body: JSON.stringify(profile)
      });

      if (response.ok) {
        setEditing(false);
        // Show success message
      }
    } catch (error) {
      console.error('Error saving profile:', error);
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));
  };

  // Logo upload handler
  const handleLogoUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type (images only)
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, GIF, SVG, etc.)');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploadingLogo(true);

    try {
      const formData = new FormData();
      formData.append('logo', file);
      formData.append('userId', user.id);

      const response = await fetch('/api/upload/logo', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();

        // Update profile with new logo URL
        setProfile(prev => ({
          ...prev,
          logoUrl: data.logoUrl
        }));

        alert('Logo uploaded successfully!');
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Logo upload error:', error);
      alert('Failed to upload logo. Please try again.');
    } finally {
      setUploadingLogo(false);
      // Reset file input
      event.target.value = '';
    }
  };

  // Verification document upload (prepare + PUT to proxy)
  const handleVerificationUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Accept PDFs and images
    const allowed = ['application/pdf', 'image/png', 'image/jpeg'];
    if (!allowed.includes(file.type)) {
      alert('Please upload a PDF or image (PNG/JPEG)');
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      alert('File must be smaller than 10MB');
      return;
    }

    setUploadingDoc(true);

    try {
      // 1) Prepare
      const prepRes = await fetch('/api/verification/upload/prepare', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${user?.token}`
        },
        body: JSON.stringify({ filename: file.name, fileType: file.type, size: file.size, category: 'company_document' })
      });

      if (!prepRes.ok) {
        const err = await prepRes.json();
        alert(`Upload preparation failed: ${err.error || 'Unknown'}`);
        return;
      }

      const prep = await prepRes.json();

      // 2) Upload to returned URL. If `direct` is true, the server returned a signed/direct upload URL (Vercel Blob).
      let uploadedUrl = null;

      if (prep.direct && prep.uploadUrl && prep.uploadUrl.startsWith('http')) {
        // Direct upload to Vercel Blob or other storage
        const uploadRes = await fetch(prep.uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type,
            // No Authorization header for direct signed URLs
          },
          body: file
        });

        if (!uploadRes.ok) {
          const text = await uploadRes.text().catch(() => '');
          alert(`Direct upload failed: ${uploadRes.status} ${text}`);
          return;
        }

        // If the prepare response included a stable blobUrl, prefer it; otherwise try to derive URL
        uploadedUrl = prep.blobUrl || prep.blobURL || prep.blobUrl || null;

        // Some blob providers return JSON after upload; attempt to read it
        try {
          const maybeJson = await uploadRes.clone().json().catch(() => null);
          if (maybeJson) {
            uploadedUrl = uploadedUrl || maybeJson.url || maybeJson.blobUrl || maybeJson.location || uploadedUrl;
          }
        } catch (e) {
          // ignore
        }
      } else {
        // Fallback to proxy upload URL (internal PUT)
        const uploadRes = await fetch(prep.uploadUrl, {
          method: 'PUT',
          headers: {
            'Content-Type': file.type,
            'Authorization': `Bearer ${user?.token}`
          },
          body: file
        });

        if (!uploadRes.ok) {
          const err = await uploadRes.json();
          alert(`Upload failed: ${err.error || 'Unknown'}`);
          return;
        }

        const uploaded = await uploadRes.json();
        uploadedUrl = uploaded.url;
      }

      // Optionally update local profile state to include the document URL
      if (uploadedUrl) {
        setProfile(prev => ({ ...prev, verificationDocuments: [...(prev.verificationDocuments || []), uploadedUrl] }));
      }

      alert('Document uploaded successfully');
    } catch (error) {
      console.error('Verification upload error:', error);
      alert('Failed to upload document.');
    } finally {
      setUploadingDoc(false);
      event.target.value = '';
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8 mt-16">
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="relative">
                <div className="w-20 h-20 bg-gray-700 rounded-lg flex items-center justify-center">
                  {profile.logoUrl ? (
                    <img 
                      src={profile.logoUrl} 
                      alt="Company Logo" 
                      className="w-full h-full object-cover rounded-lg"
                    />
                  ) : (
                    <Building2 className="w-8 h-8 text-gray-400" />
                  )}
                </div>
                {editing && (
                  <div className="relative">
                    <button
                      onClick={() => document.getElementById('logo-upload').click()}
                      disabled={uploadingLogo}
                      className="absolute -bottom-2 -right-2 bg-blue-600 rounded-full p-2 hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                    >
                      {uploadingLogo ? (
                        <div className="animate-spin rounded-full h-4 w-4 border-2 border-white border-t-transparent"></div>
                      ) : (
                        <Camera className="w-4 h-4 text-white" />
                      )}
                    </button>
                    <input
                      id="logo-upload"
                      type="file"
                      accept="image/*"
                      onChange={handleLogoUpload}
                      className="hidden"
                    />
                  </div>
                )}
              </div>
              <div>
                <h1 className="text-2xl font-bold text-white">
                  {profile.companyName || 'Company Name'}
                </h1>
                <div className="flex items-center gap-4 text-gray-400 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profile.city || 'City'}, {profile.country}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {profile.companySize || 'Company Size'}
                  </span>
                </div>
              </div>
            </div>
            
            <div className="flex gap-2">
              {editing ? (
                <>
                  <button
                    onClick={() => setEditing(false)}
                    className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 flex items-center gap-2"
                  >
                    <X className="w-4 h-4" />
                    Cancel
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2 disabled:opacity-50"
                  >
                    <Save className="w-4 h-4" />
                    {saving ? 'Saving...' : 'Save'}
                  </button>
                </>
              ) : (
                <button
                  onClick={() => setEditing(true)}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center gap-2"
                >
                  <Edit3 className="w-4 h-4" />
                  Edit Profile
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Total Jobs</p>
                <p className="text-2xl font-bold text-white">{profile.totalJobsPosted}</p>
              </div>
              <div className="bg-blue-600 rounded-lg p-3">
                <Building2 className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Active Jobs</p>
                <p className="text-2xl font-bold text-green-400">{profile.activeJobs}</p>
              </div>
              <div className="bg-green-600 rounded-lg p-3">
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Applications</p>
                <p className="text-2xl font-bold text-yellow-400">{profile.totalApplications}</p>
              </div>
              <div className="bg-yellow-600 rounded-lg p-3">
                <Users className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Member Since</p>
                <p className="text-lg font-bold text-purple-400">
                  {profile.memberSince ? new Date(profile.memberSince).getFullYear() : new Date().getFullYear()}
                </p>
              </div>
              <div className="bg-purple-600 rounded-lg p-3">
                <Calendar className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Profile */}
          <div className="lg:col-span-2 space-y-6">
            {/* Company Information */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-lg font-semibold text-white mb-4">Company Information</h2>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Company Name</label>
                  {editing ? (
                    <input
                      type="text"
                      value={profile.companyName}
                      onChange={(e) => handleInputChange('companyName', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  ) : (
                    <p className="text-white">{profile.companyName || 'Not provided'}</p>
                  )}
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Description</label>
                  {editing ? (
                    <textarea
                      value={profile.companyDescription}
                      onChange={(e) => handleInputChange('companyDescription', e.target.value)}
                      rows={4}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  ) : (
                    <p className="text-white">{profile.companyDescription || 'Not provided'}</p>
                  )}
                </div>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Industry</label>
                    {editing ? (
                      <select
                        value={profile.industry}
                        onChange={(e) => handleInputChange('industry', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      >
                        <option value="">Select Industry</option>
                        <option value="technology">Technology</option>
                        <option value="healthcare">Healthcare</option>
                        <option value="finance">Finance</option>
                        <option value="education">Education</option>
                        <option value="retail">Retail</option>
                        <option value="manufacturing">Manufacturing</option>
                        <option value="other">Other</option>
                      </select>
                    ) : (
                      <p className="text-white capitalize">{profile.industry || 'Not provided'}</p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Company Size</label>
                    {editing ? (
                      <select
                        value={profile.companySize}
                        onChange={(e) => handleInputChange('companySize', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      >
                        <option value="">Select Size</option>
                        <option value="1-10">1-10 employees</option>
                        <option value="11-50">11-50 employees</option>
                        <option value="51-200">51-200 employees</option>
                        <option value="201-500">201-500 employees</option>
                        <option value="501+">501+ employees</option>
                      </select>
                    ) : (
                      <p className="text-white">{profile.companySize || 'Not provided'}</p>
                    )}
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Tax Identification Number (TIN)</label>
                  {editing ? (
                    <input
                      type="text"
                      value={profile.taxId || ''}
                      onChange={(e) => handleInputChange('taxId', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      placeholder="Enter company TIN / BIR number"
                    />
                  ) : (
                    <p className="text-white">{profile.taxId || 'Not provided'}</p>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Authorized Representatives</label>
                  {editing ? (
                    <textarea
                      value={(profile.authorizedRepresentatives || []).map(a => `${a.name} <${a.email}>`).join('\n')}
                      onChange={(e) => {
                        const lines = e.target.value.split('\n').map(l => l.trim()).filter(Boolean);
                        const ars = lines.map(line => {
                          const m = line.match(/^(.*) <(.*)>$/);
                          if (m) return { name: m[1].trim(), email: m[2].trim() };
                          return { name: line, email: '' };
                        });
                        handleInputChange('authorizedRepresentatives', ars);
                      }}
                      rows={3}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      placeholder="One per line: Full Name <email@example.com>"
                    />
                  ) : (
                    <div className="space-y-1">
                      {(profile.authorizedRepresentatives || []).length > 0 ? (
                        (profile.authorizedRepresentatives || []).map((a, i) => (
                          <div key={i} className="text-gray-200 text-sm">{a.name} — {a.email}</div>
                        ))
                      ) : (
                        <p className="text-gray-400">No authorized representatives added.</p>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-lg font-semibold text-white mb-4">Contact Information</h2>
              <div className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Business Email</label>
                    {editing ? (
                      <input
                        type="email"
                        value={profile.businessEmail}
                        onChange={(e) => handleInputChange('businessEmail', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      />
                    ) : (
                      <p className="text-white flex items-center gap-2">
                        <Mail className="w-4 h-4" />
                        {profile.businessEmail || 'Not provided'}
                      </p>
                    )}
                  </div>
                  
                  <div>
                    <label className="block text-sm font-medium text-gray-300 mb-1">Business Phone</label>
                    {editing ? (
                      <input
                        type="tel"
                        value={profile.businessPhone}
                        onChange={(e) => handleInputChange('businessPhone', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      />
                    ) : (
                      <p className="text-white flex items-center gap-2">
                        <Phone className="w-4 h-4" />
                        {profile.businessPhone || 'Not provided'}
                      </p>
                    )}
                  </div>
                </div>
                
                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">Business Address</label>
                  {editing ? (
                    <input
                      type="text"
                      value={profile.businessAddress}
                      onChange={(e) => handleInputChange('businessAddress', e.target.value)}
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                    />
                  ) : (
                    <p className="text-white flex items-center gap-2">
                      <MapPin className="w-4 h-4" />
                      {profile.businessAddress || 'Not provided'}
                    </p>
                  )}
                </div>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Profile Settings */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-lg font-semibold text-white mb-4">Profile Settings</h2>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm">Show Contact Info</p>
                    <p className="text-gray-400 text-xs">Display contact details on job posts</p>
                  </div>
                  <button
                    onClick={() => handleInputChange('showContactOnProfile', !profile.showContactOnProfile)}
                    disabled={!editing}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      profile.showContactOnProfile ? 'bg-blue-600' : 'bg-gray-600'
                    } ${!editing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        profile.showContactOnProfile ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
                
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-white text-sm">Allow Direct Contact</p>
                    <p className="text-gray-400 text-xs">Let job seekers contact you directly</p>
                  </div>
                  <button
                    onClick={() => handleInputChange('allowDirectContact', !profile.allowDirectContact)}
                    disabled={!editing}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      profile.allowDirectContact ? 'bg-blue-600' : 'bg-gray-600'
                    } ${!editing ? 'opacity-50 cursor-not-allowed' : ''}`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        profile.allowDirectContact ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <a
                  href="/admin/post-job"
                  className="block w-full bg-blue-600 text-white rounded-lg px-4 py-2 text-center hover:bg-blue-700 transition-colors"
                >
                  Post New Job
                </a>
                <a
                  href="/admin/jobs"
                  className="block w-full bg-gray-700 text-white rounded-lg px-4 py-2 text-center hover:bg-gray-600 transition-colors"
                >
                  Manage Jobs
                </a>
                <a
                  href="/ats"
                  className="block w-full bg-purple-600 text-white rounded-lg px-4 py-2 text-center hover:bg-purple-700 transition-colors"
                >
                  Open ATS
                </a>
              </div>
            </div>

            {/* Compliance */}
            {profile.licenseNumber && (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-green-400" />
                  Compliance
                </h2>
                <div className="space-y-2">
                  <div className="flex items-center gap-2 text-green-400">
                    <Star className="w-4 h-4" />
                    <span className="text-sm">Licensed Agency</span>
                  </div>
                  <p className="text-gray-400 text-sm">License: {profile.licenseNumber}</p>
                  {profile.licenseExpirationDate && (
                    <p className="text-gray-400 text-sm">
                      Expires: {new Date(profile.licenseExpirationDate).toLocaleDateString()}
                    </p>
                  )}
                </div>
              </div>
            )}

            {/* Verification Documents */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-lg font-semibold text-white mb-4">Verification Documents</h2>
              <div className="space-y-3">
                <p className="text-gray-400 text-sm">Upload company documents (BIR, SEC, licenses). Files are private until reviewed by admins.</p>
                {editing && (
                  <div>
                    <input type="file" accept=".pdf,image/png,image/jpeg" onChange={handleVerificationUpload} />
                    <p className="text-xs text-gray-400 mt-1">{uploadingDoc ? 'Uploading...' : ''}</p>
                  </div>
                )}

                <div className="space-y-2">
                  {(profile.verificationDocuments || []).length > 0 ? (
                    (profile.verificationDocuments || []).map((u, idx) => (
                      <a key={idx} href={u} target="_blank" rel="noreferrer" className="text-blue-400 block text-sm truncate">{u}</a>
                    ))
                  ) : (
                    <p className="text-gray-400 text-sm">No documents uploaded yet.</p>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
