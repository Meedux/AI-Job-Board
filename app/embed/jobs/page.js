'use client';

import { useState, useEffect } from 'react';
import { colors, typography, components } from '../../../utils/designSystem';

const EmbeddableJobList = ({ searchParams }) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Extract embed configuration from URL params
  const config = {
    limit: parseInt(searchParams.limit) || 5,
    category: searchParams.category || '',
    location: searchParams.location || '',
    theme: searchParams.theme || 'light',
    showLogo: searchParams.showLogo !== 'false',
    height: parseInt(searchParams.height) || 400,
    search: searchParams.search || ''
  };

  useEffect(() => {
    const fetchJobs = async () => {
      try {
        const params = new URLSearchParams({
          limit: config.limit.toString(),
          ...(config.category && { category: config.category }),
          ...(config.location && { location: config.location }),
          ...(config.search && { search: config.search })
        });

        const response = await fetch(`/api/jobs?${params}`);
        if (response.ok) {
          const data = await response.json();
          setJobs(data.jobs || []);
        } else {
          setError('Failed to load jobs');
        }
      } catch (err) {
        setError('Error loading jobs');
        console.error('Error fetching jobs:', err);
      } finally {
        setLoading(false);
      }
    };

    fetchJobs();
  }, [config.limit, config.category, config.location, config.search]);

  const themeStyles = config.theme === 'dark' ? {
    background: '#1f2937',
    text: '#f9fafb',
    textSecondary: '#d1d5db',
    border: '#374151',
    hover: '#374151'
  } : {
    background: '#ffffff',
    text: '#111827',
    textSecondary: '#6b7280',
    border: '#e5e7eb',
    hover: '#f9fafb'
  };

  if (loading) {
    return (
      <div 
        className="flex items-center justify-center p-8"
        style={{ 
          backgroundColor: themeStyles.background,
          color: themeStyles.text,
          height: `${config.height}px`,
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
        }}
      >
        <div className="animate-spin rounded-full h-8 w-8 border-b-2" style={{ borderColor: themeStyles.text }}></div>
      </div>
    );
  }

  if (error) {
    return (
      <div 
        className="flex items-center justify-center p-8"
        style={{ 
          backgroundColor: themeStyles.background,
          color: themeStyles.text,
          height: `${config.height}px`,
          fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
        }}
      >
        <p style={{ color: '#ef4444' }}>Error: {error}</p>
      </div>
    );
  }

  return (
    <div 
      className="h-full overflow-auto"
      style={{ 
        backgroundColor: themeStyles.background,
        color: themeStyles.text,
        height: `${config.height}px`,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif'
      }}
    >
      {/* Header */}
      {config.showLogo && (
        <div className="border-b p-4" style={{ borderColor: themeStyles.border }}>
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold" style={{ color: themeStyles.text }}>
              Latest Jobs
            </h2>
            <a 
              href="/" 
              target="_blank" 
              rel="noopener noreferrer"
              className="text-sm hover:underline"
              style={{ color: '#059669' }}
            >
              Powered by GetGetHired
            </a>
          </div>
          {(config.category || config.location) && (
            <div className="mt-2 text-sm" style={{ color: themeStyles.textSecondary }}>
              {config.category && <span>Category: {config.category}</span>}
              {config.category && config.location && <span> • </span>}
              {config.location && <span>Location: {config.location}</span>}
            </div>
          )}
        </div>
      )}

      {/* Job List */}
      <div className="divide-y" style={{ borderColor: themeStyles.border }}>
        {jobs.length === 0 ? (
          <div className="p-8 text-center">
            <p style={{ color: themeStyles.textSecondary }}>No jobs found</p>
          </div>
        ) : (
          jobs.map((job, index) => (
            <div 
              key={index}
              className="p-4 hover:bg-opacity-50 transition-colors cursor-pointer"
              style={{ 
                backgroundColor: 'transparent',
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.backgroundColor = themeStyles.hover;
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.backgroundColor = 'transparent';
              }}
              onClick={() => {
                if (job.linkToApply) {
                  window.open(job.linkToApply, '_blank', 'noopener,noreferrer');
                }
              }}
            >
              <div className="flex justify-between items-start">
                <div className="flex-1">
                  <h3 className="font-medium text-sm mb-1" style={{ color: themeStyles.text }}>
                    {job.jobTitle || 'Job Title'}
                  </h3>
                  <p className="text-sm mb-2" style={{ color: themeStyles.textSecondary }}>
                    {job.companyName || 'Company Name'}
                  </p>
                  {job.location && (
                    <p className="text-xs" style={{ color: themeStyles.textSecondary }}>
                      📍 {job.location}
                    </p>
                  )}
                  {job.jobType && (
                    <span 
                      className="inline-block px-2 py-1 text-xs rounded mt-2"
                      style={{ 
                        backgroundColor: themeStyles.border,
                        color: themeStyles.text
                      }}
                    >
                      {job.jobType}
                    </span>
                  )}
                </div>
                <div className="text-xs" style={{ color: themeStyles.textSecondary }}>
                  {job.datePosted ? new Date(job.datePosted).toLocaleDateString() : 'Recently'}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Footer */}
      <div className="border-t p-3 text-center" style={{ borderColor: themeStyles.border }}>
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

export default function EmbedJobsPage({ searchParams }) {
  return (
    <html>
      <head>
        <title>Job Listings Widget</title>
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
        <EmbeddableJobList searchParams={searchParams} />
      </body>
    </html>
  );
}
