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
  const [isBookmarked, setIsBookmarked] = useState(false);
  
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
    benefits,
    skills,
    is_featured = false,
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

  // Format salary - Only bold for featured jobs
  const formatSalary = (salaryData) => {
    if (!salaryData?.from && !salaryData?.to) return null;
    if (salaryData.from && salaryData.to) {
      return `₱${salaryData.from.toLocaleString()} - ₱${salaryData.to.toLocaleString()}`;
    }
    if (salaryData.from) return `₱${salaryData.from.toLocaleString()}+`;
    if (salaryData.to) return `Up to ₱${salaryData.to.toLocaleString()}`;
    return null;
  };

  // Handle bookmark
  const handleBookmark = (e) => {
    e.stopPropagation();
    setIsBookmarked(!isBookmarked);
    // TODO: Add bookmark API call
  };

  // Handle share
  const handleShare = (e) => {
    e.stopPropagation();
    if (navigator.share) {
      navigator.share({
        title: `${title} at ${companyName}`,
        text: `Check out this job opportunity: ${title} at ${companyName}`,
        url: window.location.href,
      });
    } else {
      // Fallback: Copy to clipboard
      navigator.clipboard.writeText(window.location.href);
    }
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
          "cursor-pointer relative overflow-hidden touch-manipulation",
          is_featured && "border-l-4 border-l-yellow-500/60 bg-gradient-to-r from-yellow-500/5 to-transparent"
        )}
        onClick={handleCardClick}
      >
        {/* Featured badge */}
        {is_featured && (
          <div className="absolute top-2 right-2 z-10">
            <span className="inline-flex items-center px-2 py-1 text-xs font-medium bg-yellow-500/20 text-yellow-300 rounded-full border border-yellow-500/30">
              <svg className="w-3 h-3 mr-1" fill="currentColor" viewBox="0 0 20 20">
                <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
              </svg>
              Featured
            </span>
          </div>
        )}
        
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/5 group-hover:to-purple-600/5 transition-all duration-300" />
        
        <div className="relative p-4 sm:p-6">
          <div className="flex gap-4">
            {/* Company Logo */}
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 rounded-xl overflow-hidden bg-gray-700/50 border border-gray-600/50 group-hover:border-gray-500/50 transition-all duration-200">
                <Image
                  src={companyLogo}
                  alt={companyName}
                  width={56}
                  height={56}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "/placeholder-logo.svg";
                  }}
                />
              </div>
              {/* Online indicator */}
              <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-gray-900 opacity-80" />
            </div>

            {/* Job Content */}
            <div className="flex-1 min-w-0">
              {/* Job Title - Main focus */}
              <div className="mb-3">
                <h3 className={combineClasses(
                  "text-white group-hover:text-blue-300 transition-colors duration-200",
                  "text-lg sm:text-xl font-semibold leading-tight mb-2",
                  "line-clamp-2"
                )}>
                  {title}
                </h3>
                
                {/* Company and Location */}
                <div className="flex items-center gap-3 text-gray-400 mb-2">
                  <span className="font-medium text-gray-300">{companyName}</span>
                  <span className="text-gray-600">•</span>
                  <span className="inline-flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {location || "Not specified"}
                  </span>
                  {isRemote && (
                    <>
                      <span className="text-gray-600">•</span>
                      <span className="inline-flex items-center gap-1 text-emerald-300">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        Remote
                      </span>
                    </>
                  )}
                </div>
              </div>

              {/* Job Details Tags */}
              <div className="flex items-center gap-2 mb-3 flex-wrap">
                {type && (
                  <span className="inline-flex items-center px-2.5 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30 font-medium">
                    {type}
                  </span>
                )}
                {level && (
                  <span className="inline-flex items-center px-2.5 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30 font-medium">
                    {level}
                  </span>
                )}
                {formattedSalary && (
                  <span className={combineClasses(
                    "inline-flex items-center gap-1 px-2.5 py-1 text-xs rounded-full border font-medium",
                    is_featured 
                      ? "bg-green-500/30 text-green-200 border-green-500/40 font-semibold" 
                      : "bg-green-500/20 text-green-300 border-green-500/30"
                  )}>
                    <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                      <path d="M8.433 7.418c.155-.103.346-.196.567-.267v1.698a2.305 2.305 0 01-.567-.267C8.07 8.34 8 8.114 8 8c0-.114.07-.34.433-.582zM11 12.849v-1.698c.22.071.412.164.567.267.364.243.433.468.433.582 0 .114-.07.34-.433.582a2.305 2.305 0 01-.567.267z" />
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-13a1 1 0 10-2 0v.092a4.535 4.535 0 00-1.676.662C6.602 6.234 6 7.009 6 8c0 .99.602 1.765 1.324 2.246.48.32 1.054.545 1.676.662v1.941c-.391-.127-.68-.317-.843-.504a1 1 0 10-1.51 1.31c.562.649 1.413 1.076 2.353 1.253V15a1 1 0 102 0v-.092a4.535 4.535 0 001.676-.662C13.398 13.766 14 12.991 14 12c0-.99-.602-1.765-1.324-2.246A4.535 4.535 0 0011 9.092V7.151c.391.127.68.317.843.504a1 1 0 101.511-1.31c-.563-.649-1.413-1.076-2.354-1.253V5z" clipRule="evenodd" />
                    </svg>
                    {formattedSalary}
                  </span>
                )}
                <span className="inline-flex items-center gap-1 px-2.5 py-1 text-xs bg-gray-700/50 text-gray-400 rounded-full border border-gray-600/30">
                  <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                  </svg>
                  {formatDate(posted_time)}
                </span>
              </div>

              {/* Benefits/Perks Tags */}
              {benefits && benefits.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center gap-1 mb-2">
                    <svg className="w-4 h-4 text-emerald-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs text-emerald-300 font-medium">Benefits</span>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    {benefits.slice(0, 3).map((benefit, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 text-xs bg-emerald-500/10 text-emerald-300 rounded border border-emerald-500/20 font-medium"
                      >
                        {benefit}
                      </span>
                    ))}
                    {benefits.length > 3 && (
                      <span className="inline-flex items-center px-2 py-1 text-xs bg-emerald-500/5 text-emerald-400 rounded border border-emerald-500/10">
                        +{benefits.length - 3} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Skills Tags */}
              {skills && skills.length > 0 && (
                <div className="mb-3">
                  <div className="flex items-center gap-1 mb-2">
                    <svg className="w-4 h-4 text-orange-400" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M3 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1zm0 4a1 1 0 011-1h12a1 1 0 110 2H4a1 1 0 01-1-1z" clipRule="evenodd" />
                    </svg>
                    <span className="text-xs text-orange-300 font-medium">Skills Required</span>
                  </div>
                  <div className="flex items-center gap-1 flex-wrap">
                    {skills.slice(0, 4).map((skill, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 text-xs bg-orange-500/10 text-orange-300 rounded border border-orange-500/20 font-medium"
                      >
                        {skill}
                      </span>
                    ))}
                    {skills.length > 4 && (
                      <span className="inline-flex items-center px-2 py-1 text-xs bg-orange-500/5 text-orange-400 rounded border border-orange-500/10">
                        +{skills.length - 4} more
                      </span>
                    )}
                  </div>
                </div>
              )}

              {/* Categories */}
              {categories && categories.length > 0 && (
                <div className="flex items-center gap-1 flex-wrap">
                  {categories.slice(0, 2).map((category, index) => (
                    <span
                      key={index}
                      className="inline-flex items-center px-2 py-1 text-xs bg-gray-700/50 text-gray-300 rounded border border-gray-600/30"
                    >
                      #{category}
                    </span>
                  ))}
                  {categories.length > 2 && (
                    <span className="inline-flex items-center px-2 py-1 text-xs bg-gray-700/30 text-gray-400 rounded border border-gray-600/20">
                      +{categories.length - 2} more
                    </span>
                  )}
                </div>
              )}
            </div>

            {/* Action Buttons - Right side */}
            <div className="flex-shrink-0 flex items-start gap-2">
              {/* Bookmark Button */}
              <button
                className={combineClasses(
                  "p-2 rounded-lg transition-all duration-200 hover:scale-105",
                  isBookmarked 
                    ? "bg-yellow-500/20 text-yellow-300 border border-yellow-500/30" 
                    : "bg-gray-700/50 text-gray-400 border border-gray-600/30 hover:bg-gray-600/50 hover:text-gray-300"
                )}
                onClick={handleBookmark}
                title="Bookmark this job"
              >
                <svg className="w-4 h-4" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                </svg>
              </button>

              {/* Share Button */}
              <button
                className="p-2 rounded-lg bg-gray-700/50 text-gray-400 border border-gray-600/30 hover:bg-gray-600/50 hover:text-gray-300 transition-all duration-200 hover:scale-105"
                onClick={handleShare}
                title="Share this job"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </button>

              {/* Apply Button */}
              {apply_link && (
                <a
                  href={apply_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="inline-flex items-center gap-2 px-4 py-2 bg-green-600/90 hover:bg-green-600 text-white rounded-lg transition-all duration-200 hover:scale-105 font-medium"
                  onClick={(e) => e.stopPropagation()}
                >
                  <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.293 3.293a1 1 0 011.414 0l6 6a1 1 0 010 1.414l-6 6a1 1 0 01-1.414-1.414L14.586 11H3a1 1 0 110-2h11.586l-4.293-4.293a1 1 0 010-1.414z" clipRule="evenodd" />
                  </svg>
                  Apply
                </a>
              )}
            </div>
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