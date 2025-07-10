'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import SearchFilters from '../components/SearchFilters';
import JobListing from '../components/JobListing';
import EmailSubscription from '../components/EmailSubscription';
import Footer from '../components/Footer';
import { useJobs } from '../utils/jobsApi';

const Home = () => {
  const [filters, setFilters] = useState({
    search: '',
    location: '',
    type: '',
    level: '',
    category: '',
    remote: false,
    limit: 20
  });

  const { jobs, loading, error, total, initialLoad } = useJobs(filters);

  const handleSearch = useMemo(() => (searchParams) => {
    setFilters(prev => ({
      ...prev,
      search: searchParams.search || '',
      location: searchParams.location || '',
      type: searchParams.type || '',
      level: searchParams.level || '',
      category: searchParams.category || '',
      remote: searchParams.remote || false
    }));
  }, []);

  const handleFilter = useMemo(() => (filterParams) => {
    setFilters(prev => ({
      ...prev,
      ...filterParams
    }));
  }, []);

  const showSkeleton = initialLoad || (loading && jobs.length === 0);
  const showContent = !showSkeleton && !error;
  const hasResults = showContent && jobs.length > 0;

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      <Header />
      
      <main className="pt-16 lg:pt-0">
        <Hero />
        
        {/* Main Content - Compact */}
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
          
          {/* Search Filters */}
          <div className="mb-6">
            <SearchFilters onSearch={handleSearch} onFilter={handleFilter} />
          </div>
          
          {/* Results Summary - Compact */}
          {showContent && (
            <div className="mb-4 px-3 py-2 bg-gray-800/50 rounded border border-gray-700/50">
              <div className="flex items-center justify-between text-sm">
                <span className="text-gray-300">
                  {total > 0 ? `${jobs.length} of ${total} jobs found` : 'No jobs found'}
                </span>
                {filters.search && (
                  <span className="text-gray-400">
                    Searching for "{filters.search}"
                  </span>
                )}
              </div>
            </div>
          )}
          
          {/* Job Listings */}
          <div className="mb-8">
            {showSkeleton ? (
              <JobListing loading={true} />
            ) : error ? (
              <div className="text-center py-8 px-4 border border-red-500/20 rounded bg-red-500/5">
                <div className="text-red-400 mb-2">
                  <svg className="w-8 h-8 mx-auto mb-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <h3 className="text-white font-semibold">Unable to Load Jobs</h3>
                  <p className="text-red-300 text-sm mt-1">{error}</p>
                  <button 
                    onClick={() => window.location.reload()}
                    className="mt-3 px-4 py-2 bg-red-600 hover:bg-red-700 text-white rounded transition-colors"
                  >
                    Try Again
                  </button>
                </div>
              </div>
            ) : (
              <JobListing jobs={jobs} />
            )}
          </div>

          {/* Load More Button */}
          {hasResults && jobs.length < total && (
            <div className="text-center">
              <button 
                onClick={() => setFilters(prev => ({ ...prev, limit: prev.limit + 20 }))}
                className="px-6 py-2 bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
                disabled={loading}
              >
                {loading ? 'Loading...' : 'Load More Jobs'}
              </button>
            </div>
          )}
        </div>
        
        {/* Email Subscription - Compact */}
        <div className="bg-gray-800/50 border-t border-gray-700/50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            <EmailSubscription />
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}

export default Home;