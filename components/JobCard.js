import Image from "next/image";
import Link from "next/link";
import {
  colors,
  typography,
  components,
  spacing,
  animations,
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
    <div
      className={`${components.card.base} ${components.card.hover} ${components.card.padding}`}
    >
      <div className="flex items-start space-x-4">
        {/* Company Logo */}
        <Link href={jobHref} className="flex-shrink-0">
          <div className="w-16 h-16 relative">
            <Image
              src={companyLogo}
              alt={companyName}
              width={64}
              height={64}
              className="rounded-lg object-cover"
              onError={(e) => {
                e.target.src = "/placeholder-logo.svg";
              }}
            />
          </div>
        </Link>

        {/* Job Details */}
        <div className="flex-1 min-w-0">
          <Link href={jobHref}>
            <h3
              className={`${typography.h5} ${colors.neutral.textPrimary} hover:${colors.primary.text} ${animations.transition} line-clamp-2 mb-3`}
            >
              {title}
            </h3>
          </Link>

          <div className="flex items-center space-x-2 mb-3">
            <span
              className={`${colors.neutral.textSecondary} ${typography.bodyBase}`}
            >
              {companyName}
            </span>
            <span
              className={`${colors.neutral.textMuted} ${typography.bodySmall} flex items-center space-x-1`}
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
                />
              </svg>
              <span>{formatDate(posted_time)}</span>
            </span>
          </div>

          <div
            className={`flex flex-wrap items-center ${spacing.gapXSmall} ${typography.bodySmall} ${colors.neutral.textTertiary}`}
          >
            {/* Location */}
            <div className="flex items-center space-x-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z"
                />
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1.5}
                  d="M15 11a3 3 0 11-6 0 3 3 0 016 0z"
                />
              </svg>
              <span>{location || "Not specified"}</span>
              {(remote === "Yes" || remote === true) && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-green-100 text-green-800">
                  Remote
                </span>
              )}
            </div>

            <span className="hidden lg:block text-gray-400">·</span>

            {/* Job Type */}
            <div className="hidden lg:flex items-center space-x-1">
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={1}
                  d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6"
                />
              </svg>
              <span>{type || "Not specified"}</span>
            </div>

            {level && (
              <>
                <span className="hidden lg:block text-gray-400">·</span>
                <div className="hidden lg:flex items-center space-x-1">
                  <svg
                    className="w-4 h-4"
                    fill="none"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth={1.5}
                      d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
                    />
                  </svg>
                  <span>{level}</span>
                </div>
              </>
            )}

            <span className="hidden lg:block text-gray-400">·</span>

            {/* Salary */}
            {formattedSalary && (
              <div className="hidden lg:flex items-center space-x-1">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={1}
                    d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1"
                  />
                </svg>
                <span className="flex space-x-1">
                  <span>{formattedSalary.min}</span>
                  {formattedSalary.max && (
                    <>
                      <span>-</span>
                      <span>{formattedSalary.max}</span>
                    </>
                  )}
                </span>
              </div>
            )}
          </div>

          {/* Mobile-only job type, level, and salary */}
          <div
            className={`lg:hidden mt-3 flex flex-wrap items-center ${spacing.gapXSmall} ${typography.bodyXSmall}`}
          >
            {type && (
              <span
                className={`${colors.neutral.backgroundTertiary} ${colors.neutral.textSecondary} px-2 py-1 rounded`}
              >
                {type}
              </span>
            )}
            {level && (
              <span
                className={`${colors.primary.background} ${colors.primary.text} px-2 py-1 rounded`}
              >
                {level}
              </span>
            )}
            {formattedSalary && (
              <span
                className={`${colors.success.background} ${colors.success.text} px-2 py-1 rounded`}
              >
                {formattedSalary.min}
                {formattedSalary.max && ` - ${formattedSalary.max}`}
              </span>
            )}
          </div>

          {/* Categories */}
          {categories && categories.length > 0 && (
            <div className="mt-3 flex flex-wrap gap-1">
              {categories.slice(0, 3).map((category, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {category}
                </span>
              ))}
              {categories.length > 3 && (
                <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-gray-100 text-gray-600">
                  +{categories.length - 3} more
                </span>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default JobCard;
