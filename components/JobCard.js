import Image from 'next/image';
import Link from 'next/link';
import { colors, typography, components, spacing, animations } from '../utils/designSystem';

const JobCard = ({ job }) => {
  const {
    id,
    title,
    company,
    companyLogo,
    location,
    type,
    salary,
    postedAt,
    href
  } = job;

  return (
    <div className={`${components.card.base} ${components.card.hover} ${components.card.padding}`}>
      <div className="flex items-start space-x-4">
        {/* Company Logo */}
        <Link href={href} className="flex-shrink-0">
          <div className="w-16 h-16 relative">
            <Image
              src={companyLogo}
              alt={company}
              width={64}
              height={64}
              className="rounded-lg object-cover"
            />
          </div>
        </Link>

        {/* Job Details */}
        <div className="flex-1 min-w-0">
          <Link href={href}>
            <h3 className={`${typography.h5} ${colors.neutral.textPrimary} hover:${colors.primary.text} ${animations.transition} line-clamp-2 mb-3`}>
              {title}
            </h3>
          </Link>

          <div className="flex items-center space-x-2 mb-3">
            <Link href={`/company/${company.toLowerCase()}`} className={`${colors.neutral.textSecondary} hover:${colors.primary.text} ${animations.transition} ${typography.bodyBase}`}>
              {company}
            </Link>
            <span className={`${colors.neutral.textMuted} ${typography.bodySmall} flex items-center space-x-1`}>
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
              <span>{postedAt}</span>
            </span>
          </div>

          <div className={`flex flex-wrap items-center ${spacing.gapXSmall} ${typography.bodySmall} ${colors.neutral.textTertiary}`}>
            {/* Location */}
            <div className="flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{location}</span>
            </div>

            <span className="hidden lg:block text-gray-400">·</span>

            {/* Job Type */}
            <div className="hidden lg:flex items-center space-x-1">
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6" />
              </svg>
              <span>{type}</span>
            </div>

            <span className="hidden lg:block text-gray-400">·</span>

            {/* Salary */}
            {salary && (
              <div className="hidden lg:flex items-center space-x-1">
                <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                </svg>
                <span className="flex space-x-1">
                  <span>{salary.min}</span>
                  <span>-</span>
                  <span>{salary.max}</span>
                </span>
              </div>
            )}
          </div>

          {/* Mobile-only job type and salary */}
          <div className={`lg:hidden mt-3 flex flex-wrap items-center ${spacing.gapXSmall} ${typography.bodyXSmall}`}>
            <span className={`${colors.neutral.backgroundTertiary} ${colors.neutral.textSecondary} px-2 py-1 rounded`}>{type}</span>
            {salary && (
              <span className={`${colors.success.background} ${colors.success.text} px-2 py-1 rounded`}>
                {salary.min} - {salary.max}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;
