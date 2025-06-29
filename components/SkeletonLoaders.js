// Skeleton loader components for better loading experience - Mobile Optimized
export const JobCardSkeleton = () => (
  <div className="bg-gray-800 border border-gray-700 rounded-lg p-4 sm:p-6 animate-pulse">
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start mb-3 sm:mb-4">
      <div className="flex-1 mb-3 sm:mb-0">
        <div className="h-5 sm:h-6 bg-gray-700 rounded w-3/4 mb-2"></div>
        <div className="h-3 sm:h-4 bg-gray-700 rounded w-1/2"></div>
      </div>
      <div className="h-12 w-12 sm:h-16 sm:w-16 bg-gray-700 rounded"></div>
    </div>
    
    <div className="space-y-2 sm:space-y-3 mb-3 sm:mb-4">
      <div className="h-3 sm:h-4 bg-gray-700 rounded w-full"></div>
      <div className="h-3 sm:h-4 bg-gray-700 rounded w-5/6"></div>
      <div className="h-3 sm:h-4 bg-gray-700 rounded w-4/6"></div>
    </div>
    
    <div className="flex flex-wrap gap-1.5 sm:gap-2 mb-3 sm:mb-4">
      <div className="h-5 sm:h-6 bg-gray-700 rounded-full w-12 sm:w-16"></div>
      <div className="h-5 sm:h-6 bg-gray-700 rounded-full w-16 sm:w-20"></div>
      <div className="h-5 sm:h-6 bg-gray-700 rounded-full w-10 sm:w-14"></div>
    </div>
    
    <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2">
      <div className="h-3 sm:h-4 bg-gray-700 rounded w-20 sm:w-24"></div>
      <div className="h-7 sm:h-8 bg-gray-700 rounded w-full sm:w-20"></div>
    </div>
  </div>
);

export const JobListingSkeleton = ({ count = 4 }) => (
  <div className="space-y-4 sm:space-y-6">
    {Array.from({ length: count }).map((_, index) => (
      <JobCardSkeleton key={index} />
    ))}
  </div>
);

export const SearchResultsSkeleton = () => (
  <div className="flex flex-col sm:flex-row sm:justify-between sm:items-center gap-2 text-xs sm:text-sm">
    <div className="h-3 sm:h-4 bg-gray-700 rounded w-24 sm:w-32 animate-pulse"></div>
    <div className="h-3 sm:h-4 bg-gray-700 rounded w-32 sm:w-48 animate-pulse"></div>
  </div>
);
