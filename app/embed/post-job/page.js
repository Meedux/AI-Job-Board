'use client';

import { useState } from 'react';

const EmbeddableJobPostForm = ({ searchParams }) => {
  const [formData, setFormData] = useState({
    jobTitle: '',
    companyName: '',
    companyWebsite: '',
    linkToApply: '',
    categories: '',
    location: '',
    jobType: '',
    description: ''
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Extract embed configuration from URL params
  const config = {
    theme: searchParams.theme || 'light',
    showLogo: searchParams.showLogo !== 'false',
    successRedirect: searchParams.successRedirect || '',
    height: parseInt(searchParams.height) || 600,
    companyName: searchParams.companyName || '', // Pre-fill company name
    companyWebsite: searchParams.companyWebsite || '' // Pre-fill company website
  };

  const themeStyles = config.theme === 'dark' ? {
    background: '#1f2937',
    text: '#f9fafb',
    textSecondary: '#d1d5db',
    border: '#374151',
    input: '#374151',
    button: '#059669',
    buttonHover: '#047857'
  } : {
    background: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    input: '#ffffff',
    button: '#059669',
    buttonHover: '#047857'
  };

  // Pre-fill company data if provided
  useState(() => {
    if (config.companyName || config.companyWebsite) {
      setFormData(prev => ({
        ...prev,
        companyName: config.companyName,
        companyWebsite: config.companyWebsite
      }));
    }
  }, []);

  const handleInputChange = (e) => {
    setFormData({
      ...formData,
      [e.target.name]: e.target.value
    });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      // Validate required fields
      const required = ['jobTitle', 'companyName', 'companyWebsite', 'linkToApply', 'categories'];
      const missing = required.filter(field => !formData[field]);
      
      if (missing.length > 0) {
        setMessage(`Please fill in: ${missing.join(', ')}`);
        setLoading(false);
        return;
      }

      // Prepare job data in the format expected by the API
      const jobData = [
        formData.jobTitle,           // A: Job Title
        formData.description,        // B: Job Description
        formData.location || '',     // C: Location
        '',                          // D: Salary Range
        formData.jobType || '',      // E: Job Type
        '',                          // F: Experience Level
        '',                          // G: Skills Required
        '',                          // H: Benefits
        '',                          // I: Remote Work
        new Date().toISOString().split('T')[0], // J: Date Posted
        '',                          // K: Application Deadline
        formData.linkToApply,        // L: Link to Apply
        formData.companyName,        // M: Company Name
        '',                          // N: Company Description
        formData.companyWebsite,     // O: Company Website
        formData.categories          // P: Categories
      ];

      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobData }),
      });

      const result = await response.json();

      if (response.ok) {
        setMessage('Job posted successfully!');
        setFormData({
          jobTitle: '',
          companyName: config.companyName,
          companyWebsite: config.companyWebsite,
          linkToApply: '',
          categories: '',
          location: '',
          jobType: '',
          description: ''
        });

        // Redirect if specified
        if (config.successRedirect) {
          setTimeout(() => {
            window.open(config.successRedirect, '_blank', 'noopener,noreferrer');
          }, 2000);
        }
      } else {
        setMessage(`Error: ${result.error}`);
      }
    } catch (error) {
      setMessage('Error posting job. Please try again.');
      console.error('Error:', error);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div 
      className="p-6 overflow-auto"
      style={{ 
        backgroundColor: themeStyles.background,
        color: themeStyles.text,
        height: `${config.height}px`,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Header */}
      {config.showLogo && (
        <div className="mb-6 text-center border-b pb-4" style={{ borderColor: themeStyles.border }}>
          <h2 className="text-xl font-semibold" style={{ color: themeStyles.text }}>
            Post a Job
          </h2>
          <p className="text-sm mt-1" style={{ color: themeStyles.textSecondary }}>
            Powered by GetGetHired
          </p>
        </div>
      )}

      {/* Message */}
      {message && (
        <div 
          className={`p-3 rounded mb-4 text-sm ${message.includes('Error') || message.includes('Please') ? 'border-red-200' : 'border-green-200'}`}
          style={{ 
            backgroundColor: message.includes('Error') || message.includes('Please') ? '#fef2f2' : '#f0fdf4',
            color: message.includes('Error') || message.includes('Please') ? '#dc2626' : '#059669',
            border: `1px solid ${message.includes('Error') || message.includes('Please') ? '#fecaca' : '#bbf7d0'}`
          }}
        >
          {message}
        </div>
      )}

      {/* Form */}
      <form onSubmit={handleSubmit} className="space-y-4">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: themeStyles.text }}>
              Job Title *
            </label>
            <input
              type="text"
              name="jobTitle"
              value={formData.jobTitle}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              style={{
                backgroundColor: themeStyles.input,
                borderColor: themeStyles.border,
                color: themeStyles.text
              }}
              placeholder="e.g., Senior Frontend Developer"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: themeStyles.text }}>
              Company Name *
            </label>
            <input
              type="text"
              name="companyName"
              value={formData.companyName}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              style={{
                backgroundColor: themeStyles.input,
                borderColor: themeStyles.border,
                color: themeStyles.text
              }}
              placeholder="Your Company Name"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: themeStyles.text }}>
              Company Website *
            </label>
            <input
              type="url"
              name="companyWebsite"
              value={formData.companyWebsite}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              style={{
                backgroundColor: themeStyles.input,
                borderColor: themeStyles.border,
                color: themeStyles.text
              }}
              placeholder="https://yourcompany.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: themeStyles.text }}>
              Application Link *
            </label>
            <input
              type="url"
              name="linkToApply"
              value={formData.linkToApply}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              style={{
                backgroundColor: themeStyles.input,
                borderColor: themeStyles.border,
                color: themeStyles.text
              }}
              placeholder="https://apply.yourcompany.com"
              required
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: themeStyles.text }}>
              Location
            </label>
            <input
              type="text"
              name="location"
              value={formData.location}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              style={{
                backgroundColor: themeStyles.input,
                borderColor: themeStyles.border,
                color: themeStyles.text
              }}
              placeholder="e.g., San Francisco, CA"
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1" style={{ color: themeStyles.text }}>
              Job Type
            </label>
            <select
              name="jobType"
              value={formData.jobType}
              onChange={handleInputChange}
              className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
              style={{
                backgroundColor: themeStyles.input,
                borderColor: themeStyles.border,
                color: themeStyles.text
              }}
            >
              <option value="">Select Type</option>
              <option value="Full-time">Full-time</option>
              <option value="Part-time">Part-time</option>
              <option value="Contract">Contract</option>
              <option value="Freelance">Freelance</option>
              <option value="Internship">Internship</option>
            </select>
          </div>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: themeStyles.text }}>
            Categories *
          </label>
          <input
            type="text"
            name="categories"
            value={formData.categories}
            onChange={handleInputChange}
            className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            style={{
              backgroundColor: themeStyles.input,
              borderColor: themeStyles.border,
              color: themeStyles.text
            }}
            placeholder="e.g., Technology, Frontend, React"
            required
          />
        </div>

        <div>
          <label className="block text-sm font-medium mb-1" style={{ color: themeStyles.text }}>
            Job Description
          </label>
          <textarea
            name="description"
            value={formData.description}
            onChange={handleInputChange}
            rows={3}
            className="w-full px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            style={{
              backgroundColor: themeStyles.input,
              borderColor: themeStyles.border,
              color: themeStyles.text
            }}
            placeholder="Brief description of the role..."
          />
        </div>

        <button
          type="submit"
          disabled={loading}
          className="w-full px-4 py-3 text-sm font-medium text-white rounded hover:opacity-90 transition-opacity disabled:opacity-50"
          style={{
            backgroundColor: themeStyles.button
          }}
        >
          {loading ? 'Posting Job...' : 'Post Job'}
        </button>
      </form>

      {/* Footer */}
      <div className="mt-6 pt-4 border-t text-center" style={{ borderColor: themeStyles.border }}>
        <a 
          href="/" 
          target="_blank" 
          rel="noopener noreferrer"
          className="text-xs hover:underline"
          style={{ color: '#059669' }}
        >
          View all jobs on GetGetHired →
        </a>
      </div>
    </div>
  );
};

export default function EmbedJobPostPage({ searchParams }) {
  return (
    <html>
      <head>
        <title>Job Posting Widget</title>
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <style>{`
          * {
            margin: 0;
            padding: 0;
            box-sizing: border-box;
          }
          body {
            font-family: Inter, system-ui, -apple-system, sans-serif;
            line-height: 1.5;
          }
        `}</style>
      </head>
      <body>
        <EmbeddableJobPostForm searchParams={searchParams} />
      </body>
    </html>
  );
}
