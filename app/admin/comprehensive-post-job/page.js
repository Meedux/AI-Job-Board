'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ComprehensiveJobPostingForm from '@/components/ComprehensiveJobPostingForm';
import JobPreview from '@/components/JobPreview';
import { ArrowLeft, Sparkles, FileText, Briefcase } from 'lucide-react';

const ComprehensivePostJobPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [mode, setMode] = useState('manual'); // 'manual' or 'ai'
  const [showPreview, setShowPreview] = useState(false);
  const [jobData, setJobData] = useState(null);
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  // Check if user is authenticated and has posting permissions
  if (!user || !['super_admin', 'employer_admin', 'sub_user'].includes(user.role)) {
    return (
      <div className="min-h-screen bg-gray-900 flex items-center justify-center">
        <div className="text-center">
          <Briefcase className="mx-auto h-12 w-12 text-gray-400 mb-4" />
          <h1 className="text-2xl font-bold text-white mb-2">Access Denied</h1>
          <p className="text-gray-400 mb-4">You need employer privileges to post jobs.</p>
          <button
            onClick={() => router.push('/dashboard')}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  // Handle form submission
  const handleJobSubmit = async (formData) => {
    setLoading(true);
    try {
      // Prepare job data for API
      const jobPayload = {
        title: formData.jobTitle,
        companyName: formData.companyName,
        description: formData.jobDescription,
        qualification: formData.qualification,
        educationAttainment: formData.educationAttainment,
        numberOfOpenings: formData.numberOfOpenings,
        
        // Location
        city: formData.city,
        state: formData.state,
        postalCode: formData.postalCode,
        country: formData.country,
        
        // Salary
        currency: formData.currency,
        salaryPeriod: formData.salaryPeriod,
        salaryRange: formData.salaryRange,
        customSalaryMin: formData.customSalaryMin,
        customSalaryMax: formData.customSalaryMax,
        showCompensation: formData.showCompensation,
        
        // Job details
        jobType: formData.jobType,
        workMode: formData.workMode,
        experienceLevel: formData.experienceLevel,
        employmentType: formData.employmentType,
        industry: formData.industry,
        subIndustry: formData.subIndustry,
        
        // Skills and requirements
        requiredSkills: formData.requiredSkills,
        preferredSkills: formData.preferredSkills,
        benefits: formData.benefits,
        
        // Application settings
        applicationMethod: formData.applicationMethod,
        externalApplicationUrl: formData.externalApplicationUrl,
        applicationEmail: formData.applicationEmail,
        applicationDeadline: formData.applicationDeadline,
        
        // Prescreen questions
        prescreenQuestions: formData.prescreenQuestions,
        
        // Employer-specific
        licenseNumber: formData.licenseNumber,
        licenseExpirationDate: formData.licenseExpirationDate,
        overseasStatement: formData.overseasStatement,
        
        // Contact and settings
        showContactOnPosting: formData.showContactOnPosting,
        protectEmailAddress: formData.protectEmailAddress,
        endPostingOn: formData.endPostingOn,
        
        // Additional features
        allowPreview: formData.allowPreview,
        generateQRCode: formData.generateQRCode,
        generateSocialTemplate: formData.generateSocialTemplate,
        
  // System fields
        postedById: user.id,
        mode: mode
      };

      const response = await fetch('/api/jobs/comprehensive-post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(jobPayload),
      });

      const result = await response.json();

      if (result.success) {
        setJobData({ ...jobPayload, id: result.job.id });
        setMessage('Job prepared successfully! Review your posting below.');
        setShowPreview(true);
      } else {
        setMessage(result.error || 'Failed to create job posting');
      }
    } catch (error) {
      console.error('Error creating job:', error);
      setMessage('An error occurred while creating the job posting');
    } finally {
      setLoading(false);
    }
  };

  // Handle job publishing
  const handleJobPublish = async () => {
    if (!jobData?.id) return;
    
    setLoading(true);
    try {
      const response = await fetch(`/api/jobs/${jobData.id}/publish`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      const result = await response.json();

      if (result.success) {
        setMessage('Job published successfully! Redirecting to job management...');
        setTimeout(() => {
          router.push('/admin/jobs');
        }, 2000);
      } else {
        setMessage(result.error || 'Failed to publish job');
      }
    } catch (error) {
      console.error('Error publishing job:', error);
      setMessage('An error occurred while publishing the job');
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    router.push('/dashboard');
  };

  return (
    <div className="min-h-screen bg-gray-900 py-8">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.back()}
            className="flex items-center gap-2 text-gray-400 hover:text-white mb-4 transition-colors"
          >
            <ArrowLeft size={20} />
            Back
          </button>
          
          <div className="flex items-center justify-between">
            <div>
              <h1 className="text-3xl font-bold text-white">Create Job Posting</h1>
              <p className="text-gray-400 mt-2">
                Reach thousands of qualified candidates with a comprehensive job posting
              </p>
            </div>
            
            {/* Mode Toggle */}
            <div className="flex bg-gray-800 rounded-lg p-1">
              <button
                onClick={() => setMode('manual')}
                className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                  mode === 'manual' 
                    ? 'bg-blue-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <FileText size={16} />
                Manual Mode
              </button>
              <button
                onClick={() => setMode('ai')}
                className={`flex items-center gap-2 px-4 py-2 rounded transition-colors ${
                  mode === 'ai' 
                    ? 'bg-purple-600 text-white' 
                    : 'text-gray-400 hover:text-white'
                }`}
              >
                <Sparkles size={16} />
                AI Mode
              </button>
            </div>
          </div>
        </div>

        {/* Mode Description */}
        <div className="mb-8 p-4 bg-gray-800 rounded-lg border border-gray-700">
          <div className="flex items-start gap-3">
            {mode === 'manual' ? (
              <FileText className="text-blue-400 mt-1" size={20} />
            ) : (
              <Sparkles className="text-purple-400 mt-1" size={20} />
            )}
            <div>
              <h3 className="text-white font-medium mb-1">
                {mode === 'manual' ? 'Manual Mode' : 'AI-Powered Mode'}
              </h3>
              <p className="text-gray-400 text-sm">
                {mode === 'manual' 
                  ? 'Create your job posting manually with full control over content. Add up to 3 prescreen questions and customize every detail.'
                  : 'Let AI assist you in creating compelling job descriptions, suggesting relevant skills, and generating up to 5 intelligent prescreen questions.'
                }
              </p>
            </div>
          </div>
        </div>

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('success') || message.includes('successfully') 
              ? 'bg-green-900/20 border border-green-500/30 text-green-300' 
              : 'bg-red-900/20 border border-red-500/30 text-red-300'
          }`}>
            {message}
          </div>
        )}

        {/* Main Content */}
        {!showPreview ? (
          <ComprehensiveJobPostingForm
            mode={mode}
            onSubmit={handleJobSubmit}
            onCancel={handleCancel}
            loading={loading}
          />
        ) : (
          <JobPreview
            jobData={jobData}
            onClose={() => setShowPreview(false)}
            onPublish={handleJobPublish}
          />
        )}

        {/* Footer Info */}
        {!showPreview && (
          <div className="mt-8 p-4 bg-gray-800/50 rounded-lg border border-gray-700/50">
            <div className="text-center text-gray-400 text-sm">
              <p className="mb-2">
                This job posting form includes fields for optional license and overseas statement information where applicable.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ComprehensivePostJobPage;
