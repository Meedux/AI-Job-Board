'use client';

import { useState } from 'react';
import ComprehensiveJobPostingForm from '@/components/ComprehensiveJobPostingForm';
import JobPreview from '@/components/JobPreview';
import { ArrowLeft, Zap, FileText, CheckCircle, AlertCircle } from 'lucide-react';

// Force dynamic rendering to prevent prerendering issues
export const dynamic = 'force-dynamic';

const ComprehensiveJobPostingDemo = () => {
  const [mode, setMode] = useState('manual');
  const [currentStep, setCurrentStep] = useState('form'); // 'form' or 'preview'
  const [jobData, setJobData] = useState(null);
  const [demoMessage, setDemoMessage] = useState('');

  // Mock user for demo purposes
  const mockUser = {
    id: 'demo-user',
    full_name: 'Demo User',
    email: 'demo@example.com',
    role: 'employer_admin'
  };

  const handleSubmit = async (formData) => {
    console.log('Demo Form submitted:', formData);
    setJobData(formData);
    setDemoMessage('Job posting created successfully! (Demo Mode)');
    setCurrentStep('preview');
  };

  const handleCancel = () => {
    setCurrentStep('form');
    setJobData(null);
    setDemoMessage('');
  };

  const handlePublish = () => {
    setDemoMessage('Job would be published! (This is a demo - no actual posting)');
    console.log('Demo: Publishing job:', jobData);
  };

  const features = [
    {
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      title: "5-Step Comprehensive Wizard",
      description: "Guided form with progressive disclosure of complexity"
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      title: "Dynamic Employer Type Adaptation",
      description: "Forms adapt based on Local, Overseas, International, Agency types"
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      title: "Manual & AI Modes",
      description: "Traditional manual entry or AI-powered smart suggestions"
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      title: "Advanced Job Features",
      description: "Salary ranges, benefits, prescreen questions, compliance"
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      title: "Comprehensive Preview",
      description: "Job card and full overview with social sharing"
    },
    {
      icon: <CheckCircle className="w-5 h-5 text-green-500" />,
      title: "Philippine Compliance",
      description: "POEA licensing, overseas deployment, labor law compliance"
    }
  ];

  return (
    <div className="min-h-screen bg-gray-900">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center">
              <button
                onClick={() => window.history.back()}
                className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
              >
                <ArrowLeft size={20} />
              </button>
              <h1 className="ml-3 text-xl font-semibold text-white">
                Comprehensive Job Posting System Demo
              </h1>
            </div>
            
            {currentStep === 'form' && (
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
                  Manual Mode
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
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {currentStep === 'form' && (
          <>
            {/* Demo Information */}
            <div className="mb-8">
              <div className="bg-gradient-to-r from-blue-600 to-purple-600 rounded-lg p-6 mb-6">
                <h2 className="text-2xl font-bold text-white mb-2">
                  Advanced Job Posting System
                </h2>
                <p className="text-blue-100">
                  Experience the next generation of job posting with dynamic forms, AI assistance, 
                  and comprehensive employer type adaptation for the Philippine market.
                </p>
              </div>

              {/* Features Grid */}
              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-4 mb-8">
                {features.map((feature, index) => (
                  <div key={index} className="bg-gray-800 rounded-lg p-4 border border-gray-700">
                    <div className="flex items-start gap-3">
                      {feature.icon}
                      <div>
                        <h3 className="font-semibold text-white text-sm">{feature.title}</h3>
                        <p className="text-gray-400 text-xs mt-1">{feature.description}</p>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Mode Description */}
              <div className="bg-gray-800 rounded-lg p-6 border border-gray-700">
                <h3 className="text-lg font-semibold text-white mb-2">
                  {mode === 'ai' ? '🤖 AI-Powered Mode' : '📝 Manual Mode'}
                </h3>
                <p className="text-gray-400">
                  {mode === 'ai' 
                    ? 'AI Mode uses smart suggestions and auto-completion to help you create comprehensive job postings quickly. Try switching employer types to see dynamic form adaptation.'
                    : 'Manual Mode gives you full control over every aspect of your job posting. Perfect for detailed, specific job requirements with step-by-step guidance.'
                  }
                </p>
              </div>
            </div>

            {/* Demo Notice */}
            {demoMessage && (
              <div className={`mb-6 p-4 rounded-lg flex items-center gap-3 ${
                demoMessage.includes('success') 
                  ? 'bg-green-900 border border-green-700' 
                  : 'bg-blue-900 border border-blue-700'
              }`}>
                <AlertCircle className="w-5 h-5 text-blue-400" />
                <span className="text-white">{demoMessage}</span>
              </div>
            )}

            {/* Form */}
            <ComprehensiveJobPostingForm
              mode={mode}
              onSubmit={handleSubmit}
              onCancel={handleCancel}
              user={mockUser}
              isDemo={true}
            />
          </>
        )}

        {currentStep === 'preview' && jobData && (
          <div>
            <div className="mb-6 text-center">
              <h2 className="text-2xl font-bold text-white mb-2">
                Job Posting Preview
              </h2>
              <p className="text-gray-400">
                This demonstrates how your comprehensive job posting appears to candidates
              </p>
            </div>

            <JobPreview
              jobData={jobData}
              onClose={handleCancel}
              onPublish={handlePublish}
              showCloseButton={true}
              showEditButtons={false}
            />
          </div>
        )}
      </div>
    </div>
  );
};

export default ComprehensiveJobPostingDemo;
