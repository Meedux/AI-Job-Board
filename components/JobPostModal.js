'use client';

import { useState, useEffect } from 'react';
import { colors, typography, components } from '../utils/designSystem';

const JobPostModal = ({ isOpen, onClose }) => {
  const [formData, setFormData] = useState({
    jobTitle: '',
    content: '',
    fromSalary: '',
    toSalary: '',
    jobLocation: '',
    remote: '',
    level: '',
    typeOfJob: '',
    expireTime: '',
    linkToApply: '',
    companyName: '',
    companyLogo: '',
    companyWebsite: '',
    categories: ''
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState(false);
  // Auto-generate slug from job title
  const generateSlug = (title) => {
    const baseSlug = title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, '') // Remove special characters
      .replace(/\s+/g, '-') // Replace spaces with hyphens
      .replace(/-+/g, '-') // Replace multiple hyphens with single
      .trim();
    
    // Add timestamp to ensure uniqueness
    const timestamp = Date.now();
    return `${baseSlug}-${timestamp}`;
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
  };
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      // Validate Google Docs URL format
      if (!formData.content.includes('docs.google.com/document')) {
        throw new Error('Please provide a valid Google Docs link. It should contain "docs.google.com/document".');
      }

      // Auto-generate slug from job title
      const slug = generateSlug(formData.jobTitle);
      
      // Auto-generate posted time (current timestamp)
      const postedTime = new Date().toISOString();
      
      // Prepare data in the exact column order (A-P)
      const jobData = [
        formData.jobTitle,        // A: Job Title
        slug,                     // B: Slug (auto-generated)
        formData.content,         // C: Content (Google Docs Link)
        formData.fromSalary,      // D: From Salary
        formData.toSalary,        // E: To Salary
        formData.jobLocation,     // F: Job location
        formData.remote,          // G: Remote
        formData.level,           // H: Level
        formData.typeOfJob,       // I: Type of job
        postedTime,               // J: Posted Time (auto-generated)
        formData.expireTime,      // K: Expire Time
        formData.linkToApply,     // L: Link to apply
        formData.companyName,     // M: Company Name
        formData.companyLogo,     // N: Company Logo
        formData.companyWebsite,  // O: Company Website
        formData.categories       // P: Categories
      ];

      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ jobData }),
      });

      if (!response.ok) {
        throw new Error('Failed to post job');
      }

      setSuccess(true);
      // Reset form
      setFormData({
        jobTitle: '',
        content: '',
        fromSalary: '',
        toSalary: '',
        jobLocation: '',
        remote: '',
        level: '',
        typeOfJob: '',
        expireTime: '',
        linkToApply: '',
        companyName: '',
        companyLogo: '',
        companyWebsite: '',
        categories: ''
      });

      // Auto-close after success
      setTimeout(() => {
        setSuccess(false);
        onClose();
      }, 2000);

    } catch (error) {
      console.error('Error posting job:', error);
      setError(error.message || 'Failed to post job');
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black bg-opacity-50">
      <div className={`${colors.neutral.surface} rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto shadow-2xl`}>
        <div className={`flex justify-between items-center ${colors.neutral.borderLight} border-b p-6`}>
          <h2 className={`${typography.h3} ${colors.neutral.textPrimary}`}>Post a job</h2>
          <button
            onClick={onClose}
            className={`${components.button.base} ${components.button.ghost} ${components.button.sizes.small} rounded-full`}
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        
        <div className="p-6">          <p className={`${colors.neutral.textTertiary} ${typography.bodyBase} mb-6`}>
            Hire the best. Share your job post with thousands of job seekers. Use Google Docs for rich job descriptions with formatting, images, and detailed content.
          </p>

          {error && (
            <div className={`${colors.error.background} ${colors.error.text} p-3 rounded-lg ${typography.bodySmall} mb-6`}>
              {error}
            </div>
          )}

          {success && (
            <div className={`${colors.success.background} ${colors.success.text} p-3 rounded-lg ${typography.bodySmall} mb-6`}>
              Job posted successfully! The modal will close shortly.
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-6">            {/* Job Information Section */}
            <div>
              <h3 className={`${typography.h5} ${colors.neutral.textPrimary} mb-4`}>Job Information & Content</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={components.label.base}>
                    Job Title <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="jobTitle"
                    value={formData.jobTitle}
                    onChange={handleChange}
                    placeholder="e.g. Software Engineer"
                    className={components.input.base}
                    required
                  />
                </div>
                
                <div>
                  <label className={components.label.base}>
                    Categories <span className="text-red-500">*</span>
                  </label>
                  <select
                    name="categories"
                    value={formData.categories}
                    onChange={handleChange}
                    className={components.input.base}
                    required
                  >
                    <option value="">Select a category</option>
                    <option value="Engineering">Engineering</option>
                    <option value="Design">Design</option>
                    <option value="Marketing">Marketing</option>
                    <option value="Sales">Sales</option>
                    <option value="Customer Support">Customer Support</option>
                    <option value="Product">Product</option>
                    <option value="Data">Data</option>
                    <option value="Operations">Operations</option>
                    <option value="HR">Human Resources</option>
                    <option value="Finance">Finance</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
              </div>              <div className="mt-6">
                <label className={components.label.base}>
                  Content (Google Docs Link) <span className="text-red-500">*</span>
                </label>
                <input
                  type="url"
                  name="content"
                  value={formData.content}
                  onChange={handleChange}
                  placeholder="https://docs.google.com/document/d/YOUR_DOCUMENT_ID/edit"
                  className={components.input.base}
                  required
                />
                <p className={`mt-2 text-sm ${colors.neutral.textMuted}`}>
                  Paste the link to your Google Docs document containing the job description. Make sure the document is publicly viewable or accessible to anyone with the link.
                </p>
              </div>
            </div>

            {/* Job Details Section */}
            <div>
              <h3 className={`${typography.h5} ${colors.neutral.textPrimary} mb-4`}>Job Details</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                <div>
                  <label className={components.label.base}>Job Location</label>
                  <input
                    type="text"
                    name="jobLocation"
                    value={formData.jobLocation}
                    onChange={handleChange}
                    placeholder="e.g. San Francisco, CA"
                    className={components.input.base}
                  />
                </div>

                <div>
                  <label className={components.label.base}>Remote</label>
                  <select
                    name="remote"
                    value={formData.remote}
                    onChange={handleChange}
                    className={components.input.base}
                  >
                    <option value="">Select option</option>
                    <option value="Remote">Fully Remote</option>
                    <option value="Hybrid">Hybrid</option>
                    <option value="On-site">On-site</option>
                  </select>
                </div>

                <div>
                  <label className={components.label.base}>Level</label>
                  <select
                    name="level"
                    value={formData.level}
                    onChange={handleChange}
                    className={components.input.base}
                  >
                    <option value="">Select level</option>
                    <option value="Fresher">Fresher</option>
                    <option value="Entry">Entry Level</option>
                    <option value="Junior">Junior</option>
                    <option value="Senior">Senior</option>
                    <option value="Middle">Middle</option>
                  </select>
                </div>

                <div>
                  <label className={components.label.base}>Type of Job</label>
                  <select
                    name="typeOfJob"
                    value={formData.typeOfJob}
                    onChange={handleChange}
                    className={components.input.base}
                  >
                    <option value="">Select type</option>
                    <option value="Full-time">Full-time</option>
                    <option value="Part-time">Part-time</option>
                    <option value="Contract">Contract</option>
                    <option value="Freelance">Freelance</option>
                    <option value="Internship">Internship</option>
                  </select>
                </div>

                <div>
                  <label className={components.label.base}>From Salary</label>
                  <input
                    type="number"
                    name="fromSalary"
                    value={formData.fromSalary}
                    onChange={handleChange}
                    placeholder="e.g. 80000"
                    className={components.input.base}
                  />
                </div>

                <div>
                  <label className={components.label.base}>To Salary</label>
                  <input
                    type="number"
                    name="toSalary"
                    value={formData.toSalary}
                    onChange={handleChange}
                    placeholder="e.g. 120000"
                    className={components.input.base}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-6">
                <div>
                  <label className={components.label.base}>
                    Application Link <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    name="linkToApply"
                    value={formData.linkToApply}
                    onChange={handleChange}
                    placeholder="https://company.com/careers/apply"
                    className={components.input.base}
                    required
                  />
                </div>

                <div>
                  <label className={components.label.base}>Expire Date</label>
                  <input
                    type="date"
                    name="expireTime"
                    value={formData.expireTime}
                    onChange={handleChange}
                    className={components.input.base}
                  />
                </div>
              </div>
            </div>

            {/* Company Information Section */}
            <div>
              <h3 className={`${typography.h5} ${colors.neutral.textPrimary} mb-4`}>Company Information</h3>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={components.label.base}>
                    Company Name <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    name="companyName"
                    value={formData.companyName}
                    onChange={handleChange}
                    placeholder="e.g. Amazon"
                    className={components.input.base}
                    required
                  />
                </div>

                <div>
                  <label className={components.label.base}>
                    Company Website <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="url"
                    name="companyWebsite"
                    value={formData.companyWebsite}
                    onChange={handleChange}
                    placeholder="https://amazon.com"
                    className={components.input.base}
                    required
                  />
                </div>
              </div>

              <div className="mt-6">
                <label className={components.label.base}>Company Logo URL</label>
                <input
                  type="url"
                  name="companyLogo"
                  value={formData.companyLogo}
                  onChange={handleChange}
                  placeholder="https://company.com/logo.png"
                  className={components.input.base}
                />
              </div>
            </div>

            <div className="pt-6 border-t">
              <button
                type="submit"
                disabled={loading}
                className={`w-full ${components.button.base} ${components.button.primary} ${components.button.sizes.medium} flex items-center justify-center space-x-2`}
              >
                {loading ? (
                  <>
                    <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                    <span>Posting Job...</span>
                  </>
                ) : (
                  <>
                    <span>Post Job</span>
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 7l5 5m0 0l-5 5m5-5H6" />
                    </svg>
                  </>
                )}
              </button>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default JobPostModal;
