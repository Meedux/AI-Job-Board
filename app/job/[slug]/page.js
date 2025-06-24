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
    <div className={`min-h-screen ${colors.neutral.background} font-sans`}>
      <Header />

      <main className={layout.container}>
        <div className={`${layout.section} py-8`}>
          {/* Breadcrumb */}
          <nav className="flex space-x-2 items-center mb-6">
            <Link
              href="/"
              className={`${colors.neutral.textMuted} hover:${colors.neutral.textSecondary} ${animations.transition}`}
            >
              <svg
                className="h-5 w-5"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                />
              </svg>
            </Link>
            <svg
              className={`h-4 w-4 ${colors.neutral.textMuted}`}
              fill="none"
              viewBox="0 0 24 24"
              stroke="currentColor"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="1.5"
                d="m8.25 4.5 7.5 7.5-7.5 7.5"
              />
            </svg>
            <span
              className={`${typography.bodySmall} ${colors.neutral.textSecondary} line-clamp-1`}
            >
              {job.title}
            </span>
          </nav>

          {/* Job Header */}
          <div className="mb-8">
            <h1
              className={`${typography.h1} ${colors.neutral.textPrimary} mb-4`}
            >
              {job.title}
            </h1>
            <div
              className={`flex flex-wrap items-center ${spacing.gapSmall} ${typography.bodySmall} ${colors.neutral.textSecondary}`}
            >
              <span className="flex items-center space-x-1">
                <svg
                  className="h-4 w-4"
                  fill="none"
                  viewBox="0 0 24 24"
                  stroke="currentColor"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="1.5"
                    d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                  />
                </svg>
                <span>Posted on {formatDate(job.posted_time)}</span>
              </span>
              {job.expire_time && (
                <>
                  <span className="hidden sm:block">·</span>
                  <span className="flex items-center space-x-1">
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="1.5"
                        d="M6.75 2.994v2.25m10.5-2.25v2.25m-14.252 13.5V7.491a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v11.251m-18 0a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5m-6.75-6h2.25m-9 2.25h4.5m.002-2.25h.005v.006H12v-.006Zm-.001 4.5h.006v.006h-.006v-.005Zm-2.25.001h.005v.006H9.75v-.006Zm-2.25 0h.005v.005h-.006v-.005Zm6.75-2.247h.005v.005h-.005v-.005Zm0 2.247h.006v.006h-.006v-.006Zm2.25-2.248h.006V15H16.5v-.005Z"
                      />
                    </svg>
                    <span>Expires on {formatDate(job.expire_time)}</span>
                  </span>
                </>
              )}
            </div>
          </div>

          {/* Main Content Grid */}
          <div className={layout.grid.sidebar}>
            {/* Job Description - Left Column */}
            <div className="col-span-12 lg:col-span-8">
              {" "}
              <div
                className={`${components.card.base} ${components.card.padding}`}
              >
                <h2
                  className={`${typography.h3} ${colors.neutral.textPrimary} mb-6`}
                >
                  Job Description
                </h2>
                <div className="prose prose-slate prose-lg max-w-none">
                  {job.full_description ? (
                    <div
                      className="google-docs-content"
                      dangerouslySetInnerHTML={{
                        __html: job.full_description,
                      }}
                    />
                  ) : (
                    <div
                      className={`${colors.neutral.textSecondary} leading-relaxed whitespace-pre-wrap`}
                    >
                      {job.description || "No description available."}
                    </div>
                  )}
                </div>

                {/* Apply Button */}
                {job.apply_link && (
                  <a
                    href={job.apply_link}
                    target="_blank"
                    rel="noopener noreferrer"
                    className={`${components.button.primary} ${components.button.sizes.large} w-full mt-6 flex items-center justify-center space-x-2`}
                  >
                    <span>Apply for this position</span>
                    <svg
                      className="h-4 w-4"
                      fill="none"
                      viewBox="0 0 24 24"
                      stroke="currentColor"
                    >
                      <path
                        strokeLinecap="round"
                        strokeLinejoin="round"
                        strokeWidth="2"
                        d="M13.5 4.5 21 12m0 0-7.5 7.5M21 12H3"
                      />
                    </svg>
                  </a>
                )}
              </div>
            </div>{" "}
            {/* Sidebar - Right Column */}
            <div className="col-span-12 lg:col-span-4">
              <div className={spacing.gapMedium}>
                {/* Company Info */}
                <div
                  className={`${components.card.base} ${components.card.padding} text-center`}
                >
                  {job.company?.logo && (
                    <div className="w-20 h-20 mx-auto mb-4 relative">
                      <Image
                        src={job.company.logo}
                        alt={job.company.name || job.company_name}
                        width={80}
                        height={80}
                        className="w-full h-full object-contain rounded-lg"
                        onError={(e) => {
                          e.target.src = "/placeholder-logo.svg";
                        }}
                      />
                    </div>
                  )}
                  <h3
                    className={`${typography.h4} ${colors.neutral.textPrimary} mb-2`}
                  >
                    {job.company?.name || job.company_name || "Company"}
                  </h3>
                  {job.company?.website && (
                    <a
                      href={job.company.website}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${colors.primary.text} hover:underline ${typography.bodySmall} block mb-4`}
                    >
                      Visit Website
                    </a>
                  )}
                  {job.apply_link && (
                    <a
                      href={job.apply_link}
                      target="_blank"
                      rel="noopener noreferrer"
                      className={`${components.button.primary} ${components.button.sizes.medium} w-full flex items-center justify-center space-x-2`}
                    >
                      <span>Apply Now</span>
                    </a>
                  )}
                </div>
                {/* Job Information */}
                <div
                  className={`${components.card.base} ${components.card.padding}`}
                >
                  {/* Salary */}
                  <div className="text-center mb-6">
                    <div
                      className={`flex justify-center items-center space-x-1 ${typography.bodyLarge} font-bold mb-2`}
                    >
                      <svg
                        className="h-5 w-5 text-gray-200"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M2.25 18.75a60.07 60.07 0 0 1 15.797 2.101c.727.198 1.453-.342 1.453-1.096V18.75M3.75 4.5v.75A.75.75 0 0 1 3 6h-.75m0 0v-.375c0-.621.504-1.125 1.125-1.125H20.25M2.25 6v9m18-10.5v.75c0 .414.336.75.75.75h.75m-1.5-1.5h.375c.621 0 1.125.504 1.125 1.125v9.75c0 .621-.504 1.125-1.125 1.125h-.375m1.5-1.5H21a.75.75 0 0 0-.75.75v.75m0 0H3.75m0 0h-.375a1.125 1.125 0 0 1-1.125-1.125V15m1.5 1.5v-.75A.75.75 0 0 0 3 15h-.75M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Zm3 0h.008v.008H18V10.5Zm-12 0h.008v.008H6V10.5Z"
                        />
                      </svg>
                      <span className="text-gray-200">Salary</span>
                    </div>
                    <div
                      className={`${typography.bodyLarge} font-semibold ${colors.neutral.textPrimary}`}
                    >
                      {formatSalary(job.salary)}
                    </div>
                  </div>

                  <div
                    className={`${colors.neutral.border} border-t my-6`}
                  ></div>

                  {/* Job Overview */}
                  <div className="mb-4">
                    <h4
                      className={`${typography.bodyLarge} font-bold flex items-center space-x-1 mb-4`}
                    >
                      <svg
                        className="h-5 w-5 text-gray-200"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
                        />
                      </svg>
                      <span className="text-gray-200">Job Overview</span>
                    </h4>
                    <div className="space-y-4">
                      {/* Location */}
                      <div className="flex justify-between items-center">
                        <span
                          className={`flex items-center space-x-1 ${colors.neutral.textSecondary}`}
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                              d="M15 10.5a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z"
                            />
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                              d="M19.5 10.5c0 7.142-7.5 11.25-7.5 11.25S4.5 17.642 4.5 10.5a7.5 7.5 0 1 1 15 0Z"
                            />
                          </svg>
                          <span>Location</span>
                        </span>
                        <span
                          className={`${typography.bodyBase} font-medium ${colors.neutral.textPrimary}`}
                        >
                          {job.location || "Not specified"}
                        </span>
                      </div>

                      {/* Level */}
                      <div className="flex justify-between items-center">
                        <span
                          className={`flex items-center space-x-1 ${colors.neutral.textSecondary}`}
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                              d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 0 1 3 19.875v-6.75ZM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V8.625ZM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 0 1-1.125-1.125V4.125Z"
                            />
                          </svg>
                          <span>Level</span>
                        </span>
                        <span
                          className={`${typography.bodyBase} font-medium ${colors.neutral.textPrimary}`}
                        >
                          {job.level || "Not specified"}
                        </span>
                      </div>

                      {/* Remote */}
                      <div className="flex justify-between items-center">
                        <span
                          className={`flex items-center space-x-1 ${colors.neutral.textSecondary}`}
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                              d="M8.288 15.038a5.25 5.25 0 0 1 7.424 0M5.106 11.856c3.807-3.808 9.98-3.808 13.788 0M1.924 8.674c5.565-5.565 14.587-5.565 20.152 0M12.53 18.22l-.53.53-.53-.53a.75.75 0 0 1 1.06 0Z"
                            />
                          </svg>
                          <span>Remote</span>
                        </span>
                        <span
                          className={`${typography.bodyBase} font-medium ${colors.neutral.textPrimary}`}
                        >
                          {job.remote === "Yes" || job.remote === true
                            ? "Yes"
                            : "No"}
                        </span>
                      </div>

                      {/* Job Type */}
                      <div className="flex justify-between items-center">
                        <span
                          className={`flex items-center space-x-1 ${colors.neutral.textSecondary}`}
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                              d="M6.429 9.75 2.25 12l4.179 2.25m0-4.5 5.571 3 5.571-3m-11.142 0L2.25 7.5 12 2.25l9.75 5.25-4.179 2.25m0 0L21.75 12l-4.179 2.25m0 0 4.179 2.25L12 21.75 2.25 16.5l4.179-2.25m11.142 0-5.571 3-5.571-3"
                            />
                          </svg>
                          <span>Type</span>
                        </span>
                        <span
                          className={`${typography.bodyBase} font-medium ${colors.neutral.textPrimary}`}
                        >
                          {job.type || "Not specified"}
                        </span>
                      </div>

                      {/* Categories */}
                      {job.categories && job.categories.length > 0 && (
                        <div className="flex justify-between items-center">
                          <span
                            className={`flex items-center space-x-1 ${colors.neutral.textSecondary}`}
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M20.25 14.15v4.25c0 1.094-.787 2.036-1.872 2.18-2.087.277-4.216.42-6.378.42s-4.291-.143-6.378-.42c-1.085-.144-1.872-1.086-1.872-2.18v-4.25m16.5 0a2.18 2.18 0 0 0 .75-1.661V8.706c0-1.081-.768-2.015-1.837-2.175a48.114 48.114 0 0 0-3.413-.387m4.5 8.006c-.194.165-.42.295-.673.38A23.978 23.978 0 0 1 12 15.75c-2.648 0-5.195-.429-7.577-1.22a2.016 2.016 0 0 1-.673-.38m0 0A2.18 2.18 0 0 1 3 12.489V8.706c0-1.081.768-2.015 1.837-2.175a48.111 48.111 0 0 1 3.413-.387m7.5 0V5.25A2.25 2.25 0 0 0 13.5 3h-3a2.25 2.25 0 0 0-2.25 2.25v.894m7.5 0a48.667 48.667 0 0 0-7.5 0M12 12.75h.008v.008H12v-.008Z"
                              />
                            </svg>
                            <span>Categories</span>
                          </span>
                          <span
                            className={`${typography.bodyBase} font-medium ${colors.neutral.textPrimary}`}
                          >
                            {job.categories.slice(0, 2).join(", ")}
                            {job.categories.length > 2 && "..."}
                          </span>
                        </div>
                      )}

                      {/* Posted Date */}
                      <div className="flex justify-between items-center">
                        <span
                          className={`flex items-center space-x-1 ${colors.neutral.textSecondary}`}
                        >
                          <svg
                            className="h-4 w-4"
                            fill="none"
                            viewBox="0 0 24 24"
                            stroke="currentColor"
                          >
                            <path
                              strokeLinecap="round"
                              strokeLinejoin="round"
                              strokeWidth="1.5"
                              d="M12 6v6h4.5m4.5 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z"
                            />
                          </svg>
                          <span>Posted</span>
                        </span>
                        <span
                          className={`${typography.bodyBase} font-medium ${colors.neutral.textPrimary}`}
                        >
                          {formatDate(job.posted_time)}
                        </span>
                      </div>

                      {/* Expire Date */}
                      {job.expire_time && (
                        <div className="flex justify-between items-center">
                          <span
                            className={`flex items-center space-x-1 ${colors.neutral.textSecondary}`}
                          >
                            <svg
                              className="h-4 w-4"
                              fill="none"
                              viewBox="0 0 24 24"
                              stroke="currentColor"
                            >
                              <path
                                strokeLinecap="round"
                                strokeLinejoin="round"
                                strokeWidth="1.5"
                                d="M6.75 2.994v2.25m10.5-2.25v2.25m-14.252 13.5V7.491a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v11.251m-18 0a2.25 2.25 0 0 0 2.25 2.25h13.5a2.25 2.25 0 0 0 2.25-2.25m-18 0v-7.5a2.25 2.25 0 0 1 2.25-2.25h13.5a2.25 2.25 0 0 1 2.25 2.25v7.5m-6.75-6h2.25m-9 2.25h4.5m.002-2.25h.005v.006H12v-.006Zm-.001 4.5h.006v.006h-.006v-.005Zm-2.25.001h.005v.006H9.75v-.006Zm-2.25 0h.005v.005h-.006v-.005Zm6.75-2.247h.005v.005h-.005v-.005Zm0 2.247h.006v.006h-.006v-.006Zm2.25-2.248h.006V15H16.5v-.005Z"
                              />
                            </svg>
                            <span>Expires</span>
                          </span>
                          <span
                            className={`${typography.bodyBase} font-medium ${colors.neutral.textPrimary}`}
                          >
                            {formatDate(job.expire_time)}
                          </span>
                        </div>
                      )}
                    </div>
                  </div>
                </div>{" "}
                {/* Newsletter Signup */}
                <div
                  className={`${components.card.base} ${components.card.padding}`}
                >
                  <div className="text-center">
                    <div
                      className={`${colors.neutral.backgroundSecondary} items-center ${colors.neutral.border} border font-medium ${colors.neutral.textPrimary} rounded inline-block p-2 mb-4`}
                    >
                      <svg
                        className="h-8 w-8"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="1.5"
                          d="M21.75 6.75v10.5a2.25 2.25 0 0 1-2.25 2.25h-15a2.25 2.25 0 0 1-2.25-2.25V6.75m19.5 0A2.25 2.25 0 0 0 19.5 4.5h-15a2.25 2.25 0 0 0-2.25 2.25m19.5 0v.243a2.25 2.25 0 0 1-1.07 1.916l-7.5 4.615a2.25 2.25 0 0 1-2.36 0L3.32 8.91a2.25 2.25 0 0 1-1.07-1.916V6.75"
                        />
                      </svg>
                    </div>
                    <h3
                      className={`${typography.h4} ${colors.neutral.textPrimary} mb-2`}
                    >
                      Get job alerts in your inbox
                    </h3>
                    <p
                      className={`${typography.bodyBase} ${colors.neutral.textSecondary} mb-4`}
                    >
                      Subscribe to receive new job postings that match your
                      interests
                    </p>

                    <form className="space-y-3">
                      <input
                        type="email"
                        placeholder="Enter your email"
                        className={components.input.base}
                        required
                      />
                      <button
                        type="submit"
                        className={`${components.button.primary} ${components.button.sizes.medium} w-full`}
                      >
                        Subscribe
                      </button>
                    </form>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Related Jobs Section */}
        {(relatedJobs.length > 0 || relatedLoading) && (
          <div className={`${layout.container} mt-16`}>
            <h2
              className={`${typography.h2} ${colors.neutral.textPrimary} mb-8`}
            >
              Related Jobs
            </h2>

            {relatedLoading ? (
              <div className="flex justify-center py-8">
                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
              </div>
            ) : (
              <div className="grid grid-cols-1 gap-6">
                {relatedJobs.map((relatedJob, index) => (
                  <JobCard
                    key={`${index}`}
                    job={relatedJob}
                    className="w-full"
                  />
                ))}
              </div>
            )}
          </div>
        )}
      </main>

      <Footer />
    </div>
  );
}
