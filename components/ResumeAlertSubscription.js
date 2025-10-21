'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { Bell, Mail, Settings, CheckCircle, AlertTriangle } from 'lucide-react';

export default function ResumeAlertSubscription() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState({
    keywords: '',
    skills: [],
    experienceLevel: '',
    location: '',
    salary_min: '',
    salary_max: '',
    education: '',
    frequency: 'daily',
    emailAlerts: true,
    pushAlerts: true
  });
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');
  const [skillInput, setSkillInput] = useState('');

  useEffect(() => {
    loadUserPreferences();
  }, []);

  const loadUserPreferences = async () => {
    try {
      const response = await fetch('/api/user/preferences', {
        credentials: 'include'
      });

      if (response.ok) {
        const data = await response.json();
        if (data.preferences) {
          setPreferences({
            keywords: data.resumeAlertPreferences?.resumeKeywords || [],
            skills: data.resumeAlertPreferences?.resumeSkills || [],
            experienceLevel: data.resumeAlertPreferences?.resumeExperienceLevel || '',
            location: data.resumeAlertPreferences?.resumeLocation || '',
            salary_min: data.resumeAlertPreferences?.resumeSalaryMin || '',
            salary_max: data.resumeAlertPreferences?.resumeSalaryMax || '',
            education: data.resumeAlertPreferences?.resumeEducation || '',
            frequency: data.resumeAlertPreferences?.resumeAlertFrequency || 'daily',
            emailAlerts: data.resumeAlertPreferences?.resumeEmailAlerts !== undefined ? data.resumeAlertPreferences.resumeEmailAlerts : true,
            pushAlerts: data.resumeAlertPreferences?.resumePushAlerts !== undefined ? data.resumeAlertPreferences.resumePushAlerts : true
          });
        }
        setIsSubscribed(data.resumeAlerts || false);
      }
    } catch (error) {
      console.error('Error loading preferences:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          resumeAlerts: true,
          resumeAlertFrequency: preferences.frequency,
          resumeKeywords: preferences.keywords,
          resumeSkills: preferences.skills,
          resumeExperienceLevel: preferences.experienceLevel,
          resumeLocation: preferences.location,
          resumeSalaryMin: preferences.salary_min,
          resumeSalaryMax: preferences.salary_max,
          resumeEducation: preferences.education,
          resumeEmailAlerts: preferences.emailAlerts,
          resumePushAlerts: preferences.pushAlerts
        })
      });

      if (response.ok) {
        setIsSubscribed(true);
        setMessage('Resume alert preferences saved successfully!');
        setTimeout(() => setMessage(''), 3000);
      } else {
        const errorData = await response.json();
        setMessage(errorData.error || 'Failed to save preferences');
      }
    } catch (error) {
      setMessage('Error saving preferences');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleUnsubscribe = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/user/preferences', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify({
          resumeAlerts: false,
          resumeAlertFrequency: preferences.frequency,
          resumeKeywords: preferences.keywords,
          resumeSkills: preferences.skills,
          resumeExperienceLevel: preferences.experienceLevel,
          resumeLocation: preferences.location,
          resumeSalaryMin: preferences.salary_min,
          resumeSalaryMax: preferences.salary_max,
          resumeEducation: preferences.education,
          resumeEmailAlerts: preferences.emailAlerts,
          resumePushAlerts: preferences.pushAlerts
        })
      });

      if (response.ok) {
        setIsSubscribed(false);
        setMessage('Unsubscribed from resume alerts');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Error unsubscribing');
    } finally {
      setLoading(false);
    }
  };

  const addSkill = () => {
    if (skillInput.trim() && !preferences.skills.includes(skillInput.trim())) {
      setPreferences(prev => ({
        ...prev,
        skills: [...prev.skills, skillInput.trim()]
      }));
      setSkillInput('');
    }
  };

  const removeSkill = (skill) => {
    setPreferences(prev => ({
      ...prev,
      skills: prev.skills.filter(s => s !== skill)
    }));
  };

  const handleInputChange = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className="max-w-2xl mx-auto bg-white rounded-lg shadow-lg p-6">
      <div className="flex items-center gap-3 mb-6">
        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
          <Bell className="w-5 h-5 text-blue-600" />
        </div>
        <div>
          <h2 className="text-xl font-semibold text-gray-900">Resume Alerts</h2>
          <p className="text-gray-600">Get notified when new resumes match your criteria</p>
        </div>
      </div>

      {message && (
        <div className={`mb-4 p-3 rounded-lg ${message.includes('success') ? 'bg-green-50 text-green-700' : 'bg-red-50 text-red-700'}`}>
          {message}
        </div>
      )}

      {isSubscribed ? (
        <div className="space-y-6">
          <div className="bg-green-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-green-700">
              <CheckCircle className="w-5 h-5" />
              <span className="font-medium">Resume alerts are active</span>
            </div>
            <p className="text-green-600 text-sm mt-1">
              You'll receive notifications about new resumes matching your criteria.
            </p>
          </div>

          <div className="border-t pt-6">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Current Alert Preferences</h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Keywords</label>
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                  {preferences.keywords.length > 0 ? preferences.keywords.join(', ') : 'No keywords set'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Location</label>
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                  {preferences.location || 'Any location'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Experience Level</label>
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg">
                  {preferences.experienceLevel || 'Any level'}
                </p>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Frequency</label>
                <p className="text-gray-900 bg-gray-50 px-3 py-2 rounded-lg capitalize">
                  {preferences.frequency}
                </p>
              </div>
            </div>

            {preferences.skills.length > 0 && (
              <div className="mb-4">
                <label className="block text-sm font-medium text-gray-700 mb-2">Skills</label>
                <div className="flex flex-wrap gap-2">
                  {preferences.skills.map((skill, index) => (
                    <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm">
                      {skill}
                    </span>
                  ))}
                </div>
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={() => setIsSubscribed(false)}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Update Preferences
              </button>

              <button
                onClick={handleUnsubscribe}
                disabled={loading}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors disabled:opacity-50"
              >
                {loading ? 'Unsubscribing...' : 'Unsubscribe'}
              </button>
            </div>
          </div>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-yellow-700">
              <AlertTriangle className="w-5 h-5" />
              <span className="font-medium">Resume alerts are not active</span>
            </div>
            <p className="text-yellow-600 text-sm mt-1">
              Set up your preferences to start receiving notifications about matching resumes.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Keywords
              </label>
              <input
                type="text"
                value={preferences.keywords}
                onChange={(e) => handleInputChange('keywords', e.target.value)}
                placeholder="e.g., JavaScript, React, Python"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Location
              </label>
              <input
                type="text"
                value={preferences.location}
                onChange={(e) => handleInputChange('location', e.target.value)}
                placeholder="e.g., Manila, Remote"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Experience Level
              </label>
              <select
                value={preferences.experienceLevel}
                onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">Any Level</option>
                <option value="entry">Entry Level</option>
                <option value="junior">Junior</option>
                <option value="mid">Mid Level</option>
                <option value="senior">Senior</option>
                <option value="executive">Executive</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Alert Frequency
              </label>
              <select
                value={preferences.frequency}
                onChange={(e) => handleInputChange('frequency', e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="immediate">Immediate</option>
                <option value="daily">Daily</option>
                <option value="weekly">Weekly</option>
              </select>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Required Skills
            </label>
            <div className="flex gap-2 mb-2">
              <input
                type="text"
                value={skillInput}
                onChange={(e) => setSkillInput(e.target.value)}
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addSkill())}
                placeholder="Add a skill..."
                className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
              <button
                type="button"
                onClick={addSkill}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Add
              </button>
            </div>
            {preferences.skills.length > 0 && (
              <div className="flex flex-wrap gap-2">
                {preferences.skills.map((skill, index) => (
                  <span key={index} className="bg-blue-100 text-blue-700 px-2 py-1 rounded-full text-sm flex items-center gap-1">
                    {skill}
                    <button
                      type="button"
                      onClick={() => removeSkill(skill)}
                      className="text-blue-500 hover:text-blue-700"
                    >
                      ×
                    </button>
                  </span>
                ))}
              </div>
            )}
          </div>

          <div className="space-y-3">
            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={preferences.emailAlerts}
                onChange={(e) => handleInputChange('emailAlerts', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Email notifications</span>
            </label>

            <label className="flex items-center gap-2">
              <input
                type="checkbox"
                checked={preferences.pushAlerts}
                onChange={(e) => handleInputChange('pushAlerts', e.target.checked)}
                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
              />
              <span className="text-sm text-gray-700">Push notifications</span>
            </label>
          </div>

          <button
            type="submit"
            disabled={loading}
            className="w-full px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
          >
            {loading ? 'Setting up alerts...' : 'Enable Resume Alerts'}
          </button>
        </form>
      )}
    </div>
  );
}