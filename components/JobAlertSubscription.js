'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { colors, typography, components, animations, combineClasses } from '../utils/designSystem';

export default function JobAlertSubscription() {
  const { user } = useAuth();
  const [preferences, setPreferences] = useState({
    keywords: '',
    location: '',
    salary_min: '',
    salary_max: '',
    job_type: '',
    experience_level: '',
    remote_only: false,
    frequency: 'daily'
  });
  const [isSubscribed, setIsSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

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
          setPreferences(data.preferences);
        }
        setIsSubscribed(data.hasJobAlerts || false);
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
          ...preferences,
          job_alerts: true
        })
      });

      if (response.ok) {
        setIsSubscribed(true);
        setMessage('Job alert preferences saved successfully!');
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
          ...preferences,
          job_alerts: false
        })
      });

      if (response.ok) {
        setIsSubscribed(false);
        setMessage('Unsubscribed from job alerts');
        setTimeout(() => setMessage(''), 3000);
      }
    } catch (error) {
      setMessage('Error unsubscribing');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (field, value) => {
    setPreferences(prev => ({
      ...prev,
      [field]: value
    }));
  };

  return (
    <div className={combineClasses(
      "backdrop-blur-sm border rounded-2xl p-6",
      colors.neutral.surface,
      colors.neutral.border
    )}>
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="text-2xl">🔔</div>
          <div>
            <h3 className={combineClasses(typography.h4, colors.neutral.textPrimary, "font-bold")}>
              Job Alert Preferences
            </h3>
            <p className={combineClasses(typography.bodySmall, colors.neutral.textSecondary)}>
              Get notified about relevant job opportunities
            </p>
          </div>
        </div>
        <div className={combineClasses(
          "px-3 py-1 rounded-full text-sm font-medium",
          isSubscribed ? "bg-green-500/20 text-green-400" : "bg-gray-500/20 text-gray-400"
        )}>
          {isSubscribed ? 'Active' : 'Inactive'}
        </div>
      </div>

      {message && (
        <div className={combineClasses(
          "mb-4 p-3 rounded-xl text-sm",
          message.includes('Error') || message.includes('Failed') 
            ? "bg-red-500/20 text-red-400 border border-red-500/30"
            : "bg-green-500/20 text-green-400 border border-green-500/30"
        )}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className={combineClasses(typography.bodySmall, colors.neutral.textSecondary, "block mb-2")}>
              Keywords
            </label>
            <input
              type="text"
              value={preferences.keywords}
              onChange={(e) => handleInputChange('keywords', e.target.value)}
              placeholder="e.g., JavaScript, React, Node.js"
              className={combineClasses(
                "w-full px-3 py-2 border rounded-lg transition-colors duration-200",
                colors.neutral.surface,
                colors.neutral.border,
                colors.neutral.textPrimary,
                "focus:border-indigo-500 focus:outline-none"
              )}
            />
          </div>

          <div>
            <label className={combineClasses(typography.bodySmall, colors.neutral.textSecondary, "block mb-2")}>
              Location
            </label>
            <input
              type="text"
              value={preferences.location}
              onChange={(e) => handleInputChange('location', e.target.value)}
              placeholder="e.g., Manila, Remote, Philippines"
              className={combineClasses(
                "w-full px-3 py-2 border rounded-lg transition-colors duration-200",
                colors.neutral.surface,
                colors.neutral.border,
                colors.neutral.textPrimary,
                "focus:border-indigo-500 focus:outline-none"
              )}
            />
          </div>

          <div>
            <label className={combineClasses(typography.bodySmall, colors.neutral.textSecondary, "block mb-2")}>
              Minimum Salary
            </label>
            <input
              type="number"
              value={preferences.salary_min}
              onChange={(e) => handleInputChange('salary_min', e.target.value)}
              placeholder="e.g., 50000"
              className={combineClasses(
                "w-full px-3 py-2 border rounded-lg transition-colors duration-200",
                colors.neutral.surface,
                colors.neutral.border,
                colors.neutral.textPrimary,
                "focus:border-indigo-500 focus:outline-none"
              )}
            />
          </div>

          <div>
            <label className={combineClasses(typography.bodySmall, colors.neutral.textSecondary, "block mb-2")}>
              Maximum Salary
            </label>
            <input
              type="number"
              value={preferences.salary_max}
              onChange={(e) => handleInputChange('salary_max', e.target.value)}
              placeholder="e.g., 100000"
              className={combineClasses(
                "w-full px-3 py-2 border rounded-lg transition-colors duration-200",
                colors.neutral.surface,
                colors.neutral.border,
                colors.neutral.textPrimary,
                "focus:border-indigo-500 focus:outline-none"
              )}
            />
          </div>

          <div>
            <label className={combineClasses(typography.bodySmall, colors.neutral.textSecondary, "block mb-2")}>
              Job Type
            </label>
            <select
              value={preferences.job_type}
              onChange={(e) => handleInputChange('job_type', e.target.value)}
              className={combineClasses(
                "w-full px-3 py-2 border rounded-lg transition-colors duration-200",
                colors.neutral.surface,
                colors.neutral.border,
                colors.neutral.textPrimary,
                "focus:border-indigo-500 focus:outline-none"
              )}
            >
              <option value="">Any</option>
              <option value="full-time">Full-time</option>
              <option value="part-time">Part-time</option>
              <option value="contract">Contract</option>
              <option value="freelance">Freelance</option>
            </select>
          </div>

          <div>
            <label className={combineClasses(typography.bodySmall, colors.neutral.textSecondary, "block mb-2")}>
              Experience Level
            </label>
            <select
              value={preferences.experience_level}
              onChange={(e) => handleInputChange('experience_level', e.target.value)}
              className={combineClasses(
                "w-full px-3 py-2 border rounded-lg transition-colors duration-200",
                colors.neutral.surface,
                colors.neutral.border,
                colors.neutral.textPrimary,
                "focus:border-indigo-500 focus:outline-none"
              )}
            >
              <option value="">Any</option>
              <option value="entry">Entry Level</option>
              <option value="mid">Mid Level</option>
              <option value="senior">Senior Level</option>
              <option value="lead">Lead/Manager</option>
            </select>
          </div>
        </div>

        <div className="flex items-center space-x-4">
          <div className="flex items-center space-x-2">
            <input
              type="checkbox"
              id="remote_only"
              checked={preferences.remote_only}
              onChange={(e) => handleInputChange('remote_only', e.target.checked)}
              className="w-4 h-4 text-indigo-600 bg-gray-800 border-gray-600 rounded focus:ring-indigo-500"
            />
            <label htmlFor="remote_only" className={combineClasses(typography.bodySmall, colors.neutral.textSecondary)}>
              Remote jobs only
            </label>
          </div>

          <div className="flex items-center space-x-2">
            <label className={combineClasses(typography.bodySmall, colors.neutral.textSecondary)}>
              Frequency:
            </label>
            <select
              value={preferences.frequency}
              onChange={(e) => handleInputChange('frequency', e.target.value)}
              className={combineClasses(
                "px-3 py-1 border rounded-lg transition-colors duration-200",
                colors.neutral.surface,
                colors.neutral.border,
                colors.neutral.textPrimary,
                "focus:border-indigo-500 focus:outline-none"
              )}
            >
              <option value="daily">Daily</option>
              <option value="weekly">Weekly</option>
              <option value="monthly">Monthly</option>
            </select>
          </div>
        </div>

        <div className="flex space-x-3 pt-4">
          <button
            type="submit"
            disabled={loading}
            className={combineClasses(
              "flex-1 py-2 px-4 rounded-lg font-medium transition-all duration-200",
              colors.primary.background,
              colors.primary.text,
              "hover:transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            )}
          >
            {loading ? 'Saving...' : (isSubscribed ? 'Update Preferences' : 'Subscribe to Alerts')}
          </button>
          
          {isSubscribed && (
            <button
              type="button"
              onClick={handleUnsubscribe}
              disabled={loading}
              className={combineClasses(
                "px-4 py-2 rounded-lg font-medium transition-all duration-200",
                "bg-red-500/20 text-red-400 hover:bg-red-500/30",
                "disabled:opacity-50 disabled:cursor-not-allowed"
              )}
            >
              Unsubscribe
            </button>
          )}
        </div>
      </form>
    </div>
  );
}
