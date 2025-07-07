'use client';

import JobCard from './JobCard';
import { colors, typography, components, animations, combineClasses } from '../utils/designSystem';

const JobListing = ({ jobs = [], loading = false, error = null }) => {
  if (loading) {
    return (
      <div className={combineClasses(
        'space-y-3 sm:space-y-4'
      )}>
        {/* Loading skeleton - Mobile Optimized */}
        {[...Array(5)].map((_, index) => (
          <div key={index} className={animations.pulse}>
            <div className={combineClasses(
              components.card.base,
              components.card.padding,
              'sm:p-6'
            )}>
              <div className="flex flex-col sm:flex-row sm:items-start space-y-3 sm:space-y-0 sm:space-x-4">
                <div className={combineClasses(
                  'w-12 h-12 sm:w-16 sm:h-16',
                  colors.neutral.backgroundSecondary,
                  'rounded-lg mx-auto sm:mx-0'
                )}></div>
                <div className="flex-1 space-y-2">
                  <div className={combineClasses(
                    'h-4 rounded w-3/4',
                    colors.neutral.backgroundSecondary
                  )}></div>
                  <div className={combineClasses(
                    'h-3 rounded w-1/2',
                    colors.neutral.backgroundSecondary
                  )}></div>
                  <div className={combineClasses(
                    'h-3 rounded w-2/3',
                    colors.neutral.backgroundSecondary
                  )}></div>
                </div>
              </div>
            </div>
          </div>
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-center py-12">
        <div className={combineClasses(colors.error.text, 'mb-4')}>
          <svg className="w-16 h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <h3 className={combineClasses(typography.h4, colors.neutral.textPrimary, 'mb-2')}>
            Error loading jobs
          </h3>
          <p className={combineClasses(typography.bodySmall, colors.neutral.textSecondary)}>
            {error}
          </p>
        </div>
      </div>
    );
  }

  if (!jobs || jobs.length === 0) {
    return (
      <div className="text-center py-8 sm:py-12 px-4">
        <div className={combineClasses(colors.neutral.textTertiary, 'mb-4')}>
          <svg className="w-12 h-12 sm:w-16 sm:h-16 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
          </svg>
          <h3 className={combineClasses(typography.h4, colors.neutral.textPrimary, 'mb-2')}>
            No jobs found
          </h3>
          <p className={combineClasses(typography.bodySmall, colors.neutral.textSecondary, 'max-w-sm mx-auto')}>
            Try adjusting your search criteria or check back later for new opportunities.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 sm:gap-4">
      {jobs.map((job, index) => (
        <JobCard 
          key={`job-${index}`} 
          job={job} 
        />
      ))}
    </div>
  );
};

export default JobListing;
