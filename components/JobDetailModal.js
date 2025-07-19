'use client';

import { useState, useEffect } from 'react';
import { createPortal } from 'react-dom';
import { colors, typography, components, animations, combineClasses } from '../utils/designSystem';
import CompanyReviewSystem from './CompanyReviewSystem';

const JobDetailModal = ({ job, isOpen, onClose }) => {
  const [jobContent, setJobContent] = useState('');
  const [isLoadingContent, setIsLoadingContent] = useState(false);
  const [mounted, setMounted] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [companyRating, setCompanyRating] = useState(null);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  useEffect(() => {
    if (isOpen && (job?.content_doc_url || job?.content)) {
      loadJobContent();
    }
    if (isOpen && job?.companyId) {
      fetchCompanyRating();
    }
    // Debug log to see job structure
    if (isOpen && job) {
      console.log('Job object in modal:', job);
      console.log('Company ID available:', job.companyId);
      console.log('Company object:', job.company);
    }
  }, [isOpen, job]);

  // Prevent body scroll when modal is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = 'unset';
    }
    
    return () => {
      document.body.style.overflow = 'unset';
    };
  }, [isOpen]);

  // Handle escape key
  useEffect(() => {
    const handleEscape = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('keydown', handleEscape);
    }

    return () => {
      document.removeEventListener('keydown', handleEscape);
    };
  }, [isOpen, onClose]);

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

  const renderStars = (rating, size = 'w-4 h-4') => {
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

  if (!isOpen || !job || !mounted) return null;

  const modalContent = (
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
      <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-in fade-in duration-300">
        <div 
          className="fixed inset-0 cursor-pointer" 
          onClick={onClose}
          aria-label="Close modal"
        />
        
        {/* Modal Content */}
        <div className={combineClasses(
          "relative w-full max-w-4xl max-h-[90vh] flex flex-col rounded-2xl shadow-2xl",
          "bg-gray-900 border border-gray-700",
          "animate-in zoom-in-95 duration-300 ease-out"
        )}>
          {/* Header - Fixed height */}
          <div className={combineClasses(
            "flex items-center justify-between p-6 border-b border-gray-700",
            "bg-gray-800/50 backdrop-blur-sm flex-shrink-0"
          )}>
            <div className="flex items-center gap-4">
              {(job.company_logo || job.company?.logo) && (
                <div className="w-16 h-16 rounded-lg overflow-hidden p-2 bg-gray-800">
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
                <h1 className="text-xl font-semibold text-white mb-1">
                  {job.title}
                </h1>
                <p className="text-lg text-gray-300 font-medium">
                  {job.company_name || job.company?.name}
                </p>
                {/* Company Rating */}
                {companyRating && companyRating.overall > 0 && (
                  <div className="flex items-center gap-2 mt-1">
                    {renderStars(companyRating.overall)}
                    <span className="text-sm text-gray-400">
                      {companyRating.overall.toFixed(1)} ({companyRating.totalReviews} reviews)
                    </span>
                  </div>
                )}
              </div>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 rounded-lg text-gray-400 hover:text-white hover:bg-gray-700 transition-colors duration-200"
              aria-label="Close modal"
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>

          {/* Content - Scrollable area */}
          <div className="flex-1 overflow-y-auto min-h-0">
            {/* Quick Info */}
            <div className="p-6 border-b border-gray-700 bg-gray-800/30">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div>
                  <p className="text-sm text-gray-400 mb-1">Location</p>
                  <p className="text-base font-medium text-white">{job.location || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Job Type</p>
                  <p className="text-base font-medium capitalize text-white">{job.type || "Full-time"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Experience Level</p>
                  <p className="text-base font-medium capitalize text-white">{job.level || "Not specified"}</p>
                </div>
                <div>
                  <p className="text-sm text-gray-400 mb-1">Salary</p>
                  <p className="text-base font-medium text-green-400">
                    {formatSalary(job.salary?.from, job.salary?.to)}
                  </p>
                </div>
              </div>
              
              {/* Remote Badge */}
              {(job.remote === "Yes" || job.remote === true) && (
                <div className="mt-3">
                  <span className="inline-flex items-center px-3 py-1 rounded-full text-sm font-medium bg-emerald-500/20 text-emerald-300 border border-emerald-500/30">
                    🌐 Remote Work Available
                  </span>
                </div>
              )}

              {/* Categories */}
              {job.categories && job.categories.length > 0 && (
                <div className="mt-4">
                  <p className="text-sm text-gray-400 mb-2">Categories</p>
                  <div className="flex flex-wrap gap-2">
                    {job.categories.map((category, index) => (
                      <span
                        key={index}
                        className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-500/20 text-blue-300 border border-blue-500/30"
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
              <h2 className="text-lg font-semibold text-white mb-4">
                Job Description
              </h2>
              
              {isLoadingContent ? (
                <div className="flex items-center justify-center py-8">
                  <div className="text-center">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto mb-3"></div>
                    <p className="text-base text-gray-300">
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
                <div className="p-4 rounded-lg border border-gray-700 bg-gray-800/30">
                  <p className="text-base text-gray-300 mb-3">
                    Detailed job description will be available when you apply or visit the company website.
                  </p>
                  <div className="space-y-2 text-sm">
                    <p className="text-white"><strong>Position:</strong> {job.title}</p>
                    <p className="text-white"><strong>Company:</strong> {job.company_name || job.company?.name}</p>
                    <p className="text-white"><strong>Posted:</strong> {formatDate(job.posted_time)}</p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Footer Actions - Fixed at bottom */}
          <div className="p-6 border-t border-gray-700 bg-gray-800/50 backdrop-blur-sm flex-shrink-0">
            <div className="flex flex-col sm:flex-row gap-3">
              {job.apply_link ? (
                <a
                  href={job.apply_link}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex-1 text-center px-6 py-3 bg-green-600 hover:bg-green-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  Apply Now
                </a>
              ) : (
                <button
                  disabled
                  className="flex-1 px-6 py-3 bg-gray-600 text-gray-400 cursor-not-allowed font-medium rounded-lg"
                >
                  Application Link Not Available
                </button>
              )}
              
              {/* Review Company Button */}
              <button
                onClick={() => {
                  console.log('Review button clicked!');
                  console.log('Current job:', job);
                  console.log('Company ID:', job?.companyId || job?.company?.id);
                  setShowReviewModal(true);
                }}
                className="text-center px-6 py-3 bg-purple-600 hover:bg-purple-700 text-white font-medium rounded-lg transition-colors duration-200 flex items-center gap-2 justify-center"
              >
                <svg className="w-4 h-4" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z" />
                </svg>
                Review Company
              </button>
              
              {(job.company?.website || job.company_website) && (
                <a
                  href={job.company?.website || job.company_website}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-center px-6 py-3 bg-blue-600 hover:bg-blue-700 text-white font-medium rounded-lg transition-colors duration-200"
                >
                  Company Website
                </a>
              )}
              
              <button
                onClick={onClose}
                className="px-6 py-3 bg-gray-700 hover:bg-gray-600 text-gray-300 hover:text-white font-medium rounded-lg transition-colors duration-200"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </>
  );

  // Use portal to render modal at document root
  return createPortal(
    <>
      {modalContent}
      
      {/* Review Modal */}
      {showReviewModal && (job?.companyId || job?.company?.id) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-[10000] p-4">
          <div className="bg-gray-900 rounded-lg max-w-4xl max-h-[90vh] overflow-y-auto w-full border border-gray-700">
            <div className="p-4 border-b border-gray-700 flex items-center justify-between">
              <h2 className="text-xl font-bold text-white">
                Review {job.company_name || job.company?.name}
              </h2>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-gray-400 hover:text-white"
              >
                <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="p-6">
              <CompanyReviewSystem 
                companyId={job.companyId || job.company?.id} 
                companyName={job.company_name || job.company?.name} 
              />
            </div>
          </div>
        </div>
      )}
    </>,
    document.body
  );
};

export default JobDetailModal;
