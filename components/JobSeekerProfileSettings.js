'use client';

import { useState } from 'react';
import { 
  Settings, 
  Bell, 
  Shield, 
  Eye, 
  EyeOff, 
  Globe, 
  Lock, 
  Star,
  Smartphone,
  Mail,
  MapPin,
  DollarSign,
  Save,
  X,
  Check,
  AlertTriangle,
  Info
} from 'lucide-react';

export default function JobSeekerProfileSettings({ profile, onUpdateProfile, isOpen, onClose }) {
  const [settings, setSettings] = useState({
    // Privacy Settings
    hideEmail: profile?.hideEmail ?? true,
    hidePhone: profile?.hidePhone ?? true,
    hideAddress: profile?.hideAddress ?? true,
    hideSalary: profile?.hideSalary ?? true,
    profileVisibility: profile?.profileVisibility || 'public',
    allowDirectContact: profile?.allowDirectContact ?? false,
    showOnlineStatus: profile?.showOnlineStatus ?? true,
    allowProfileDownload: profile?.allowProfileDownload ?? false,
    
    // Notification Settings
    jobAlerts: profile?.jobAlerts ?? true,
    applicationUpdates: profile?.applicationUpdates ?? true,
    messageNotifications: profile?.messageNotifications ?? true,
    weeklyDigest: profile?.weeklyDigest ?? true,
    marketingEmails: profile?.marketingEmails ?? false,
    smsNotifications: profile?.smsNotifications ?? false,
    
    // Job Preferences
    openToRemote: profile?.openToRemote ?? false,
    openToRelocation: profile?.openToRelocation ?? false,
    preferredWorkingHours: profile?.preferredWorkingHours || 'standard',
    minimumSalary: profile?.minimumSalary || '',
    noticePeriod: profile?.noticePeriod || '30 days',
    
    // Search Preferences
    searchVisibility: profile?.searchVisibility ?? true,
    showSalaryInSearch: profile?.showSalaryInSearch ?? false,
    highlightProfile: profile?.highlightProfile ?? false,
    anonymousMode: profile?.anonymousMode ?? false
  });

  const [activeSection, setActiveSection] = useState('privacy');
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);

  const handleSettingChange = (key, value) => {
    setSettings(prev => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      await onUpdateProfile(settings);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (error) {
      console.error('Error saving settings:', error);
    } finally {
      setSaving(false);
    }
  };

  if (!isOpen) return null;

  const sections = [
    { id: 'privacy', label: 'Privacy & Visibility', icon: Shield, color: 'indigo' },
    { id: 'notifications', label: 'Notifications', icon: Bell, color: 'green' },
    { id: 'preferences', label: 'Job Preferences', icon: Settings, color: 'purple' },
    { id: 'search', label: 'Search Settings', icon: Globe, color: 'blue' }
  ];

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <div className="bg-slate-800 rounded-2xl w-full max-w-4xl max-h-[90vh] overflow-hidden border border-slate-700 shadow-2xl">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-slate-700 bg-slate-800/80 backdrop-blur-xl">
          <div className="flex items-center gap-3">
            <div className="bg-gradient-to-br from-indigo-500 to-purple-600 rounded-xl p-2">
              <Settings className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-white">Profile Settings</h2>
              <p className="text-slate-400 text-sm">Customize your profile privacy and preferences</p>
            </div>
          </div>
          
          <div className="flex items-center gap-3">
            {saved && (
              <div className="flex items-center gap-2 text-green-400 text-sm">
                <Check className="w-4 h-4" />
                Saved
              </div>
            )}
            
            <button
              onClick={handleSave}
              disabled={saving}
              className="px-4 py-2 bg-indigo-600 text-white rounded-xl hover:bg-indigo-700 flex items-center gap-2 disabled:opacity-50 transition-all duration-200"
            >
              <Save className="w-4 h-4" />
              {saving ? 'Saving...' : 'Save Changes'}
            </button>
            
            <button
              onClick={onClose}
              className="p-2 text-slate-400 hover:text-white hover:bg-slate-700 rounded-xl transition-all duration-200"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div className="flex h-[calc(90vh-100px)]">
          {/* Sidebar Navigation */}
          <div className="w-64 bg-slate-900/50 border-r border-slate-700 p-4">
            <div className="space-y-2">
              {sections.map((section) => (
                <button
                  key={section.id}
                  onClick={() => setActiveSection(section.id)}
                  className={`w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-all duration-200 ${
                    activeSection === section.id
                      ? `bg-${section.color}-600/20 text-${section.color}-300 border border-${section.color}-500/30`
                      : 'text-slate-400 hover:text-slate-300 hover:bg-slate-800/50'
                  }`}
                >
                  <section.icon className="w-5 h-5" />
                  <span className="font-medium">{section.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Settings Content */}
          <div className="flex-1 p-6 overflow-y-auto">
            {activeSection === 'privacy' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Shield className="w-5 h-5 text-indigo-400" />
                    Privacy & Visibility Settings
                  </h3>
                  <p className="text-slate-400 text-sm mb-6">Control who can see your information and how your profile appears to employers.</p>
                </div>

                {/* Contact Information Privacy */}
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                  <h4 className="font-medium text-white mb-4 flex items-center gap-2">
                    <Lock className="w-4 h-4 text-indigo-400" />
                    Contact Information
                  </h4>
                  
                  <div className="space-y-4">
                    {[
                      { key: 'hideEmail', label: 'Hide Email Address', icon: Mail, desc: 'Employers will see a masked email until you apply' },
                      { key: 'hidePhone', label: 'Hide Phone Number', icon: Smartphone, desc: 'Your phone will be hidden from public view' },
                      { key: 'hideAddress', label: 'Hide Full Address', icon: MapPin, desc: 'Only show city and country publicly' },
                      { key: 'hideSalary', label: 'Hide Salary Expectations', icon: DollarSign, desc: 'Keep your salary range private' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                        <div className="flex items-center gap-3">
                          <item.icon className="w-5 h-5 text-slate-400" />
                          <div>
                            <p className="text-white text-sm font-medium">{item.label}</p>
                            <p className="text-slate-400 text-xs">{item.desc}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => handleSettingChange(item.key, !settings[item.key])}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                            settings[item.key] ? 'bg-red-600' : 'bg-green-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                              settings[item.key] ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Profile Visibility */}
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                  <h4 className="font-medium text-white mb-4 flex items-center gap-2">
                    <Eye className="w-4 h-4 text-purple-400" />
                    Profile Visibility
                  </h4>
                  
                  <div className="space-y-3">
                    {[
                      { value: 'public', label: 'Public Profile', desc: 'Visible to all employers and searchable', icon: Globe },
                      { value: 'premium_only', label: 'Premium Employers Only', desc: 'Only verified premium employers can see your profile', icon: Star },
                      { value: 'private', label: 'Private Profile', desc: 'Hidden from searches, only visible through direct applications', icon: Lock }
                    ].map((option) => (
                      <label key={option.value} className="flex items-center p-4 bg-slate-700/30 rounded-lg cursor-pointer hover:bg-slate-700/50 transition-colors duration-200">
                        <input
                          type="radio"
                          name="profileVisibility"
                          value={option.value}
                          checked={settings.profileVisibility === option.value}
                          onChange={() => handleSettingChange('profileVisibility', option.value)}
                          className="sr-only"
                        />
                        <div className={`w-5 h-5 rounded-full border-2 mr-4 flex items-center justify-center ${
                          settings.profileVisibility === option.value 
                            ? 'border-purple-500 bg-purple-500' 
                            : 'border-slate-500'
                        }`}>
                          {settings.profileVisibility === option.value && (
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

                {/* Additional Privacy Options */}
                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                  <h4 className="font-medium text-white mb-4">Additional Options</h4>
                  
                  <div className="space-y-4">
                    {[
                      { key: 'allowDirectContact', label: 'Allow Direct Contact', desc: 'Let employers message you directly without applying to jobs' },
                      { key: 'showOnlineStatus', label: 'Show Online Status', desc: 'Display when you were last active on the platform' },
                      { key: 'allowProfileDownload', label: 'Allow Profile Download', desc: 'Let employers download your profile as PDF' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                        <div>
                          <p className="text-white text-sm font-medium">{item.label}</p>
                          <p className="text-slate-400 text-xs">{item.desc}</p>
                        </div>
                        <button
                          onClick={() => handleSettingChange(item.key, !settings[item.key])}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                            settings[item.key] ? 'bg-green-600' : 'bg-slate-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                              settings[item.key] ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'notifications' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Bell className="w-5 h-5 text-green-400" />
                    Notification Preferences
                  </h3>
                  <p className="text-slate-400 text-sm mb-6">Choose how and when you want to receive notifications.</p>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                  <h4 className="font-medium text-white mb-4">Email Notifications</h4>
                  
                  <div className="space-y-4">
                    {[
                      { key: 'jobAlerts', label: 'Job Alerts', desc: 'Receive notifications about relevant job opportunities' },
                      { key: 'applicationUpdates', label: 'Application Updates', desc: 'Get notified when employers respond to your applications' },
                      { key: 'messageNotifications', label: 'Messages', desc: 'Receive notifications for new messages from employers' },
                      { key: 'weeklyDigest', label: 'Weekly Digest', desc: 'Get a summary of new opportunities and activity' },
                      { key: 'marketingEmails', label: 'Marketing Emails', desc: 'Receive tips, career advice, and platform updates' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                        <div>
                          <p className="text-white text-sm font-medium">{item.label}</p>
                          <p className="text-slate-400 text-xs">{item.desc}</p>
                        </div>
                        <button
                          onClick={() => handleSettingChange(item.key, !settings[item.key])}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                            settings[item.key] ? 'bg-green-600' : 'bg-slate-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                              settings[item.key] ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                  <h4 className="font-medium text-white mb-4">SMS Notifications</h4>
                  
                  <div className="p-4 bg-yellow-900/20 border border-yellow-500/30 rounded-lg mb-4">
                    <div className="flex items-start gap-2">
                      <Info className="w-4 h-4 text-yellow-400 mt-0.5 flex-shrink-0" />
                      <div>
                        <p className="text-yellow-300 text-sm font-medium">SMS charges may apply</p>
                        <p className="text-yellow-200/80 text-xs">Standard messaging rates from your carrier may apply for SMS notifications.</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                    <div>
                      <p className="text-white text-sm font-medium">SMS Notifications</p>
                      <p className="text-slate-400 text-xs">Receive urgent notifications via SMS</p>
                    </div>
                    <button
                      onClick={() => handleSettingChange('smsNotifications', !settings.smsNotifications)}
                      className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                        settings.smsNotifications ? 'bg-green-600' : 'bg-slate-600'
                      }`}
                    >
                      <span
                        className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                          settings.smsNotifications ? 'translate-x-6' : 'translate-x-1'
                        }`}
                      />
                    </button>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'preferences' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Settings className="w-5 h-5 text-purple-400" />
                    Job Search Preferences
                  </h3>
                  <p className="text-slate-400 text-sm mb-6">Set your job search criteria and preferences.</p>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                  <h4 className="font-medium text-white mb-4">Work Preferences</h4>
                  
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div>
                        <p className="text-white text-sm font-medium">Open to Remote Work</p>
                        <p className="text-slate-400 text-xs">Include remote job opportunities</p>
                      </div>
                      <button
                        onClick={() => handleSettingChange('openToRemote', !settings.openToRemote)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                          settings.openToRemote ? 'bg-purple-600' : 'bg-slate-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                            settings.openToRemote ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                      <div>
                        <p className="text-white text-sm font-medium">Open to Relocation</p>
                        <p className="text-slate-400 text-xs">Consider jobs in other cities</p>
                      </div>
                      <button
                        onClick={() => handleSettingChange('openToRelocation', !settings.openToRelocation)}
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                          settings.openToRelocation ? 'bg-purple-600' : 'bg-slate-600'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                            settings.openToRelocation ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Preferred Working Hours</label>
                      <select
                        value={settings.preferredWorkingHours}
                        onChange={(e) => handleSettingChange('preferredWorkingHours', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                      >
                        <option value="standard">Standard (9 AM - 5 PM)</option>
                        <option value="flexible">Flexible Hours</option>
                        <option value="night">Night Shift</option>
                        <option value="weekend">Weekend Work</option>
                        <option value="any">Any Schedule</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-slate-300 mb-2">Notice Period</label>
                      <select
                        value={settings.noticePeriod}
                        onChange={(e) => handleSettingChange('noticePeriod', e.target.value)}
                        className="w-full px-4 py-3 bg-slate-700/50 border border-slate-600 rounded-xl text-white focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-200"
                      >
                        <option value="immediate">Immediate</option>
                        <option value="1 week">1 Week</option>
                        <option value="2 weeks">2 Weeks</option>
                        <option value="30 days">30 Days</option>
                        <option value="60 days">60 Days</option>
                        <option value="90 days">90 Days</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeSection === 'search' && (
              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-blue-400" />
                    Search & Discovery Settings
                  </h3>
                  <p className="text-slate-400 text-sm mb-6">Control how you appear in employer searches and recommendations.</p>
                </div>

                <div className="bg-slate-800/50 rounded-xl p-6 border border-slate-700/50">
                  <h4 className="font-medium text-white mb-4">Search Visibility</h4>
                  
                  <div className="space-y-4">
                    {[
                      { key: 'searchVisibility', label: 'Appear in Search Results', desc: 'Allow employers to find your profile through searches' },
                      { key: 'showSalaryInSearch', label: 'Show Salary in Search', desc: 'Display your salary expectations in search results' },
                      { key: 'highlightProfile', label: 'Highlight Profile', desc: 'Make your profile stand out in search results (Premium feature)' },
                      { key: 'anonymousMode', label: 'Anonymous Browsing', desc: 'Browse job postings without revealing your identity' }
                    ].map((item) => (
                      <div key={item.key} className="flex items-center justify-between p-4 bg-slate-700/30 rounded-lg">
                        <div>
                          <p className="text-white text-sm font-medium">{item.label}</p>
                          <p className="text-slate-400 text-xs">{item.desc}</p>
                        </div>
                        <button
                          onClick={() => handleSettingChange(item.key, !settings[item.key])}
                          className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors duration-200 ${
                            settings[item.key] ? 'bg-blue-600' : 'bg-slate-600'
                          }`}
                        >
                          <span
                            className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform duration-200 ${
                              settings[item.key] ? 'translate-x-6' : 'translate-x-1'
                            }`}
                          />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
