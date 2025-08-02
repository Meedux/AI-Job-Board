'use client';

import { useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import ComprehensiveJobPostingForm from '@/components/ComprehensiveJobPostingForm';
import JobPreview from '@/components/JobPreview';
import FormBuilder from '@/components/FormBuilder';
import { ArrowLeft, Plus, Settings, Eye, Briefcase, Zap, FileText } from 'lucide-react';

const PostJobPage = () => {
  const { user } = useAuth();
  const router = useRouter();
  const [currentStep, setCurrentStep] = useState('job-form'); // 'job-form', 'form-builder', 'preview'
  const [mode, setMode] = useState('manual'); // 'manual' or 'ai'
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
      const response = await fetch('/api/jobs/comprehensive-post', {
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
        setMessage('Job posted successfully! You can now create a custom application form or proceed to publish.');
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

  const handleFinish = async () => {
    if (jobData?.id) {
      try {
        const response = await fetch(`/api/jobs/${jobData.id}/publish`, {
          method: 'POST',
          credentials: 'include',
        });
        
        const result = await response.json();
        
        if (result.success) {
          setMessage('Job published successfully!');
          setTimeout(() => router.push('/admin/jobs'), 1500);
        } else {
          setMessage('Failed to publish job');
        }
      } catch (error) {
        console.error('Error publishing job:', error);
        setMessage('An error occurred while publishing the job');
      }
    } else {
      router.push('/admin/jobs');
    }
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
              {/* Mode Toggle - Only show on job form step */}
              {currentStep === 'job-form' && (
                <div className="flex bg-gray-700 rounded-lg p-1">
                  <button
                    onClick={() => setMode('manual')}
                    className={`px-3 py-1.5 rounded text-sm transition-colors flex items-center gap-2 ${
                      mode === 'manual' 
                        ? 'bg-blue-600 text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <FileText size={14} />
                    Manual
                  </button>
                  <button
                    onClick={() => setMode('ai')}
                    className={`px-3 py-1.5 rounded text-sm transition-colors flex items-center gap-2 ${
                      mode === 'ai' 
                        ? 'bg-purple-600 text-white' 
                        : 'text-gray-400 hover:text-white'
                    }`}
                  >
                    <Zap size={14} />
                    AI Mode
                  </button>
                </div>
              )}
              
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
          <div>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">
                {mode === 'ai' ? 'AI-Powered Job Posting' : 'Manual Job Posting'}
              </h2>
              <p className="text-gray-400">
                {mode === 'ai' 
                  ? 'Let AI help you create a comprehensive job posting with smart suggestions'
                  : 'Fill out the detailed job posting form step by step'
                }
              </p>
            </div>
            
            <ComprehensiveJobPostingForm
              mode={mode}
              onSubmit={handleJobSubmit}
              onCancel={handleCancel}
              initialData={jobData}
              isEditing={!!jobData}
            />
          </div>
        )}

        {currentStep === 'form-builder' && jobData && (
          <div>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">Create Application Form</h2>
              <p className="text-gray-400">
                Design a custom application form for <span className="text-blue-400">{jobData.title || jobData.jobTitle}</span>
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
                Review your comprehensive job posting before publishing
              </p>
            </div>

            {/* Use our comprehensive job preview component */}
            <JobPreview
              jobData={jobData}
              customForm={customForm}
              onClose={() => setCurrentStep('form-builder')}
              onPublish={handleFinish}
              showCloseButton={false}
              showEditButtons={true}
              onEditJob={() => setCurrentStep('job-form')}
              onEditForm={() => setCurrentStep('form-builder')}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default PostJobPage;


