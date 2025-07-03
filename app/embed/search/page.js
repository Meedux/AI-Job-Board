'use client';

import { useState } from 'react';

const EmbeddableJobSearch = ({ searchParams }) => {
  const [searchTerm, setSearchTerm] = useState('');
  const [location, setLocation] = useState('');

  // Extract embed configuration from URL params
  const config = {
    theme: searchParams.theme || 'light',
    showLogo: searchParams.showLogo !== 'false',
    redirectUrl: searchParams.redirectUrl || '/',
    placeholder: searchParams.placeholder || 'Search for jobs...',
    locationPlaceholder: searchParams.locationPlaceholder || 'Location...',
    buttonText: searchParams.buttonText || 'Search Jobs',
    width: searchParams.width || '100%',
    height: parseInt(searchParams.height) || 120
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

  const handleSearch = (e) => {
    e.preventDefault();
    
    const params = new URLSearchParams();
    if (searchTerm) params.append('search', searchTerm);
    if (location) params.append('location', location);
    
    const targetUrl = `${config.redirectUrl}${params.toString() ? '?' + params.toString() : ''}`;
    window.open(targetUrl, '_blank', 'noopener,noreferrer');
  };

  return (
    <div 
      className="p-4"
      style={{ 
        backgroundColor: themeStyles.background,
        color: themeStyles.text,
        width: config.width,
        height: `${config.height}px`,
        fontFamily: 'Inter, system-ui, -apple-system, sans-serif',
        border: `1px solid ${themeStyles.border}`,
        borderRadius: '8px'
      }}
    >
      {/* Header */}
      {config.showLogo && (
        <div className="mb-4 text-center">
          <h3 className="text-sm font-semibold" style={{ color: themeStyles.text }}>
            Find Your Next Job
          </h3>
          <p className="text-xs mt-1" style={{ color: themeStyles.textSecondary }}>
            Powered by GetGetHired
          </p>
        </div>
      )}

      {/* Search Form */}
      <form onSubmit={handleSearch} className="space-y-3">
        <div className="flex flex-col sm:flex-row gap-2">
          <input
            type="text"
            placeholder={config.placeholder}
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            style={{
              backgroundColor: themeStyles.input,
              borderColor: themeStyles.border,
              color: themeStyles.text
            }}
          />
          <input
            type="text"
            placeholder={config.locationPlaceholder}
            value={location}
            onChange={(e) => setLocation(e.target.value)}
            className="flex-1 px-3 py-2 text-sm border rounded focus:outline-none focus:ring-2 focus:ring-green-500"
            style={{
              backgroundColor: themeStyles.input,
              borderColor: themeStyles.border,
              color: themeStyles.text
            }}
          />
        </div>
        
        <button
          type="submit"
          className="w-full px-4 py-2 text-sm font-medium text-white rounded hover:opacity-90 transition-opacity"
          style={{
            backgroundColor: themeStyles.button
          }}
          onMouseEnter={(e) => {
            e.target.style.backgroundColor = themeStyles.buttonHover;
          }}
          onMouseLeave={(e) => {
            e.target.style.backgroundColor = themeStyles.button;
          }}
        >
          {config.buttonText}
        </button>
      </form>
    </div>
  );
};

export default function EmbedSearchPage({ searchParams }) {
  return (
    <html>
      <head>
        <title>Job Search Widget</title>
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
            background: transparent;
            display: flex;
            align-items: center;
            justify-content: center;
            min-height: 100vh;
          }
        `}</style>
      </head>
      <body>
        <EmbeddableJobSearch searchParams={searchParams} />
      </body>
    </html>
  );
}
