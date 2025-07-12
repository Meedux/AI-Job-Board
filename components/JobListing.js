'use client';

import JobCard from './JobCard';

const JobListing = ({ jobs = [], loading = false, error = null }) => {
  if (loading) {
    return (
      <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-lg overflow-hidden">
        <div className="divide-y divide-gray-700/30">
          {[...Array(8)].map((_, index) => (
            <div key={index} className="p-4 sm:p-5">
              <div className="flex items-center gap-4 animate-pulse">
                <div className="w-12 h-12 bg-gray-700/50 rounded-xl"></div>
                <div className="flex-1 space-y-3">
                  <div className="h-5 bg-gray-700/50 rounded-lg w-3/4"></div>
                  <div className="h-4 bg-gray-700/50 rounded-lg w-1/2"></div>
                  <div className="flex items-center gap-2">
                    <div className="h-3 bg-gray-700/50 rounded-full w-16"></div>
                    <div className="h-3 bg-gray-700/50 rounded-full w-12"></div>
                    <div className="h-3 bg-gray-700/50 rounded-full w-14"></div>
                  </div>
                </div>
                <div className="h-8 bg-gray-700/50 rounded-lg w-24"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="bg-gray-800/40 backdrop-blur-sm border border-red-500/30 rounded-xl shadow-lg overflow-hidden">
        <div className="text-center py-12 px-6">
          <div className="text-red-400 mb-4">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
            <h3 className="text-white font-semibold text-lg mb-2">Unable to Load Jobs</h3>
            <p className="text-red-300 text-sm">{error}</p>
            <button 
              onClick={() => window.location.reload()}
              className="mt-4 inline-flex items-center gap-2 px-4 py-2 bg-red-600/90 hover:bg-red-600 text-white rounded-lg transition-all duration-200 hover:scale-105"
            >
              <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                <path fillRule="evenodd" d="M4 2a1 1 0 011 1v2.101a7.002 7.002 0 0111.601 2.566 1 1 0 11-1.885.666A5.002 5.002 0 005.999 7H9a1 1 0 010 2H4a1 1 0 01-1-1V3a1 1 0 011-1zm.008 9.057a1 1 0 011.276.61A5.002 5.002 0 0014.001 13H11a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0v-2.101a7.002 7.002 0 01-11.601-2.566 1 1 0 01.61-1.276z" clipRule="evenodd" />
              </svg>
              Try Again
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-lg overflow-hidden">
        <div className="text-center py-12 px-6">
          <div className="text-gray-500 mb-4">
            <svg className="w-12 h-12 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <h3 className="text-white font-semibold text-lg mb-2">No Jobs Found</h3>
            <p className="text-gray-400 text-sm">Try adjusting your search criteria or check back later for new opportunities.</p>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 rounded-xl shadow-lg overflow-hidden">
      <div className="divide-y divide-gray-700/30">
        {jobs.map((job, index) => (
          <JobCard 
            key={`job-${index}`} 
            job={job} 
          />
        ))}
      </div>
    </div>
  );
};

export default JobListing;
