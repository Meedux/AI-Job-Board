'use client';

import { useState } from "react";
import Image from "next/image";
import JobDetailModal from "./JobDetailModal";
import {
  colors,
  typography,
  components,
  spacing,
  animations,
  gradients,
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
      return `${salaryData.from.toLocaleString()} - ${salaryData.to.toLocaleString()}`;
    }
    if (salaryData.from) return `${salaryData.from.toLocaleString()}+`;
    if (salaryData.to) return `Up to ${salaryData.to.toLocaleString()}`;
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
          components.card.base,
          components.card.hover,
          animations.transition,
          "group cursor-pointer"
        )}
        onClick={handleCardClick}
      >
        {/* Header */}
        <div className={combineClasses(components.card.padding)}>
          <div className="flex items-start justify-between mb-3">
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className={combineClasses(
                "w-12 h-12 rounded-lg overflow-hidden flex-shrink-0",
                colors.neutral.backgroundTertiary
              )}>
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
              <div className="flex-1 min-w-0">
                <h3 className={combineClasses(
                  typography.bodyBase,
                  "font-semibold leading-tight mb-1 line-clamp-1 group-hover:text-blue-400 transition-colors",
                  colors.neutral.textPrimary
                )}>
                  {title}
                </h3>
                <p className={combineClasses(
                  typography.bodySmall,
                  "font-medium truncate",
                  colors.neutral.textSecondary
                )}>
                  {companyName}
                </p>
              </div>
            </div>
            
            {/* Save/Bookmark Button */}
            <button
              className={combineClasses(
                "p-2 rounded-lg transition-colors",
                colors.neutral.surfaceHover
              )}
              onClick={(e) => {
                e.stopPropagation();
                // Add bookmark functionality
              }}
            >
              <svg className={combineClasses("w-5 h-5", colors.neutral.textMuted)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 5a2 2 0 012-2h10a2 2 0 012 2v16l-7-3.5L5 21V5z" />
              </svg>
            </button>
          </div>

          {/* Job Details */}
          <div className="space-y-2 mb-3">
            <div className={combineClasses("flex items-center gap-4", typography.bodySmall, colors.neutral.textSecondary)}>
              <div className="flex items-center gap-1">
                <svg className={combineClasses("w-4 h-4", colors.neutral.textMuted)} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <span>{location || "Not specified"}</span>
              </div>
              
              {isRemote && (
                <span className={combineClasses(
                  "inline-flex items-center px-2 py-1 rounded-full",
                  typography.bodyXSmall,
                  "font-medium",
                  colors.success.background,
                  colors.success.text
                )}>
                  Remote
                </span>
              )}
            </div>

            {/* Additional Info */}
            <div className={combineClasses("flex items-center gap-4", typography.bodySmall, colors.neutral.textTertiary)}>
              {type && (
                <span className="capitalize">{type}</span>
              )}
              {level && (
                <>
                  <span>•</span>
                  <span className="capitalize">{level}</span>
                </>
              )}
              <span>•</span>
              <span>{formatDate(posted_time)}</span>
            </div>
          </div>

          {/* Salary */}
          {formattedSalary && (
            <div className="mb-3">
              <span className={combineClasses(
                typography.h5,
                "font-bold",
                colors.success.text
              )}>
                {formattedSalary}
              </span>
            </div>
          )}

          {/* Categories */}
          {categories && categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-3">
              {categories.slice(0, 2).map((category, index) => (
                <span
                  key={index}
                  className={combineClasses(
                    "inline-flex items-center px-2 py-1 rounded",
                    typography.bodyXSmall,
                    "font-medium",
                    colors.primary.background,
                    colors.primary.text
                  )}
                >
                  {category}
                </span>
              ))}
              {categories.length > 2 && (
                <span className={combineClasses(typography.bodyXSmall, colors.neutral.textTertiary)}>
                  +{categories.length - 2} more
                </span>
              )}
            </div>
          )}

          {/* Action Buttons */}
          <div className={combineClasses("flex gap-2 pt-2 border-t", colors.neutral.border)}>
            <button
              className={combineClasses(
                components.button.base,
                components.button.primary,
                components.button.sizes.medium,
                "flex-1"
              )}
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
            >
              View Details
            </button>
            {apply_link && (
              <a
                href={apply_link}
                target="_blank"
                rel="noopener noreferrer"
                className={combineClasses(
                  components.button.base,
                  components.button.secondary,
                  components.button.sizes.medium,
                  "px-4"
                )}
                onClick={(e) => e.stopPropagation()}
              >
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