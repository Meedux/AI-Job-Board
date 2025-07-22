'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import JobPostingForm from '@/components/JobPostingForm';
import FormBuilder from '@/components/FormBuilder';
import { ArrowLeft, Plus, Settings, Eye, Briefcase } from 'lucide-react';

const PostJobPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState('job-form'); // 'job-form', 'form-builder', 'preview'
  const [jobData, setJobData] = useState(null);
  const [customForm, setCustomForm] = useState(null);
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

  const handleJobSubmit = async (data) => {
    setLoading(true);
    try {
      const response = await fetch('/api/jobs/post', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        credentials: 'include',
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (result.success) {
        setJobData({ ...data, id: result.job.id });
        setMessage('Job posted successfully! Now create a custom application form.');
        setCurrentStep('form-builder');
      } else {
        setMessage(result.error || 'Failed to post job');
      }
    } catch (error) {
      console.error('Error posting job:', error);
      setMessage('An error occurred while posting the job');
    } finally {
      setLoading(false);
    }
  };

  const handleFormSave = async (formData) => {
    setLoading(true);
    try {
      const token = localStorage.getItem('token');
      const headers = {
        'Content-Type': 'application/json',
      };
      
      if (token) {
        headers['Authorization'] = `Bearer ${token}`;
      }

      const response = await fetch('/api/application-forms', {
        method: 'POST',
        headers,
        credentials: 'include',
        body: JSON.stringify(formData),
      });

      const result = await response.json();

      console.log('Form save response:', result);
      console.log('Response status:', response.status);

      if (result.success) {
        setCustomForm(formData);
        setMessage('Application form created successfully!');
        setCurrentStep('preview');
      } else {
        console.error('Form save failed:', result);
        setMessage(`Failed to create application form: ${result.error || 'Unknown error'}`);
      }
    } catch (error) {
      console.error('Error creating form:', error);
      setMessage('An error occurred while creating the form');
    } finally {
      setLoading(false);
    }
  };

  const handleFormPreview = (formData) => {
    setCustomForm(formData);
    setCurrentStep('preview');
  };

  const handleFinish = () => {
    router.push('/admin/jobs');
  };

  const handleCancel = () => {
    router.push('/admin/jobs');
  };

  const renderStepIndicator = () => (
    <div className="flex items-center justify-center mb-8">
      <div className="flex items-center space-x-4">
        <div className={`flex items-center ${currentStep === 'job-form' ? 'text-blue-400' : 'text-green-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            currentStep === 'job-form' ? 'border-blue-400 bg-blue-400' : 'border-green-400 bg-green-400'
          }`}>
            <span className="text-white font-semibold text-sm">1</span>
          </div>
          <span className="ml-2 font-medium">Job Details</span>
        </div>
        
        <div className={`w-8 h-px ${currentStep !== 'job-form' ? 'bg-green-400' : 'bg-gray-600'}`} />
        
        <div className={`flex items-center ${
          currentStep === 'job-form' ? 'text-gray-400' : 
          currentStep === 'form-builder' ? 'text-blue-400' : 'text-green-400'
        }`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            currentStep === 'job-form' ? 'border-gray-600' : 
            currentStep === 'form-builder' ? 'border-blue-400 bg-blue-400' : 'border-green-400 bg-green-400'
          }`}>
            <span className="text-white font-semibold text-sm">2</span>
          </div>
          <span className="ml-2 font-medium">Application Form</span>
        </div>
        
        <div className={`w-8 h-px ${currentStep === 'preview' ? 'bg-green-400' : 'bg-gray-600'}`} />
        
        <div className={`flex items-center ${currentStep === 'preview' ? 'text-blue-400' : 'text-gray-400'}`}>
          <div className={`w-8 h-8 rounded-full flex items-center justify-center border-2 ${
            currentStep === 'preview' ? 'border-blue-400 bg-blue-400' : 'border-gray-600'
          }`}>
            <span className="text-white font-semibold text-sm">3</span>
          </div>
          <span className="ml-2 font-medium">Preview & Publish</span>
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => router.push('/admin/jobs')}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="ml-3 text-xl font-semibold text-white">Post New Job</h1>
            </div>
            
            <div className="flex items-center space-x-4">
              {currentStep !== 'job-form' && (
                <button
                  onClick={() => setCurrentStep('job-form')}
                  className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
                >
                  Edit Job Details
                </button>
              )}
              
              {currentStep === 'preview' && (
                <button
                  onClick={() => setCurrentStep('form-builder')}
                  className="px-4 py-2 text-gray-300 hover:text-white hover:bg-gray-700 rounded-lg transition-colors flex items-center gap-2"
                >
                  <Settings size={16} />
                  Edit Form
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {renderStepIndicator()}

        {/* Message Display */}
        {message && (
          <div className={`mb-6 p-4 rounded-lg ${
            message.includes('success') || message.includes('Success') 
              ? 'bg-green-900 border border-green-700 text-green-300' 
              : 'bg-red-900 border border-red-700 text-red-300'
          }`}>
            {message}
          </div>
        )}

        {/* Step Content */}
        {currentStep === 'job-form' && (
          <JobPostingForm
            onSubmit={handleJobSubmit}
            onCancel={handleCancel}
            initialData={jobData}
            isEditing={!!jobData}
          />
        )}

        {currentStep === 'form-builder' && jobData && (
          <div>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Create Application Form</h2>
              <p className="text-gray-400">
                Design a custom application form for <span className="text-blue-400">{jobData.title}</span>
              </p>
            </div>
            
            <FormBuilder
              jobId={jobData.id}
              onSave={handleFormSave}
              onPreview={handleFormPreview}
              initialForm={customForm}
            />
          </div>
        )}

        {currentStep === 'preview' && jobData && (
          <div>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Preview & Publish</h2>
              <p className="text-gray-400">
                Review your job posting and application form before publishing
              </p>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
              {/* Job Preview */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Briefcase size={20} />
                  Job Posting Preview
                </h3>
                
                <div className="space-y-4">
                  <div>
                    <h4 className="text-lg font-bold text-white">{jobData.title}</h4>
                    <p className="text-gray-300">{jobData.company} • {jobData.location}</p>
                    <div className="flex flex-wrap gap-2 mt-2">
                      <span className="px-2 py-1 bg-blue-600 text-white rounded text-sm">{jobData.jobType}</span>
                      <span className="px-2 py-1 bg-purple-600 text-white rounded text-sm">{jobData.workMode}</span>
                      <span className="px-2 py-1 bg-green-600 text-white rounded text-sm">{jobData.experienceLevel}</span>
                    </div>
                  </div>

                  {(jobData.salaryMin || jobData.salaryMax) && (
                    <div>
                      <h5 className="font-medium text-gray-300">Salary Range</h5>
                      <p className="text-white">
                        {jobData.salaryMin && jobData.salaryMax 
                          ? `$${jobData.salaryMin.toLocaleString()} - $${jobData.salaryMax.toLocaleString()}`
                          : jobData.salaryMin 
                            ? `From $${jobData.salaryMin.toLocaleString()}`
                            : `Up to $${jobData.salaryMax.toLocaleString()}`
                        }
                      </p>
                    </div>
                  )}

                  {jobData.skillsRequired && jobData.skillsRequired.length > 0 && (
                    <div>
                      <h5 className="font-medium text-gray-300 mb-2">Required Skills</h5>
                      <div className="flex flex-wrap gap-2">
                        {jobData.skillsRequired.map((skill, index) => (
                          <span key={index} className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-sm">
                            {skill}
                          </span>
                        ))}
                      </div>
                    </div>
                  )}

                  <div>
                    <h5 className="font-medium text-gray-300 mb-2">Description</h5>
                    <div 
                      className="text-gray-400 prose prose-invert max-w-none"
                      dangerouslySetInnerHTML={{ __html: jobData.description }}
                    />
                  </div>
                </div>
              </div>

              {/* Form Preview */}
              <div className="bg-gray-800 rounded-lg p-6">
                <h3 className="text-xl font-semibold text-white mb-4 flex items-center gap-2">
                  <Settings size={20} />
                  Application Form Preview
                </h3>
                
                {customForm ? (
                  <div className="space-y-4">
                    <div>
                      <h4 className="font-bold text-white">{customForm.title}</h4>
                      {customForm.description && (
                        <p className="text-gray-300 text-sm mt-1">{customForm.description}</p>
                      )}
                    </div>
                    
                    <div className="text-sm text-gray-400">
                      <span className="font-medium">{customForm.fields?.length || 0}</span> fields configured
                    </div>
                    
                    <div className="max-h-64 overflow-y-auto">
                      {customForm.fields?.map((field, index) => (
                        <div key={index} className="mb-3 p-3 bg-gray-700 rounded">
                          <div className="flex items-center justify-between">
                            <span className="text-white font-medium">{field.label}</span>
                            {field.required && <span className="text-red-400 text-sm">Required</span>}
                          </div>
                          <span className="text-gray-400 text-sm capitalize">{field.type}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="text-center text-gray-400">
                    <p>Using default application form</p>
                    <button
                      onClick={() => setCurrentStep('form-builder')}
                      className="mt-2 text-blue-400 hover:text-blue-300"
                    >
                      Create custom form
                    </button>
                  </div>
                )}
              </div>
            </div>

            {/* Action Buttons */}
            <div className="flex justify-center gap-4 mt-8">
              <button
                onClick={handleCancel}
                className="px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={handleFinish}
                className="px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center gap-2"
              >
                <Eye size={16} />
                Publish Job
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default PostJobPage;


