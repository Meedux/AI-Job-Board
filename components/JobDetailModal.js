'use client';

import { useState, useEffect } from 'react';
import { colors, typography, components, animations, combineClasses } from '../utils/designSystem';

const JobDetailModal = ({ job, isOpen, onClose }) => {
  const [jobContent, setJobContent] = useState('');
  const [isLoadingContent, setIsLoadingContent] = useState(false);

  useEffect(() => {
    if (isOpen && (job?.content_doc_url || job?.content)) {
      loadJobContent();
    }
  }, [isOpen, job]);

  const loadJobContent = async () => {
    // Check if we already have processed content
    if (job?.full_description) {
      console.log('Using pre-loaded full_description');
      setJobContent(job.full_description);
      return;
    }

    // Otherwise try to fetch from Google Docs URL
    const contentUrl = job?.content_doc_url || job?.content;
    if (!contentUrl) {
      console.log('No content URL found for job:', job);
      setJobContent('');
      return;
    }
    
    console.log('Loading content from Google Docs URL:', contentUrl);
    setIsLoadingContent(true);
    try {
      const response = await fetch('/api/jobs/content', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ contentUrl }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to fetch content');
      }

      const data = await response.json();
      console.log('Google Docs content received:', data.content ? 'Content loaded' : 'No content');
      setJobContent(data.content || '');
    } catch (error) {
      console.error('Error loading job content:', error);
      setJobContent(`
        <div style="text-align: center; padding: 2rem; background: rgba(239, 68, 68, 0.1); border: 1px solid rgba(239, 68, 68, 0.2); border-radius: 0.5rem;">
          <p style="color: rgb(209, 213, 219); margin-bottom: 1rem;">Unable to load job description from Google Docs.</p>
          <p style="color: rgb(156, 163, 175); font-size: 0.875rem;">Error: ${error.message}</p>
          <p style="color: rgb(156, 163, 175); font-size: 0.875rem;">URL: ${contentUrl}</p>
        </div>
      `);
    } finally {
      setIsLoadingContent(false);
    }
  };

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

  const formatSalary = (fromSalary, toSalary) => {
    if (!fromSalary && !toSalary) return "Not specified";
    if (fromSalary && toSalary) {
      return `$${fromSalary.toLocaleString()} - $${toSalary.toLocaleString()}`;
    }
    if (fromSalary) return `$${fromSalary.toLocaleString()}+`;
    if (toSalary) return `Up to $${toSalary.toLocaleString()}`;
    return "Not specified";
  };

  if (!isOpen || !job) return null;

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
        
        .google-docs-content h1 {
          font-size: 1.875rem;
          font-weight: 700;
          color: rgb(243 244 246);
          margin-bottom: 1.5rem;
          border-bottom: 2px solid rgb(55 65 81);
          padding-bottom: 0.75rem;
        }
        
        .google-docs-content h2 {
          font-size: 1.5rem;
          font-weight: 600;
          color: rgb(229 231 235);
          margin-bottom: 1.25rem;
          margin-top: 2rem;
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
          background: rgba(55, 65, 81, 0.5);
          padding: 0.25rem 0.5rem;
          border-radius: 0.25rem;
          font-family: 'Courier New', monospace;
          font-size: 0.875rem;
        }
        
        .google-docs-content pre {
          background: rgba(55, 65, 81, 0.5);
          padding: 1rem;
          border-radius: 0.5rem;
          overflow-x: auto;
          margin: 1.5rem 0;
        }
        
        .google-docs-content table {
          width: 100%;
          border-collapse: collapse;
          margin: 1.5rem 0;
          background: rgba(55, 65, 81, 0.3);
          border-radius: 0.5rem;
          overflow: hidden;
        }
        
        .google-docs-content th,
        .google-docs-content td {
          padding: 0.75rem;
          text-align: left;
          border-bottom: 1px solid rgb(75 85 99);
        }
        
        .google-docs-content th {
          background: rgba(55, 65, 81, 0.7);
          font-weight: 600;
          color: rgb(243 244 246);
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

      {/* Modal Overlay */}
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div 
          className="fixed inset-0 bg-black/70 backdrop-blur-sm" 
          onClick={onClose}
        ></div>
        
        {/* Modal Content */}
        <div className={combineClasses(
          "relative w-full max-w-4xl max-h-[90vh] overflow-hidden rounded-2xl shadow-2xl",
          colors.neutral.surface,
          colors.neutral.border,
          "border"
        )}>
          {/* Header */}
          <div className={combineClasses(
            "flex items-center justify-between p-6 border-b",
            colors.neutral.backgroundSecondary,
            colors.neutral.border
          )}>
            <div className="flex items-center gap-4">
              {(job.company_logo || job.company?.logo) && (
                <div className={combineClasses(
                  "w-16 h-16 rounded-lg overflow-hidden p-2",
                  colors.neutral.surface
                )}>
                  <img 
                    src={job.company_logo || job.company?.logo} 
                    alt={`${job.company_name || job.company?.name} logo`}
                    className="w-full h-full object-contain"
                    onError={(e) => {
                      e.target.src = "/placeholder-logo.svg";
                    }}
                  />
                </div>
              )}
              <div>
                <h1 className={combineClasses(typography.h4, colors.neutral.textPrimary, "mb-1")}>
                  {job.title}
                </h1>
                <p className={combineClasses(typography.h5, colors.neutral.textSecondary, "font-medium")}>
                  {job.company_name || job.company?.name}
                </p>
              </div>
            </div>
            
            <button
              onClick={onClose}
              className={combineClasses(
                components.button.base,
                components.button.ghost,
                components.button.sizes.small,
                "rounded-lg"
              )}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content */}
          <div className="overflow-y-auto max-h-[calc(90vh-180px)]">
            {/* Quick Info */}
            <div className={combineClasses("p-6 border-b", colors.primary.background, colors.neutral.border)}>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className={combineClasses(typography.bodySmall, colors.neutral.textTertiary, "mb-1")}>Location</p>
                  <p className={combineClasses(typography.bodyBase, "font-medium", colors.neutral.textPrimary)}>{job.location || "Not specified"}</p>
                </div>
                <div>
                  <p className={combineClasses(typography.bodySmall, colors.neutral.textTertiary, "mb-1")}>Job Type</p>
                  <p className={combineClasses(typography.bodyBase, "font-medium capitalize", colors.neutral.textPrimary)}>{job.type || "Full-time"}</p>
                </div>
                <div>
                  <p className={combineClasses(typography.bodySmall, colors.neutral.textTertiary, "mb-1")}>Experience Level</p>
                  <p className={combineClasses(typography.bodyBase, "font-medium capitalize", colors.neutral.textPrimary)}>{job.level || "Not specified"}</p>
                </div>
                <div>
                  <p className={combineClasses(typography.bodySmall, colors.neutral.textTertiary, "mb-1")}>Salary</p>
                  <p className={combineClasses(typography.bodyBase, "font-medium", colors.success.text)}>
                    {formatSalary(job.salary?.from, job.salary?.to)}
                  </p>
                </div>
              </div>
              
              {/* Remote Badge */}
              {(job.remote === "Yes" || job.remote === true) && (
                <div className="mt-3">
                  <span className={combineClasses(
                    "inline-flex items-center px-3 py-1 rounded-full",
                    typography.bodySmall,
                    "font-medium",
                    colors.success.background,
                    colors.success.text
                  )}>
                    🌐 Remote Work Available
                  </span>
                </div>
              )}

              {/* Categories */}
              {job.categories && job.categories.length > 0 && (
                <div className="mt-4">
                  <p className={combineClasses(typography.bodySmall, colors.neutral.textTertiary, "mb-2")}>Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {job.categories.map((category, index) => (
                      <span
                        key={index}
                        className={combineClasses(
                          "inline-flex items-center px-2 py-1 rounded",
                          typography.bodyXSmall,
                          "font-medium",
                          colors.secondary.background,
                          colors.secondary.text
                        )}
                      >
                        {category}
                      </span>
                    ))}
                  </div>
                </div>
              )}
            </div>

            {/* Job Description */}
            <div className="p-6">
              <h2 className={combineClasses(typography.h5, colors.neutral.textPrimary, "mb-4")}>
                Job Description
              </h2>
              
              {isLoadingContent ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                    <p className={combineClasses(typography.bodyBase, colors.neutral.textSecondary)}>
                      Loading job description...
                    </p>
                  </div>
                </div>
              ) : jobContent ? (
                <div 
                  className="google-docs-content"
                  dangerouslySetInnerHTML={{ __html: jobContent }}
                />
              ) : (
                <div className={combineClasses(
                  "p-4 rounded-lg border",
                  colors.neutral.backgroundTertiary,
                  colors.neutral.border
                )}>
                  <p className={combineClasses(typography.bodyBase, colors.neutral.textSecondary, "mb-3")}>
                    Detailed job description will be available when you apply or visit the company website.
                  </p>
                  <div className={combineClasses("space-y-2", typography.bodySmall)}>
                    <p className={colors.neutral.textPrimary}><strong>Position:</strong> {job.title}</p>
                    <p className={colors.neutral.textPrimary}><strong>Company:</strong> {job.company_name || job.company?.name}</p>
                    <p className={colors.neutral.textPrimary}><strong>Posted:</strong> {formatDate(job.posted_time)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions */}
          <div className={combineClasses(
            "p-6 border-t",
            colors.neutral.backgroundSecondary,
            colors.neutral.border
          )}>
            <div className="flex flex-col sm:flex-row gap-3">
              {job.apply_link ? (
                <a
                  href={job.apply_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={combineClasses(
                    components.button.base,
                    components.button.primary,
                    components.button.sizes.large,
                    "flex-1 text-center"
                  )}
                >
                  Apply Now
                </a>
              ) : (
                <button
                  disabled
                  className={combineClasses(
                    components.button.base,
                    "bg-gray-600 text-gray-400 cursor-not-allowed",
                    components.button.sizes.large,
                    "flex-1"
                  )}
                >
                  Application Link Not Available
                </button>
              )}
              
              {(job.company?.website || job.company_website) && (
                <a
                  href={job.company?.website || job.company_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={combineClasses(
                    components.button.base,
                    components.button.secondary,
                    components.button.sizes.large,
                    "text-center"
                  )}
                >
                  Company Website
                </a>
              )}
              
              <button
                onClick={onClose}
                className={combineClasses(
                  components.button.base,
                  components.button.ghost,
                  components.button.sizes.large
                )}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default JobDetailModal;
