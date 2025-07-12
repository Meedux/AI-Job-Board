'use client';

import { useState } from "react";
import Image from "next/image";
import JobDetailModal from "./JobDetailModal";
import {
  colors,
  typography,
  components,
  animations,
  combineClasses,
} from "../utils/designSystem";

const JobCard = ({ job }) => {
  const [isModalOpen, setIsModalOpen] = useState(false);
  
  const {
    title,
    company,
    company_name,
    company_logo,
    location,
    type,
    level,
    salary,
    posted_time,
    remote,
    categories,
    apply_link,
  } = job;

  // Format posted date
  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 0) return "Today";
      if (diffDays === 1) return "Yesterday";
      if (diffDays < 7) return `${diffDays}d ago`;
      if (diffDays < 30) return `${Math.floor(diffDays / 7)}w ago`;
      return `${Math.floor(diffDays / 30)}m ago`;
    } catch {
      return "Recently";
    }
  };

  // Format salary
  const formatSalary = (salaryData) => {
    if (!salaryData?.from && !salaryData?.to) return null;
    if (salaryData.from && salaryData.to) {
      return `$${salaryData.from.toLocaleString()} - $${salaryData.to.toLocaleString()}`;
    }
    if (salaryData.from) return `$${salaryData.from.toLocaleString()}+`;
    if (salaryData.to) return `Up to $${salaryData.to.toLocaleString()}`;
    return null;
  };

  const companyName = company?.name || company_name || "Company";
  const companyLogo = company?.logo || company_logo || "/placeholder-logo.svg";
  const formattedSalary = formatSalary(salary);
  const isRemote = remote === "Yes" || remote === true;

  const handleCardClick = () => {
    setIsModalOpen(true);
  };

  const handleCloseModal = () => {
    setIsModalOpen(false);
  };

  return (
    <>
      <div 
        className={combineClasses(
          "group border-b border-gray-700/30 hover:border-gray-600/50 transition-all duration-200",
          "hover:bg-gradient-to-r hover:from-gray-800/40 hover:to-gray-800/20",
          "cursor-pointer relative overflow-hidden touch-manipulation"
        )}
        onClick={handleCardClick}
      >
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/5 group-hover:to-purple-600/5 transition-all duration-300" />
        
        <div className="relative p-3 sm:p-5">
          {/* Mobile-first layout */}
          <div className="flex flex-col sm:flex-row sm:items-stretch gap-3 sm:gap-4" style={{ justifyContent: "space-between" }}>
            {/* Top row on mobile: Logo + Header info */}
            <div className="flex items-start gap-3 sm:gap-4">
              {/* Company Logo - Mobile optimized */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 sm:w-12 sm:h-12 rounded-xl overflow-hidden bg-gray-700/50 border border-gray-600/50 group-hover:border-gray-500/50 transition-all duration-200">
                  <Image
                    src={companyLogo}
                    alt={companyName}
                    width={48}
                    height={48}
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      e.target.src = "/placeholder-logo.svg";
                    }}
                  />
                </div>
                {/* Online indicator dot */}
                <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 opacity-80" />
              </div>

              {/* Job Info - Mobile optimized */}
              <div className="flex-1 min-w-0">
                {/* Title and Company */}
                <div className="mb-2">
                  <h3 className={combineClasses(
                    "font-semibold text-white group-hover:text-blue-300 transition-colors duration-200",
                    "text-sm sm:text-base lg:text-lg leading-tight mb-1",
                    "line-clamp-2"
                  )}>
                    {title}
                  </h3>
                  
                  <div className="flex items-center gap-2 text-gray-400 flex-wrap">
                    <span className="text-xs sm:text-sm font-medium">{companyName}</span>
                    {isRemote && (
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-emerald-500/20 text-emerald-300 rounded-full text-xs font-medium">
                        <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        Remote
                      </span>
                    )}
                  </div>
                </div>

                {/* Salary - Mobile friendly */}
                {formattedSalary && (
                  <div className="mb-2 sm:hidden">
                    <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-green-500/20 text-green-300 rounded-full text-xs font-semibold">
                      <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                        <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                        <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                      </svg>
                      {formattedSalary}
                    </span>
                  </div>
                )}

                {/* Job Details - Mobile optimized */}
                <div className="flex items-center gap-1 sm:gap-2 text-xs text-gray-500 mb-2 sm:mb-3 flex-wrap">
                  <span className="inline-flex items-center gap-1">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {location || "Not specified"}
                  </span>
                  
                  {type && (
                    <>
                      <span className="text-gray-600 hidden sm:inline">•</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-blue-500/20 text-blue-300 rounded text-xs font-medium capitalize">
                        {type}
                      </span>
                    </>
                  )}
                  
                  {level && (
                    <>
                      <span className="text-gray-600 hidden sm:inline">•</span>
                      <span className="inline-flex items-center gap-1 px-2 py-0.5 bg-purple-500/20 text-purple-300 rounded text-xs font-medium capitalize">
                        {level}
                      </span>
                    </>
                  )}
                  
                  <span className="text-gray-600 hidden sm:inline">•</span>
                  <span className="inline-flex items-center gap-1 text-gray-400">
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                    </svg>
                    {formatDate(posted_time)}
                  </span>
                </div>

                {/* Categories - Mobile optimized */}
                {categories && categories.length > 0 && (
                  <div className="flex items-center gap-1 sm:gap-2 mb-3 sm:mb-2 flex-wrap">
                    {categories.slice(0, 2).map((category, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-0.5 text-xs bg-gray-700/50 text-gray-300 rounded-full border border-gray-600/50 hover:bg-gray-600/50 transition-colors"
                      >
                        #{category}
                      </span>
                    ))}
                    {categories.length > 2 && (
                      <span className="inline-flex items-center px-2 py-0.5 text-xs bg-gray-700/30 text-gray-400 rounded-full border border-gray-600/30">
                        +{categories.length - 2} more
                      </span>
                    )}
                  </div>
                )}
              </div>
            </div>

            {/* Salary for desktop */}
            {formattedSalary && (
              <div className="hidden sm:block flex-shrink-0 text-right">
                <span className="inline-flex items-center gap-1 px-3 py-1 bg-green-500/20 text-green-300 rounded-full text-sm font-semibold">
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                  </svg>
                  {formattedSalary}
                </span>
              </div>
            )}
          </div>

          {/* Mobile Action Buttons - Always visible on mobile */}
          <div className="flex items-center gap-2 mt-3 sm:hidden">
            <button
              className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs bg-blue-600/90 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 active:scale-95"
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              Details
            </button>
            {apply_link && (
              <a
                href={apply_link}
                target="_blank"
                rel="noopener noreferrer"
                className="flex-1 inline-flex items-center justify-center gap-1 px-3 py-2 text-xs bg-green-600/90 hover:bg-green-600 text-white rounded-lg transition-all duration-200 active:scale-95"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Apply
              </a>
            )}
          </div>

          {/* Desktop Action Buttons - Hover only */}
          <div className="hidden sm:flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-all duration-200 translate-x-2 group-hover:translate-x-0 absolute right-5 top-1/2 -translate-y-1/2">
            <button
              className="inline-flex items-center gap-1 px-3 py-2 text-xs bg-blue-600/90 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105"
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
            >
              <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                <path d="M10 12a2 2 0 100-4 2 2 0 000 4z" />
                <path fillRule="evenodd" d="M.458 10C1.732 5.943 5.522 3 10 3s8.268 2.943 9.542 7c-1.274 4.057-5.064 7-9.542 7S1.732 14.057.458 10zM14 10a4 4 0 11-8 0 4 4 0 018 0z" clipRule="evenodd" />
              </svg>
              Details
            </button>
            {apply_link && (
              <a
                href={apply_link}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 px-3 py-2 text-xs bg-green-600/90 hover:bg-green-600 text-white rounded-lg transition-all duration-200 hover:scale-105"
                onClick={(e) => e.stopPropagation()}
              >
                <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                </svg>
                Apply
              </a>
            )}
          </div>
        </div>
      </div>

      {/* Job Detail Modal */}
      <JobDetailModal
        job={job}
        isOpen={isModalOpen}
        onClose={handleCloseModal}
      />
    </>
  );
};

export default JobCard;