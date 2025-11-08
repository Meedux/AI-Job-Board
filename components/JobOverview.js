// Job Overview Component - Displays job details based on employer type
'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Users, 
  Clock, 
  Globe,
  Mail,
  Phone,
  Shield,
  AlertTriangle,
  Eye,
  Share2,
  Flag,
  Briefcase,
  CheckCircle,
  ExternalLink
} from 'lucide-react';
import { EDUCATION_LEVELS, CURRENCIES } from '@/utils/jobPostingConstants';

const JobOverview = ({ job, showApplicationForm = false, onApply }) => {
  const { user } = useAuth();
  const [showFullDescription, setShowFullDescription] = useState(false);

  // Employer type removed — do not branch on employerType

  // Format salary display
  const formatSalary = (job) => {
    if (!job.showCompensation) return 'Competitive salary';
    
    const currency = CURRENCIES.find(c => c.value === job.currency);
    const symbol = currency?.symbol || '₱';
    
    if (job.salaryRange && job.salaryRange !== 'custom') {
      return job.salaryRange === 'minimum_wage' ? 'Minimum Wage' : job.salaryRange.replace(/\d+/g, match => `${symbol}${parseInt(match).toLocaleString()}`);
    }
    
    if (job.customSalaryMin && job.customSalaryMax) {
      return `${symbol}${parseInt(job.customSalaryMin).toLocaleString()} - ${symbol}${parseInt(job.customSalaryMax).toLocaleString()} ${job.salaryPeriod}`;
    }
    
    return 'Competitive salary';
  };

  // Format education level
  const getEducationLabel = (value) => {
    const education = EDUCATION_LEVELS.find(e => e.value === value);
    return education?.label || value;
  };

  // Get days ago
  const getDaysAgo = (date) => {
    const diffTime = Math.abs(new Date() - new Date(date));
    const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
    return diffDays === 1 ? '1 day ago' : `${diffDays} days ago`;
  };

  return (
    <div className="max-w-4xl mx-auto bg-gray-900 rounded-lg shadow-xl overflow-hidden">
      {/* Header Section */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6 text-white">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <h1 className="text-2xl font-bold">{job.jobTitle}</h1>
              {job.isVerified && (
                <div className="flex items-center gap-1 bg-green-500 text-white px-2 py-1 rounded-full text-xs">
                  <CheckCircle size={12} />
                  Verified
                </div>
              )}
            </div>
            
            <div className="flex items-center gap-4 text-blue-100 mb-3">
              <div className="flex items-center gap-1">
                <Building2 size={16} />
                <span className="font-medium">{job.companyName}</span>
              </div>
              
              <div className="flex items-center gap-1">
                <MapPin size={16} />
                <span>{job.city}, {job.state || job.country}</span>
              </div>
              
              {job.numberOfOpenings > 1 && (
                <div className="flex items-center gap-1">
                  <Users size={16} />
                  <span>{job.numberOfOpenings} openings</span>
                </div>
              )}
            </div>

            <div className="flex flex-wrap gap-2">
              <span className="px-3 py-1 bg-blue-500 rounded-full text-sm">{job.jobType}</span>
              <span className="px-3 py-1 bg-purple-500 rounded-full text-sm">{job.workMode}</span>
              <span className="px-3 py-1 bg-green-500 rounded-full text-sm">{job.experienceLevel}</span>
              {job.employerType && (
                <span className="px-3 py-1 bg-orange-500 rounded-full text-sm">{job.employerType.label}</span>
              )}
            </div>
          </div>

          <div className="text-right">
            <div className="text-lg font-semibold">{formatSalary(job)}</div>
            <div className="text-sm text-blue-200">Posted {getDaysAgo(job.postedAt)}</div>
            {job.applicationsCount > 0 && (
              <div className="text-sm text-blue-200 mt-1">
                {job.applicationsCount} applicant{job.applicationsCount !== 1 ? 's' : ''}
              </div>
            )}
          </div>
        </div>

        {/* Action Buttons */}
        <div className="flex gap-3">
          <button
            onClick={onApply}
            className="flex-1 bg-white text-blue-600 px-6 py-3 rounded-lg font-semibold hover:bg-gray-100 transition-colors"
          >
            Apply Now
          </button>
          
          <button className="flex items-center gap-2 px-4 py-3 bg-blue-500 rounded-lg hover:bg-blue-400 transition-colors">
            <Share2 size={16} />
            Share
          </button>
          
          <button className="flex items-center gap-2 px-4 py-3 bg-red-500 rounded-lg hover:bg-red-400 transition-colors">
            <Flag size={16} />
            Report
          </button>
        </div>
      </div>

      {/* Content Section */}
      <div className="p-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Job Description */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                <Briefcase size={20} />
                Job Description
              </h2>
              <div className="prose prose-invert max-w-none">
                  <div 
                    className={`google-docs-content text-gray-300 leading-relaxed ${!showFullDescription ? 'line-clamp-6' : ''}`}
                    dangerouslySetInnerHTML={{ 
                      __html: (() => {
                        const raw = job.jobDescription || job.description || '';
                        // If the content already contains HTML tags, render as-is.
                        if (/<[a-z][\s\S]*>/i.test(raw)) return raw;
                        // Otherwise convert newlines to <br /> for simple line breaks
                        return raw.replace(/\n/g, '<br />') || 'No description provided';
                      })()
                    }}
                  />
                {job.jobDescription && job.jobDescription.length > 300 && (
                  <button
                    onClick={() => setShowFullDescription(!showFullDescription)}
                    className="text-blue-400 hover:text-blue-300 text-sm mt-2"
                  >
                    {showFullDescription ? 'Show less' : 'Show more'}
                  </button>
                )}
              </div>
            </section>

            {/* Qualifications */}
            <section>
              <h2 className="text-xl font-semibold text-white mb-3 flex items-center gap-2">
                <Shield size={20} />
                Qualifications
              </h2>
              <div 
                className="text-gray-300 leading-relaxed"
                dangerouslySetInnerHTML={{ 
                  __html: job.qualification?.replace(/\n/g, '<br />') || 'No specific qualifications listed'
                }}
              />
            </section>

            {/* Required Skills */}
            {job.requiredSkills && job.requiredSkills.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Required Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.requiredSkills.map((skill, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-blue-600 text-white rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Preferred Skills */}
            {job.preferredSkills && job.preferredSkills.length > 0 && (
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Preferred Skills</h2>
                <div className="flex flex-wrap gap-2">
                  {job.preferredSkills.map((skill, index) => (
                    <span 
                      key={index}
                      className="px-3 py-1 bg-gray-600 text-white rounded-full text-sm"
                    >
                      {skill}
                    </span>
                  ))}
                </div>
              </section>
            )}

            {/* Benefits */}
            {job.benefits && (
              <section>
                <h2 className="text-xl font-semibold text-white mb-3">Benefits & Perks</h2>
                <div 
                  className="text-gray-300 leading-relaxed"
                  dangerouslySetInnerHTML={{ 
                    __html: job.benefits.replace(/\n/g, '<br />')
                  }}
                />
              </section>
            )}

            {/* Overseas statements removed along with employerType concept */}
          </div>

          {/* Sidebar */}
          <div className="space-y-6">
            {/* Job Details */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Job Details</h3>
              <div className="space-y-3 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Job Type:</span>
                  <span className="text-white capitalize">{job.jobType}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Work Mode:</span>
                  <span className="text-white capitalize">{job.workMode}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Experience:</span>
                  <span className="text-white capitalize">{job.experienceLevel}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Education:</span>
                  <span className="text-white text-right text-xs">{getEducationLabel(job.educationAttainment)}</span>
                </div>
                
                {job.employmentType && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Employment:</span>
                    <span className="text-white capitalize">{job.employmentType}</span>
                  </div>
                )}
                
                {job.employerType && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Employer Type:</span>
                    <span className="text-white">{job.employerType.label}</span>
                  </div>
                )}
                
                {job.industry && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Industry:</span>
                    <span className="text-white capitalize">{job.industry}</span>
                  </div>
                )}
                
                {job.applicationDeadline && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Deadline:</span>
                    <span className="text-white">{new Date(job.applicationDeadline).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>

            {/* Company Information */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-4">Company Information</h3>
              <div className="space-y-3">
                <div>
                  <h4 className="font-medium text-white">{job.companyName}</h4>
                  {job.companyDescription && (
                    <p className="text-gray-400 text-sm mt-1">{job.companyDescription}</p>
                  )}
                </div>
                
                <div className="space-y-2 text-sm">
                  {job.city && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <MapPin size={14} />
                      {job.city}, {job.state} {job.postalCode}
                    </div>
                  )}
                  
                  {job.country && job.country !== 'Philippines' && (
                    <div className="flex items-center gap-2 text-gray-300">
                      <Globe size={14} />
                      {job.country}
                    </div>
                  )}
                </div>

                {/* License information will be shown when present on job */}
                {job.licenseNumber && (
                  <div className="mt-4 p-3 bg-green-900/20 border border-green-500/30 rounded">
                    <div className="flex items-center gap-2 text-green-400 mb-1">
                      <Shield size={14} />
                      <span className="font-medium text-xs">Licensed Agency</span>
                    </div>
                    <div className="text-xs text-gray-300">
                      <div>License: {job.licenseNumber}</div>
                      {job.licenseExpirationDate && (
                        <div>Expires: {new Date(job.licenseExpirationDate).toLocaleDateString()}</div>
                      )}
                    </div>
                  </div>
                )}

                {/* Placement Fee Information for DMW Agencies */}
                {job.hasPlacementFee && job.employerType?.subtype === 'dmw' && (
                  <div className="mt-4 p-3 bg-yellow-900/20 border border-yellow-500/30 rounded">
                    <div className="flex items-center gap-2 text-yellow-400 mb-1">
                      <DollarSign size={14} />
                      <span className="font-medium text-xs">Placement Fee Required</span>
                    </div>
                    <div className="text-xs text-gray-300">
                      This position includes a placement fee as per DMW/POEA regulations.
                      The fee amount will be discussed during the application process.
                    </div>
                  </div>
                )}

                {/* Contact Information (if enabled) */}
                {job.showContactOnPosting && (
                  <div className="mt-4 pt-3 border-t border-gray-700">
                    <h5 className="font-medium text-white mb-2 text-sm">Contact Information</h5>
                    {job.contactEmail && (
                      <div className="flex items-center gap-2 text-gray-300 text-sm">
                        <Mail size={14} />
                        {job.protectEmailAddress && user?.role !== 'premium' 
                          ? '***@***.com (Apply to view)' 
                          : job.contactEmail
                        }
                      </div>
                    )}
                    {job.contactPhone && (
                      <div className="flex items-center gap-2 text-gray-300 text-sm mt-1">
                        <Phone size={14} />
                        {job.contactPhone}
                      </div>
                    )}
                  </div>
                )}

                {/* View Jobs Link */}
                <div className="mt-4 pt-3 border-t border-gray-700">
                  <button className="flex items-center gap-2 text-blue-400 hover:text-blue-300 text-sm">
                    <ExternalLink size={14} />
                    View all jobs from this company
                  </button>
                </div>
              </div>
            </div>

            {/* Application Statistics */}
            <div className="bg-gray-800 rounded-lg p-4">
              <h3 className="text-lg font-semibold text-white mb-3">Application Status</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-400">Total Applicants:</span>
                  <span className="text-white font-medium">{job.applicationsCount || 0}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Posted:</span>
                  <span className="text-white">{getDaysAgo(job.postedAt)}</span>
                </div>
                
                <div className="flex justify-between">
                  <span className="text-gray-400">Views:</span>
                  <span className="text-white">{job.viewsCount || 0}</span>
                </div>
                
                {job.endPostingOn && (
                  <div className="flex justify-between">
                    <span className="text-gray-400">Ends:</span>
                    <span className="text-white">{new Date(job.endPostingOn).toLocaleDateString()}</span>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobOverview;
