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

  // CVViz embed script
  useEffect(() => {
    const script = document.createElement('script');
    script.type = 'text/javascript';
    script.innerHTML = `
      window.addEventListener('message', receiveMessage, false);
      function receiveMessage(evt) {
        if (evt.origin !== "https://jobs.cvviz.com") {
          return;
        }
        if (evt.data.type === "frame-resized") {
          document.getElementById("cvviz-ifrm").style.height = evt.data.value + "px";
        }
      }
    `;
    document.head.appendChild(script);

    return () => {
      document.head.removeChild(script);
    };
  }, []);

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
          
          {/* Results Summary - Enhanced */}
          {showContent && (
            <div className="mb-6 p-4 bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
                  <span className="text-gray-300 font-medium">
                    {total > 0 ? (
                      <>
                        <span className="text-white font-semibold">{jobs.length}</span> of{' '}
                        <span className="text-blue-400 font-semibold">{total}</span> jobs found
                      </>
                    ) : (
                      'No jobs found'
                    )}
                  </span>
                </div>
                {filters.search && (
                  <div className="flex items-center gap-2 text-sm">
                    <svg className="w-4 h-4 text-gray-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M8 4a4 4 0 100 8 4 4 0 000-8zM2 8a6 6 0 1110.89 3.476l4.817 4.817a1 1 0 01-1.414 1.414l-4.816-4.816A6 6 0 012 8z" clipRule="evenodd" />
                    </svg>
                    <span className="text-gray-400">
                      Searching for <span className="text-blue-400 font-medium">"{filters.search}"</span>
                    </span>
                  </div>
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

          {/* Load More Button - Enhanced */}
          {hasResults && jobs.length < total && (
            <div className="text-center mb-12">
              <button 
                onClick={() => setFilters(prev => ({ ...prev, limit: prev.limit + 20 }))}
                className="inline-flex items-center gap-2 px-6 py-3 bg-blue-600/90 hover:bg-blue-600 text-white rounded-xl transition-all duration-200 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100"
                disabled={loading}
              >
                {loading ? (
                  <>
                    <svg className="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Loading...
                  </>
                ) : (
                  <>
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 3a1 1 0 011 1v5h5a1 1 0 110 2h-5v5a1 1 0 11-2 0v-5H4a1 1 0 110-2h5V4a1 1 0 011-1z" clipRule="evenodd" />
                    </svg>
                    Load More Jobs
                  </>
                )}
              </button>
              <p className="text-gray-400 text-sm mt-2">
                Showing {jobs.length} of {total} available positions
              </p>
            </div>
          )}

          {/* Section Divider */}
          <div className="mb-8 flex items-center">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent"></div>
            <div className="px-4">
              <span className="inline-flex items-center gap-2 px-4 py-2 bg-gray-800/50 text-gray-300 rounded-full text-sm font-medium border border-gray-700/50">
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 011 1v2a1 1 0 01-1 1H4a1 1 0 01-1-1V4zm0 4a1 1 0 011-1h12a1 1 0 011 1v6a1 1 0 01-1 1H4a1 1 0 01-1-1V8z" clipRule="evenodd" />
                </svg>
                More Job Opportunities
              </span>
            </div>
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gray-700/50 to-transparent"></div>
          </div>

          {/* CVViz Embedded Jobs */}
          <div className="mb-8">
            <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-lg overflow-hidden">
              <div className="p-1">
                <iframe 
                  id="cvviz-ifrm"
                  src="https://jobs.cvviz.com/getgethired.com"
                  width="100%"
                  height="400"
                  frameBorder="0"
                  scrolling="auto"
                  title="CVViz Job Listings"
                  className="w-full rounded-lg"
                  style={{
                    minHeight: '400px',
                    border: 'none',
                    backgroundColor: 'transparent'
                  }}
                />
              </div>
            </div>
          </div>
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