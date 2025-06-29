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
    <div 
      className="relative rounded-2xl p-0.5 transition-all duration-300 ease-out hover:-translate-y-0.5 group"
      style={{
        background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.1) 0%, rgba(168, 85, 247, 0.1) 100%)',
      }}
    >
      {/* Hover effects */}
      <div 
        className="absolute inset-0 rounded-2xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"
        style={{
          background: 'linear-gradient(135deg, rgba(99, 102, 241, 0.15) 0%, rgba(168, 85, 247, 0.15) 100%)',
          boxShadow: '0 20px 40px rgba(0, 0, 0, 0.3), 0 0 0 1px rgba(99, 102, 241, 0.2)',
        }}
      />
      
      {/* Card inner */}
      <div 
        className="relative rounded-xl border overflow-hidden"
        style={{
          background: 'rgba(15, 23, 42, 0.8)',
          backdropFilter: 'blur(10px)',
          borderColor: 'rgba(30, 41, 59, 0.5)',
        }}
      >
        <div className="p-5 sm:p-6">
          {/* Header with company logo and meta info */}
          <div className="flex flex-col sm:flex-row sm:justify-between sm:items-start gap-3 sm:gap-0 mb-4">
            <div className="flex items-center gap-3 flex-1">
              <Link href={jobHref} className="relative transition-transform duration-200 hover:scale-105">
                <div 
                  className="w-14 h-14 rounded-xl overflow-hidden flex items-center justify-center border"
                  style={{
                    background: 'rgba(30, 41, 59, 0.5)',
                    borderColor: 'rgba(51, 65, 85, 0.5)',
                  }}
                >
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
                <h4 className="text-base font-semibold text-slate-200 mb-1 leading-tight">{companyName}</h4>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-slate-400 font-medium">{formatDate(posted_time)}</span>
                  {(remote === "Yes" || remote === true) && (
                    <div 
                      className="inline-flex items-center gap-1 px-2 py-1 rounded border text-xs font-semibold uppercase tracking-wide"
                      style={{
                        background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(21, 128, 61, 0.1) 100%)',
                        borderColor: 'rgba(34, 197, 94, 0.2)',
                        color: '#4ade80',
                      }}
                    >
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
              <div 
                className="px-3 py-2 rounded-lg border self-start"
                style={{
                  background: 'linear-gradient(135deg, rgba(34, 197, 94, 0.1) 0%, rgba(21, 128, 61, 0.1) 100%)',
                  borderColor: 'rgba(34, 197, 94, 0.2)',
                  backdropFilter: 'blur(10px)',
                }}
              >
                <span className="text-sm font-bold text-green-400 whitespace-nowrap">
                  {formattedSalary.min?.toLocaleString()} - {formattedSalary.max?.toLocaleString()}
                </span>
              </div>
            )}
          </div>

          {/* Job title */}
          <Link href={jobHref}>
            <h3 className="text-xl font-bold text-slate-100 mb-4 leading-tight transition-colors duration-200 hover:text-indigo-300 cursor-pointer line-clamp-2">
              {title}
            </h3>
          </Link>

          {/* Job details */}
          <div className="flex flex-wrap gap-4 mb-4">
            <div className="flex items-center gap-1.5 text-sm text-slate-400 font-medium">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
              </svg>
              <span>{location || "Location not specified"}</span>
            </div>
            
            <div className="flex items-center gap-1.5 text-sm text-slate-400 font-medium">
              <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M21 13.255A23.931 23.931 0 0112 15c-3.183 0-6.22-.62-9-1.745M16 6V4a2 2 0 00-2-2h-4a2 2 0 00-2-2v2m8 0H8m8 0v2a2 2 0 01-2 2H10a2 2 0 01-2-2V6" />
              </svg>
              <span>{type || "Full-time"}</span>
            </div>

            {level && (
              <div className="flex items-center gap-1.5 text-sm text-slate-400 font-medium">
                <svg className="w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M13 10V3L4 14h7v7l9-11h-7z" />
                </svg>
                <span>{level}</span>
              </div>
            )}
          </div>

          {/* Categories */}
          {categories && categories.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-5">
              {categories.slice(0, 3).map((category, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border transition-all duration-200 hover:-translate-y-0.5"
                  style={{
                    background: 'rgba(99, 102, 241, 0.1)',
                    borderColor: 'rgba(99, 102, 241, 0.2)',
                    color: '#a5b4fc',
                  }}
                >
                  {category}
                </span>
              ))}
              {categories.length > 3 && (
                <span
                  className="inline-flex items-center px-3 py-1.5 rounded-full text-xs font-semibold border"
                  style={{
                    background: 'rgba(51, 65, 85, 0.5)',
                    borderColor: 'rgba(71, 85, 105, 0.5)',
                    color: '#94a3b8',
                  }}
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
              className="relative inline-flex items-center gap-3 px-6 py-3.5 text-sm font-bold rounded-xl transition-all duration-300 ease-out text-white border overflow-hidden group/btn hover:-translate-y-0.5 hover:scale-105 active:translate-y-0 active:scale-100 w-full sm:w-auto justify-center sm:justify-start"
              style={{
                background: 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)',
                borderColor: 'rgba(99, 102, 241, 0.4)',
                boxShadow: '0 4px 14px rgba(99, 102, 241, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05) inset',
                letterSpacing: '0.5px',
              }}
              onMouseEnter={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #7c3aed 0%, #a855f7 50%, #f472b6 100%)';
                e.target.style.boxShadow = '0 8px 28px rgba(99, 102, 241, 0.4), 0 0 0 1px rgba(255, 255, 255, 0.1) inset, 0 1px 0 rgba(255, 255, 255, 0.2) inset';
              }}
              onMouseLeave={(e) => {
                e.target.style.background = 'linear-gradient(135deg, #6366f1 0%, #8b5cf6 50%, #ec4899 100%)';
                e.target.style.boxShadow = '0 4px 14px rgba(99, 102, 241, 0.25), 0 0 0 1px rgba(255, 255, 255, 0.05) inset';
              }}
            >
              {/* Shine effect */}
              <div 
                className="absolute top-0 -left-full w-full h-full opacity-0 group-hover/btn:opacity-100 group-hover/btn:left-full transition-all duration-500 p-[5rem] ease-out"
                style={{
                  background: 'linear-gradient(90deg, transparent, rgba(255, 255, 255, 0.2), transparent)',
                }}
              />
              
              <span className="relative z-10">View Details</span>
              
              <div 
                className="relative flex items-center justify-center w-5 h-5 rounded border transition-all duration-300 ease-out group-hover/btn:translate-x-1 z-10"
                style={{
                  background: 'rgba(255, 255, 255, 0.1)',
                }}
              >
                <svg className="w-3.5 h-3.5 transition-all duration-300 ease-out group-hover/btn:translate-x-0.5 group-hover/btn:scale-110" fill="none" stroke="currentColor" viewBox="0 0 24 24" strokeWidth={2.5}>
                  <path strokeLinecap="round" strokeLinejoin="round" d="M13 7l5 5m0 0l-5 5m5-5H6" />
                </svg>
              </div>
              
              {/* Ripple effect */}
              <div className="absolute top-1/2 left-1/2 w-0 h-0 rounded-full bg-white bg-opacity-20 transition-all duration-300 ease-out -translate-x-1/2 -translate-y-1/2 pointer-events-none active:w-32 active:h-32 active:duration-75" />
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobCard;