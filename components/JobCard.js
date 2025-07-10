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
          "border-b border-gray-700/50 p-3 hover:bg-gray-800/30 transition-colors cursor-pointer group"
        )}
        onClick={handleCardClick}
      >
        <div className="flex items-start gap-3">
          {/* Company Logo - Smaller */}
          <div className="w-10 h-10 rounded overflow-hidden flex-shrink-0 bg-gray-700/50">
            <Image
              src={companyLogo}
              alt={companyName}
              width={40}
              height={40}
              className="w-full h-full object-cover"
              onError={(e) => {
                e.target.src = "/placeholder-logo.svg";
              }}
            />
          </div>

          {/* Job Info - Compact */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2 mb-1">
              <h3 className={combineClasses(
                "font-semibold text-white group-hover:text-blue-400 transition-colors line-clamp-1",
                typography.bodyBase
              )}>
                {title}
              </h3>
              
              {/* Salary - Right aligned */}
              {formattedSalary && (
                <span className={combineClasses(
                  "text-green-400 font-semibold text-sm flex-shrink-0"
                )}>
                  {formattedSalary}
                </span>
              )}
            </div>

            <p className={combineClasses(
              "text-gray-400 text-sm mb-1 truncate"
            )}>
              {companyName}
            </p>

            {/* Compact details in one line */}
            <div className="flex items-center gap-3 text-xs text-gray-500">
              <span>{location || "Not specified"}</span>
              
              {type && (
                <>
                  <span>•</span>
                  <span className="capitalize">{type}</span>
                </>
              )}
              
              {level && (
                <>
                  <span>•</span>
                  <span className="capitalize">{level}</span>
                </>
              )}
              
              <span>•</span>
              <span>{formatDate(posted_time)}</span>
              
              {isRemote && (
                <>
                  <span>•</span>
                  <span className="text-green-400 font-medium">Remote</span>
                </>
              )}
            </div>

            {/* Categories - Inline and compact */}
            {categories && categories.length > 0 && (
              <div className="flex items-center gap-2 mt-1">
                {categories.slice(0, 3).map((category, index) => (
                  <span
                    key={index}
                    className="inline-block px-2 py-0.5 text-xs bg-blue-500/20 text-blue-300 rounded"
                  >
                    {category}
                  </span>
                ))}
                {categories.length > 3 && (
                  <span className="text-xs text-gray-500">
                    +{categories.length - 3}
                  </span>
                )}
              </div>
            )}
          </div>

          {/* Quick Actions - Compact buttons on hover */}
          <div className="flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
            <button
              className="px-3 py-1 text-xs bg-blue-600 hover:bg-blue-700 text-white rounded transition-colors"
              onClick={(e) => {
                e.stopPropagation();
                handleCardClick();
              }}
            >
              Details
            </button>
            {apply_link && (
              <a
                href={apply_link}
                target="_blank"
                rel="noopener noreferrer"
                className="px-3 py-1 text-xs bg-green-600 hover:bg-green-700 text-white rounded transition-colors"
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