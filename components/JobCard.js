import Image from "next/image";
import Link from "next/link";
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
  const {
    slug,
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
  } = job;

  // Format salary display
  const formatSalary = (salaryData) => {
    if (!salaryData) return null;
    return {
      min: salaryData.from,
      max: salaryData.to,
    };
  };

  // Format posted date
  const formatDate = (dateString) => {
    if (!dateString) return "Recently";
    try {
      const date = new Date(dateString);
      const now = new Date();
      const diffTime = Math.abs(now - date);
      const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

      if (diffDays === 1) return "1 day ago";
      if (diffDays < 30) return `${diffDays} days ago`;
      if (diffDays < 365) return `${Math.floor(diffDays / 30)} months ago`;
      return `${Math.floor(diffDays / 365)} years ago`;
    } catch {
      return dateString;
    }
  };

  const companyName = company?.name || company_name || "Company";
  const companyLogo = company?.logo || company_logo || "/placeholder-logo.svg";
  const formattedSalary = formatSalary(salary);
  const jobHref = `/job/${slug}`;

  return (
    <div className={combineClasses(
      components.card.base,
      components.card.hover,
      animations.transition,
      "group relative overflow-hidden",
      "hover:-translate-y-0.5"
    )}>
      {/* Card content */}
      <div className={components.card.padding}>
        {/* Header with company logo and meta info */}
        <div className={`flex flex-col sm:flex-row sm:justify-between sm:items-start ${spacing.gapSmall} mb-4`}>
          <div className="flex items-center gap-3 flex-1">
            <Link href={jobHref} className={`relative ${animations.transition} ${animations.hover}`}>
              <div className={combineClasses(
                "w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center",
                colors.neutral.backgroundTertiary,
                colors.neutral.border,
                "border"
              )}>
                <Image
                  src={companyLogo}
                  alt={companyName}
                  width={56}
                  height={56}
                  className="rounded-xl object-cover"
                  onError={(e) => {
                    e.target.src = "/placeholder-logo.svg";
                  }}
                />
              </div>
            </Link>
            <div className="flex-1 min-w-0">
              <h4 className={`${typography.bodyBase} font-semibold ${colors.neutral.textPrimary} mb-1 leading-tight`}>
                {companyName}
              </h4>
              <div className="flex items-center gap-2">
                <span className={`${typography.bodySmall} ${colors.neutral.textSecondary} font-medium`}>
                  {formatDate(posted_time)}
                </span>
                {(remote === "Yes" || remote === true) && (
                  <div className={combineClasses(
                    "inline-flex items-center gap-1 px-2 py-1 rounded border",
                    colors.success.background,
                    colors.success.text,
                    typography.bodyXSmall,
                    "font-semibold uppercase tracking-wide"
                  )}>
                    <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3.055 11H5a2 2 0 012 2v1a2 2 0 002 2 2 2 0 012 2v2.945M8 3.935V5.5A2.5 2.5 0 0010.5 8h.5a2 2 0 012 2 2 2 0 104 0 2 2 0 012-2h1.064M15 20.488V18a2 2 0 012-2h3.064" />
                    </svg>
                    Remote
                  </div>
                )}
              </div>
            </div>
          </div>
          
          {/* Salary badge */}
          {formattedSalary && formattedSalary.min && formattedSalary.max && (
            <div className={combineClasses(
              "px-3 py-2 rounded-lg border self-start",
              colors.success.background,
              colors.success.text,
              typography.bodySmall,
              "font-bold whitespace-nowrap"
            )}>
              {formattedSalary.min?.toLocaleString()} - {formattedSalary.max?.toLocaleString()}
            </div>
          )}
        </div>

        {/* Job title */}
        <Link href={jobHref}>
          <h3 className={combineClasses(
            typography.h4,
            colors.neutral.textPrimary,
            "mb-4 leading-tight cursor-pointer line-clamp-2",
            animations.transition,
            "hover:text-blue-400"
          )}>
            {title}
          </h3>
        </Link>

        {/* Job details */}
        <div className={`flex flex-wrap ${spacing.gapSmall} mb-4`}>
          <div className={`flex items-center gap-1.5 ${typography.bodySmall} ${colors.neutral.textSecondary} font-medium`}>
            <svg className={`w-4 h-4 ${colors.neutral.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
            </svg>
            <span>{location || "Location not specified"}</span>
          </div>
          
          <div className={`flex items-center gap-1.5 ${typography.bodySmall} ${colors.neutral.textSecondary} font-medium`}>
            <svg className={`w-4 h-4 ${colors.neutral.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6" />
            </svg>
            <span>{type || "Full-time"}</span>
          </div>

          {level && (
            <div className={`flex items-center gap-1.5 ${typography.bodySmall} ${colors.neutral.textSecondary} font-medium`}>
              <svg className={`w-4 h-4 ${colors.neutral.textMuted}`} fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
              </svg>
              <span>{level}</span>
            </div>
          )}
        </div>

        {/* Categories */}
        {categories && categories.length > 0 && (
          <div className={`flex flex-wrap ${spacing.gapSmall} mb-5`}>
            {categories.slice(0, 3).map((category, index) => (
              <span
                key={index}
                className={combineClasses(
                  "inline-flex items-center px-3 py-1.5 rounded-full border",
                  colors.primary.background,
                  colors.primary.text,
                  typography.bodyXSmall,
                  "font-semibold",
                  animations.transition,
                  "hover:-translate-y-0.5"
                )}
              >
                {category}
              </span>
            ))}
            {categories.length > 3 && (
              <span
                className={combineClasses(
                  "inline-flex items-center px-3 py-1.5 rounded-full border",
                  colors.neutral.backgroundTertiary,
                  colors.neutral.textTertiary,
                  typography.bodyXSmall,
                  "font-semibold"
                )}
              >
                +{categories.length - 3} more
              </span>
            )}
          </div>
        )}

        {/* Action button */}
        <div className="flex justify-end">
          <Link 
            href={jobHref} 
            className={combineClasses(
              components.button.base,
              components.button.primary,
              components.button.sizes.medium,
              "w-full sm:w-auto group/btn relative overflow-hidden",
              animations.transition,
              "hover:-translate-y-0.5 hover:scale-105"
            )}
          >
            <span className="relative z-10">View Details</span>
            <div className={combineClasses(
              "relative flex items-center justify-center w-5 h-5 rounded border ml-3 z-10",
              animations.transition,
              "group-hover/btn:translate-x-1"
            )}>
              <svg className={combineClasses(
                "w-3.5 h-3.5",
                animations.transition,
                "group-hover/btn:translate-x-0.5 group-hover/btn:scale-110"
              )} fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
              </svg>
            </div>
          </Link>
        </div>
      </div>
    </div>
  );
};

export default JobCard;