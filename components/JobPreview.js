// Job Preview Component - Shows both Job Card and Job Overview
'use client';

import { useState } from 'react';
import { 
  Eye, 
  EyeOff, 
  Building2, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Users,
  Clock,
  Share2,
  Download
} from 'lucide-react';
import JobOverview from './JobOverview';

const JobPreview = ({ 
  jobData, 
  customForm,
  onClose, 
  onPublish,
  showCloseButton = true,
  showEditButtons = false,
  onEditJob,
  onEditForm
}) => {
  const [viewMode, setViewMode] = useState('card'); // 'card' or 'overview'
  const [showQRCode, setShowQRCode] = useState(false);

  // Format salary for card view
  const formatSalaryCard = (job) => {
    if (!job.showCompensation) return 'Competitive';
    
    if (job.salaryRange && job.salaryRange !== 'custom') {
      return job.salaryRange === 'minimum_wage' ? 'Min. Wage' : job.salaryRange.split('-')[0] + '+';
    }
    
    if (job.customSalaryMin) {
      const symbol = job.currency === 'PHP' ? '₱' : '$';
      return `${symbol}${parseInt(job.customSalaryMin).toLocaleString()}+`;
    }
    
    return 'Competitive';
  };

  // Job Card View (similar to JobStreet style)
  const JobCard = ({ job, isPreview = true }) => (
    <div className="bg-white rounded-lg border border-gray-200 hover:border-blue-300 hover:shadow-md transition-all duration-200 p-4">
      {isPreview && (
        <div className="mb-3 p-2 bg-blue-50 border border-blue-200 rounded text-sm text-blue-700">
          🔍 Preview Mode - This is how your job will appear in search results
        </div>
      )}
      
      <div className="flex justify-between items-start mb-3">
        <div className="flex-1">
          <h3 className="text-lg font-semibold text-gray-900 hover:text-blue-600 cursor-pointer line-clamp-2">
            {job.jobTitle}
          </h3>
          <p className="text-gray-600 font-medium">{job.companyName}</p>
        </div>
        
        {job.isVerified && (
          <div className="ml-3 bg-green-100 text-green-800 px-2 py-1 rounded-full text-xs font-medium">
            ✓ Verified
          </div>
        )}
      </div>

      <div className="space-y-2 mb-4">
        <div className="flex items-center gap-4 text-sm text-gray-600">
          <div className="flex items-center gap-1">
            <MapPin size={14} />
            <span>{job.city}, {job.state || job.country}</span>
          </div>
          
          <div className="flex items-center gap-1">
            <DollarSign size={14} />
            <span className="font-medium text-gray-900">{formatSalaryCard(job)}</span>
          </div>
        </div>
        
        <div className="flex items-center gap-2 text-sm">
          <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded text-xs">
            {job.jobType}
          </span>
          <span className="px-2 py-1 bg-purple-100 text-purple-800 rounded text-xs">
            {job.workMode}
          </span>
          <span className="px-2 py-1 bg-gray-100 text-gray-800 rounded text-xs">
            {job.experienceLevel}
          </span>
          {job.numberOfOpenings > 1 && (
            <span className="px-2 py-1 bg-green-100 text-green-800 rounded text-xs">
              {job.numberOfOpenings} openings
            </span>
          )}
        </div>
      </div>

      <div className="text-sm text-gray-600 mb-4 line-clamp-3">
        {job.jobDescription?.replace(/<[^>]*>/g, '').substring(0, 150)}...
      </div>

      <div className="flex items-center justify-between pt-3 border-t border-gray-100">
        <div className="flex items-center gap-4 text-xs text-gray-500">
          <span>Posted today</span>
          {job.applicationsCount > 0 && (
            <span>{job.applicationsCount} applicant{job.applicationsCount !== 1 ? 's' : ''}</span>
          )}
        </div>
        
        <div className="flex gap-2">
          <button className="text-gray-400 hover:text-gray-600">
            <Share2 size={16} />
          </button>
          <button className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 text-sm font-medium">
            Apply
          </button>
        </div>
      </div>
    </div>
  );

  // Social Media Template
  const SocialTemplate = ({ job }) => (
    <div className="bg-gradient-to-br from-blue-600 to-purple-600 rounded-lg p-6 text-white relative overflow-hidden">
      <div className="absolute top-0 right-0 w-32 h-32 bg-white/10 rounded-full -mr-16 -mt-16"></div>
      <div className="absolute bottom-0 left-0 w-24 h-24 bg-white/10 rounded-full -ml-12 -mb-12"></div>
      
      <div className="relative z-10">
        <div className="flex items-center gap-3 mb-4">
          <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
            <Building2 size={20} />
          </div>
          <div>
            <h3 className="font-bold text-lg">We're Hiring!</h3>
            <p className="text-blue-100 text-sm">{job.companyName}</p>
          </div>
        </div>
        
        <h2 className="text-xl font-bold mb-2">{job.jobTitle}</h2>
        
        <div className="space-y-1 text-sm text-blue-100 mb-4">
          <div className="flex items-center gap-2">
            <MapPin size={14} />
            <span>{job.city}, {job.state || job.country}</span>
          </div>
          <div className="flex items-center gap-2">
            <DollarSign size={14} />
            <span>{formatSalaryCard(job)} • {job.jobType}</span>
          </div>
        </div>
        
        <p className="text-sm mb-4 line-clamp-2">
          {job.jobDescription?.replace(/<[^>]*>/g, '').substring(0, 100)}...
        </p>
        
        <div className="flex items-center justify-between">
          <div className="text-xs">
            Apply now at GetGetHired.com
          </div>
          <div className="bg-white/20 px-3 py-1 rounded-full text-xs">
            {job.numberOfOpenings} opening{job.numberOfOpenings !== 1 ? 's' : ''}
          </div>
        </div>
      </div>
    </div>
  );

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-gray-900 rounded-lg max-w-6xl w-full max-h-[90vh] overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between p-6 border-b border-gray-700">
          <div>
            <h2 className="text-xl font-semibold text-white">Job Preview</h2>
            <p className="text-gray-400 text-sm">Review how your job posting will appear to candidates</p>
          </div>
          
          <div className="flex items-center gap-3">
            {/* View Toggle */}
            <div className="flex bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setViewMode('card')}
                className={`px-3 py-2 text-sm rounded ${
                  viewMode === 'card' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Card View
              </button>
              <button
                onClick={() => setViewMode('overview')}
                className={`px-3 py-2 text-sm rounded ${
                  viewMode === 'overview' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                Full View
              </button>
            </div>
            
            {showCloseButton && (
              <button
                onClick={onClose}
                className="text-gray-400 hover:text-white"
              >
                ✕
              </button>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-140px)]">
          {viewMode === 'card' ? (
            <div className="space-y-6">
              {/* Job Card Preview */}
              <div>
                <h3 className="text-lg font-medium text-white mb-3">Search Results View</h3>
                <div className="max-w-2xl">
                  <JobCard job={jobData} />
                </div>
              </div>

              {/* Social Media Template */}
              {jobData.generateSocialTemplate && (
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">Social Media Template</h3>
                  <div className="max-w-md">
                    <SocialTemplate job={jobData} />
                  </div>
                  <button className="mt-3 flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700">
                    <Download size={16} />
                    Download Template
                  </button>
                </div>
              )}

              {/* QR Code */}
              {jobData.generateQRCode && (
                <div>
                  <h3 className="text-lg font-medium text-white mb-3">QR Code</h3>
                  <div className="bg-white p-4 rounded-lg inline-block">
                    <div className="w-32 h-32 bg-gray-200 flex items-center justify-center text-gray-500 text-sm">
                      QR Code Preview
                    </div>
                  </div>
                  <button className="ml-4 flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700">
                    <Download size={16} />
                    Download QR Code
                  </button>
                </div>
              )}
            </div>
          ) : (
            <div className="bg-white rounded-lg">
              <JobOverview job={jobData} showApplicationForm={false} />
            </div>
          )}
        </div>

        {/* Footer */}
        <div className="flex items-center justify-between p-6 border-t border-gray-700 bg-gray-800">
          <div className="text-sm text-gray-400">
            This preview shows how your job posting will appear to candidates
          </div>
          
          <div className="flex gap-3">
            {showEditButtons && (
              <>
                <button
                  onClick={onEditForm}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm"
                >
                  Edit Form
                </button>
                <button
                  onClick={onEditJob}
                  className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors text-sm"
                >
                  Edit Job
                </button>
              </>
            )}
            
            {showCloseButton && (
              <button
                onClick={onClose}
                className="px-6 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Back to Edit
              </button>
            )}
            
            <button
              onClick={onPublish}
              className="px-6 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
            >
              Publish Job
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default JobPreview;
