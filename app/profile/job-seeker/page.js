'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { 
  User, 
  Mail, 
  Phone, 
  MapPin, 
  Calendar, 
  Briefcase, 
  GraduationCap,
  Award,
  FileText,
  Camera,
  Edit3,
  Save,
  X,
  Eye,
  EyeOff,
  Shield,
  Settings,
  Download,
  Upload,
  Star,
  LinkedinIcon,
  Globe,
  CheckCircle
} from 'lucide-react';

export default function JobSeekerProfile() {
  const { user } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  
  const [profile, setProfile] = useState({
    // Personal Information
    fullName: '',
    email: '',
    phone: '',
    address: '',
    city: '',
    state: '',
    country: 'Philippines',
    postalCode: '',
    dateOfBirth: '',
    profilePicture: '',
    
    // Professional Information
    currentPosition: '',
    yearsOfExperience: 0,
    expectedSalary: '',
    salaryPeriod: 'monthly',
    currency: 'PHP',
    availability: 'immediate',
    employmentType: 'full-time',
    workMode: 'office',
    
    // Skills & Education
    skills: [],
    education: [],
    certifications: [],
    languages: [],
    
    // Social & Portfolio
    linkedinUrl: '',
    portfolioUrl: '',
    githubUrl: '',
    
    // Privacy Settings
    hideContactInfo: true,
    hideEmail: true,
    hidePhone: true,
    hideAddress: true,
    profileVisibility: 'public',
    allowDirectContact: false,
    showSalaryExpectation: false,
    
    // Resume
    resumeUrl: '',
    resumeFileName: '',
    resumeUploadedAt: null,
    
    // Statistics
    profileViews: 0,
    applicationsSent: 0,
    interviewsScheduled: 0,
    memberSince: null
  });

  useEffect(() => {
    if (!user) {
      router.push('/login');
      return;
    }

    if (user.role !== 'job_seeker') {
      router.push('/dashboard');
      return;
    }

    fetchProfile();
  }, [user, router]);

  const fetchProfile = async () => {
    try {
      const response = await fetch('/api/profile/job-seeker', {
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
      const response = await fetch('/api/profile/job-seeker', {
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

  const addSkill = (skill) => {
    if (skill && !profile.skills.includes(skill)) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="animate-spin rounded-full h-32 w-32 border-b-2 border-blue-500"></div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="bg-gray-800 rounded-lg p-6 mb-6 border border-gray-700">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-6">
              <div className="relative">
                <div className="w-24 h-24 bg-gray-700 rounded-full flex items-center justify-center overflow-hidden">
                  {profile.profilePicture ? (
                    <img 
                      src={profile.profilePicture} 
                      alt="Profile" 
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <User className="w-12 h-12 text-gray-400" />
                  )}
                </div>
                {editing && (
                  <button className="absolute -bottom-2 -right-2 bg-blue-600 rounded-full p-2 hover:bg-blue-700">
                    <Camera className="w-4 h-4 text-white" />
                  </button>
                )}
              </div>
              
              <div>
                <h1 className="text-3xl font-bold text-white">
                  {profile.fullName || user.fullName || 'Your Name'}
                </h1>
                <p className="text-lg text-gray-300 mt-1">
                  {profile.currentPosition || 'Professional Title'}
                </p>
                <div className="flex items-center gap-4 text-gray-400 mt-2">
                  <span className="flex items-center gap-1">
                    <MapPin className="w-4 h-4" />
                    {profile.city || 'City'}, {profile.country}
                  </span>
                  <span className="flex items-center gap-1">
                    <Briefcase className="w-4 h-4" />
                    {profile.yearsOfExperience} years experience
                  </span>
                  {profile.availability && (
                    <span className="flex items-center gap-1">
                      <Calendar className="w-4 h-4" />
                      Available {profile.availability}
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
                <p className="text-gray-400 text-sm">Profile Views</p>
                <p className="text-2xl font-bold text-white">{profile.profileViews}</p>
              </div>
              <div className="bg-blue-600 rounded-lg p-3">
                <Eye className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Applications</p>
                <p className="text-2xl font-bold text-green-400">{profile.applicationsSent}</p>
              </div>
              <div className="bg-green-600 rounded-lg p-3">
                <FileText className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
          
          <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-gray-400 text-sm">Interviews</p>
                <p className="text-2xl font-bold text-yellow-400">{profile.interviewsScheduled}</p>
              </div>
              <div className="bg-yellow-600 rounded-lg p-3">
                <Calendar className="w-6 h-6 text-white" />
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
                <Award className="w-6 h-6 text-white" />
              </div>
            </div>
          </div>
        </div>

        {/* Tabs */}
        <div className="bg-gray-800 rounded-lg border border-gray-700 mb-6">
          <div className="border-b border-gray-700">
            <nav className="flex space-x-8 px-6">
              {[
                { id: 'profile', label: 'Profile', icon: User },
                { id: 'privacy', label: 'Privacy', icon: Shield },
                { id: 'resume', label: 'Resume', icon: FileText },
                { id: 'settings', label: 'Settings', icon: Settings }
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`py-4 px-2 border-b-2 font-medium text-sm flex items-center gap-2 ${
                    activeTab === tab.id
                      ? 'border-blue-500 text-blue-400'
                      : 'border-transparent text-gray-400 hover:text-gray-300'
                  }`}
                >
                  <tab.icon className="w-4 h-4" />
                  {tab.label}
                </button>
              ))}
            </nav>
          </div>
        </div>

        {/* Tab Content */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2">
            {activeTab === 'profile' && (
              <div className="space-y-6">
                {/* Personal Information */}
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h2 className="text-lg font-semibold text-white mb-4">Personal Information</h2>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Full Name</label>
                      {editing ? (
                        <input
                          type="text"
                          value={profile.fullName}
                          onChange={(e) => handleInputChange('fullName', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                        />
                      ) : (
                        <p className="text-white">{profile.fullName || 'Not provided'}</p>
                      )}
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Email</label>
                      <div className="flex items-center gap-2">
                        {editing ? (
                          <input
                            type="email"
                            value={profile.email}
                            onChange={(e) => handleInputChange('email', e.target.value)}
                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                          />
                        ) : (
                          <p className="text-white flex-1">
                            {profile.hideEmail ? '***@***.com' : (profile.email || 'Not provided')}
                          </p>
                        )}
                        <button
                          onClick={() => handleInputChange('hideEmail', !profile.hideEmail)}
                          className={`p-2 rounded ${profile.hideEmail ? 'bg-red-600' : 'bg-green-600'}`}
                          title={profile.hideEmail ? 'Email Hidden' : 'Email Visible'}
                        >
                          {profile.hideEmail ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Phone</label>
                      <div className="flex items-center gap-2">
                        {editing ? (
                          <input
                            type="tel"
                            value={profile.phone}
                            onChange={(e) => handleInputChange('phone', e.target.value)}
                            className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                          />
                        ) : (
                          <p className="text-white flex-1">
                            {profile.hidePhone ? '***-***-****' : (profile.phone || 'Not provided')}
                          </p>
                        )}
                        <button
                          onClick={() => handleInputChange('hidePhone', !profile.hidePhone)}
                          className={`p-2 rounded ${profile.hidePhone ? 'bg-red-600' : 'bg-green-600'}`}
                          title={profile.hidePhone ? 'Phone Hidden' : 'Phone Visible'}
                        >
                          {profile.hidePhone ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                        </button>
                      </div>
                    </div>
                    
                    <div>
                      <label className="block text-sm font-medium text-gray-300 mb-1">Current Position</label>
                      {editing ? (
                        <input
                          type="text"
                          value={profile.currentPosition}
                          onChange={(e) => handleInputChange('currentPosition', e.target.value)}
                          className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                        />
                      ) : (
                        <p className="text-white">{profile.currentPosition || 'Not provided'}</p>
                      )}
                    </div>
                  </div>
                </div>

                {/* Skills */}
                <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                  <h2 className="text-lg font-semibold text-white mb-4">Skills</h2>
                  <div className="flex flex-wrap gap-2 mb-4">
                    {profile.skills.map((skill, index) => (
                      <span
                        key={index}
                        className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm flex items-center gap-2"
                      >
                        {skill}
                        {editing && (
                          <button
                            onClick={() => removeSkill(skill)}
                            className="text-blue-200 hover:text-white"
                          >
                            <X className="w-3 h-3" />
                          </button>
                        )}
                      </span>
                    ))}
                  </div>
                  {editing && (
                    <input
                      type="text"
                      placeholder="Add a skill and press Enter"
                      className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded-lg text-white"
                      onKeyPress={(e) => {
                        if (e.key === 'Enter') {
                          addSkill(e.target.value.trim());
                          e.target.value = '';
                        }
                      }}
                    />
                  )}
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-lg font-semibold text-white mb-4">Privacy Settings</h2>
                <div className="space-y-6">
                  <div className="p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
                    <h3 className="font-medium text-blue-300 mb-3">Contact Information Visibility</h3>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white text-sm">Hide Email Address</p>
                          <p className="text-gray-400 text-xs">Prevent employers from seeing your email until you apply</p>
                        </div>
                        <button
                          onClick={() => handleInputChange('hideEmail', !profile.hideEmail)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            profile.hideEmail ? 'bg-red-600' : 'bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              profile.hideEmail ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white text-sm">Hide Phone Number</p>
                          <p className="text-gray-400 text-xs">Prevent employers from seeing your phone until you apply</p>
                        </div>
                        <button
                          onClick={() => handleInputChange('hidePhone', !profile.hidePhone)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            profile.hidePhone ? 'bg-red-600' : 'bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              profile.hidePhone ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                      
                      <div className="flex items-center justify-between">
                        <div>
                          <p className="text-white text-sm">Hide Full Address</p>
                          <p className="text-gray-400 text-xs">Only show city and country, hide specific address</p>
                        </div>
                        <button
                          onClick={() => handleInputChange('hideAddress', !profile.hideAddress)}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                            profile.hideAddress ? 'bg-red-600' : 'bg-gray-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                              profile.hideAddress ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    </div>
                  </div>

                  <div className="p-4 bg-purple-900/20 border border-purple-500/30 rounded-lg">
                    <h3 className="font-medium text-purple-300 mb-3">Profile Visibility</h3>
                    <div className="space-y-3">
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="profileVisibility"
                          value="public"
                          checked={profile.profileVisibility === 'public'}
                          onChange={() => handleInputChange('profileVisibility', 'public')}
                          className="mr-3 text-purple-600"
                        />
                        <div>
                          <span className="text-white text-sm">Public</span>
                          <p className="text-gray-400 text-xs">Visible to all employers and recruiters</p>
                        </div>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="profileVisibility"
                          value="premium_only"
                          checked={profile.profileVisibility === 'premium_only'}
                          onChange={() => handleInputChange('profileVisibility', 'premium_only')}
                          className="mr-3 text-purple-600"
                        />
                        <div>
                          <span className="text-white text-sm">Premium Employers Only</span>
                          <p className="text-gray-400 text-xs">Only visible to verified premium employers</p>
                        </div>
                      </label>
                      
                      <label className="flex items-center">
                        <input
                          type="radio"
                          name="profileVisibility"
                          value="private"
                          checked={profile.profileVisibility === 'private'}
                          onChange={() => handleInputChange('profileVisibility', 'private')}
                          className="mr-3 text-purple-600"
                        />
                        <div>
                          <span className="text-white text-sm">Private</span>
                          <p className="text-gray-400 text-xs">Hidden from employer searches</p>
                        </div>
                      </label>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'resume' && (
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h2 className="text-lg font-semibold text-white mb-4">Resume Management</h2>
                
                {profile.resumeUrl ? (
                  <div className="p-4 bg-green-900/20 border border-green-500/30 rounded-lg mb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        <FileText className="w-8 h-8 text-green-400" />
                        <div>
                          <p className="text-white font-medium">{profile.resumeFileName}</p>
                          <p className="text-gray-400 text-sm">
                            Uploaded {profile.resumeUploadedAt ? new Date(profile.resumeUploadedAt).toLocaleDateString() : 'recently'}
                          </p>
                        </div>
                      </div>
                      <div className="flex gap-2">
                        <button className="px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 flex items-center gap-1">
                          <Eye className="w-4 h-4" />
                          View
                        </button>
                        <button className="px-3 py-1 bg-green-600 text-white rounded hover:bg-green-700 flex items-center gap-1">
                          <Download className="w-4 h-4" />
                          Download
                        </button>
                      </div>
                    </div>
                  </div>
                ) : (
                  <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg mb-4">
                    <p className="text-yellow-300">No resume uploaded yet</p>
                  </div>
                )}
                
                <button className="w-full px-4 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 flex items-center justify-center gap-2">
                  <Upload className="w-5 h-5" />
                  Upload New Resume
                </button>
              </div>
            )}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Quick Actions */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-lg font-semibold text-white mb-4">Quick Actions</h2>
              <div className="space-y-3">
                <a
                  href="/jobs"
                  className="block w-full bg-blue-600 text-white rounded-lg px-4 py-2 text-center hover:bg-blue-700 transition-colors"
                >
                  Browse Jobs
                </a>
                <a
                  href="/my-applications"
                  className="block w-full bg-purple-600 text-white rounded-lg px-4 py-2 text-center hover:bg-purple-700 transition-colors"
                >
                  My Applications
                </a>
                <a
                  href="/resume-analyzer"
                  className="block w-full bg-green-600 text-white rounded-lg px-4 py-2 text-center hover:bg-green-700 transition-colors"
                >
                  Analyze Resume
                </a>
              </div>
            </div>

            {/* Profile Completeness */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-lg font-semibold text-white mb-4">Profile Completeness</h2>
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Basic Info</span>
                  <CheckCircle className="w-5 h-5 text-green-400" />
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Skills</span>
                  {profile.skills.length > 0 ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-600 rounded-full" />
                  )}
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300 text-sm">Resume</span>
                  {profile.resumeUrl ? (
                    <CheckCircle className="w-5 h-5 text-green-400" />
                  ) : (
                    <div className="w-5 h-5 border-2 border-gray-600 rounded-full" />
                  )}
                </div>
              </div>
              
              <div className="mt-4 pt-4 border-t border-gray-700">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-gray-300 text-sm">Overall</span>
                  <span className="text-white font-medium">75%</span>
                </div>
                <div className="w-full bg-gray-700 rounded-full h-2">
                  <div className="bg-blue-600 h-2 rounded-full" style={{ width: '75%' }}></div>
                </div>
              </div>
            </div>

            {/* Privacy Status */}
            <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Shield className="w-5 h-5 text-blue-400" />
                Privacy Status
              </h2>
              <div className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Email</span>
                  <span className={`px-2 py-1 rounded text-xs ${profile.hideEmail ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'}`}>
                    {profile.hideEmail ? 'Hidden' : 'Visible'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Phone</span>
                  <span className={`px-2 py-1 rounded text-xs ${profile.hidePhone ? 'bg-red-900 text-red-200' : 'bg-green-900 text-green-200'}`}>
                    {profile.hidePhone ? 'Hidden' : 'Visible'}
                  </span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-gray-300">Profile</span>
                  <span className="px-2 py-1 bg-blue-900 text-blue-200 rounded text-xs capitalize">
                    {profile.profileVisibility}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
