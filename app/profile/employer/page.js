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
  ExternalLink,
  CheckCircle
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
    industry: 'Technology',
    logoUrl: '',
    websiteUrl: '',
    businessAddress: '',
    businessPhone: '',
    businessEmail: '',
    licenseNumber: '',
    licenseExpirationDate: '',
    employerType: null,
    authorizedRepEmail: '',
    authorizedRepEmailValidated: false,
    
    // Contact Information
    city: '',
    state: '',
    country: 'Philippines',
    postalCode: '',
    companySize: '',
    foundedYear: '',
    taxId: '',
    authorizedRepresentatives: [],
    verificationDocuments: [],
    
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
  const [employerTypes, setEmployerTypes] = useState([]);
  const [toast, setToast] = useState(null);
  const [verificationModal, setVerificationModal] = useState(false);

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
    fetchEmployerTypes();
  }, [user, router]);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
    setTimeout(() => setToast(null), 5000);
  };

  const showVerificationModal = () => {
    setVerificationModal(true);
  };

  const hideVerificationModal = () => {
    setVerificationModal(false);
  };

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

  const fetchEmployerTypes = async () => {
    try {
      const response = await fetch('/api/employer-types');
      if (response.ok) {
        const data = await response.json();
        setEmployerTypes(data.employerTypes || []);
      }
    } catch (error) {
      console.error('Error fetching employer types:', error);
    }
  };

  const handleSave = async () => {
    // Check verification requirements
    if (!profile.employerType && profile.verificationStatus !== 'verified') {
      showToast('Please select an employer type to complete verification.', 'warning');
      return;
    }
    
    if (!profile.authorizedRepEmail && profile.verificationStatus !== 'verified') {
      showToast('Please provide an authorized representative email for verification.', 'warning');
      return;
    }

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
        const result = await response.json();
        setEditing(false);
        showToast('Profile updated successfully!', 'success');
        // If server auto-verified the employer, show a success note
        if (result && result.verificationStatus === 'verified') {
          showToast('Profile automatically verified — you now have full employer access.', 'success');
        }
        // Refresh profile data
        fetchProfile();
      } else {
        const error = await response.json();
        showToast(error.error || 'Failed to update profile.', 'error');
      }
    } catch (error) {
      console.error('Error saving profile:', error);
      showToast('An error occurred while saving. Please try again.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleInputChange = (field, value) => {
    setProfile(prev => ({ ...prev, [field]: value }));

    // Show verification prompts for required fields when not verified
    if (profile.verificationStatus !== 'verified') {
      if (field === 'employerType' && value) {
        showToast('Employer type selected. Complete verification to unlock all features.', 'info');
      }
      if (field === 'authorizedRepEmail' && value) {
        showToast('Authorized rep email updated. Please verify this email to complete verification.', 'warning');
      }
      if (field === 'licenseNumber' && value && profile.employerType?.subtype === 'dmw') {
        showToast('DMW license information added. Upload verification documents to complete verification.', 'info');
      }
    }
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
                <div className="flex items-center gap-3 mb-2">
                  <h1 className="text-2xl font-bold text-white">
                    {profile.companyName || 'Company Name'}
                  </h1>
                  {/* Verification Status Badge */}
                  <div className={`px-3 py-1 rounded-full text-sm font-medium flex items-center gap-2 ${
                    profile.verificationStatus === 'verified' 
                      ? 'bg-green-600/20 text-green-400 border border-green-600/30' 
                      : profile.verificationStatus === 'pending' 
                      ? 'bg-yellow-600/20 text-yellow-400 border border-yellow-600/30'
                      : 'bg-red-600/20 text-red-400 border border-red-600/30'
                  }`}>
                    {profile.verificationStatus === 'verified' ? (
                      <>
                        <CheckCircle className="w-4 h-4" />
                        Verified Employer
                      </>
                    ) : profile.verificationStatus === 'pending' ? (
                      <>
                        <Shield className="w-4 h-4" />
                        Verification Pending
                      </>
                    ) : (
                      <>
                        <Shield className="w-4 h-4" />
                        Unverified
                      </>
                    )}
                  </div>
                </div>
                <div className="flex items-center gap-4 text-gray-400 mt-1">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profile.city || 'City'}, {profile.country}
                  </span>
                  <span className="flex items-center gap-1">
                    <Users className="w-4 h-4" />
                    {profile.companySize || 'Company Size'}
                  </span>
                  {/* Employer Type Display */}
                  {profile.employerType && (
                    <span className="flex items-center gap-1">
                      <Building2 className="w-4 h-4" />
                      {profile.employerType.label}
                    </span>
                  )}
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
                    <label className="block text-sm font-medium text-gray-300 mb-1">
                      Employer Type {!profile.employerType && profile.verificationStatus !== 'verified' && <span className="text-red-400">*</span>}
                    </label>
                    {editing ? (
                      <select
                        value={profile.employerType?.id || ''}
                        onChange={(e) => {
                          const selectedType = employerTypes.find(type => type.id === e.target.value);
                          handleInputChange('employerType', selectedType || null);
                          handleInputChange('employerTypeId', e.target.value || null);
                        }}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      >
                        <option value="">Select Employer Type</option>
                        {employerTypes.map(type => (
                          <option key={type.id} value={type.id}>
                            {type.label} {type.description && `(${type.description})`}
                          </option>
                        ))}
                      </select>
                    ) : (
                      <p className="text-white">{profile.employerType?.label || 'Not selected'}</p>
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

                <div>
                  <label className="block text-sm font-medium text-gray-300 mb-1">
                    Authorized Representative Email {!profile.authorizedRepEmailValidated && profile.verificationStatus !== 'verified' && <span className="text-red-400">*</span>}
                  </label>
                  {editing ? (
                    <div className="space-y-2">
                      <input
                        type="email"
                        value={profile.authorizedRepEmail || ''}
                        onChange={(e) => handleInputChange('authorizedRepEmail', e.target.value)}
                        className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                        placeholder="Enter authorized representative email"
                      />
                      <p className="text-xs text-gray-400">This email will be used for verification purposes and must be validated.</p>
                    </div>
                  ) : (
                    <div className="flex items-center gap-2">
                      <p className="text-white">{profile.authorizedRepEmail || 'Not provided'}</p>
                      {profile.authorizedRepEmailValidated && (
                        <span className="text-green-400 text-sm flex items-center gap-1">
                          <CheckCircle className="w-4 h-4" />
                          Validated
                        </span>
                      )}
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Employer Type Specific Fields */}
            {profile.employerType && profile.employerType.subtype === 'dmw' && (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-lg font-semibold text-white mb-4">DMW License Information</h2>
                <div className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">
                        DMW License Number {!profile.licenseNumber && profile.verificationStatus !== 'verified' && <span className="text-red-400">*</span>}
                      </label>
                      {editing ? (
                        <input
                          type="text"
                          value={profile.licenseNumber || ''}
                          onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                          placeholder="Enter DMW license number"
                        />
                      ) : (
                        <p className="text-white">{profile.licenseNumber || 'Not provided'}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">License Expiration Date</label>
                      {editing ? (
                        <input
                          type="date"
                          value={profile.licenseExpirationDate ? new Date(profile.licenseExpirationDate).toISOString().split('T')[0] : ''}
                          onChange={(e) => handleInputChange('licenseExpirationDate', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                        />
                      ) : (
                        <p className="text-white">
                          {profile.licenseExpirationDate ? new Date(profile.licenseExpirationDate).toLocaleDateString() : 'Not provided'}
                        </p>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            )}

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

            {/* Verification Status */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                Verification Status
              </h2>
              <div className="space-y-3">
                <div className={`p-3 rounded-lg border ${
                  profile.verificationStatus === 'verified' 
                    ? 'bg-green-600/10 border-green-600/30 text-green-400' 
                    : profile.verificationStatus === 'pending' 
                    ? 'bg-yellow-600/10 border-yellow-600/30 text-yellow-400'
                    : 'bg-red-600/10 border-red-600/30 text-red-400'
                }`}>
                  <div className="flex items-center gap-2 mb-2">
                    {profile.verificationStatus === 'verified' ? (
                      <CheckCircle className="w-5 h-5" />
                    ) : profile.verificationStatus === 'pending' ? (
                      <Shield className="w-5 h-5" />
                    ) : (
                      <Shield className="w-5 h-5" />
                    )}
                    <span className="font-medium">
                      {profile.verificationStatus === 'verified' 
                        ? 'Verified Employer' 
                        : profile.verificationStatus === 'pending' 
                        ? 'Verification in Progress'
                        : 'Verification Required'}
                    </span>
                  </div>
                  <p className="text-sm">
                    {profile.verificationStatus === 'verified' 
                      ? 'Your employer account has been verified. You can now post jobs and access all premium features.'
                      : profile.verificationStatus === 'pending' 
                      ? 'Your verification documents are being reviewed. This usually takes 1-3 business days.'
                      : 'Complete your verification to unlock job posting and premium features.'}
                  </p>
                </div>

                {/* Employer Type Info */}
                {profile.employerType && (
                  <div className="p-3 bg-gray-700/50 rounded-lg">
                    <h4 className="text-white font-medium mb-1">Employer Type</h4>
                    <p className="text-gray-300 text-sm">{profile.employerType.label}</p>
                    {profile.employerType.description && (
                      <p className="text-gray-400 text-xs mt-1">{profile.employerType.description}</p>
                    )}
                  </div>
                )}

                {/* Verification Documents */}
                {profile.verificationDocuments && profile.verificationDocuments.length > 0 && (
                  <div className="p-3 bg-gray-700/50 rounded-lg">
                    <h4 className="text-white font-medium mb-2">Submitted Documents</h4>
                    <div className="space-y-1">
                      {profile.verificationDocuments.map((doc, index) => (
                        <div key={index} className="flex items-center gap-2 text-gray-300 text-sm">
                          <CheckCircle className="w-4 h-4 text-green-400" />
                          <span>Document {index + 1}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Verification Actions */}
                {profile.verificationStatus !== 'verified' && (
                  <button
                    onClick={showVerificationModal}
                    className="w-full bg-blue-600 text-white rounded-lg px-4 py-2 text-sm hover:bg-blue-700 transition-colors"
                  >
                    {profile.verificationDocuments && profile.verificationDocuments.length > 0 
                      ? 'Update Verification Documents' 
                      : 'Submit for Verification'}
                  </button>
                )}
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
              <h2 className="text-lg font-semibold text-white mb-4">
                Verification Documents {(profile.verificationDocuments || []).length === 0 && profile.verificationStatus !== 'verified' && <span className="text-red-400">*</span>}
              </h2>
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

            {/* Verification Status */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className={profile.verificationStatus === 'verified' ? 'text-green-400 w-5 h-5' : 'text-yellow-400 w-5 h-5'} />
                Verification Status
              </h2>
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  {profile.verificationStatus === 'verified' ? (
                    <>
                      <CheckCircle className="w-5 h-5 text-green-400" />
                      <span className="text-green-400 font-medium">Verified</span>
                    </>
                  ) : profile.verificationStatus === 'pending' ? (
                    <>
                      <div className="w-5 h-5 border-2 border-yellow-400 border-t-transparent rounded-full animate-spin"></div>
                      <span className="text-yellow-400 font-medium">Under Review</span>
                    </>
                  ) : (
                    <>
                      <X className="w-5 h-5 text-red-400" />
                      <span className="text-red-400 font-medium">Unverified</span>
                    </>
                  )}
                </div>
                
                {profile.verificationStatus !== 'verified' && (
                  <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-3">
                    <p className="text-yellow-200 text-sm font-medium mb-1">Complete Verification</p>
                    <p className="text-yellow-300 text-xs mb-3">
                      To post jobs and access premium features, please complete your profile verification.
                      Required: Employer Type, Authorized Rep Email, and verification documents.
                    </p>
                    <button
                      onClick={showVerificationModal}
                      className="w-full bg-yellow-600 text-white rounded-lg px-3 py-2 text-sm hover:bg-yellow-700 transition-colors"
                    >
                      View Verification Requirements
                    </button>
                  </div>
                )}
                
                {profile.employerType && (
                  <div className="text-gray-300 text-sm">
                    <strong>Type:</strong> {profile.employerType.label}
                  </div>
                )}
                
                {profile.authorizedRepEmail && (
                  <div className="text-gray-300 text-sm">
                    <strong>Auth Rep:</strong> {profile.authorizedRepEmail}
                    {profile.authorizedRepEmailValidated ? (
                      <span className="text-green-400 ml-1">✓</span>
                    ) : (
                      <span className="text-yellow-400 ml-1">⚠</span>
                    )}
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Verification Requirements Modal */}
      {verificationModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-gray-900 rounded-2xl max-w-lg w-full mx-4 border border-gray-700 shadow-2xl">
            {/* Header */}
            <div className="flex items-center justify-between p-6 border-b border-gray-700">
              <h2 className="text-xl font-bold text-white">Complete Your Verification</h2>
              <button
                onClick={hideVerificationModal}
                className="text-gray-400 hover:text-white transition-colors"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Content */}
            <div className="p-6 space-y-4">
              <p className="text-gray-300">
                To post jobs and access all features, please complete the following verification requirements:
              </p>

              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                    profile.employerType ? 'bg-green-600' : 'bg-gray-600'
                  }`}>
                    {profile.employerType ? (
                      <CheckCircle className="w-3 h-3 text-white" />
                    ) : (
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">Select Employer Type</p>
                    <p className="text-gray-400 text-sm">Choose your employer category (Direct Employer, Agency, etc.)</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                    profile.authorizedRepEmail ? 'bg-green-600' : 'bg-gray-600'
                  }`}>
                    {profile.authorizedRepEmail ? (
                      <CheckCircle className="w-3 h-3 text-white" />
                    ) : (
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">Authorized Representative Email</p>
                    <p className="text-gray-400 text-sm">Provide email for official communications and verification</p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                    (profile.verificationDocuments || []).length > 0 ? 'bg-green-600' : 'bg-gray-600'
                  }`}>
                    {(profile.verificationDocuments || []).length > 0 ? (
                      <CheckCircle className="w-3 h-3 text-white" />
                    ) : (
                      <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                    )}
                  </div>
                  <div>
                    <p className="text-white font-medium">Verification Documents</p>
                    <p className="text-gray-400 text-sm">Upload BIR forms, licenses, or company documents</p>
                  </div>
                </div>

                {profile.employerType?.subtype === 'dmw' && (
                  <div className="flex items-start gap-3">
                    <div className={`w-5 h-5 rounded-full flex items-center justify-center mt-0.5 ${
                      profile.licenseNumber ? 'bg-green-600' : 'bg-gray-600'
                    }`}>
                      {profile.licenseNumber ? (
                        <CheckCircle className="w-3 h-3 text-white" />
                      ) : (
                        <div className="w-2 h-2 bg-gray-400 rounded-full"></div>
                      )}
                    </div>
                    <div>
                      <p className="text-white font-medium">DMW License Information</p>
                      <p className="text-gray-400 text-sm">Provide your DMW license number and expiration date</p>
                    </div>
                  </div>
                )}
              </div>

              <div className="bg-blue-900/20 border border-blue-500/30 rounded-lg p-4">
                <p className="text-blue-300 text-sm">
                  <strong>Why verify?</strong> Verification ensures trust and compliance. Verified employers can post unlimited jobs,
                  access premium features, and build credibility with job seekers.
                </p>
              </div>
            </div>

            {/* Footer */}
            <div className="flex gap-3 p-6 border-t border-gray-700">
              <button
                onClick={hideVerificationModal}
                className="flex-1 bg-gray-700 text-white rounded-lg px-4 py-2 hover:bg-gray-600 transition-colors"
              >
                Close
              </button>
              <button
                onClick={() => {
                  hideVerificationModal();
                  setEditing(true);
                }}
                className="flex-1 bg-blue-600 text-white rounded-lg px-4 py-2 hover:bg-blue-700 transition-colors"
              >
                Complete Profile
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Toast Notification */}
      {toast && (
        <div className={`fixed bottom-4 right-4 z-50 p-4 rounded-lg shadow-lg max-w-sm ${
          toast.type === 'success' ? 'bg-green-600' :
          toast.type === 'error' ? 'bg-red-600' :
          toast.type === 'warning' ? 'bg-yellow-600' : 'bg-blue-600'
        } text-white`}>
          <p className="text-sm">{toast.message}</p>
        </div>
      )}
    </div>
  );
}
