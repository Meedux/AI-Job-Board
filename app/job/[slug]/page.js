"use client";

import { useParams } from "next/navigation";
import { useState, useEffect } from "react";
import Link from "next/link";
import Image from "next/image";
import Header from "../../../components/Header";
import Footer from "../../../components/Footer";
import JobCard from "../../../components/JobCard";
import {
  colors,
  typography,
  components,
  layout,
  spacing,
  animations,
} from "../../../utils/designSystem";
import { useJob } from "../../../utils/jobsApi";
import { jobsApi } from "../../../utils/jobsApi";
import { formatGoogleDocsContent } from "../../../utils/googleDocsFormatter";

export default function JobDetailsPage() {
  const params = useParams();
  const slug = params.slug;
  const { job, loading, error } = useJob(slug);
  const [relatedJobs, setRelatedJobs] = useState([]);
  const [relatedLoading, setRelatedLoading] = useState(false);

  // Fetch related jobs based on categories
  useEffect(() => {
    const fetchRelatedJobs = async () => {
      if (job?.categories?.length > 0) {
        setRelatedLoading(true);
        try {
          // Get jobs in the same category, excluding current job
          const response = await jobsApi.getJobs({
            category: job.categories[0], // Use first category
            limit: 3,
          });

          // Filter out current job and take first 3
          const filtered = response.jobs
            .filter((relatedJob) => relatedJob.slug !== slug)
            .slice(0, 3);

          setRelatedJobs(filtered);
        } catch (error) {
          console.error("Error fetching related jobs:", error);
          setRelatedJobs([]);
        } finally {
          setRelatedLoading(false);
        }
      }
    };

    fetchRelatedJobs();
  }, [job, slug]);
  if (loading) {
    return (
      <div className={`min-h-screen ${colors.neutral.background} font-sans`}>
        <Header />
        <div
          className={`${layout.container} flex justify-center items-center py-20`}
        >
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
        <Footer />
      </div>
    );
  }

  if (error || !job) {
    return (
      <div className={`min-h-screen ${colors.neutral.background} font-sans`}>
        <Header />
        <div className={`${layout.container} text-center py-20`}>
          <div className="text-red-500 mb-4">
            <svg
              className="w-16 h-16 mx-auto mb-4"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <h3
              className={`${typography.h4} ${colors.neutral.textPrimary} mb-2`}
            >
              Job not found
            </h3>
            <p
              className={`${typography.bodyBase} ${colors.neutral.textSecondary} mb-4`}
            >
              {error || "The job you are looking for does not exist."}
            </p>
            <Link
              href="/"
              className={`${components.button.primary} ${components.button.sizes.medium} inline-block`}
            >
              Back to Jobs
            </Link>
          </div>
        </div>
        <Footer />
      </div>
    );
  }

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    try {
      return new Date(dateString).toLocaleDateString("en-US", {
        year: "numeric",
        month: "short",
        day: "numeric",
      });
    } catch {
      return dateString;
    }
  };

  const formatSalary = (salary) => {
    if (!salary) return "Not specified";
    if (salary.from && salary.to) {
      return `${salary.from} - ${salary.to}`;
    }
    if (salary.from) return `${salary.from}+`;
    if (salary.to) return `Up to ${salary.to}`;
    return salary.range || "Not specified";
  };
  return (
    <>
      {/* Custom styles for Google Docs content */}
      <style jsx global>{`
        .google-docs-content {
          color: rgb(209 213 219);
          line-height: 1.7;
          font-size: 1rem;
        }
        
        .google-docs-content p {
          margin-bottom: 1.25rem;
          color: rgb(209 213 219);
          line-height: 1.75;
        }
        
        .google-docs-content p:last-child {
          margin-bottom: 0;
        }
        
        .google-docs-content h1,
        .google-docs-content h2,
        .google-docs-content h3,
        .google-docs-content h4,
        .google-docs-content h5,
        .google-docs-content h6 {
          color: rgb(243 244 246);
          font-weight: 600;
          margin-top: 2rem;
          margin-bottom: 1rem;
          line-height: 1.4;
        }
        
        .google-docs-content h1 {
          font-size: 2rem;
          border-bottom: 2px solid rgb(55 65 81);
          padding-bottom: 0.75rem;
          margin-bottom: 1.5rem;
        }
        
        .google-docs-content h2 {
          font-size: 1.5rem;
          color: rgb(229 231 235);
        }
        
        .google-docs-content h3 {
          font-size: 1.25rem;
          color: rgb(229 231 235);
        }
        
        .google-docs-content h4 {
          font-size: 1.125rem;
          color: rgb(229 231 235);
        }
        
        .google-docs-content strong,
        .google-docs-content b {
          color: rgb(243 244 246);
          font-weight: 600;
        }
        
        .google-docs-content em,
        .google-docs-content i {
          color: rgb(229 231 235);
          font-style: italic;
        }
        
        .google-docs-content ul,
        .google-docs-content ol {
          margin-left: 1.5rem;
          margin-bottom: 1.25rem;
          color: rgb(209 213 219);
        }
        
        .google-docs-content ul {
          list-style-type: disc;
        }
        
        .google-docs-content ol {
          list-style-type: decimal;
        }
        
        .google-docs-content li {
          margin-bottom: 0.75rem;
          line-height: 1.75;
          padding-left: 0.25rem;
        }
        
        .google-docs-content li:last-child {
          margin-bottom: 0;
        }
        
        .google-docs-content a {
          color: rgb(96 165 250);
          text-decoration: underline;
          transition: color 0.2s ease;
        }
        
        .google-docs-content a:hover {
          color: rgb(147 197 253);
        }
        
        .google-docs-content blockquote {
          border-left: 4px solid rgb(37 99 235);
          padding-left: 1rem;
          margin: 1.5rem 0;
          font-style: italic;
          color: rgb(209 213 219);
          background: rgba(55, 65, 81, 0.3);
          padding: 1rem;
          border-radius: 0.5rem;
        }
        
        .google-docs-content code {
          color: rgb(147 197 253);
          background: rgb(31 41 55);
          padding: 0.125rem 0.375rem;
          border-radius: 0.25rem;
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
        }
        
        .google-docs-content pre {
          background: rgb(31 41 55);
          border: 1px solid rgb(55 65 81);
          border-radius: 0.5rem;
          padding: 1rem;
          overflow-x: auto;
          margin: 1.5rem 0;
        }
        
        .google-docs-content pre code {
          background: transparent;
          padding: 0;
          color: rgb(209 213 219);
        }
        
        .google-docs-content hr {
          border: none;
          border-top: 1px solid rgb(55 65 81);
          margin: 2rem 0;
        }
        
        .google-docs-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          border: 1px solid rgb(55 65 81);
          border-radius: 0.5rem;
          overflow: hidden;
        }
        
        .google-docs-content th,
        .google-docs-content td {
          border: 1px solid rgb(55 65 81);
          padding: 0.75rem;
          text-align: left;
        }
        
        .google-docs-content th {
          background: rgb(31 41 55);
          color: rgb(229 231 235);
          font-weight: 600;
        }
        
        .google-docs-content td {
          color: rgb(209 213 219);
        }
        
        @media (max-width: 640px) {
          .google-docs-content {
            font-size: 0.875rem;
          }
          
          .google-docs-content h1 {
            font-size: 1.5rem;
          }
          
          .google-docs-content h2 {
            font-size: 1.25rem;
          }
          
          .google-docs-content h3 {
            font-size: 1.125rem;
          }
          
          .google-docs-content ul,
          .google-docs-content ol {
            margin-left: 1rem;
          }
          
          .google-docs-content table {
            font-size: 0.75rem;
          }
          
          .google-docs-content th,
          .google-docs-content td {
            padding: 0.5rem;
          }
        }
      `}</style>
      
      <div className={`min-h-screen ${colors.neutral.background} font-sans`}>
        <Header />

        <main className="relative">
          {/* Hero Section with Floating Card Design */}
          <div className="relative overflow-hidden">
            {/* Background Pattern */}
            <div className="absolute inset-0 bg-gradient-to-br from-blue-900/10 via-gray-900 to-purple-900/10">
              <div className="absolute inset-0 bg-[url('data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iNjAiIGhlaWdodD0iNjAiIHZpZXdCb3g9IjAgMCA2MCA2MCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48ZyBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPjxnIGZpbGw9IiNmZmYiIGZpbGwtb3BhY2l0eT0iMC4wMiI+PGNpcmNsZSBjeD0iMzAiIGN5PSIzMCIgcj0iMiIvPjwvZz48L2c+PC9zdmc+')] opacity-30"></div>
            </div>

            <div className={`${layout.container} relative z-10 pt-8 pb-16`}>
              {/* Enhanced Breadcrumb with Animation */}
              <nav className="flex space-x-2 items-center mb-8 p-4 rounded-2xl bg-gray-800/40 backdrop-blur-sm border border-gray-700/50 shadow-xl">
                <Link
                  href="/"
                  className={`${colors.neutral.textMuted} hover:${colors.primary.text} ${animations.transition} flex items-center space-x-2 px-3 py-2 rounded-xl hover:bg-gray-700/50`}
                >
                  <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                  </svg>
                  <span className="font-medium">Home</span>
                </Link>
                <div className="flex items-center space-x-2">
                  <svg className={`h-4 w-4 ${colors.neutral.textMuted}`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="m8.25 4.5 7.5 7.5-7.5 7.5" />
                  </svg>
                  <span className={`${typography.bodySmall} ${colors.neutral.textSecondary} line-clamp-1 font-medium px-3 py-2 bg-gray-700/30 rounded-xl`}>
                    {job.title}
                  </span>
                </div>
              </nav>

              {/* Floating Hero Card */}
              <div className="relative">
                <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-2xl"></div>
                <div className="relative p-8 sm:p-12 rounded-3xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 shadow-2xl">
                  <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-8">
                    {/* Left Content */}
                    <div className="flex-1">
                      {/* Job Title with Gradient */}
                      <div className="mb-6">
                        <h1 className={`${typography.h1} bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-4 leading-tight`}>
                          {job.title}
                        </h1>
                        
                        {/* Job Type & Remote Status Pills */}
                        <div className="flex flex-wrap items-center gap-3 mb-6">
                          {job.type && (
                            <span className="px-4 py-2 bg-blue-900/30 text-blue-300 rounded-full border border-blue-800/50 text-sm font-medium">
                              📋 {job.type}
                            </span>
                          )}
                          <span className={`px-4 py-2 rounded-full text-sm font-medium border ${
                            job.remote === "Yes" || job.remote === true 
                              ? "bg-green-900/30 text-green-300 border-green-800/50" 
                              : "bg-red-900/30 text-red-300 border-red-800/50"
                          }`}>
                            {job.remote === "Yes" || job.remote === true ? "🌐 Remote" : "🏢 On-site"}
                          </span>
                          {job.level && (
                            <span className="px-4 py-2 bg-purple-900/30 text-purple-300 rounded-full border border-purple-800/50 text-sm font-medium">
                              📊 {job.level}
                            </span>
                          )}
                        </div>
                      </div>
                      
                      {/* Company Info with Enhanced Design */}
                      <div className="flex items-center gap-6 p-6 bg-gray-900/50 rounded-2xl border border-gray-700/30">
                        {job.company?.logo && (
                          <div className="relative">
                            <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-xl blur-lg"></div>
                            <div className="relative w-16 h-16 p-2 bg-gray-800 rounded-xl border border-gray-700">
                              <Image
                                src={job.company.logo}
                                alt={job.company.name || job.company_name}
                                width={48}
                                height={48}
                                className="w-full h-full object-contain rounded-lg"
                                onError={(e) => { e.target.src = "/placeholder-logo.svg"; }}
                              />
                            </div>
                          </div>
                        )}
                        <div className="flex-1">
                          <h2 className={`${typography.h4} ${colors.neutral.textPrimary} font-bold mb-2`}>
                            {job.company?.name || job.company_name || "Company"}
                          </h2>
                          {job.company?.website && (
                            <a
                              href={job.company.website}
                              target="_blank"
                              rel="noopener noreferrer"
                              className={`${colors.primary.text} hover:text-blue-300 ${typography.bodyBase} ${animations.transition} flex items-center space-x-2 font-medium`}
                            >
                              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                              </svg>
                              <span>Visit Company</span>
                            </a>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Right Content - Apply Button */}
                    {job.apply_link && (
                      <div className="flex-shrink-0">
                        <div className="relative group">
                          <div className="absolute -inset-2 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-75"></div>
                          <a
                            href={job.apply_link}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="relative flex items-center space-x-4 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-lg rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 active:scale-95"
                          >
                            <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            <span>Apply Now</span>
                            <svg className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                            </svg>
                          </a>
                        </div>
                      </div>
                    )}
                  </div>

                  {/* Enhanced Meta Information */}
                  <div className="flex flex-wrap items-center gap-4 mt-8 pt-6 border-t border-gray-700/50">
                    <div className="flex items-center space-x-2 text-gray-400">
                      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                      </svg>
                      <span className="font-medium">Posted {formatDate(job.posted_time)}</span>
                    </div>
                    {job.salary && (job.salary.from || job.salary.to) && (
                      <div className="flex items-center space-x-2 text-green-400">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                        </svg>
                        <span className="font-semibold text-lg">{formatSalary(job.salary)}</span>
                      </div>
                    )}
                    {job.location && (
                      <div className="flex items-center space-x-2 text-blue-400">
                        <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z" />
                        </svg>
                        <span className="font-medium">{job.location}</span>
                      </div>
                    )}
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Main Content with Unique Layout */}
          <div className={`${layout.container} -mt-8 relative z-20`}>
            <div className="grid grid-cols-1 xl:grid-cols-3 gap-8">
              {/* Main Job Description - Takes 2 columns */}
              <div className="xl:col-span-2">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/10 to-blue-600/10 rounded-3xl blur-2xl"></div>
                  <div className="relative p-8 sm:p-10 rounded-3xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 shadow-2xl">
                    {/* Section Header with Icon */}
                    <div className="flex items-center space-x-4 mb-8 pb-6 border-b border-gray-700/50">
                      <div className="w-12 h-12 bg-gradient-to-br from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
                        <svg className="h-7 w-7 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                      </div>
                      <div>
                        <h2 className={`${typography.h3} ${colors.neutral.textPrimary} font-bold`}>
                          Job Description
                        </h2>
                        <p className={`${typography.bodyBase} ${colors.neutral.textSecondary} mt-1`}>
                          Detailed information about this position
                        </p>
                      </div>
                    </div>
                    
                    {/* Enhanced Google Docs Content */}
                    <div className="job-description-wrapper">
                      {job.full_description ? (
                        <div
                          className="google-docs-content"
                          dangerouslySetInnerHTML={{
                            __html: formatGoogleDocsContent(job.full_description),
                          }}
                        />
                      ) : (
                        <div className={`${colors.neutral.textSecondary} leading-relaxed whitespace-pre-wrap text-lg`}>
                          {job.description || "No description available."}
                        </div>
                      )}
                    </div>

                    {/* Call to Action at Bottom */}
                    {job.apply_link && (
                      <div className="mt-10 pt-8 border-t border-gray-700/50">
                        <div className="text-center">
                          <div className="relative group inline-block">
                            <div className="absolute -inset-4 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300 opacity-75"></div>
                            <a
                              href={job.apply_link}
                              target="_blank"
                              rel="noopener noreferrer"
                              className="relative flex items-center justify-center space-x-4 px-12 py-5 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold text-xl rounded-2xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 active:scale-95"
                            >
                              <svg className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                              </svg>
                              <span>Apply for this Position</span>
                              <svg className="h-6 w-6 group-hover:translate-x-2 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                              </svg>
                            </a>
                          </div>
                          <p className={`${typography.bodyBase} ${colors.neutral.textMuted} mt-4`}>
                            You&apos;ll be redirected to the company&apos;s application page
                          </p>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </div>
              {/* Sidebar - Right Column */}
              <div className="xl:col-span-1 space-y-8">
                {/* Enhanced Company Card */}
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-green-600/10 to-blue-600/10 rounded-3xl blur-2xl"></div>
                  <div className="relative p-6 rounded-3xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 shadow-2xl">
                    <div className="text-center">
                      {job.company?.logo && (
                        <div className="relative mx-auto mb-6">
                          <div className="absolute -inset-3 bg-gradient-to-r from-blue-600/30 to-purple-600/30 rounded-2xl blur-lg"></div>
                          <div className="relative w-24 h-24 mx-auto p-3 bg-gray-800 rounded-2xl border border-gray-700">
                            <Image
                              src={job.company.logo}
                              alt={job.company.name || job.company_name}
                              width={72}
                              height={72}
                              className="w-full h-full object-contain rounded-xl"
                              onError={(e) => { e.target.src = "/placeholder-logo.svg"; }}
                            />
                          </div>
                        </div>
                      )}
                      <h3 className={`${typography.h4} ${colors.neutral.textPrimary} mb-4 font-bold`}>
                        {job.company?.name || job.company_name || "Company"}
                      </h3>
                      {job.company?.website && (
                        <a
                          href={job.company.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-900/30 text-blue-300 rounded-xl border border-blue-800/50 hover:bg-blue-800/40 transition-all duration-300 mb-6"
                        >
                          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.19 8.688a4.5 4.5 0 0 1 1.242 7.244l-4.5 4.5a4.5 4.5 0 0 1-6.364-6.364l1.757-1.757m13.35-.622 1.757-1.757a4.5 4.5 0 0 0-6.364-6.364l-4.5 4.5a4.5 4.5 0 0 0 1.242 7.244" />
                          </svg>
                          <span className="font-medium">Visit Website</span>
                        </a>
                      )}
                    </div>
                  </div>
                </div>

                {/* Enhanced Job Details Card */}
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-600/10 to-pink-600/10 rounded-3xl blur-2xl"></div>
                  <div className="relative p-6 rounded-3xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 shadow-2xl">
                    <div className="flex items-center space-x-3 mb-6 pb-4 border-b border-gray-700/50">
                      <div className="w-10 h-10 bg-gradient-to-br from-purple-600 to-pink-600 rounded-xl flex items-center justify-center">
                        <svg className="h-6 w-6 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z" />
                        </svg>
                      </div>
                      <h4 className={`${typography.h5} ${colors.neutral.textPrimary} font-bold`}>
                        Job Details
                      </h4>
                    </div>

                    <div className="space-y-5">
                      {/* Salary - Featured */}
                      {job.salary && (job.salary.from || job.salary.to) && (
                        <div className="p-4 bg-gradient-to-br from-green-900/30 to-emerald-900/20 rounded-2xl border border-green-800/50">
                          <div className="flex items-center justify-center space-x-2 mb-2">
                            <svg className="h-6 w-6 text-green-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z" />
                            </svg>
                            <span className="text-green-400 font-semibold">Salary Range</span>
                          </div>
                          <div className="text-center text-2xl font-bold text-green-300">
                            {formatSalary(job.salary)}
                          </div>
                        </div>
                      )}

                      {/* Other Details */}
                      {[
                        { 
                          icon: "M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z",
                          label: "Location", 
                          value: job.location || "Not specified",
                          color: "blue"
                        },
                        { 
                          icon: "M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z",
                          label: "Experience", 
                          value: job.level || "Not specified",
                          color: "purple"
                        },
                        { 
                          icon: "M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3",
                          label: "Job Type", 
                          value: job.type || "Not specified",
                          color: "orange"
                        }
                      ].map((detail, index) => (
                        <div key={index} className="flex items-center justify-between p-3 rounded-xl bg-gray-800/40 border border-gray-700/50">
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 bg-${detail.color}-900/30 rounded-lg flex items-center justify-center`}>
                              <svg className={`h-4 w-4 text-${detail.color}-400`} fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d={detail.icon} />
                              </svg>
                            </div>
                            <span className={`${colors.neutral.textSecondary} font-medium`}>{detail.label}</span>
                          </div>
                          <span className={`${colors.neutral.textPrimary} font-semibold`}>{detail.value}</span>
                        </div>
                      ))}

                      {/* Categories */}
                      {job.categories && job.categories.length > 0 && (
                        <div className="p-3 rounded-xl bg-gray-800/40 border border-gray-700/50">
                          <div className="flex items-center space-x-3 mb-3">
                            <div className="w-8 h-8 bg-cyan-900/30 rounded-lg flex items-center justify-center">
                              <svg className="h-4 w-4 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z" />
                              </svg>
                            </div>
                            <span className={`${colors.neutral.textSecondary} font-medium`}>Categories</span>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            {job.categories.map((category, idx) => (
                              <span
                                key={idx}
                                className="px-3 py-1 bg-cyan-900/30 text-cyan-300 rounded-full text-xs font-medium border border-cyan-800/50"
                              >
                                {category}
                              </span>
                            ))}
                          </div>
                        </div>
                      )}

                      {/* Dates */}
                      <div className="space-y-3">
                        <div className="flex items-center justify-between p-3 rounded-xl bg-gray-800/40 border border-gray-700/50">
                          <div className="flex items-center space-x-3">
                            <div className="w-8 h-8 bg-gray-700/50 rounded-lg flex items-center justify-center">
                              <svg className="h-4 w-4 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                              </svg>
                            </div>
                            <span className={`${colors.neutral.textSecondary} font-medium`}>Posted</span>
                          </div>
                          <span className={`${colors.neutral.textPrimary} font-semibold`}>{formatDate(job.posted_time)}</span>
                        </div>

                        {job.expire_time && (
                          <div className="flex items-center justify-between p-3 rounded-xl bg-red-900/20 border border-red-800/50">
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-red-900/30 rounded-lg flex items-center justify-center">
                                <svg className="h-4 w-4 text-red-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M6.75 2.994v2.25m10.5-2.25v2.25m-14.252 13.5V7.491a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v11.251m-18 0a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5m-6.75-6h2.25m-9 2.25h4.5m.002-2.25h.005v.006H12v-.006Zm-.001 4.5h.006v.006h-.006v-.005Zm-2.25.001h.005v.006H9.75v-.006Zm-2.25 0h.005v.005h-.006v-.005Zm6.75-2.247h.005v.005h-.005v-.005Zm0 2.247h.006v.006h-.006v-.006Zm2.25-2.248h.006V15H16.5v-.005Z" />
                                </svg>
                              </div>
                              <span className="text-red-300 font-medium">Expires</span>
                            </div>
                            <span className="text-red-300 font-semibold">{formatDate(job.expire_time)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Enhanced Newsletter Signup */}
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-pink-600/10 to-purple-600/10 rounded-3xl blur-2xl"></div>
                  <div className="relative p-6 rounded-3xl bg-gradient-to-br from-gray-800/80 to-gray-900/80 backdrop-blur-xl border border-gray-700/50 shadow-2xl">
                    <div className="text-center">
                      <div className="w-16 h-16 mx-auto mb-4 bg-gradient-to-br from-pink-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-xl">
                        <svg className="h-8 w-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                          <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75" />
                        </svg>
                      </div>
                      <h3 className={`${typography.h5} ${colors.neutral.textPrimary} mb-3 font-bold`}>
                        💼 Get Job Alerts
                      </h3>
                      <p className={`${typography.bodyBase} ${colors.neutral.textSecondary} mb-6 leading-relaxed`}>
                        Subscribe for curated job postings delivered weekly
                      </p>
                      <form className="space-y-4">
                        <input
                          type="email"
                          placeholder="Your email address"
                          className="w-full px-4 py-3 bg-gray-800/50 border border-gray-700 rounded-xl text-white placeholder:text-gray-500 focus:border-purple-500 focus:ring-2 focus:ring-purple-500/20 transition-all duration-300"
                          required
                        />
                        <button
                          type="submit"
                          className="w-full px-6 py-3 bg-gradient-to-r from-pink-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-purple-500/25 transition-all duration-300 transform hover:scale-105 active:scale-95"
                        >
                          🚀 Subscribe Now
                        </button>
                        <p className={`${typography.bodyXSmall} ${colors.neutral.textMuted}`}>
                          No spam, unsubscribe anytime
                        </p>
                      </form>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>

          {/* Enhanced Related Jobs Section */}
          {(relatedJobs.length > 0 || relatedLoading) && (
            <div className={`${layout.container} mt-20 mb-16`}>
              <div className="text-center mb-12">
                <div className="relative inline-block">
                  <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-3xl blur-2xl"></div>
                  <div className="relative">
                    <h2 className={`${typography.h2} bg-gradient-to-r from-white via-gray-100 to-gray-300 bg-clip-text text-transparent mb-4 font-bold`}>
                      🔍 Related Opportunities
                    </h2>
                    <p className={`${typography.bodyLarge} ${colors.neutral.textSecondary}`}>
                      Discover more positions that might interest you
                    </p>
                  </div>
                </div>
              </div>

              {relatedLoading ? (
                <div className="flex justify-center py-12">
                  <div className="relative">
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-full blur-xl"></div>
                    <div className="relative animate-spin rounded-full h-16 w-16 border-4 border-gray-700 border-t-blue-600"></div>
                  </div>
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-8">
                  {relatedJobs.map((relatedJob, index) => (
                    <div key={index} className="relative group">
                      <div className="absolute -inset-2 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-2xl blur-xl group-hover:blur-2xl transition-all duration-300"></div>
                      <div className="relative">
                        <JobCard job={relatedJob} className="transform group-hover:scale-[1.02] transition-all duration-300" />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {relatedJobs.length > 0 && (
                <div className="text-center mt-12">
                  <div className="relative inline-block group">
                    <div className="absolute -inset-4 bg-gradient-to-r from-blue-600/20 to-purple-600/20 rounded-2xl blur-lg group-hover:blur-xl transition-all duration-300"></div>
                    <Link
                      href="/"
                      className="relative inline-flex items-center space-x-3 px-8 py-4 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-2xl shadow-xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 active:scale-95"
                    >
                      <span>Browse All Jobs</span>
                      <svg className="h-5 w-5 group-hover:translate-x-1 transition-transform" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3" />
                      </svg>
                    </Link>
                  </div>
                </div>
              )}
            </div>
          )}
        </main>

        <Footer />
      </div>
    </>
  );
}
