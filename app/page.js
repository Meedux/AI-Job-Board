'use client';

import { useState, useEffect } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import SearchFilters from '../components/SearchFilters';
import JobListing from '../components/JobListing';
import EmailSubscription from '../components/EmailSubscription';
import Footer from '../components/Footer';
import { colors, typography, components, layout, spacing, gradients } from '../utils/designSystem';
import { useJobs } from '../utils/jobsApi';

export default function Home() {
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    type: '',
    level: '',
    category: '',
    remote: false,
    limit: 20
  });

  const { jobs, loading, error, total } = useJobs(filters);

  const handleSearch = (searchParams) => {
    setFilters(prev => ({
      ...prev,
      search: searchParams.search || '',
      location: searchParams.location || '',
      type: searchParams.type || '',
      level: searchParams.level || '',
      category: searchParams.category || '',
      remote: searchParams.remote || false
    }));
  };

  const handleFilter = (filterParams) => {
    setFilters(prev => ({
      ...prev,
      ...filterParams
    }));
  };

  return (
    <div className={`min-h-screen ${colors.neutral.background} font-sans`}>
      <Header />
      
      <main>
        <Hero />
        
        <div className={layout.container}>
          <SearchFilters onSearch={handleSearch} onFilter={handleFilter} />
          
          {/* Results Summary */}
          {!loading && (
            <div className="mt-6 flex justify-between items-center text-sm text-slate-600">
              <span>
                {total > 0 ? `Showing ${jobs.length} of ${total} jobs` : 'No jobs found'}
              </span>
              {filters.search && (
                <span>
                  Search results for &quot;{filters.search}&quot;
                </span>
              )}
            </div>
          )}
          
          <div className={`mt-6 ${layout.grid.sidebar}`}>
            {/* Job Listings */}
            <div className="col-span-12 lg:col-span-8">
              {loading ? (
                <div className="flex justify-center items-center py-20">
                  <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
                </div>
              ) : error ? (
                <div className="text-center py-20">
                  <div className="text-red-500 mb-4">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold">Error loading jobs</h3>
                    <p className="text-sm text-slate-500 mt-2">{error}</p>
                  </div>
                </div>
              ) : jobs.length === 0 ? (
                <div className="text-center py-20">
                  <div className="text-slate-400 mb-4">
                    <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <h3 className="text-lg font-semibold">No jobs found</h3>
                    <p className="text-sm text-slate-500 mt-2">Try adjusting your search criteria</p>
                  </div>
                </div>
              ) : (
                <JobListing jobs={jobs} />
              )}
            </div>
            
            {/* Sidebar */}
            <div className="col-span-12 lg:col-span-4">
              <div className="sticky top-6 space-y-6">
                <EmailSubscription />
                
                {/* Job Search Tips */}
                <div className={`${gradients.primaryLight} rounded-lg ${components.card.padding}`}>
                  <h3 className={`${typography.h5} ${colors.neutral.textPrimary} mb-3`}>
                    💡 Job Search Tips
                  </h3>
                  <ul className={`space-y-2 ${typography.bodySmall} ${colors.neutral.textTertiary}`}>
                    <li className="flex items-start space-x-2">
                      <span className={colors.primary.text}>•</span>
                      <span>Use specific keywords in your search</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className={colors.primary.text}>•</span>
                      <span>Set up job alerts for faster notifications</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className={colors.primary.text}>•</span>
                      <span>Update your profile regularly</span>
                    </li>
                    <li className="flex items-start space-x-2">
                      <span className={colors.primary.text}>•</span>
                      <span>Apply within 24 hours for best results</span>
                    </li>
                  </ul>
                </div>

                {/* Quick Filters */}
                {total > 0 && (
                  <div className={`${components.card.base} ${components.card.padding}`}>
                    <h3 className={`${typography.h5} ${colors.neutral.textPrimary} mb-3`}>
                      Quick Filters
                    </h3>
                    <div className="flex flex-wrap gap-2">
                      <button
                        onClick={() => handleFilter({ remote: !filters.remote })}
                        className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                          filters.remote 
                            ? 'bg-blue-100 text-blue-700 border-blue-300' 
                            : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        Remote Only
                      </button>
                      <button
                        onClick={() => handleFilter({ type: filters.type === 'full-time' ? '' : 'full-time' })}
                        className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                          filters.type === 'full-time'
                            ? 'bg-blue-100 text-blue-700 border-blue-300' 
                            : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        Full-time
                      </button>
                      <button
                        onClick={() => handleFilter({ level: filters.level === 'senior' ? '' : 'senior' })}
                        className={`px-3 py-1 rounded-full text-sm border transition-colors ${
                          filters.level === 'senior'
                            ? 'bg-blue-100 text-blue-700 border-blue-300' 
                            : 'bg-white text-slate-600 border-slate-300 hover:bg-slate-50'
                        }`}
                      >
                        Senior Level
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}