'use client';

import { useState, useEffect, useMemo } from 'react';
import Header from '../components/Header';
import Hero from '../components/Hero';
import SearchFilters from '../components/SearchFilters';
import JobListing from '../components/JobListing';
import EmailSubscription from '../components/EmailSubscription';
import Footer from '../components/Footer';
import { JobListingSkeleton, SearchResultsSkeleton } from '../components/SkeletonLoaders';
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

  const { jobs, loading, error, total, initialLoad } = useJobs(filters);

  // Memoize handlers to prevent unnecessary re-renders
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

  // Optimized loading states
  const showSkeleton = initialLoad || (loading && jobs.length === 0);
  const showContent = !showSkeleton && !error;
  const hasResults = showContent && jobs.length > 0;

  return (
    <div className={`min-h-screen ${colors.neutral.background} font-sans`}>
      <Header />
      
      <main className="relative">
        {/* Enhanced Hero Section */}
        <div className="relative overflow-hidden">
          {/* Background Elements */}
          <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-gray-900 to-purple-900/10">
            <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
          </div>
          
          <div className="relative z-10">
            <Hero />
          </div>
        </div>
        
        {/* Main Content with Floating Design */}
        <div className={`${layout.container} relative -mt-8 z-20`}>
          {/* Floating Search Card */}
          <div className="relative mb-8">
            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-2xl"></div>
            <div className="relative p-6 sm:p-8 rounded-3xl bg-gradient-to-br from-gray-800/90 to-gray-900/90 backdrop-blur-xl border border-gray-700/50 shadow-2xl">
              <SearchFilters onSearch={handleSearch} onFilter={handleFilter} />
            </div>
          </div>
          
          {/* Results Summary with Enhanced Design */}
          {showSkeleton ? (
            <div className="mb-6 px-1 sm:px-0">
              <div className="p-4 bg-gray-800/50 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
                <SearchResultsSkeleton />
              </div>
            </div>
          ) : showContent && (
            <div className="mb-6 px-1 sm:px-0">
              <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4 p-4 sm:p-6 bg-gradient-to-r from-gray-800/50 to-gray-900/50 rounded-2xl border border-gray-700/50 backdrop-blur-sm">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-blue-900/30 rounded-xl flex items-center justify-center">
                    <svg className="h-5 w-5 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                    </svg>
                  </div>
                  <div>
                    <p className="text-sm sm:text-base font-semibold text-gray-200">
                      {total > 0 ? `${jobs.length} of ${total} jobs found` : 'No jobs found'}
                    </p>
                    <p className="text-xs text-gray-400">
                      {total > 0 ? 'Updated moments ago' : 'Try different search criteria'}
                    </p>
                  </div>
                </div>
                {filters.search && (
                  <div className="flex items-center space-x-2 px-3 py-2 bg-gray-700/50 rounded-xl">
                    <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                    </svg>
                    <span className="text-sm text-gray-300 truncate max-w-[200px]">
                      &quot;{filters.search}&quot;
                    </span>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* Main Grid Layout */}
          <div className="grid grid-cols-1 xl:grid-cols-4 gap-6 lg:gap-8">
            {/* Job Listings - Takes 3 columns */}
            <div className="xl:col-span-3 order-2 xl:order-1">
              {showSkeleton ? (
                <div className="space-y-6">
                  {[...Array(4)].map((_, index) => (
                    <div key={index} className="relative">
                      <div className="absolute -inset-2 bg-gradient-to-r from-gray-600/10 to-gray-500/10 rounded-2xl blur-xl"></div>
                      <div className="relative p-6 bg-gray-800/50 rounded-2xl border border-gray-700/50">
                        <JobListingSkeleton count={1} />
                      </div>
                    </div>
                  ))}
                </div>
              ) : error ? (
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-red-600/10 to-orange-600/10 rounded-3xl blur-2xl"></div>
                  <div className="relative text-center py-16 px-6 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-3xl border border-gray-700/50 backdrop-blur-xl">
                    <div className="w-16 h-16 mx-auto mb-6 bg-red-900/30 rounded-2xl flex items-center justify-center">
                      <svg className="w-8 h-8 text-red-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-200 mb-3">Unable to Load Jobs</h3>
                    <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">{error}</p>
                    <button 
                      onClick={() => window.location.reload()}
                      className="px-6 py-3 bg-gradient-to-r from-red-600 to-orange-600 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-red-500/25 transition-all duration-300 transform hover:scale-105"
                    >
                      Try Again
                    </button>
                  </div>
                </div>
              ) : !hasResults ? (
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-gray-600/10 to-gray-500/10 rounded-3xl blur-2xl"></div>
                  <div className="relative text-center py-16 px-6 bg-gradient-to-br from-gray-800/80 to-gray-900/80 rounded-3xl border border-gray-700/50 backdrop-blur-xl">
                    <div className="w-16 h-16 mx-auto mb-6 bg-gray-700/50 rounded-2xl flex items-center justify-center">
                      <svg className="w-8 h-8 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-semibold text-gray-200 mb-3">No Jobs Found</h3>
                    <p className="text-sm text-gray-400 mb-6 max-w-md mx-auto">
                      We couldn&apos;t find any jobs matching your criteria. Try adjusting your search or filters.
                    </p>
                    <button 
                      onClick={() => setFilters({
                        search: '',
                        location: '',
                        type: '',
                        level: '',
                        category: '',
                        remote: false,
                        limit: 20
                      })}
                      className="px-6 py-3 bg-gradient-to-r from-gray-600 to-gray-700 text-white rounded-xl font-medium hover:shadow-lg hover:shadow-gray-500/25 transition-all duration-300 transform hover:scale-105"
                    >
                      Clear All Filters
                    </button>
                  </div>
                </div>
              ) : (
                <div className="relative">
                  <JobListing jobs={jobs} />
                  {loading && (
                    <div className="absolute inset-0 bg-gray-900/50 backdrop-blur-sm flex items-center justify-center rounded-2xl">
                      <div className="relative">
                        <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-xl"></div>
                        <div className="relative animate-spin rounded-full h-12 w-12 border-4 border-gray-700 border-t-blue-600"></div>
                      </div>
                    </div>
                  )}
                </div>
              )}
            </div>
            
            {/* Enhanced Sidebar - Takes 1 column */}
            <div className="xl:col-span-1 order-1 xl:order-2 space-y-6">
              {/* Mobile Email Subscription */}
              <div className="xl:hidden">
                <div className="relative">
                  <div className="absolute -inset-3 bg-gradient-to-r from-pink-600/20 to-purple-600/20 rounded-2xl blur-xl"></div>
                  <div className="relative">
                    <EmailSubscription />
                  </div>
                </div>
              </div>
              
              {/* Enhanced Quick Filters */}
              {hasResults && (
                <div className="relative">
                  <div className="absolute -inset-3 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl blur-xl"></div>
                  <div className="relative p-6 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-xl">
                    <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-700/50">
                      <div className="w-10 h-10 bg-gradient-to-br from-blue-600 to-purple-600 rounded-xl flex items-center justify-center">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M12 6V4m0 2a2 2 0 100 4m0-4a2 2 0 110 4m-6 8a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4m6 6v10m6-2a2 2 0 100-4m0 4a2 2 0 100 4m0-4v2m0-6V4" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-gray-100">
                        Quick Filters
                      </h3>
                    </div>
                    <div className="space-y-3">
                      <button
                        onClick={() => handleFilter({ remote: !filters.remote })}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all duration-300 ${
                          filters.remote 
                            ? 'bg-gradient-to-r from-green-600/20 to-emerald-600/20 border-green-500/50 text-green-300 shadow-lg shadow-green-500/10' 
                            : 'bg-gray-800/50 border-gray-600/50 text-gray-300 hover:bg-gray-700/50 hover:border-gray-500/50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">🌐</span>
                          <span className="font-medium">Remote Work</span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 ${
                          filters.remote ? 'bg-green-500 border-green-500' : 'border-gray-500'
                        }`}>
                          {filters.remote && (
                            <svg className="w-3 h-3 text-white m-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </button>
                      
                      <button
                        onClick={() => handleFilter({ type: filters.type === 'full-time' ? '' : 'full-time' })}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all duration-300 ${
                          filters.type === 'full-time'
                            ? 'bg-gradient-to-r from-blue-600/20 to-indigo-600/20 border-blue-500/50 text-blue-300 shadow-lg shadow-blue-500/10' 
                            : 'bg-gray-800/50 border-gray-600/50 text-gray-300 hover:bg-gray-700/50 hover:border-gray-500/50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">⏰</span>
                          <span className="font-medium">Full-time</span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 ${
                          filters.type === 'full-time' ? 'bg-blue-500 border-blue-500' : 'border-gray-500'
                        }`}>
                          {filters.type === 'full-time' && (
                            <svg className="w-3 h-3 text-white m-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </button>
                      
                      <button
                        onClick={() => handleFilter({ level: filters.level === 'senior' ? '' : 'senior' })}
                        className={`w-full flex items-center justify-between p-3 rounded-xl border-2 transition-all duration-300 ${
                          filters.level === 'senior'
                            ? 'bg-gradient-to-r from-purple-600/20 to-pink-600/20 border-purple-500/50 text-purple-300 shadow-lg shadow-purple-500/10' 
                            : 'bg-gray-800/50 border-gray-600/50 text-gray-300 hover:bg-gray-700/50 hover:border-gray-500/50'
                        }`}
                      >
                        <div className="flex items-center space-x-3">
                          <span className="text-lg">🎯</span>
                          <span className="font-medium">Senior Level</span>
                        </div>
                        <div className={`w-5 h-5 rounded-full border-2 ${
                          filters.level === 'senior' ? 'bg-purple-500 border-purple-500' : 'border-gray-500'
                        }`}>
                          {filters.level === 'senior' && (
                            <svg className="w-3 h-3 text-white m-0.5" fill="currentColor" viewBox="0 0 20 20">
                              <path fillRule="evenodd" d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z" clipRule="evenodd" />
                            </svg>
                          )}
                        </div>
                      </button>
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Stats Card */}
              {showContent && (
                <div className="relative">
                  <div className="absolute -inset-3 bg-gradient-to-r from-emerald-600/10 to-teal-600/10 rounded-2xl blur-xl"></div>
                  <div className="relative p-6 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-xl">
                    <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-700/50">
                      <div className="w-10 h-10 bg-gradient-to-br from-emerald-600 to-teal-600 rounded-xl flex items-center justify-center">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                        </svg>
                      </div>
                      <h3 className="text-lg font-bold text-gray-100">
                        Statistics
                      </h3>
                    </div>
                    <div className="space-y-4">
                      <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-blue-900/30 rounded-lg flex items-center justify-center">
                            <svg className="h-4 w-4 text-blue-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-gray-300">Total Jobs</span>
                        </div>
                        <span className="text-lg font-bold text-blue-400">{total.toLocaleString()}</span>
                      </div>
                      
                      <div className="flex items-center justify-between p-3 bg-gray-800/50 rounded-xl">
                        <div className="flex items-center space-x-3">
                          <div className="w-8 h-8 bg-green-900/30 rounded-lg flex items-center justify-center">
                            <svg className="h-4 w-4 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                            </svg>
                          </div>
                          <span className="text-sm font-medium text-gray-300">Showing</span>
                        </div>
                        <span className="text-lg font-bold text-green-400">{jobs.length}</span>
                      </div>
                      
                      {filters.search && (
                        <div className="p-3 bg-yellow-900/20 border border-yellow-800/50 rounded-xl">
                          <div className="flex items-center space-x-2 mb-2">
                            <svg className="h-4 w-4 text-yellow-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                            </svg>
                            <span className="text-sm font-medium text-yellow-400">Active Search</span>
                          </div>
                          <p className="text-xs text-yellow-300 truncate" title={filters.search}>
                            {filters.search}
                          </p>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              )}

              {/* Enhanced Job Search Tips - Desktop Only */}
              <div className="hidden xl:block relative">
                <div className="absolute -inset-3 bg-gradient-to-r from-indigo-600/10 to-purple-600/10 rounded-2xl blur-xl"></div>
                <div className="relative p-6 bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 rounded-2xl shadow-xl">
                  <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-700/50">
                    <div className="w-10 h-10 bg-gradient-to-br from-indigo-600 to-purple-600 rounded-xl flex items-center justify-center">
                      <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
                      </svg>
                    </div>
                    <h3 className="text-lg font-bold text-gray-100">
                      Pro Tips
                    </h3>
                  </div>
                  <div className="space-y-4">
                    {[
                      { icon: "🔍", text: "Use specific keywords for better results", color: "blue" },
                      { icon: "🔔", text: "Set up job alerts for instant notifications", color: "green" },
                      { icon: "📝", text: "Keep your profile updated regularly", color: "purple" },
                      { icon: "⚡", text: "Apply within 24 hours for best chances", color: "orange" }
                    ].map((tip, index) => (
                      <div key={index} className="flex items-start space-x-3 p-3 bg-gray-800/30 rounded-xl hover:bg-gray-700/30 transition-colors duration-200">
                        <span className="text-lg">{tip.icon}</span>
                        <p className="text-sm text-gray-300 leading-relaxed">{tip.text}</p>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Desktop Email Subscription */}
              <div className="hidden xl:block relative">
                <div className="absolute -inset-3 bg-gradient-to-r from-pink-600/20 to-purple-600/20 rounded-2xl blur-xl"></div>
                <div className="relative">
                  <EmailSubscription />
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
      
      <Footer />
    </div>
  );
}