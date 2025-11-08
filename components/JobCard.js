'use client';

import { useState, useEffect } from "react";
import Image from "next/image";
import JobDetailModal from "./JobDetailModal";
import { useAuth } from "../contexts/AuthContext";
import { useSubscription } from "../contexts/SubscriptionContext";
import {
  typography,
  components,
  animations,
  combineClasses,
} from "../utils/designSystem";

const JobCard = ({ job }) => {
  const { user } = useAuth();
  const { subscription } = useSubscription();
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [isBookmarked, setIsBookmarked] = useState(false);
  const [companyRating, setCompanyRating] = useState(null);
  
  // Fetch company rating when component mounts
  useEffect(() => {
    if (job?.companyId) {
      fetchCompanyRating();
    }
  }, [job?.companyId]);

  const fetchCompanyRating = async () => {
    try {
      const response = await fetch(`/api/companies/${job.companyId}/reviews`);
      if (response.ok) {
        const data = await response.json();
        setCompanyRating(data.averageRatings);
      }
    } catch (error) {
      console.error('Error fetching company rating:', error);
    }
  };

  const renderStars = (rating, size = 'w-3 h-3') => {
    return (
      <div className="flex space-x-1">
        {[1, 2, 3, 4, 5].map((star) => (
          <div
            key={star}
            className={`${size} ${
              star <= rating ? 'text-yellow-400' : 'text-gray-300'
            }`}
          >
            <svg className={`${size} fill-current`} viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
          </div>
        ))}
      </div>
    );
  };
  
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
    
    const currencySymbol = salaryData.currency === 'USD' ? '$' : '₱';
    
    // Use consistent period labels
    const periodLabels = {
      'hourly': '/hour',
      'daily': '/day', 
      'monthly': '/month',
      'annually': '/year'
    };
    const periodText = salaryData.period ? periodLabels[salaryData.period] || '' : '';
    
    if (salaryData.from && salaryData.to) {
      return `${currencySymbol}${salaryData.from.toLocaleString()} - ${currencySymbol}${salaryData.to.toLocaleString()}${periodText}`;
    }
    if (salaryData.from) return `${currencySymbol}${salaryData.from.toLocaleString()}${periodText}+`;
    if (salaryData.to) return `Up to ${currencySymbol}${salaryData.to.toLocaleString()}${periodText}`;
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

  // Job content is now free - premium features are AI tools and convenience features
  const renderPremiumFeatureTeaser = () => {
    if (isPremiumUser) return null;
    
    return (
      <div className="absolute top-2 left-2 bg-gradient-to-r from-purple-600/90 to-pink-600/90 text-white px-2 py-1 rounded-lg text-xs font-semibold">
        � Premium Features Available
      </div>
    );
  };

  // Update: No more upgrade prompt for job content, only for premium features
  const renderUpgradePrompt = () => {
    if (isPremiumUser) return null;
    
    return (
      <div className="mt-4 p-4 bg-gradient-to-r from-purple-900/30 to-pink-900/30 border border-purple-500/30 rounded-lg">
        <h4 className="text-sm font-semibold text-purple-300 mb-2">
          🚀 Unlock Premium Job Seeker Features
        </h4>
        <div className="space-y-2 text-xs text-purple-200">
          <div className="flex items-center space-x-2">
            <span>🤖</span>
            <span>AI Resume Builder & Analyzer</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>⚡</span>
            <span>One-click Apply & Lazy Apply</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>👁️</span>
            <span>Resume Visibility to Employers</span>
          </div>
          <div className="flex items-center space-x-2">
            <span>📊</span>
            <span>Company & Salary Insights</span>
          </div>
        </div>
        <a 
          href="/pricing" 
          className="inline-block mt-3 px-4 py-2 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-700 hover:to-pink-700 text-white text-xs font-medium rounded-lg transition-all duration-200 transform hover:scale-105"
        >
          Upgrade to Premium
        </a>
      </div>
    );
  };

  // Component for verified checkmark
  const VerifiedCheckmark = ({ isVerified }) => {
    if (!isVerified) return null;
    
    return (
      <div className="relative">
        <div className="absolute -inset-1 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-full opacity-75 blur-sm animate-pulse"></div>
        <div className="relative flex items-center justify-center w-6 h-6 bg-blue-500 rounded-full">
          <svg className="w-4 h-4 text-white" fill="currentColor" viewBox="0 0 24 24">
            <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
        </div>
      </div>
    );
  };

  // Component for premium banner
  const PremiumBanner = ({ isPremium }) => {
    if (!isPremium) return null;
    
    return (
      <div className="absolute top-3 right-3 z-10">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-yellow-400 via-orange-500 to-red-500 rounded-lg opacity-75 blur-sm animate-pulse"></div>
          <div className="relative flex items-center px-3 py-1 bg-gradient-to-r from-yellow-400 to-orange-500 rounded-lg">
            <svg className="w-4 h-4 text-white mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
            </svg>
            <span className="text-xs font-bold text-white">PREMIUM</span>
          </div>
        </div>
      </div>
    );
  };

  // Component for featured job ribbon
  const FeaturedRibbon = ({ isFeatured }) => {
    if (!isFeatured) return null;
    
    return (
      <div className="absolute top-0 right-0 z-10">
        <div className="relative">
          <div className="absolute -inset-1 bg-gradient-to-r from-purple-500 to-pink-500 rounded-bl-lg opacity-75 blur-sm"></div>
          <div className="relative flex items-center px-4 py-2 bg-gradient-to-r from-purple-500 to-pink-500 rounded-bl-lg">
            <svg className="w-4 h-4 text-white mr-1" fill="currentColor" viewBox="0 0 24 24">
              <path d="M5 3l3.057-3 3.943 4 4-4 3 3v18l-3-3-4 4-4-4-3 3z" />
            </svg>
            <span className="text-xs font-bold text-white">FEATURED</span>
          </div>
        </div>
      </div>
    );
  };

  return (
    <>
      <div 
        className={combineClasses(
          "group border-b border-gray-700/30 hover:border-gray-600/50 transition-all duration-300",
          "hover:bg-gradient-to-r hover:from-gray-800/40 hover:to-gray-800/20",
          "cursor-pointer relative overflow-hidden",
          is_featured && "border-l-4 border-l-yellow-500/60 bg-gradient-to-r from-yellow-500/5 to-transparent"
        )}
        onClick={handleCardClick}
      >
        {/* Featured Ribbon */}
        <FeaturedRibbon isFeatured={is_featured} />
        
        {/* Subtle gradient overlay on hover */}
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/0 to-purple-600/0 group-hover:from-blue-600/5 group-hover:to-purple-600/5 transition-all duration-300" />
        
        <div className="relative p-3 sm:p-4 lg:p-6">
          {/* Mobile Layout (Stack vertically on small screens) */}
          <div className="block sm:hidden">
            <div className="space-y-3">
              {/* Mobile Header */}
              <div className="flex items-start justify-between gap-3">
                <div className="flex items-start gap-3 flex-1 min-w-0">
                  {/* Company Logo */}
                  <div className="relative flex-shrink-0">
                    <div className="w-12 h-12 rounded-lg overflow-hidden bg-gray-700/50 border border-gray-600/50">
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
                    <div className="absolute -bottom-1 -right-1">
                      <VerifiedCheckmark isVerified={job.company?.verified || false} />
                    </div>
                  </div>
                  
                  {/* Job Title & Company */}
                  <div className="flex-1 min-w-0">
                    <h3 className="text-white font-semibold text-base leading-tight mb-1 line-clamp-2">
                      {title}
                    </h3>
                    <div className="flex items-center gap-1 text-gray-400 text-sm mb-1">
                      <span className="font-medium text-gray-300 truncate">{companyName}</span>
                      <VerifiedCheckmark isVerified={job.company?.verified || false} />
                    </div>
                    <div className="flex items-center gap-1 text-gray-400 text-xs">
                      <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                        <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                      </svg>
                      <span className="truncate">{location || "Not specified"}</span>
                      {isRemote && (
                        <>
                          <span className="text-gray-600">•</span>
                          <span className="text-emerald-300">Remote</span>
                        </>
                      )}
                    </div>
                  </div>
                </div>
                
                {/* Mobile Actions */}
                <div className="flex flex-col gap-1 flex-shrink-0">
                  <button
                    className={combineClasses(
                      "p-2 rounded-lg transition-all duration-200",
                      isBookmarked 
                        ? "bg-yellow-500/20 text-yellow-300" 
                        : "bg-gray-700/50 text-gray-400"
                    )}
                    onClick={handleBookmark}
                  >
                    <svg className="w-4 h-4" fill={isBookmarked ? "currentColor" : "none"} stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
                    </svg>
                  </button>
                  <button
                    className="p-2 rounded-lg bg-gray-700/50 text-gray-400 transition-all duration-200"
                    onClick={handleShare}
                  >
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                    </svg>
                  </button>
                </div>
              </div>

              {/* Mobile Tags Row */}
              <div className="flex items-center gap-1 flex-wrap">
                {type && (
                  <span className="px-2 py-1 text-xs bg-blue-500/20 text-blue-300 rounded-full border border-blue-500/30">
                    {type}
                  </span>
                )}
                {level && (
                  <span className="px-2 py-1 text-xs bg-purple-500/20 text-purple-300 rounded-full border border-purple-500/30">
                    {level}
                  </span>
                )}
                {formattedSalary && (
                  <span className="px-2 py-1 text-xs bg-green-500/20 text-green-300 rounded-full border border-green-500/30">
                    {formattedSalary}
                  </span>
                )}
                <span className="px-2 py-1 text-xs bg-gray-700/50 text-gray-400 rounded-full border border-gray-600/30">
                  {formatDate(posted_time)}
                </span>
              </div>

              {/* Mobile Action Buttons */}
              <div className="flex gap-2 pt-2">
                <button
                  onClick={(e) => {
                    e.stopPropagation();
                    setIsModalOpen(true);
                  }}
                  className="flex-1 px-3 py-2 bg-blue-600/90 text-white rounded-lg text-sm font-medium"
                >
                  View Details
                </button>
                {apply_link && (
                  <a
                    href={apply_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex-1 px-3 py-2 bg-green-600/90 text-white rounded-lg text-sm font-medium text-center"
                    onClick={(e) => e.stopPropagation()}
                  >
                    Apply Now
                  </a>
                )}
              </div>
            </div>
          </div>

          {/* Desktop Layout (Hidden on mobile) */}
          <div className="hidden sm:flex gap-4 items-start">
            {/* Company Logo */}
            <div className="relative flex-shrink-0">
              <div className="w-14 h-14 lg:w-16 lg:h-16 rounded-xl overflow-hidden bg-gray-700/50 border border-gray-600/50 group-hover:border-gray-500/50 transition-all duration-200">
                <Image
                  src={companyLogo}
                  alt={companyName}
                  width={64}
                  height={64}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    e.target.src = "/placeholder-logo.svg";
                  }}
                />
              </div>
              <div className="absolute -bottom-1 -right-1">
                <VerifiedCheckmark isVerified={job.company?.verified || false} />
              </div>
            </div>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Header */}
              <div className="mb-3">
                <h3 className="text-white group-hover:text-blue-300 transition-colors duration-200 text-lg lg:text-xl font-semibold leading-tight mb-2 line-clamp-2">
                  {title}
                </h3>
                
                {/* Company Info Row */}
                <div className="flex items-center gap-3 text-gray-400 mb-2 flex-wrap">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-gray-300">{companyName}</span>
                    <VerifiedCheckmark isVerified={job.company?.verified || false} />
                  </div>
                  <span className="text-gray-600 hidden lg:inline">•</span>
                  <span className="inline-flex items-center gap-1">
                    <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                      <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                    </svg>
                    {location || "Not specified"}
                  </span>
                  {isRemote && (
                    <>
                      <span className="text-gray-600 hidden lg:inline">•</span>
                      <span className="inline-flex items-center gap-1 text-emerald-300">
                        <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M5.05 4.05a7 7 0 119.9 9.9L10 18.9l-4.95-4.95a7 7 0 010-9.9zM10 11a2 2 0 100-4 2 2 0 000 4z" clipRule="evenodd" />
                        </svg>
                        Remote
                      </span>
                    </>
                  )}
                </div>
                
                {/* Company Rating */}
                {companyRating && companyRating.overall > 0 && (
                  <div className="flex items-center gap-2 mb-2">
                    {renderStars(companyRating.overall)}
                    <span className="text-xs text-gray-400">
                      {companyRating.overall.toFixed(1)} ({companyRating.totalReviews} reviews)
                    </span>
                  </div>
                )}
              </div>

              {/* Tags and Details */}
              <div className="space-y-3">
                {/* Primary Tags */}
                <div className="flex items-center gap-2 flex-wrap">
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
                        ? "bg-green-500/30 text-green-200 border-green-500/40" 
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

                {/* Skills - Desktop Only */}
                {skills && Array.isArray(skills) && skills.length > 0 && (
                  <div className="hidden lg:block">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-xs text-orange-300 font-medium mr-2">Skills:</span>
                      {skills.slice(0, 3).map((skill, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 text-xs bg-orange-500/10 text-orange-300 rounded border border-orange-500/20"
                        >
                          {skill}
                        </span>
                      ))}
                      {skills.length > 3 && (
                        <span className="text-xs text-orange-400">
                          +{skills.length - 3} more
                        </span>
                      )}
                    </div>
                  </div>
                )}

                {/* Benefits - Desktop Only */}
                {benefits && Array.isArray(benefits) && benefits.length > 0 && (
                  <div className="hidden lg:block">
                    <div className="flex items-center gap-1 flex-wrap">
                      <span className="text-xs text-emerald-300 font-medium mr-2">Benefits:</span>
                      {benefits.slice(0, 2).map((benefit, index) => (
                        <span
                          key={index}
                          className="inline-flex items-center px-2 py-1 text-xs bg-emerald-500/10 text-emerald-300 rounded border border-emerald-500/20"
                        >
                          {benefit}
                        </span>
                      ))}
                      {benefits.length > 2 && (
                        <span className="text-xs text-emerald-400">
                          +{benefits.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>
            </div>

            {/* Desktop Action Buttons */}
            <div className="flex-shrink-0 flex items-start gap-2">
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

              <button
                className="p-2 rounded-lg bg-gray-700/50 text-gray-400 border border-gray-600/30 hover:bg-gray-600/50 hover:text-gray-300 transition-all duration-200 hover:scale-105"
                onClick={handleShare}
                title="Share this job"
              >
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8.684 13.342C8.886 12.938 9 12.482 9 12c0-.482-.114-.938-.316-1.342m0 2.684a3 3 0 110-2.684m0 2.684l6.632 3.316m-6.632-6l6.632-3.316m0 0a3 3 0 105.367-2.684 3 3 0 00-5.367 2.684zm0 9.316a3 3 0 105.367 2.684 3 3 0 00-5.367-2.684z" />
                </svg>
              </button>

              <button
                onClick={(e) => {
                  e.stopPropagation();
                  setIsModalOpen(true);
                }}
                className="px-4 py-2 bg-blue-600/90 hover:bg-blue-600 text-white rounded-lg transition-all duration-200 hover:scale-105 font-medium text-sm"
              >
                <span className="hidden lg:inline">View Details</span>
                <span className="lg:hidden">Details</span>
              </button>

              {apply_link && (
                <a
                  href={apply_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="px-4 py-2 bg-green-600/90 hover:bg-green-600 text-white rounded-lg transition-all duration-200 hover:scale-105 font-medium text-sm"
                  onClick={(e) => e.stopPropagation()}
                >
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