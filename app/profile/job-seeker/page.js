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
  CheckCircle,
  DollarSign,
  Clock,
  Building,
  Home,
  Monitor,
  Plus,
  Trash2,
  Copy,
  Share2,
  Bell,
  Lock,
  Zap,
  TrendingUp,
  Target,
  Heart,
  Bookmark
} from 'lucide-react';

export default function JobSeekerProfile() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editing, setEditing] = useState(false);
  const [activeTab, setActiveTab] = useState('profile');
  const [skillInput, setSkillInput] = useState('');
  const [showSkillSuggestions, setShowSkillSuggestions] = useState(false);
  const [profileCompleteness, setProfileCompleteness] = useState(0);
  const [uploadingResume, setUploadingResume] = useState(false);
  const [uploadingAvatar, setUploadingAvatar] = useState(false);
  const [resumeFile, setResumeFile] = useState(null);
  
  // Skill suggestions for better UX
  const skillSuggestions = [
    'JavaScript', 'Python', 'React', 'Node.js', 'TypeScript', 'PHP', 'Java', 'C#',
    'HTML/CSS', 'SQL', 'MongoDB', 'PostgreSQL', 'AWS', 'Docker', 'Git',
    'Project Management', 'Leadership', 'Communication', 'Problem Solving',
    'Data Analysis', 'Machine Learning', 'UI/UX Design', 'Digital Marketing'
  ];
  
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
    bio: '',
    
    // Professional Information
    currentPosition: '',
    yearsOfExperience: 0,
    expectedSalary: '',
    salaryPeriod: 'monthly',
    currency: 'PHP',
    availability: 'immediate',
    employmentType: 'full-time',
    workMode: 'office',
    preferredLocation: '',
    jobTitle: '',
    industry: '',
    
    // Skills & Education
    skills: [],
    education: [],
    certifications: [],
    languages: [],
    projects: [],
    
    // Social & Portfolio
    linkedinUrl: '',
    portfolioUrl: '',
    githubUrl: '',
    behanceUrl: '',
    dribbbleUrl: '',
    personalWebsite: '',
    
    // Preferences
    jobAlerts: true,
    openToRemote: false,
    openToRelocation: false,
    preferredWorkingHours: 'standard',
    noticePeriod: '30 days',
    
    // Privacy Settings
    hideContactInfo: true,
    hideEmail: true,
    hidePhone: true,
    hideAddress: true,
    hideSalary: true,
    profileVisibility: 'public',
    allowDirectContact: false,
    showSalaryExpectation: false,
    showOnlineStatus: true,
    allowProfileDownload: false,
    
    // Resume
    resumeUrl: '',
    resumeFileName: '',
    resumeUploadedAt: null,
    
    // Statistics
    profileViews: 0,
    applicationsSent: 0,
    interviewsScheduled: 0,
    memberSince: null,
    lastActiveAt: new Date(),
    responseRate: 85,
    profileStrength: 'Good'
  });

  useEffect(() => {
    console.log('JobSeeker Profile - Auth loading:', authLoading); // Debug log
    console.log('JobSeeker Profile - User:', user); // Debug log
    console.log('JobSeeker Profile - User role:', user?.role); // Debug log
    
    // Wait for authentication to complete
    if (authLoading) {
      console.log('JobSeeker Profile - Still loading auth, waiting...'); // Debug log
      return;
    }
    
    if (!user) {
      console.log('JobSeeker Profile - No user after auth complete, redirecting to login'); // Debug log
      router.push('/login');
      return;
    }

    // Check if user has the correct role
    if (user.role !== 'job_seeker') {
      console.log('JobSeeker Profile - Wrong role, redirecting to appropriate page'); // Debug log
      router.push('/dashboard');
      return;
    }

    console.log('JobSeeker Profile - Fetching profile for job seeker user'); // Debug log
    fetchProfile();
  }, [user, authLoading, router]);

  useEffect(() => {
    calculateProfileCompleteness();
  }, [profile]);

  const calculateProfileCompleteness = () => {
    const fields = [
      profile.fullName,
      profile.email,
      profile.phone,
      profile.currentPosition,
      profile.bio,
      profile.skills.length > 0,
      profile.education.length > 0,
      profile.resumeUrl,
      profile.city,
      profile.linkedinUrl || profile.portfolioUrl
    ];
    
    const completedFields = fields.filter(field => 
      typeof field === 'boolean' ? field : Boolean(field)
    ).length;
    
    const percentage = Math.round((completedFields / fields.length) * 100);
    setProfileCompleteness(percentage);
  };

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
        // Update last active timestamp
        setProfile(prev => ({ ...prev, lastActiveAt: new Date() }));
        // Show success message (you can add a toast notification here)
        console.log('Profile updated successfully');
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
    if (skill && !profile.skills.some(s => s.toLowerCase() === skill.toLowerCase())) {
      setProfile(prev => ({
        ...prev,
        skills: [...prev.skills, skill]
      }));
      setSkillInput('');
      setShowSkillSuggestions(false);
    }
  };

  const removeSkill = (skillToRemove) => {
    setProfile(prev => ({
      ...prev,
      skills: prev.skills.filter(skill => skill !== skillToRemove)
    }));
  };

  const addEducation = () => {
    const newEducation = {
      id: Date.now(),
      degree: '',
      institution: '',
      year: '',
      description: ''
    };
    setProfile(prev => ({
      ...prev,
      education: [...prev.education, newEducation]
    }));
  };

  const updateEducation = (id, field, value) => {
    setProfile(prev => ({
      ...prev,
      education: prev.education.map(edu => 
        edu.id === id ? { ...edu, [field]: value } : edu
      )
    }));
  };

  const removeEducation = (id) => {
    setProfile(prev => ({
      ...prev,
      education: prev.education.filter(edu => edu.id !== id)
    }));
  };

  const getProfileStrengthColor = (strength) => {
    switch (strength) {
      case 'Excellent': return 'text-green-400';
      case 'Good': return 'text-blue-400';
      case 'Fair': return 'text-yellow-400';
      default: return 'text-red-400';
    }
  };

  const getAvailabilityBadgeColor = (availability) => {
    switch (availability) {
      case 'immediate': return 'bg-green-600';
      case 'within_2_weeks': return 'bg-blue-600';
      case 'within_month': return 'bg-yellow-600';
      default: return 'bg-gray-600';
    }
  };

  // Resume upload handlers
  const handleResumeUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type
    if (!file.type.includes('pdf') && !file.type.includes('doc') && !file.type.includes('docx')) {
      alert('Please upload a PDF, DOC, or DOCX file');
      return;
    }

    // Validate file size (5MB limit)
    if (file.size > 5 * 1024 * 1024) {
      alert('File size must be less than 5MB');
      return;
    }

    setUploadingResume(true);
    setResumeFile(file);

    try {
      const formData = new FormData();
      formData.append('resume', file);
      formData.append('userId', user.id);

      const response = await fetch('/api/upload/resume', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();
        
        // Update profile with new resume URL
        setProfile(prev => ({
          ...prev,
          resumeUrl: data.resumeUrl,
          resumeFileName: file.name,
          resumeUploadedAt: new Date()
        }));

        alert('Resume uploaded successfully!');
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Resume upload error:', error);
      alert('Failed to upload resume. Please try again.');
    } finally {
      setUploadingResume(false);
      setResumeFile(null);
      // Reset file input
      event.target.value = '';
    }
  };

  // Avatar upload handlers
  const handleAvatarUpload = async (event) => {
    const file = event.target.files[0];
    if (!file) return;

    // Validate file type (images only)
    if (!file.type.startsWith('image/')) {
      alert('Please upload an image file (JPG, PNG, GIF, etc.)');
      return;
    }

    // Validate file size (2MB limit)
    if (file.size > 2 * 1024 * 1024) {
      alert('File size must be less than 2MB');
      return;
    }

    setUploadingAvatar(true);

    try {
      const formData = new FormData();
      formData.append('avatar', file);
      formData.append('userId', user.id);

      const response = await fetch('/api/upload/avatar', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${user.token}`
        },
        body: formData
      });

      if (response.ok) {
        const data = await response.json();

        // Update profile with new avatar URL
        setProfile(prev => ({
          ...prev,
          profilePicture: data.profilePictureUrl
        }));

        alert('Avatar uploaded successfully!');
      } else {
        const error = await response.json();
        alert(`Upload failed: ${error.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Avatar upload error:', error);
      alert('Failed to upload avatar. Please try again.');
    } finally {
      setUploadingAvatar(false);
      // Reset file input
      event.target.value = '';
    }
  };

  const handleCreateWithBuilder = () => {
    // For now, redirect to a resume builder page or show a message
    alert('Resume Builder feature coming soon! For now, please upload your existing resume.');
    // TODO: Implement resume builder functionality
    // router.push('/resume-builder');
  };

  if (authLoading || loading) {
    return (
      <div className="min-h-screen bg-slate-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="animate-spin rounded-full h-16 w-16 border-4 border-indigo-500 border-t-transparent"></div>
          <p className="text-slate-300 text-lg">
            {authLoading ? 'Verifying authentication...' : 'Loading your profile...'}
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 mt-16">
      {/* Background Pattern */}
      <div className="absolute inset-0 bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900">
        <div className="absolute inset-0" style={{
          backgroundImage: `radial-gradient(circle at 1px 1px, rgba(255,255,255,0.05) 1px, transparent 0)`,
          backgroundSize: '20px 20px'
        }}></div>
      </div>
      
      <div className="relative z-10 py-8">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          {/* Enhanced Header */}
          <div className="bg-slate-800/80 backdrop-blur-xl rounded-2xl p-8 mb-8 border border-slate-700/50 shadow-2xl">
            <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6">
              <div className="flex items-center gap-6">
                <div className="relative">
                  <div className="w-32 h-32 bg-gradient-to-br from-indigo-500 to-purple-600 rounded-2xl flex items-center justify-center overflow-hidden shadow-2xl">
                    {profile.profilePicture ? (
                      <img 
                        src={profile.profilePicture} 
                        alt="Profile" 
                        className="w-full h-full object-cover"
                      />
                    ) : (
                      <User className="w-16 h-16 text-white" />
                    )}
                  </div>
                  {editing && (
                    <div className="relative">
                      <button
                        onClick={() => document.getElementById('avatar-upload').click()}
                        disabled={uploadingAvatar}
                        className="absolute -bottom-2 -right-2 bg-indigo-600 rounded-full p-3 hover:bg-indigo-700 shadow-lg transition-all duration-200 hover:scale-110 disabled:opacity-50 disabled:cursor-not-allowed"
                      >
                        {uploadingAvatar ? (
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                        ) : (
                          <Camera className="w-5 h-5 text-white" />
                        )}
                      </button>
                      <input
                        id="avatar-upload"
                        type="file"
                        accept="image/*"
                        onChange={handleAvatarUpload}
                        className="hidden"
                      />
                    </div>
                  )}
                  {/* Online Status Indicator */}
                  {profile.showOnlineStatus && (
                    <div className="absolute top-2 right-2 w-4 h-4 bg-green-500 rounded-full border-2 border-slate-800 shadow-lg"></div>
                  )}
                </div>
                
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <h1 className="text-4xl font-bold bg-gradient-to-r from-white to-slate-300 bg-clip-text text-transparent">
                      {profile.fullName || user.fullName || 'Your Name'}
                    </h1>
                    <span className={`px-3 py-1 rounded-full text-xs font-medium ${getProfileStrengthColor(profile.profileStrength)} bg-slate-700/50`}>
                      {profile.profileStrength} Profile
                    </span>
                  </div>
                  
                  <p className="text-xl text-slate-300 mb-3">
                    {profile.currentPosition || 'Professional Title'}
                  </p>
                  
                  {profile.bio && (
                    <p className="text-slate-400 mb-4 max-w-2xl leading-relaxed">
                      {profile.bio}
                    </p>
                  )}
                  
                  <div className="flex flex-wrap items-center gap-4 text-slate-400">
                    <span className="flex items-center gap-2 bg-slate-700/30 px-3 py-1.5 rounded-lg">
                      <MapPin className="w-4 h-4" />
                      {profile.city || 'City'}, {profile.country}
                    </span>
                    
                    <span className="flex items-center gap-2 bg-slate-700/30 px-3 py-1.5 rounded-lg">
                      <Briefcase className="w-4 h-4" />
                      {profile.yearsOfExperience} years experience
                    </span>
                    
                    {profile.availability && (
                      <span className={`flex items-center gap-2 px-3 py-1.5 rounded-lg text-white ${getAvailabilityBadgeColor(profile.availability)}`}>
                        <Clock className="w-4 h-4" />
                        Available {profile.availability.replace('_', ' ')}
                      </span>
                    )}
                    
                    {profile.expectedSalary && (
                      <span className="flex items-center gap-2 bg-slate-700/30 px-3 py-1.5 rounded-lg">
                        <DollarSign className="w-4 h-4" />
                        {profile.currency} {profile.expectedSalary}/{profile.salaryPeriod}
                      </span>
                    )}
                  </div>
                </div>
              </div>
              
              <div className="flex flex-col sm:flex-row gap-3">
                {editing ? (
                  <>
                    <button
                      onClick={() => setEditing(false)}
                      className="px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <X className="w-5 h-5" />
                      Cancel
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={saving}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 flex items-center gap-2 disabled:opacity-50 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <Save className="w-5 h-5" />
                      {saving ? 'Saving...' : 'Save Changes'}
                    </button>
                  </>
                ) : (
                  <>
                    <button
                      onClick={() => setEditing(true)}
                      className="px-6 py-3 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <Edit3 className="w-5 h-5" />
                      Edit Profile
                    </button>
                    
                    <button className="px-6 py-3 bg-slate-700 text-white rounded-xl hover:bg-slate-600 flex items-center gap-2 transition-all duration-200 shadow-lg hover:shadow-xl">
                      <Share2 className="w-5 h-5" />
                      Share Profile
                    </button>
                  </>
                )}
              </div>
            </div>
            
            {/* Profile Completeness Bar */}
            <div className="mt-6 pt-6 border-t border-slate-700/50">
              <div className="flex items-center justify-between mb-2">
                <span className="text-slate-300 font-medium">Profile Completeness</span>
                <span className="text-slate-400 text-sm">{profileCompleteness}%</span>
              </div>
              <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                <div 
                  className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700 ease-out"
                  style={{ width: `${profileCompleteness}%` }}
                ></div>
              </div>
              {profileCompleteness < 80 && (
                <p className="text-slate-400 text-sm mt-2">
                  Complete your profile to increase visibility to employers
                </p>
              )}
            </div>
          </div>

          {/* Enhanced Stats Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
            <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-indigo-500/50 transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Profile Views</p>
                  <p className="text-3xl font-bold text-white mt-1">{profile.profileViews}</p>
                  <p className="text-green-400 text-xs mt-1">+12% this week</p>
                </div>
                <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-3 group-hover:scale-110 transition-transform duration-300">
                  <Eye className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-green-500/50 transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Applications</p>
                  <p className="text-3xl font-bold text-white mt-1">{profile.applicationsSent}</p>
                  <p className="text-green-400 text-xs mt-1">+3 this month</p>
                </div>
                <div className="bg-gradient-to-br from-green-500 to-emerald-600 rounded-xl p-3 group-hover:scale-110 transition-transform duration-300">
                  <FileText className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-yellow-500/50 transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Interviews</p>
                  <p className="text-3xl font-bold text-white mt-1">{profile.interviewsScheduled}</p>
                  <p className="text-yellow-400 text-xs mt-1">+1 scheduled</p>
                </div>
                <div className="bg-gradient-to-br from-yellow-500 to-orange-600 rounded-xl p-3 group-hover:scale-110 transition-transform duration-300">
                  <Calendar className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
            
            <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50 hover:border-purple-500/50 transition-all duration-300 group">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-slate-400 text-sm font-medium">Response Rate</p>
                  <p className="text-3xl font-bold text-white mt-1">{profile.responseRate}%</p>
                  <p className="text-purple-400 text-xs mt-1">Above average</p>
                </div>
                <div className="bg-gradient-to-br from-purple-500 to-pink-600 rounded-xl p-3 group-hover:scale-110 transition-transform duration-300">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Navigation Tabs */}
          <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl border border-slate-700/50 mb-8 overflow-hidden">
            <div className="border-b border-slate-700/50">
              <nav className="flex">
                {[
                  { id: 'profile', label: 'Profile', icon: User, color: 'indigo' },
                  { id: 'experience', label: 'Experience', icon: Briefcase, color: 'blue' },
                  { id: 'privacy', label: 'Privacy', icon: Shield, color: 'green' },
                  { id: 'resume', label: 'Resume', icon: FileText, color: 'purple' },
                  { id: 'settings', label: 'Settings', icon: Settings, color: 'yellow' }
                ].map((tab) => (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id)}
                    className={`relative py-4 px-6 font-medium text-sm flex items-center gap-3 transition-all duration-300 ${
                      activeTab === tab.id
                        ? `text-${tab.color}-400 bg-slate-700/50`
                        : 'text-slate-400 hover:text-slate-300 hover:bg-slate-700/30'
                    }`}
                  >
                    <tab.icon className="w-5 h-5" />
                    {tab.label}
                    {activeTab === tab.id && (
                      <div className={`absolute bottom-0 left-0 right-0 h-0.5 bg-gradient-to-r from-${tab.color}-500 to-${tab.color}-400`}></div>
                    )}
                  </button>
                ))}
              </nav>
            </div>
          </div>

          {/* Tab Content */}
          <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
            {/* Main Content */}
            <div className="xl:col-span-2 space-y-8">
              {activeTab === 'profile' && (
                <div className="space-y-8">
                  {/* Personal Information */}
                  <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-white">Personal Information</h2>
                      {editing && (
                        <span className="text-indigo-400 text-sm flex items-center gap-2">
                          <Edit3 className="w-4 h-4" />
                          Editing mode
                        </span>
                      )}
                    </div>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Full Name</label>
                        {editing ? (
                          <input
                            type="text"
                            value={profile.fullName}
                            onChange={(e) => handleInputChange('fullName', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                            placeholder="Enter your full name"
                          />
                        ) : (
                          <p className="text-white bg-slate-700/30 px-4 py-3 rounded-xl">{profile.fullName || 'Not provided'}</p>
                        )}
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Current Position</label>
                        {editing ? (
                          <input
                            type="text"
                            value={profile.currentPosition}
                            onChange={(e) => handleInputChange('currentPosition', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                            placeholder="e.g. Senior Software Developer"
                          />
                        ) : (
                          <p className="text-white bg-slate-700/30 px-4 py-3 rounded-xl">{profile.currentPosition || 'Not provided'}</p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Email</label>
                        <div className="flex items-center gap-2">
                          {editing ? (
                            <input
                              type="email"
                              value={profile.email}
                              onChange={(e) => handleInputChange('email', e.target.value)}
                              className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                              placeholder="your.email@example.com"
                            />
                          ) : (
                            <p className="flex-1 text-white bg-slate-700/30 px-4 py-3 rounded-xl">
                              {profile.hideEmail ? '***@***.com' : (profile.email || 'Not provided')}
                            </p>
                          )}
                          <button
                            onClick={() => handleInputChange('hideEmail', !profile.hideEmail)}
                            className={`p-3 rounded-xl transition-all duration-200 ${
                              profile.hideEmail 
                                ? 'bg-red-600 hover:bg-red-700' 
                                : 'bg-green-600 hover:bg-green-700'
                            }`}
                            title={profile.hideEmail ? 'Email Hidden' : 'Email Visible'}
                          >
                            {profile.hideEmail ? <EyeOff className="w-5 h-5 text-white" /> : <Eye className="w-5 h-5 text-white" />}
                          </button>
                        </div>
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Phone</label>
                        <div className="flex items-center gap-2">
                          {editing ? (
                            <input
                              type="tel"
                              value={profile.phone}
                              onChange={(e) => handleInputChange('phone', e.target.value)}
                              className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                              placeholder="+63 123 456 7890"
                            />
                          ) : (
                            <p className="flex-1 text-white bg-slate-700/30 px-4 py-3 rounded-xl">
                              {profile.hidePhone ? '***-***-****' : (profile.phone || 'Not provided')}
                            </p>
                          )}
                          <button
                            onClick={() => handleInputChange('hidePhone', !profile.hidePhone)}
                            className={`p-3 rounded-xl transition-all duration-200 ${
                              profile.hidePhone 
                                ? 'bg-red-600 hover:bg-red-700' 
                                : 'bg-green-600 hover:bg-green-700'
                            }`}
                            title={profile.hidePhone ? 'Phone Hidden' : 'Phone Visible'}
                          >
                            {profile.hidePhone ? <EyeOff className="w-5 h-5 text-white" /> : <Eye className="w-5 h-5 text-white" />}
                          </button>
                        </div>
                      </div>

                      <div className="md:col-span-2">
                        <label className="block text-sm font-medium text-slate-300 mb-2">Professional Bio</label>
                        {editing ? (
                          <textarea
                            value={profile.bio}
                            onChange={(e) => handleInputChange('bio', e.target.value)}
                            rows={4}
                            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200 resize-none"
                            placeholder="Tell employers about yourself, your experience, and what you're looking for..."
                          />
                        ) : (
                          <p className="text-white bg-slate-700/30 px-4 py-3 rounded-xl min-h-[120px]">
                            {profile.bio || 'No bio provided'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Enhanced Skills Section */}
                  <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50">
                    <h2 className="text-2xl font-bold text-white mb-6">Skills & Expertise</h2>
                    
                    <div className="flex flex-wrap gap-3 mb-6">
                      {profile.skills.map((skill, index) => (
                        <span
                          key={index}
                          className="px-4 py-2 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-full text-sm flex items-center gap-2 shadow-lg hover:shadow-xl transition-all duration-200"
                        >
                          {skill}
                          {editing && (
                            <button
                              onClick={() => removeSkill(skill)}
                              className="text-indigo-200 hover:text-white transition-colors duration-200"
                            >
                              <X className="w-4 h-4" />
                            </button>
                          )}
                        </span>
                      ))}
                      
                      {profile.skills.length === 0 && (
                        <div className="text-slate-400 text-center py-8 w-full">
                          <Target className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No skills added yet. Add your skills to attract relevant opportunities.</p>
                        </div>
                      )}
                    </div>
                    
                    {editing && (
                      <div className="relative">
                        <input
                          type="text"
                          value={skillInput}
                          onChange={(e) => {
                            setSkillInput(e.target.value);
                            setShowSkillSuggestions(e.target.value.length > 0);
                          }}
                          onKeyPress={(e) => {
                            if (e.key === 'Enter' && skillInput.trim()) {
                              addSkill(skillInput.trim());
                            }
                          }}
                          className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                          placeholder="Type a skill and press Enter (e.g., JavaScript, Project Management)"
                        />
                        
                        {showSkillSuggestions && skillInput && (
                          <div className="absolute top-full left-0 right-0 mt-2 bg-slate-800 border border-slate-600 rounded-xl shadow-2xl z-10 max-h-48 overflow-y-auto">
                            {skillSuggestions
                              .filter(skill => 
                                skill.toLowerCase().includes(skillInput.toLowerCase()) &&
                                !profile.skills.some(s => s.toLowerCase() === skill.toLowerCase())
                              )
                              .slice(0, 8)
                              .map((skill, index) => (
                                <button
                                  key={index}
                                  onClick={() => addSkill(skill)}
                                  className="w-full text-left px-4 py-3 text-white hover:bg-slate-700 transition-colors duration-200 first:rounded-t-xl last:rounded-b-xl"
                                >
                                  {skill}
                                </button>
                              ))
                            }
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>
              )}

              {activeTab === 'experience' && (
                <div className="space-y-8">
                  {/* Work Preferences */}
                  <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50">
                    <h2 className="text-2xl font-bold text-white mb-6">Work Preferences</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Years of Experience</label>
                        {editing ? (
                          <input
                            type="number"
                            min="0"
                            max="50"
                            value={profile.yearsOfExperience}
                            onChange={(e) => handleInputChange('yearsOfExperience', parseInt(e.target.value) || 0)}
                            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                          />
                        ) : (
                          <p className="text-white bg-slate-700/30 px-4 py-3 rounded-xl">
                            {profile.yearsOfExperience} years
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Expected Salary</label>
                        {editing ? (
                          <div className="flex gap-2">
                            <select
                              value={profile.currency}
                              onChange={(e) => handleInputChange('currency', e.target.value)}
                              className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                            >
                              <option value="PHP">PHP</option>
                              <option value="USD">USD</option>
                              <option value="EUR">EUR</option>
                            </select>
                            <input
                              type="text"
                              value={profile.expectedSalary}
                              onChange={(e) => handleInputChange('expectedSalary', e.target.value)}
                              className="flex-1 px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                              placeholder="50,000"
                            />
                            <select
                              value={profile.salaryPeriod}
                              onChange={(e) => handleInputChange('salaryPeriod', e.target.value)}
                              className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                            >
                              <option value="monthly">Monthly</option>
                              <option value="annually">Annually</option>
                              <option value="hourly">Hourly</option>
                            </select>
                          </div>
                        ) : (
                          <p className="text-white bg-slate-700/30 px-4 py-3 rounded-xl">
                            {profile.expectedSalary ? 
                              `${profile.currency} ${profile.expectedSalary}/${profile.salaryPeriod}` : 
                              'Not specified'
                            }
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Availability</label>
                        {editing ? (
                          <select
                            value={profile.availability}
                            onChange={(e) => handleInputChange('availability', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                          >
                            <option value="immediate">Immediate</option>
                            <option value="within_2_weeks">Within 2 weeks</option>
                            <option value="within_month">Within a month</option>
                            <option value="after_notice">After notice period</option>
                          </select>
                        ) : (
                          <p className="text-white bg-slate-700/30 px-4 py-3 rounded-xl capitalize">
                            {profile.availability.replace('_', ' ')}
                          </p>
                        )}
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Work Mode</label>
                        {editing ? (
                          <select
                            value={profile.workMode}
                            onChange={(e) => handleInputChange('workMode', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                          >
                            <option value="office">Office</option>
                            <option value="remote">Remote</option>
                            <option value="hybrid">Hybrid</option>
                          </select>
                        ) : (
                          <p className="text-white bg-slate-700/30 px-4 py-3 rounded-xl capitalize">
                            {profile.workMode}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Education Section */}
                  <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50">
                    <div className="flex items-center justify-between mb-6">
                      <h2 className="text-2xl font-bold text-white">Education</h2>
                      {editing && (
                        <button
                          onClick={addEducation}
                          className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2 transition-all duration-200"
                        >
                          <Plus className="w-4 h-4" />
                          Add Education
                        </button>
                      )}
                    </div>
                    
                    <div className="space-y-4">
                      {profile.education.map((edu, index) => (
                        <div key={edu.id || index} className="bg-slate-700/30 rounded-xl p-6 border border-slate-600/50">
                          {editing ? (
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                              <input
                                type="text"
                                value={edu.degree || ''}
                                onChange={(e) => updateEducation(edu.id || index, 'degree', e.target.value)}
                                className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                                placeholder="Degree (e.g., Bachelor of Science in Computer Science)"
                              />
                              <input
                                type="text"
                                value={edu.institution || ''}
                                onChange={(e) => updateEducation(edu.id || index, 'institution', e.target.value)}
                                className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                                placeholder="Institution"
                              />
                              <input
                                type="text"
                                value={edu.year || ''}
                                onChange={(e) => updateEducation(edu.id || index, 'year', e.target.value)}
                                className="px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                                placeholder="Year (e.g., 2020-2024)"
                              />
                              <button
                                onClick={() => removeEducation(edu.id || index)}
                                className="px-4 py-3 bg-red-600 text-white rounded-xl hover:bg-red-700 flex items-center justify-center gap-2 transition-all duration-200"
                              >
                                <Trash2 className="w-4 h-4" />
                                Remove
                              </button>
                            </div>
                          ) : (
                            <div>
                              <h3 className="text-white font-semibold">{edu.degree || 'Degree not specified'}</h3>
                              <p className="text-slate-300">{edu.institution || 'Institution not specified'}</p>
                              <p className="text-slate-400 text-sm">{edu.year || 'Year not specified'}</p>
                            </div>
                          )}
                        </div>
                      ))}
                      
                      {profile.education.length === 0 && (
                        <div className="text-slate-400 text-center py-8">
                          <GraduationCap className="w-12 h-12 mx-auto mb-3 opacity-50" />
                          <p>No education added yet. Add your educational background.</p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}
              {activeTab === 'privacy' && (
                <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <Shield className="w-6 h-6 text-indigo-400" />
                    Privacy & Visibility Settings
                  </h2>
                  
                  <div className="space-y-8">
                    {/* Contact Information Privacy */}
                    <div className="p-6 bg-gradient-to-br from-indigo-900/20 to-purple-900/20 border border-indigo-500/30 rounded-2xl">
                      <h3 className="font-semibold text-indigo-300 mb-4 flex items-center gap-2">
                        <Lock className="w-5 h-5" />
                        Contact Information Visibility
                      </h3>
                      <div className="space-y-4">
                        {[
                          { key: 'hideEmail', label: 'Hide Email Address', desc: 'Prevent employers from seeing your email until you apply' },
                          { key: 'hidePhone', label: 'Hide Phone Number', desc: 'Prevent employers from seeing your phone until you apply' },
                          { key: 'hideAddress', label: 'Hide Full Address', desc: 'Only show city and country, hide specific address' },
                          { key: 'hideSalary', label: 'Hide Salary Expectations', desc: 'Keep your salary expectations private' }
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                            <div>
                              <p className="text-white text-sm font-medium">{item.label}</p>
                              <p className="text-slate-400 text-xs">{item.desc}</p>
                            </div>
                            <button
                              onClick={() => handleInputChange(item.key, !profile[item.key])}
                              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ${
                                profile[item.key] ? 'bg-red-600' : 'bg-green-600'
                              }`}
                            >
                              <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${
                                  profile[item.key] ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Profile Visibility */}
                    <div className="p-6 bg-gradient-to-br from-purple-900/20 to-pink-900/20 border border-purple-500/30 rounded-2xl">
                      <h3 className="font-semibold text-purple-300 mb-4 flex items-center gap-2">
                        <Eye className="w-5 h-5" />
                        Profile Visibility
                      </h3>
                      <div className="space-y-3">
                        {[
                          { value: 'public', label: 'Public', desc: 'Visible to all employers and recruiters', icon: Globe },
                          { value: 'premium_only', label: 'Premium Employers Only', desc: 'Only visible to verified premium employers', icon: Star },
                          { value: 'private', label: 'Private', desc: 'Hidden from employer searches', icon: Lock }
                        ].map((option) => (
                          <label key={option.value} className="flex items-center p-4 bg-slate-800/50 rounded-xl cursor-pointer hover:bg-slate-700/50 transition-colors duration-200">
                            <input
                              type="radio"
                              name="profileVisibility"
                              value={option.value}
                              checked={profile.profileVisibility === option.value}
                              onChange={() => handleInputChange('profileVisibility', option.value)}
                              className="sr-only"
                            />
                            <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                              profile.profileVisibility === option.value 
                                ? 'border-purple-500 bg-purple-500' 
                                : 'border-slate-500'
                            }`}>
                              {profile.profileVisibility === option.value && (
                                <div className="w-2 h-2 rounded-full bg-white"></div>
                              )}
                            </div>
                            <option.icon className="w-5 h-5 text-slate-400 mr-3" />
                            <div>
                              <span className="text-white text-sm font-medium">{option.label}</span>
                              <p className="text-slate-400 text-xs">{option.desc}</p>
                            </div>
                          </label>
                        ))}
                      </div>
                    </div>

                    {/* Additional Privacy Settings */}
                    <div className="p-6 bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-2xl">
                      <h3 className="font-semibold text-green-300 mb-4 flex items-center gap-2">
                        <Bell className="w-5 h-5" />
                        Communication Preferences
                      </h3>
                      <div className="space-y-4">
                        {[
                          { key: 'allowDirectContact', label: 'Allow Direct Contact', desc: 'Let employers contact you directly without applying to jobs' },
                          { key: 'showOnlineStatus', label: 'Show Online Status', desc: 'Display when you were last active' },
                          { key: 'allowProfileDownload', label: 'Allow Profile Download', desc: 'Let employers download your profile information' }
                        ].map((item) => (
                          <div key={item.key} className="flex items-center justify-between p-4 bg-slate-800/50 rounded-xl">
                            <div>
                              <p className="text-white text-sm font-medium">{item.label}</p>
                              <p className="text-slate-400 text-xs">{item.desc}</p>
                            </div>
                            <button
                              onClick={() => handleInputChange(item.key, !profile[item.key])}
                              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ${
                                profile[item.key] ? 'bg-green-600' : 'bg-slate-600'
                              }`}
                            >
                              <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${
                                  profile[item.key] ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              )}

              {activeTab === 'resume' && (
                <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50">
                  <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                    <FileText className="w-6 h-6 text-indigo-400" />
                    Resume Management
                  </h2>
                  
                  {profile.resumeUrl ? (
                    <div className="p-6 bg-gradient-to-br from-green-900/20 to-emerald-900/20 border border-green-500/30 rounded-2xl mb-6">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-4">
                          <div className="bg-green-600 rounded-xl p-3">
                            <FileText className="w-8 h-8 text-white" />
                          </div>
                          <div>
                            <p className="text-white font-semibold text-lg">{profile.resumeFileName}</p>
                            <p className="text-green-300 text-sm">
                              Uploaded {profile.resumeUploadedAt ? new Date(profile.resumeUploadedAt).toLocaleDateString() : 'recently'}
                            </p>
                            <div className="flex items-center gap-2 mt-2">
                              <span className="px-2 py-1 bg-green-600 text-white text-xs rounded-full">Active</span>
                              <span className="text-slate-400 text-xs">• PDF Format</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex gap-3">
                          <button className="px-4 py-2 bg-slate-700 text-white rounded-xl hover:bg-slate-600 flex items-center gap-2 transition-all duration-200">
                            <Eye className="w-4 h-4" />
                            Preview
                          </button>
                          <button className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2 transition-all duration-200">
                            <Download className="w-4 h-4" />
                            Download
                          </button>
                        </div>
                      </div>
                    </div>
                  ) : (
                    <div className="p-6 bg-gradient-to-br from-yellow-900/20 to-orange-900/20 border border-yellow-500/30 rounded-2xl mb-6">
                      <div className="text-center">
                        <Upload className="w-16 h-16 text-yellow-400 mx-auto mb-4" />
                        <h3 className="text-yellow-300 font-semibold text-lg mb-2">No Resume Uploaded</h3>
                        <p className="text-yellow-200/80 mb-4">Upload your resume to increase your chances of getting hired</p>
                      </div>
                    </div>
                  )}
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <label className="p-4 bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl hover:from-indigo-700 hover:to-purple-700 flex items-center justify-center gap-3 transition-all duration-200 shadow-lg hover:shadow-xl cursor-pointer disabled:opacity-50 disabled:cursor-not-allowed">
                      {uploadingResume ? (
                        <>
                          <div className="animate-spin rounded-full h-5 w-5 border-2 border-white border-t-transparent"></div>
                          Uploading...
                        </>
                      ) : (
                        <>
                          <Upload className="w-5 h-5" />
                          Upload New Resume
                        </>
                      )}
                      <input
                        type="file"
                        accept=".pdf,.doc,.docx"
                        onChange={handleResumeUpload}
                        className="hidden"
                        disabled={uploadingResume}
                      />
                    </label>
                    
                    <button 
                      onClick={handleCreateWithBuilder}
                      className="p-4 bg-slate-700 text-white rounded-xl hover:bg-slate-600 flex items-center justify-center gap-3 transition-all duration-200 shadow-lg hover:shadow-xl"
                    >
                      <FileText className="w-5 h-5" />
                      Create with Builder
                    </button>
                  </div>

                  {/* Resume Tips */}
                  <div className="mt-8 p-6 bg-slate-700/30 rounded-2xl border border-slate-600/50">
                    <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                      <Zap className="w-5 h-5 text-yellow-400" />
                      Resume Tips
                    </h3>
                    <ul className="space-y-2 text-slate-300 text-sm">
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        Keep your resume to 1-2 pages maximum
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        Use a clean, professional format with clear sections
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        Include relevant keywords from job descriptions
                      </li>
                      <li className="flex items-start gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 mt-0.5 flex-shrink-0" />
                        Quantify your achievements with numbers and metrics
                      </li>
                    </ul>
                  </div>
                </div>
              )}

              {activeTab === 'settings' && (
                <div className="space-y-8">
                  {/* Account Settings */}
                  <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50">
                    <h2 className="text-2xl font-bold text-white mb-6 flex items-center gap-3">
                      <Settings className="w-6 h-6 text-indigo-400" />
                      Account Settings
                    </h2>
                    
                    <div className="space-y-6">
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Job Alert Notifications</label>
                          <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                            <span className="text-white">Receive job recommendations</span>
                            <button
                              onClick={() => handleInputChange('jobAlerts', !profile.jobAlerts)}
                              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ${
                                profile.jobAlerts ? 'bg-indigo-600' : 'bg-slate-600'
                              }`}
                            >
                              <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${
                                  profile.jobAlerts ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>

                        <div>
                          <label className="block text-sm font-medium text-slate-300 mb-2">Open to Remote Work</label>
                          <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-xl">
                            <span className="text-white">Include remote opportunities</span>
                            <button
                              onClick={() => handleInputChange('openToRemote', !profile.openToRemote)}
                              className={`relative inline-flex h-7 w-12 items-center rounded-full transition-colors duration-200 ${
                                profile.openToRemote ? 'bg-indigo-600' : 'bg-slate-600'
                              }`}
                            >
                              <span
                                className={`inline-block h-5 w-5 transform rounded-full bg-white transition-transform duration-200 ${
                                  profile.openToRemote ? 'translate-x-6' : 'translate-x-1'
                                }`}
                              />
                            </button>
                          </div>
                        </div>
                      </div>

                      <div>
                        <label className="block text-sm font-medium text-slate-300 mb-2">Preferred Industries</label>
                        {editing ? (
                          <input
                            type="text"
                            value={profile.industry}
                            onChange={(e) => handleInputChange('industry', e.target.value)}
                            className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                            placeholder="e.g., Technology, Healthcare, Finance"
                          />
                        ) : (
                          <p className="text-white bg-slate-700/30 px-4 py-3 rounded-xl">
                            {profile.industry || 'Not specified'}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Social Links */}
                  <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-8 border border-slate-700/50">
                    <h2 className="text-2xl font-bold text-white mb-6">Social & Portfolio Links</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                      {[
                        { key: 'linkedinUrl', label: 'LinkedIn Profile', icon: LinkedinIcon, placeholder: 'https://linkedin.com/in/yourprofile' },
                        { key: 'githubUrl', label: 'GitHub Profile', icon: Globe, placeholder: 'https://github.com/yourusername' },
                        { key: 'portfolioUrl', label: 'Portfolio Website', icon: Globe, placeholder: 'https://yourportfolio.com' },
                        { key: 'personalWebsite', label: 'Personal Website', icon: Globe, placeholder: 'https://yourwebsite.com' }
                      ].map((link) => (
                        <div key={link.key}>
                          <label className="flex items-center gap-2 text-sm font-medium text-slate-300 mb-2">
                            <link.icon className="w-4 h-4" />
                            {link.label}
                          </label>
                          {editing ? (
                            <input
                              type="url"
                              value={profile[link.key]}
                              onChange={(e) => handleInputChange(link.key, e.target.value)}
                              className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white placeholder-slate-400 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-500/20 transition-all duration-200"
                              placeholder={link.placeholder}
                            />
                          ) : (
                            <p className="text-white bg-slate-700/30 px-4 py-3 rounded-xl">
                              {profile[link.key] ? (
                                <a href={profile[link.key]} target="_blank" rel="noopener noreferrer" className="text-indigo-400 hover:text-indigo-300 transition-colors duration-200">
                                  {profile[link.key]}
                                </a>
                              ) : (
                                'Not provided'
                              )}
                            </p>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Enhanced Sidebar */}
            <div className="space-y-6">
              {/* Quick Actions */}
              <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Zap className="w-5 h-5 text-yellow-400" />
                  Quick Actions
                </h2>
                <div className="space-y-3">
                  <a
                    href="/jobs"
                    className="block w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white rounded-xl px-4 py-3 text-center hover:from-indigo-700 hover:to-purple-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Browse Jobs
                  </a>
                  <a
                    href="/my-applications"
                    className="block w-full bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl px-4 py-3 text-center hover:from-emerald-700 hover:to-teal-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    My Applications
                  </a>
                  <a
                    href="/resume-analyzer"
                    className="block w-full bg-gradient-to-r from-orange-600 to-red-600 text-white rounded-xl px-4 py-3 text-center hover:from-orange-700 hover:to-red-700 transition-all duration-200 shadow-lg hover:shadow-xl"
                  >
                    Analyze Resume
                  </a>
                </div>
              </div>

              {/* Profile Completeness Widget */}
              <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Target className="w-5 h-5 text-indigo-400" />
                  Profile Status
                </h2>
                
                <div className="space-y-4">
                  {[
                    { label: 'Basic Info', completed: Boolean(profile.fullName && profile.email), icon: User },
                    { label: 'Professional Bio', completed: Boolean(profile.bio), icon: FileText },
                    { label: 'Skills', completed: profile.skills.length > 0, icon: Star },
                    { label: 'Experience', completed: profile.yearsOfExperience > 0, icon: Briefcase },
                    { label: 'Resume', completed: Boolean(profile.resumeUrl), icon: FileText },
                    { label: 'Social Links', completed: Boolean(profile.linkedinUrl || profile.portfolioUrl), icon: Globe }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-slate-300 text-sm flex items-center gap-2">
                        <item.icon className="w-4 h-4" />
                        {item.label}
                      </span>
                      {item.completed ? (
                        <CheckCircle className="w-5 h-5 text-green-400" />
                      ) : (
                        <div className="w-5 h-5 border-2 border-slate-600 rounded-full" />
                      )}
                    </div>
                  ))}
                </div>
                
                <div className="mt-6 pt-4 border-t border-slate-700/50">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-slate-300 text-sm font-medium">Overall Progress</span>
                    <span className="text-white font-bold">{profileCompleteness}%</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-3 overflow-hidden">
                    <div 
                      className="h-full bg-gradient-to-r from-indigo-500 to-purple-500 rounded-full transition-all duration-700 ease-out"
                      style={{ width: `${profileCompleteness}%` }}
                    ></div>
                  </div>
                  <p className="text-slate-400 text-xs mt-2">
                    {profileCompleteness >= 80 
                      ? 'Excellent! Your profile is highly visible to employers.' 
                      : 'Complete more sections to improve your visibility.'
                    }
                  </p>
                </div>
              </div>

              {/* Privacy Status Summary */}
              <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Shield className="w-5 h-5 text-blue-400" />
                  Privacy Summary
                </h2>
                <div className="space-y-3 text-sm">
                  {[
                    { label: 'Email', hidden: profile.hideEmail },
                    { label: 'Phone', hidden: profile.hidePhone },
                    { label: 'Address', hidden: profile.hideAddress },
                    { label: 'Salary', hidden: profile.hideSalary }
                  ].map((item, index) => (
                    <div key={index} className="flex items-center justify-between">
                      <span className="text-slate-300">{item.label}</span>
                      <span className={`px-3 py-1 rounded-full text-xs font-medium ${
                        item.hidden 
                          ? 'bg-red-900/50 text-red-300 border border-red-500/30' 
                          : 'bg-green-900/50 text-green-300 border border-green-500/30'
                      }`}>
                        {item.hidden ? 'Hidden' : 'Visible'}
                      </span>
                    </div>
                  ))}
                  
                  <div className="pt-3 border-t border-slate-700/50">
                    <div className="flex items-center justify-between">
                      <span className="text-slate-300">Profile Visibility</span>
                      <span className="px-3 py-1 bg-indigo-900/50 text-indigo-300 border border-indigo-500/30 rounded-full text-xs font-medium capitalize">
                        {profile.profileVisibility.replace('_', ' ')}
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Activity Stats */}
              <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <TrendingUp className="w-5 h-5 text-purple-400" />
                  Activity
                </h2>
                <div className="space-y-4">
                  <div className="text-center">
                    <p className="text-3xl font-bold text-white">{profile.responseRate}%</p>
                    <p className="text-slate-400 text-sm">Response Rate</p>
                    <div className="w-full bg-slate-700 rounded-full h-2 mt-2">
                      <div 
                        className="bg-gradient-to-r from-purple-500 to-pink-500 h-2 rounded-full transition-all duration-700"
                        style={{ width: `${profile.responseRate}%` }}
                      ></div>
                    </div>
                  </div>
                  
                  <div className="pt-4 border-t border-slate-700/50 text-center">
                    <p className="text-slate-400 text-sm">Last active</p>
                    <p className="text-white font-medium">
                      {profile.lastActiveAt ? new Date(profile.lastActiveAt).toLocaleDateString() : 'Today'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Recommendations */}
              <div className="bg-slate-800/60 backdrop-blur-xl rounded-2xl p-6 border border-slate-700/50">
                <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                  <Heart className="w-5 h-5 text-pink-400" />
                  Recommended For You
                </h2>
                <div className="space-y-3">
                  <div className="p-3 bg-slate-700/30 rounded-xl border border-slate-600/50 hover:border-indigo-500/50 transition-colors duration-200 cursor-pointer">
                    <p className="text-white text-sm font-medium">Complete your portfolio</p>
                    <p className="text-slate-400 text-xs">Add project examples to stand out</p>
                  </div>
                  
                  <div className="p-3 bg-slate-700/30 rounded-xl border border-slate-600/50 hover:border-indigo-500/50 transition-colors duration-200 cursor-pointer">
                    <p className="text-white text-sm font-medium">Take a skills assessment</p>
                    <p className="text-slate-400 text-xs">Verify your expertise with badges</p>
                  </div>
                  
                  <div className="p-3 bg-slate-700/30 rounded-xl border border-slate-600/50 hover:border-indigo-500/50 transition-colors duration-200 cursor-pointer">
                    <p className="text-white text-sm font-medium">Update your resume</p>
                    <p className="text-slate-400 text-xs">Keep your experience current</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
