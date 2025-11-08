// Comprehensive Job Posting Form Component
'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { useSubscription } from '@/contexts/SubscriptionContext';
import { 
  hasPremiumFeature,
  PREMIUM_FEATURES
} from '@/utils/premiumFeatures';

import { 
  
  EDUCATION_LEVELS, 
  SALARY_RANGES_PHP, 
  SALARY_PERIODS, 
  CURRENCIES,
  DEFAULT_PRESCREEN_QUESTIONS,
  
  INDUSTRY_CATEGORIES,
  FORM_TOOLTIPS,
  JOB_TYPES,
  WORK_MODES,
  EXPERIENCE_LEVELS,
  EMPLOYMENT_TYPES
} from '@/utils/jobPostingConstants';
import { 
  Building2, 
  MapPin, 
  DollarSign, 
  Calendar, 
  Users, 
  Clock, 
  Info, 
  Plus, 
  Minus,
  Eye,
  Save,
  Sparkles,
  FileText,
  Shield,
  AlertTriangle,
  Globe,
  Mail,
  Phone
} from 'lucide-react';

import RichTextEditor from './RichTextEditor';

const ComprehensiveJobPostingForm = ({ 
  onSubmit, 
  onCancel, 
  initialData = null, 
  mode = 'manual',
  user: propUser = null,
  isDemo = false
}) => {
  // Get user from props (for demo) or context
  const contextUser = (() => {
    try {
      const { user } = useAuth();
      return user;
    } catch (error) {
      // Fallback for when useAuth is not available (e.g., during build)
      return null;
    }
  })();
  
  const user = propUser || contextUser;
  const subscriptionContext = (() => {
    try {
      return useSubscription();
    } catch (error) {
      // Fallback for when useSubscription is not available (e.g., during build)
      return { subscription: null };
    }
  })();
  const { subscription } = subscriptionContext;
  const [currentStep, setCurrentStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const [showPreview, setShowPreview] = useState(false);

  // Form State
  const [formData, setFormData] = useState({
    // Basic Job Information
    jobTitle: '',
    numberOfOpenings: 1,
    companyName: user?.companyName || '',
    jobDescription: '',
    qualification: '',
    endPostingOn: '',
    educationAttainment: '',
    showContactOnPosting: false,
    protectEmailAddress: false,
    
    // Location Information
    city: '',
    state: '',
    postalCode: '',
    country: 'Philippines',
    
    // Salary Information
    currency: 'PHP',
    salaryPeriod: 'monthly',
    salaryRange: '',
    customSalaryMin: '',
    customSalaryMax: '',
    showCompensation: true,
    
    // Job Details
    jobType: 'full-time',
    workMode: 'on-site',
    experienceLevel: 'mid-level',
    employmentType: 'permanent',
    industry: '',
    subIndustry: '',
    
    // Skills and Requirements
    requiredSkills: [],
    preferredSkills: [],
    benefits: '',
    
    // Prescreen Questions
    prescreenQuestions: [],
    useDefaultQuestions: false,
    
    // Employer-specific fields
    licenseNumber: '',
    licenseExpirationDate: '',
    overseasStatement: '',
    // Placement fees and agency-specific fields
    hasPlacementFee: false,
    isPlacement: false,
    // New fields from requirements
    functionalRole: '',
    specialization: '',
    dealBreakers: [],
    course: '',
    region: '',
    mandatoryStatement: false,
    principalEmployer: '',
    validPassport: false,
    
    // Application Settings
    applicationDeadline: '',
    applicationMethod: 'internal', // 'internal', 'external', 'email'
    externalApplicationUrl: '',
    applicationEmail: '',
    
    // Preview and Publishing
    allowPreview: true,
    generateQRCode: false,
    generateSocialTemplate: false
  });

  // Initialize form data from initialData if provided
  useEffect(() => {
    if (initialData) {
      setFormData(prev => ({
        ...prev,
        ...initialData,
        // Ensure prescreenQuestions is properly initialized
        prescreenQuestions: initialData.prescreenQuestions || [],
        useDefaultQuestions: initialData.useDefaultQuestions || false
      }));
    }
  }, [initialData]);

  // Auto-save prescreen questions to localStorage
  useEffect(() => {
    if (formData.prescreenQuestions.length > 0) {
      const key = `job-posting-prescreen-${user?.id || 'anonymous'}`;
      localStorage.setItem(key, JSON.stringify(formData.prescreenQuestions));
    }
  }, [formData.prescreenQuestions, user?.id]);

  // Load prescreen questions from localStorage on mount
  useEffect(() => {
    if (!initialData) {
      const key = `job-posting-prescreen-${user?.id || 'anonymous'}`;
      const saved = localStorage.getItem(key);
      if (saved) {
        try {
          const parsedQuestions = JSON.parse(saved);
          if (parsedQuestions.length > 0) {
            setFormData(prev => ({
              ...prev,
              prescreenQuestions: parsedQuestions
            }));
            // Could add a toast notification here if needed
          }
        } catch (error) {
          console.error('Error loading saved prescreen questions:', error);
        }
      }
    }
  }, [initialData, user?.id]);

  // employerType was removed — do not branch UI/validation on legacy employer type

  // Derive employer-related flags from the current user (if available).
  // These control whether certain fields are shown and/or required.
  const companyType = user?.companyType || null; // e.g. 'agency', 'employer', 'sub_agency'
  const employerCategory = user?.employerCategory || null; // e.g. 'local', 'abroad', 'both'
  const requiresLicense = companyType === 'agency' || companyType === 'sub_agency' || companyType === 'manpower';
  const isOverseasEmployer = employerCategory === 'abroad' || employerCategory === 'both';
  const isVerified = !!user?.isVerified;

  // Normalized employer type object attached to user (if available)
  const employerType = user?.employerTypeUser || null;
  const employerSubtype = employerType?.subtype || null; // e.g. 'dmw', 'poea', 'ma', 'lb', 'pea'
  const isDMWAgency = employerSubtype === 'dmw' || employerSubtype === 'poea';
  const isAgency = companyType === 'agency' || companyType === 'manpower' || companyType === 'sub_agency';
  const canSetPlacementFee = isDMWAgency && isVerified;
  const companyNameReadOnly = !!user?.companyName;

  // When user context loads, pre-fill some form values and enforce defaults
  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        companyName: user.companyName || prev.companyName,
        // Unverified accounts should not show contact info by default
        showContactOnPosting: user && user.isVerified ? prev.showContactOnPosting : false
      }));
    }
  }, [user]);

  // Form submission handler
  const handleFormSubmit = async (e) => {
    e.preventDefault();
    
    if (currentStep < 5) {
      nextStep();
      return;
    }
    
    setLoading(true);
    
    try {
      // Validate required fields
      const requiredFields = {
        1: ['jobTitle', 'companyName'],
        2: ['jobDescription'],
        3: ['employmentType', 'workMode'],
        4: ['applicationMethod'],
        5: [] // Review step
      };
      
      const newErrors = {};
      for (let step = 1; step <= 4; step++) {
        requiredFields[step].forEach(field => {
          if (!formData[field] || (Array.isArray(formData[field]) && formData[field].length === 0)) {
            newErrors[field] = 'This field is required';
          }
        });
      }
      
      if (Object.keys(newErrors).length > 0) {
        setErrors(newErrors);
        setLoading(false);
        return;
      }
      
      // Demo mode just calls onSubmit directly
      if (isDemo) {
        onSubmit(formData);
        return;
      }
      
      // Prepare data for submission - map field names to match API expectations
      const submissionData = {
        // Map comprehensive form fields to API expected fields
        title: formData.jobTitle,
        description: formData.jobDescription,
        company: formData.companyName,
        location: `${formData.city}, ${formData.state}`,
        jobType: formData.jobType,
        workMode: formData.workMode,
        experienceLevel: formData.experienceLevel,
        salaryMin: formData.customSalaryMin ? parseInt(formData.customSalaryMin) : null,
        salaryMax: formData.customSalaryMax ? parseInt(formData.customSalaryMax) : null,
        requirements: formData.qualification,
        skillsRequired: formData.requiredSkills,
        benefits: formData.benefits,
        applicationDeadline: formData.applicationDeadline,
        category: formData.industry,
        
        // Include all comprehensive fields for the new system
        ...formData,
        // Normalize placement fee to boolean
        hasPlacementFee: !!formData.hasPlacementFee,
        isPlacement: !!formData.isPlacement,
        // Only include prescreen questions for premium users
        prescreenQuestions: hasPremiumFeature(PREMIUM_FEATURES.PRESCREEN_QUESTIONS, user, subscription) 
          ? formData.prescreenQuestions 
          : [],
        postedById: user?.id,
        status: 'draft'
      };
      
      // If onSubmit returns a promise/result, await it so we can surface server messages here.
      let result;
      try {
        result = onSubmit ? onSubmit(submissionData) : null;
        if (result && typeof result.then === 'function') {
          result = await result;
        }

        if (result && result.error) {
          setErrors(prev => ({ ...prev, submit: result.error }));
        }
      } finally {
        // Clear saved prescreen questions from localStorage after attempted submission
        const key = `job-posting-prescreen-${user?.id || 'anonymous'}`;
        localStorage.removeItem(key);
      }
    } catch (error) {
      console.error('Form submission error:', error);
      setErrors({ submit: 'An error occurred while submitting the form' });
    } finally {
      setLoading(false);
    }
  };
  

  // Handle form changes
  const handleInputChange = (field, value) => {
    setFormData(prev => ({
      ...prev,
      [field]: value
    }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({
        ...prev,
        [field]: null
      }));
    }
  };

  // Handle array fields (skills, questions)
  const handleArrayAdd = (field, value) => {
    if (value.trim()) {
      setFormData(prev => ({
        ...prev,
        [field]: [...prev[field], value.trim()]
      }));
    }
  };

  const handleArrayRemove = (field, index) => {
    setFormData(prev => ({
      ...prev,
      [field]: prev[field].filter((_, i) => i !== index)
    }));
  };

  // Add prescreen question
  const addPrescreenQuestion = () => {
    const maxQuestions = mode === 'ai' ? 5 : 3;
    if (formData.prescreenQuestions.length < maxQuestions) {
      setFormData(prev => ({
        ...prev,
        prescreenQuestions: [
          ...prev.prescreenQuestions,
          {
            id: Date.now(),
            type: 'text',
            question: '',
            options: [],
            required: false
          }
        ]
      }));
    }
  };

  // Update prescreen question
  const updatePrescreenQuestion = (index, field, value) => {
    setFormData(prev => ({
      ...prev,
      prescreenQuestions: prev.prescreenQuestions.map((q, i) => 
        i === index ? { ...q, [field]: value } : q
      )
    }));
  };

  // Remove prescreen question
  const removePrescreenQuestion = (index) => {
    setFormData(prev => ({
      ...prev,
      prescreenQuestions: prev.prescreenQuestions.filter((_, i) => i !== index)
    }));
  };

  // Load default questions
  const loadDefaultQuestions = () => {
    setFormData(prev => ({
      ...prev,
      prescreenQuestions: DEFAULT_PRESCREEN_QUESTIONS.slice(0, 3),
      useDefaultQuestions: true
    }));
  };

  // Form validation
  const validateStep = (step) => {
    const newErrors = {};

    switch (step) {
      case 1: // Basic Information
        if (!formData.jobTitle.trim()) newErrors.jobTitle = 'Job title is required';
        if (!formData.companyName.trim()) newErrors.companyName = 'Company name is required';
        if (!formData.jobDescription.trim()) newErrors.jobDescription = 'Job description is required';
        if (!formData.qualification.trim()) newErrors.qualification = 'Qualifications are required';
        if (!formData.educationAttainment) newErrors.educationAttainment = 'Education attainment is required';
        // If the employer's company type requires a license, validate license fields
        if (requiresLicense) {
          if (!formData.licenseNumber || !formData.licenseNumber.trim()) newErrors.licenseNumber = 'License number is required for your account type';
          if (!formData.licenseExpirationDate) newErrors.licenseExpirationDate = 'License expiration date is required';
        }
        break;

      case 2: // Location and Salary
        if (!formData.city.trim()) newErrors.city = 'City is required';
        if (!formData.postalCode.trim()) newErrors.postalCode = 'Postal code is required';
        if (formData.salaryRange === 'custom') {
          if (!formData.customSalaryMin) newErrors.customSalaryMin = 'Minimum salary is required';
          if (!formData.customSalaryMax) newErrors.customSalaryMax = 'Maximum salary is required';
        }
        break;

      case 3: // Job Details
        if (!formData.industry) newErrors.industry = 'Industry is required';
        // If this employer posts overseas jobs, require an overseas statement
        if (isOverseasEmployer) {
          if (!formData.overseasStatement || !formData.overseasStatement.trim()) newErrors.overseasStatement = 'Overseas statement is required for overseas job postings';
        }
        break;

      case 4: // Application Settings
        if (formData.applicationMethod === 'external' && !formData.externalApplicationUrl) {
          newErrors.externalApplicationUrl = 'External application URL is required';
        }
        if (formData.applicationMethod === 'email' && !formData.applicationEmail) {
          newErrors.applicationEmail = 'Application email is required';
        }
        break;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // Handle step navigation
  const nextStep = () => {
    if (validateStep(currentStep)) {
      setCurrentStep(prev => Math.min(prev + 1, 5));
    }
  };

  const prevStep = () => {
    setCurrentStep(prev => Math.max(prev - 1, 1));
  };

  // AI Mode - Generate content
  const generateAIContent = async (type) => {
    setLoading(true);
    try {
      // Simulate AI generation - replace with actual AI service
      if (type === 'description') {
        const aiDescription = `Join our dynamic team as a ${formData.jobTitle} where you'll make a significant impact on our organization's success. We're looking for a passionate professional who thrives in a collaborative environment and is ready to take on exciting challenges.`;
        handleInputChange('jobDescription', aiDescription);
      } else if (type === 'skills') {
        const aiSkills = ['Communication', 'Problem Solving', 'Teamwork', 'Time Management'];
        setFormData(prev => ({
          ...prev,
          requiredSkills: [...prev.requiredSkills, ...aiSkills]
        }));
      } else if (type === 'questions') {
        const aiQuestions = [
          {
            id: Date.now() + 1,
            type: 'select',
            question: 'What motivates you most about this role?',
            options: ['Career growth', 'Technical challenges', 'Team collaboration', 'Company mission'],
            required: true
          },
          {
            id: Date.now() + 2,
            type: 'text',
            question: 'Describe a challenging project you\'ve worked on recently.',
            required: true
          }
        ];
        setFormData(prev => ({
          ...prev,
          prescreenQuestions: [...prev.prescreenQuestions, ...aiQuestions]
        }));
      }
    } catch (error) {
      console.error('AI generation error:', error);
    } finally {
      setLoading(false);
    }
  };

  // Tooltip component
  const Tooltip = ({ text, children }) => (
    <div className="relative group">
      {children}
      <div className="absolute left-0 top-full mt-2 w-80 p-3 bg-gray-800 text-white text-sm rounded-lg shadow-lg opacity-0 group-hover:opacity-100 transition-opacity duration-200 z-10 pointer-events-none">
        <div className="flex items-start gap-2">
          <Info size={16} className="text-blue-400 flex-shrink-0 mt-0.5" />
          <span>{text}</span>
        </div>
      </div>
    </div>
  );

  // Step indicator
  const StepIndicator = () => {
    const steps = [
      { number: 1, label: 'Basic Info' },
      { number: 2, label: 'Location & Salary' },
      { number: 3, label: 'Job Details' },
      { number: 4, label: 'Application' },
      { number: 5, label: 'Questions & Publish', hasQuestions: formData.prescreenQuestions.length > 0 }
    ];

    return (
      <div className="flex items-center justify-center mb-8">
        {steps.map((step, index) => (
          <div key={step.number} className="flex items-center">
            <div className="flex flex-col items-center">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium relative ${
                step.number <= currentStep 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-700 text-gray-400'
              }`}>
                {step.number}
                {step.hasQuestions && (
                  <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-500 rounded-full border border-gray-900"></div>
                )}
              </div>
              <span className={`text-xs mt-1 ${
                step.number <= currentStep ? 'text-blue-400' : 'text-gray-500'
              }`}>
                {step.label}
              </span>
            </div>
            {index < steps.length - 1 && (
              <div className={`w-12 h-0.5 ${
                step.number < currentStep ? 'bg-blue-600' : 'bg-gray-700'
              }`} />
            )}
          </div>
        ))}
      </div>
    );
  };

  // Step 1: Basic Information
  const renderStep1 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">Basic Job Information</h3>
      
      {/* Job Title */}
      <div>
        <Tooltip text={FORM_TOOLTIPS.jobTitle}>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
            <Building2 size={16} />
            Job Title *
            <Info size={14} className="text-gray-400" />
          </label>
        </Tooltip>
        <input
          type="text"
          value={formData.jobTitle}
          onChange={(e) => handleInputChange('jobTitle', e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Senior Frontend Developer"
        />
        {errors.jobTitle && <p className="mt-1 text-sm text-red-400">{errors.jobTitle}</p>}
      </div>

      {/* Functional Role */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
          <Building2 size={16} />
          Functional Role
        </label>
        <select
          value={formData.functionalRole}
          onChange={(e) => handleInputChange('functionalRole', e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Functional Role</option>
          <option value="engineering">Engineering</option>
          <option value="sales">Sales</option>
          <option value="marketing">Marketing</option>
          <option value="finance">Finance</option>
          <option value="hr">Human Resources</option>
          <option value="operations">Operations</option>
          <option value="other">Other</option>
        </select>
      </div>

      {/* Specialization */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
          <Building2 size={16} />
          Specialization
        </label>
        <input
          type="text"
          value={formData.specialization}
          onChange={(e) => handleInputChange('specialization', e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Frontend Development, Digital Marketing"
        />
      </div>

      {/* Number of Openings */}
      <div>
        <Tooltip text={FORM_TOOLTIPS.numberOfOpenings}>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
            <Users size={16} />
            Number of Openings *
            <Info size={14} className="text-gray-400" />
          </label>
        </Tooltip>
        <input
          type="number"
          min="1"
          max="100"
          value={formData.numberOfOpenings}
          onChange={(e) => handleInputChange('numberOfOpenings', parseInt(e.target.value))}
          className="w-32 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Company Name */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
          <Building2 size={16} />
          Company Name *
        </label>
        <input
          type="text"
          value={formData.companyName}
          onChange={(e) => handleInputChange('companyName', e.target.value)}
          readOnly={companyNameReadOnly}
          className={`w-full px-3 py-2 ${companyNameReadOnly ? 'bg-gray-900 cursor-not-allowed' : 'bg-gray-800'} border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500`}
          placeholder="Your company name"
        />
        {companyNameReadOnly && (
          <p className="mt-1 text-xs text-gray-400">Company name is set from your account registration and cannot be changed here. Manage company details on the Manage Company page.</p>
        )}
        {errors.companyName && <p className="mt-1 text-sm text-red-400">{errors.companyName}</p>}
      </div>

      {/* Job Description */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <FileText size={16} />
            Job Description *
          </label>
          {mode === 'ai' && (
            <button
              type="button"
              onClick={() => generateAIContent('description')}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:opacity-50"
            >
              <Sparkles size={14} />
              {loading ? 'Generating...' : 'AI Generate'}
            </button>
          )}
        </div>
        <RichTextEditor
          content={formData.jobDescription}
          onChange={(content) => handleInputChange('jobDescription', content)}
          placeholder="Describe the role, responsibilities, and what makes this position exciting..."
        />
        {errors.jobDescription && <p className="mt-1 text-sm text-red-400">{errors.jobDescription}</p>}
      </div>

      {/* Qualifications */}
      <div>
        <Tooltip text={FORM_TOOLTIPS.qualifications}>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
            <Shield size={16} />
            Qualifications *
            <Info size={14} className="text-gray-400" />
          </label>
        </Tooltip>
        <textarea
          rows={4}
          value={formData.qualification}
          onChange={(e) => handleInputChange('qualification', e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="List the required qualifications, experience, and skills..."
        />
        {errors.qualification && <p className="mt-1 text-sm text-red-400">{errors.qualification}</p>}
      </div>

      {/* Education Attainment */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
          Education Attainment *
        </label>
        <select
          value={formData.educationAttainment}
          onChange={(e) => handleInputChange('educationAttainment', e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select education level</option>
          {EDUCATION_LEVELS.map((level) => (
            <option key={level.value} value={level.value}>
              {level.label}
            </option>
          ))}
        </select>
        {errors.educationAttainment && <p className="mt-1 text-sm text-red-400">{errors.educationAttainment}</p>}
      </div>

      {/* License & Overseas Information (shown when applicable based on employer type/category) */}
      {requiresLicense && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Tooltip text={FORM_TOOLTIPS.licenseNumber}>
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
                <Shield size={16} />
                License Number *
                <Info size={14} className="text-gray-400" />
              </label>
            </Tooltip>
            <input
              type="text"
              value={formData.licenseNumber}
              onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="DOLE/DMW/CDA License Number"
            />
            {errors.licenseNumber && <p className="mt-1 text-sm text-red-400">{errors.licenseNumber}</p>}
          </div>
          
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Calendar size={16} />
              License Expiration Date *
            </label>
            <input
              type="date"
              value={formData.licenseExpirationDate}
              onChange={(e) => handleInputChange('licenseExpirationDate', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            {errors.licenseExpirationDate && <p className="mt-1 text-sm text-red-400">{errors.licenseExpirationDate}</p>}
          </div>
        </div>
      )}

      {isOverseasEmployer && (
        <div className="mt-4">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
            <Globe size={16} />
            Overseas Statement *
          </label>
          <textarea
            rows={3}
            value={formData.overseasStatement}
            onChange={(e) => handleInputChange('overseasStatement', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="Explain placement details, compliance, and any employer responsibilities for overseas placements"
          />
          {errors.overseasStatement && <p className="mt-1 text-sm text-red-400">{errors.overseasStatement}</p>}
        </div>
      )}

      {/* End Posting Date */}
      <div>
        <Tooltip text={FORM_TOOLTIPS.endPostingOn}>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
            <Calendar size={16} />
            End Posting On
            <Info size={14} className="text-gray-400" />
          </label>
        </Tooltip>
        <input
          type="date"
          value={formData.endPostingOn}
          onChange={(e) => handleInputChange('endPostingOn', e.target.value)}
          className="w-full md:w-1/3 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>
    </div>
  );

  // Step 2: Location and Salary
  const renderStep2 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">Location & Compensation</h3>
      
      {/* Location Information */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
            <MapPin size={16} />
            City *
          </label>
          <input
            type="text"
            value={formData.city}
            onChange={(e) => handleInputChange('city', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Manila"
          />
          {errors.city && <p className="mt-1 text-sm text-red-400">{errors.city}</p>}
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">State/Province</label>
          <input
            type="text"
            value={formData.state}
            onChange={(e) => handleInputChange('state', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., Metro Manila"
          />
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">Postal Code *</label>
          <input
            type="text"
            value={formData.postalCode}
            onChange={(e) => handleInputChange('postalCode', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="e.g., 1000"
          />
          {errors.postalCode && <p className="mt-1 text-sm text-red-400">{errors.postalCode}</p>}
        </div>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">Region</label>
        <select
          value={formData.region}
          onChange={(e) => handleInputChange('region', e.target.value)}
          className="w-full md:w-1/3 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="">Select Region</option>
          <option value="NCR">National Capital Region (NCR)</option>
          <option value="Region I">Region I (Ilocos Region)</option>
          <option value="Region II">Region II (Cagayan Valley)</option>
          <option value="Region III">Region III (Central Luzon)</option>
          <option value="Region IV-A">Region IV-A (CALABARZON)</option>
          <option value="Region IV-B">Region IV-B (MIMAROPA)</option>
          <option value="Region V">Region V (Bicol Region)</option>
          <option value="Region VI">Region VI (Western Visayas)</option>
          <option value="Region VII">Region VII (Central Visayas)</option>
          <option value="Region VIII">Region VIII (Eastern Visayas)</option>
          <option value="Region IX">Region IX (Zamboanga Peninsula)</option>
          <option value="Region X">Region X (Northern Mindanao)</option>
          <option value="Region XI">Region XI (Davao Region)</option>
          <option value="Region XII">Region XII (SOCCSKSARGEN)</option>
          <option value="Region XIII">Region XIII (Caraga)</option>
          <option value="BARMM">BARMM (Bangsamoro)</option>
          <option value="Overseas">Overseas</option>
        </select>
      </div>

      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">Country</label>
        <select
          value={formData.country}
          onChange={(e) => handleInputChange('country', e.target.value)}
          className="w-full md:w-1/3 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          <option value="Philippines">Philippines</option>
          <option value="Singapore">Singapore</option>
          <option value="Japan">Japan</option>
          <option value="Dubai">Dubai</option>
          <option value="Saudi Arabia">Saudi Arabia</option>
          <option value="Other">Other</option>
        </select>
      </div>

      {/* Salary Information */}
      <div className="border-t border-gray-700 pt-6">
        <Tooltip text={FORM_TOOLTIPS.salary}>
          <h4 className="flex items-center gap-2 text-lg font-medium text-white mb-4">
            <DollarSign size={18} />
            Salary Information
            <Info size={14} className="text-gray-400" />
          </h4>
        </Tooltip>
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">Currency</label>
            <select
              value={formData.currency}
              onChange={(e) => handleInputChange('currency', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {CURRENCIES.map((currency) => (
                <option key={currency.value} value={currency.value}>
                  {currency.label}
                </option>
              ))}
            </select>
          </div>
          
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">Salary Period</label>
            <select
              value={formData.salaryPeriod}
              onChange={(e) => handleInputChange('salaryPeriod', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {SALARY_PERIODS.map((period) => (
                <option key={period.value} value={period.value}>
                  {period.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Salary Range for PHP Monthly */}
        {formData.currency === 'PHP' && formData.salaryPeriod === 'monthly' && (
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">Salary Range</label>
            <select
              value={formData.salaryRange}
              onChange={(e) => handleInputChange('salaryRange', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select salary range</option>
              {SALARY_RANGES_PHP.map((range) => (
                <option key={range.value} value={range.value}>
                  {range.label}
                </option>
              ))}
            </select>
          </div>
        )}

        {/* Custom Salary Input */}
        {(formData.salaryRange === 'custom' || formData.currency !== 'PHP' || formData.salaryPeriod !== 'monthly') && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Minimum Salary</label>
              <input
                type="number"
                value={formData.customSalaryMin}
                onChange={(e) => handleInputChange('customSalaryMin', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 50000"
              />
              {errors.customSalaryMin && <p className="mt-1 text-sm text-red-400">{errors.customSalaryMin}</p>}
            </div>
            
            <div>
              <label className="text-sm font-medium text-gray-300 mb-2 block">Maximum Salary</label>
              <input
                type="number"
                value={formData.customSalaryMax}
                onChange={(e) => handleInputChange('customSalaryMax', e.target.value)}
                className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
                placeholder="e.g., 80000"
              />
              {errors.customSalaryMax && <p className="mt-1 text-sm text-red-400">{errors.customSalaryMax}</p>}
            </div>
          </div>
        )}

        {/* Overseas Job Salary Requirement */}
        {isOverseasEmployer && (
          <div className="mt-4 p-4 bg-orange-900/20 border border-orange-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-orange-400 mb-2">
              <AlertTriangle size={16} />
              <span className="font-medium">Overseas Job Requirement</span>
            </div>
            <p className="text-orange-300 text-sm">
              For overseas job postings, salary information is required and must be clearly specified.
            </p>
          </div>
        )}

        {/* Show Compensation Toggle */}
        <div className="mt-4">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <input
              type="checkbox"
              checked={formData.showCompensation}
              onChange={(e) => handleInputChange('showCompensation', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            Show compensation in job posting
            <Info size={14} className="text-gray-400" />
          </label>
        </div>

        {/* Placement Fee Section - Only for DMW Agencies */}
        {canSetPlacementFee && (
          <div className="mt-6 p-4 bg-blue-900/20 border border-blue-500/30 rounded-lg">
            <div className="flex items-center gap-2 text-blue-400 mb-3">
              <DollarSign size={16} />
              <span className="font-medium">Placement Fee Information</span>
            </div>

            <div className="space-y-4">
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="hasPlacementFee"
                  checked={!!formData.hasPlacementFee}
                  onChange={(e) => handleInputChange('hasPlacementFee', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                <label htmlFor="hasPlacementFee" className="text-sm font-medium text-gray-300">
                  This job posting includes a placement fee
                </label>
              </div>

              <p className="text-xs text-gray-400">
                Check this box if your agency charges a placement fee for this position. Only verified DMW agencies can indicate placement fees.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );

  // Step 3: Job Details and Requirements
  const renderStep3 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">Job Details & Requirements</h3>
      
      {/* Job Type and Work Mode */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
            <Clock size={16} />
            Job Type *
          </label>
          <select
            value={formData.jobType}
            onChange={(e) => handleInputChange('jobType', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {JOB_TYPES.map((type) => (
              <option key={type.value} value={type.value}>
                {type.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">Work Mode *</label>
          <select
            value={formData.workMode}
            onChange={(e) => handleInputChange('workMode', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {WORK_MODES.map((mode) => (
              <option key={mode.value} value={mode.value}>
                {mode.label}
              </option>
            ))}
          </select>
        </div>
        
        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">Experience Level *</label>
          <select
            value={formData.experienceLevel}
            onChange={(e) => handleInputChange('experienceLevel', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            {EXPERIENCE_LEVELS.map((level) => (
              <option key={level.value} value={level.value}>
                {level.label}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* Employment Type */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">Employment Type *</label>
        <select
          value={formData.employmentType}
          onChange={(e) => handleInputChange('employmentType', e.target.value)}
          className="w-full md:w-1/3 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        >
          {EMPLOYMENT_TYPES.map((type) => (
            <option key={type.value} value={type.value}>
              {type.label}
            </option>
          ))}
        </select>
      </div>

      {/* Industry */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="text-sm font-medium text-gray-300 mb-2 block">Industry *</label>
          <select
            value={formData.industry}
            onChange={(e) => {
              handleInputChange('industry', e.target.value);
              handleInputChange('subIndustry', ''); // Reset sub-industry
            }}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">Select industry</option>
            {Object.entries(INDUSTRY_CATEGORIES).map(([key, category]) => (
              <option key={key} value={key}>
                {category.label}
              </option>
            ))}
          </select>
          {errors.industry && <p className="mt-1 text-sm text-red-400">{errors.industry}</p>}
        </div>
        
        {formData.industry && INDUSTRY_CATEGORIES[formData.industry]?.subcategories && (
          <div>
            <label className="text-sm font-medium text-gray-300 mb-2 block">Sub-Industry</label>
            <select
              value={formData.subIndustry}
              onChange={(e) => handleInputChange('subIndustry', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select sub-industry</option>
              {INDUSTRY_CATEGORIES[formData.industry].subcategories.map((sub) => (
                <option key={sub} value={sub}>
                  {sub}
                </option>
              ))}
            </select>
          </div>
        )}
      </div>

      {/* Course */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">Required Course/Degree</label>
        <input
          type="text"
          value={formData.course}
          onChange={(e) => handleInputChange('course', e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="e.g., Bachelor of Science in Computer Science"
        />
      </div>

      {/* Skills Required */}
      <div>
        <div className="flex items-center justify-between mb-2">
          <label className="text-sm font-medium text-gray-300">Required Skills</label>
          {mode === 'ai' && (
            <button
              type="button"
              onClick={() => generateAIContent('skills')}
              disabled={loading}
              className="flex items-center gap-2 px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:opacity-50"
            >
              <Sparkles size={14} />
              AI Suggest
            </button>
          )}
        </div>
        <SkillsInput
          skills={formData.requiredSkills}
          onAdd={(skill) => handleArrayAdd('requiredSkills', skill)}
          onRemove={(index) => handleArrayRemove('requiredSkills', index)}
          placeholder="Type a skill and press Enter"
        />
      </div>

      {/* Preferred Skills */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">Preferred Skills (Optional)</label>
        <SkillsInput
          skills={formData.preferredSkills}
          onAdd={(skill) => handleArrayAdd('preferredSkills', skill)}
          onRemove={(index) => handleArrayRemove('preferredSkills', index)}
          placeholder="Type a preferred skill and press Enter"
        />
      </div>

      {/* Deal Breakers */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">Deal Breakers (Optional)</label>
        <SkillsInput
          skills={formData.dealBreakers}
          onAdd={(skill) => handleArrayAdd('dealBreakers', skill)}
          onRemove={(index) => handleArrayRemove('dealBreakers', index)}
          placeholder="Type a deal breaker and press Enter"
        />
        <p className="text-xs text-gray-400 mt-1">Skills or requirements that are absolutely necessary</p>
      </div>

      {/* Benefits */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-2 block">Benefits & Perks</label>
        <textarea
          rows={3}
          value={formData.benefits}
          onChange={(e) => handleInputChange('benefits', e.target.value)}
          className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
          placeholder="Describe the benefits, perks, and company culture..."
        />
      </div>

      {/* Overseas statements and employer-type specific choices removed */}
    </div>
  );

  // Step 4: Application Settings
  const renderStep4 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">Application Settings</h3>
      
      {/* Application Method */}
      <div>
        <label className="text-sm font-medium text-gray-300 mb-3 block">How should candidates apply?</label>
        <div className="space-y-3">
          <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg border border-gray-700 cursor-pointer">
            <input
              type="radio"
              name="applicationMethod"
              value="internal"
              checked={formData.applicationMethod === 'internal'}
              onChange={(e) => handleInputChange('applicationMethod', e.target.value)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
            />
            <div>
              <div className="font-medium text-white">Through GetGetHired Platform</div>
              <div className="text-sm text-gray-400">Candidates apply directly through our platform</div>
            </div>
          </label>
          
          <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg border border-gray-700 cursor-pointer">
            <input
              type="radio"
              name="applicationMethod"
              value="external"
              checked={formData.applicationMethod === 'external'}
              onChange={(e) => handleInputChange('applicationMethod', e.target.value)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
            />
            <div>
              <div className="font-medium text-white">External Application URL</div>
              <div className="text-sm text-gray-400">Redirect candidates to your company's application page</div>
            </div>
          </label>
          
          <label className="flex items-center gap-3 p-3 bg-gray-800 rounded-lg border border-gray-700 cursor-pointer">
            <input
              type="radio"
              name="applicationMethod"
              value="email"
              checked={formData.applicationMethod === 'email'}
              onChange={(e) => handleInputChange('applicationMethod', e.target.value)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 focus:ring-blue-500"
            />
            <div>
              <div className="font-medium text-white">Email Application</div>
              <div className="text-sm text-gray-400">Candidates send applications via email</div>
            </div>
          </label>
        </div>
      </div>

      {/* External URL Input */}
      {formData.applicationMethod === 'external' && (
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
            <Globe size={16} />
            External Application URL *
          </label>
          <input
            type="url"
            value={formData.externalApplicationUrl}
            onChange={(e) => handleInputChange('externalApplicationUrl', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="https://yourcompany.com/careers/apply"
          />
          {errors.externalApplicationUrl && <p className="mt-1 text-sm text-red-400">{errors.externalApplicationUrl}</p>}
        </div>
      )}

      {/* Email Input */}
      {formData.applicationMethod === 'email' && (
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
            <Mail size={16} />
            Application Email *
          </label>
          <input
            type="email"
            value={formData.applicationEmail}
            onChange={(e) => handleInputChange('applicationEmail', e.target.value)}
            className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="careers@yourcompany.com"
          />
          {errors.applicationEmail && <p className="mt-1 text-sm text-red-400">{errors.applicationEmail}</p>}
        </div>
      )}

      {/* Application Deadline */}
      <div>
        <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
          <Calendar size={16} />
          Application Deadline
        </label>
        <input
          type="date"
          value={formData.applicationDeadline}
          onChange={(e) => handleInputChange('applicationDeadline', e.target.value)}
          className="w-full md:w-1/3 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
        />
      </div>

      {/* Contact Information Settings */}
      <div className="border-t border-gray-700 pt-6">
        <h4 className="text-lg font-medium text-white mb-4">Contact Information Display</h4>
        
        <div className="space-y-4">
          <div>
            {isVerified ? (
              <Tooltip text={FORM_TOOLTIPS.showContact}>
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <input
                    type="checkbox"
                    checked={formData.showContactOnPosting}
                    onChange={(e) => handleInputChange('showContactOnPosting', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  Show contact information on job posting
                  <Info size={14} className="text-gray-400" />
                </label>
              </Tooltip>
            ) : (
              <div className="text-sm text-gray-400">
                Contact information is hidden until your account is verified. Upload required documents and validate the Authorized Representative's email to enable contact display.
              </div>
            )}
          </div>

          {isVerified && formData.showContactOnPosting && user?.role === 'premium' && (
            <div className="ml-6">
              <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                <input
                  type="checkbox"
                  checked={formData.protectEmailAddress}
                  onChange={(e) => handleInputChange('protectEmailAddress', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                Protect email address (Premium Feature)
              </label>
              <p className="text-xs text-gray-400 mt-1">
                Email will be masked until candidate applies
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Step 5: Prescreen Questions and Final Settings
  const renderStep5 = () => (
    <div className="space-y-6">
      <h3 className="text-xl font-semibold text-white mb-4">Prescreen Questions & Final Settings</h3>

      {/* Prescreen Questions */}
      {hasPremiumFeature(PREMIUM_FEATURES.PRESCREEN_QUESTIONS, user, subscription) ? (
        <div>
          <div className="flex items-center justify-between mb-4">
            <div>
              <Tooltip text={FORM_TOOLTIPS.prescreenQuestions}>
                <h4 className="flex items-center gap-2 text-lg font-medium text-white">
                  Prescreen Questions
                  <Info size={14} className="text-gray-400" />
                </h4>
              </Tooltip>
              <p className="text-sm text-gray-400">
                Add up to {mode === 'ai' ? '5' : '3'} questions to filter candidates effectively
              </p>
              {formData.prescreenQuestions.length > 0 && (
                <p className="text-sm text-green-400">
                  ✓ {formData.prescreenQuestions.length} question{formData.prescreenQuestions.length !== 1 ? 's' : ''} added
                </p>
              )}
            </div>

            <div className="flex gap-2">
              {!formData.useDefaultQuestions && (
                <button
                  type="button"
                  onClick={loadDefaultQuestions}
                  className="flex items-center gap-2 px-3 py-1 bg-green-600 text-white rounded text-sm hover:bg-green-700"
                >
                  Use Default Questions
                </button>
              )}

              {mode === 'ai' && (
                <button
                  type="button"
                  onClick={() => generateAIContent('questions')}
                  disabled={loading}
                  className="flex items-center gap-2 px-3 py-1 bg-purple-600 text-white rounded text-sm hover:bg-purple-700 disabled:opacity-50"
                >
                  <Sparkles size={14} />
                  AI Generate
                </button>
              )}
            </div>
          </div>

          <div className="space-y-4">
            {formData.prescreenQuestions.map((question, index) => (
              <PrescreenQuestionBuilder
                key={question.id}
                question={question}
                index={index}
                onUpdate={(field, value) => updatePrescreenQuestion(index, field, value)}
                onRemove={() => removePrescreenQuestion(index)}
              />
            ))}

            {formData.prescreenQuestions.length < (mode === 'ai' ? 5 : 3) && (
              <button
                type="button"
                onClick={addPrescreenQuestion}
                className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Plus size={16} />
                Add Question
              </button>
            )}
          </div>
        </div>
      ) : (
        <div className="bg-yellow-900/20 border border-yellow-600/30 rounded-lg p-4">
          <div className="flex items-center gap-2 text-yellow-400 mb-2">
            <Sparkles size={16} />
            <h4 className="text-lg font-medium">Prescreen Questions (Premium Feature)</h4>
          </div>
          <p className="text-yellow-300 text-sm mb-3">
            Add custom questions to filter candidates before they apply. This helps you identify the most qualified applicants.
          </p>
          <p className="text-yellow-200 text-sm">
            Upgrade to Premium to add up to {mode === 'ai' ? '5' : '3'} prescreen questions per job posting.
          </p>
        </div>
      )}

      {/* Final Settings */}
      <div className="border-t border-gray-700 pt-6">
        <h4 className="text-lg font-medium text-white mb-4">Additional Features</h4>

        <div className="space-y-4">
          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <input
              type="checkbox"
              checked={formData.allowPreview}
              onChange={(e) => handleInputChange('allowPreview', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            Enable job preview for candidates
          </label>

          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <input
              type="checkbox"
              checked={formData.generateQRCode}
              onChange={(e) => handleInputChange('generateQRCode', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            Generate QR code for easy sharing
          </label>

          <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
            <input
              type="checkbox"
              checked={formData.generateSocialTemplate}
              onChange={(e) => handleInputChange('generateSocialTemplate', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            Create social media sharing template (Premium Feature)
            {user?.role !== 'premium' && (
              <span className="text-xs bg-yellow-600 text-black px-2 py-1 rounded">PREMIUM</span>
            )}
          </label>
        </div>

        <div className="mt-4">
          {isOverseasEmployer && (
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">Valid Passport Required</label>
              <label className="flex items-center gap-2 text-sm text-gray-300">
                <input
                  type="checkbox"
                  checked={!!formData.validPassport}
                  onChange={(e) => handleInputChange('validPassport', e.target.checked)}
                  className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                />
                Require candidates to have valid passport (for abroad agencies)
              </label>
            </div>
          )}

          <div className="mt-4">
            <label className="flex items-center justify-between gap-2 text-sm font-medium text-gray-300 mb-2">
              <span>Principal/Employer</span>
              <a href="/profile/employer/manage-company" className="text-xs text-blue-400 hover:underline">Add</a>
            </label>
            <input
              type="text"
              value={formData.principalEmployer}
              onChange={(e) => handleInputChange('principalEmployer', e.target.value)}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Name of the principal employer or company"
            />
          </div>

          {isDMWAgency && (
            <div>
              <div className="mt-4">
                <label className="block text-sm font-medium text-gray-300 mb-2">Mandatory Statement</label>
                <label className="flex items-start gap-2 text-sm text-gray-300">
                  <input
                    type="checkbox"
                    checked={!!formData.mandatoryStatement}
                    onChange={(e) => handleInputChange('mandatoryStatement', e.target.checked)}
                    className="w-4 h-4 mt-0.5 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                  />
                  <div>
                    <div className="font-medium">Include mandatory statement for manpower pooling (DMW/POEA requirement)</div>
                    {formData.mandatoryStatement && (
                      <div className="mt-2 p-3 bg-red-900/20 border border-red-700 rounded-lg text-xs text-red-300">
                        "For manpower pooling only. No fees in any form and/or purpose will be collected from the applicants. Beware of illegal recruiters and human traffickers."
                      </div>
                    )}
                  </div>
                </label>
              </div>

              <div className="mt-4">
                <label className="flex items-center gap-2 text-sm font-medium text-gray-300">
                  <input
                    type="checkbox"
                    checked={!!formData.hasPlacementFee}
                    onChange={(e) => handleInputChange('hasPlacementFee', e.target.checked)}
                    className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
                    disabled={!canSetPlacementFee}
                  />
                  Has Placement Fee (DMW Agencies Only)
                </label>
                <p className="text-sm text-gray-400 mt-1">Check if this job posting includes a placement fee. Only verified DMW agencies can set placement fees.</p>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );

  // Skills Input Component
  const SkillsInput = ({ skills, onAdd, onRemove, placeholder }) => {
    const [skillInput, setSkillInput] = useState('');

    const handleAdd = (e) => {
      e.preventDefault();
      if (skillInput.trim()) {
        onAdd(skillInput);
        setSkillInput('');
      }
    };

    return (
      <div>
        <div className="flex gap-2 mb-3">
          <input
            type="text"
            value={skillInput}
            onChange={(e) => setSkillInput(e.target.value)}
            onKeyPress={(e) => e.key === 'Enter' && handleAdd(e)}
            className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder={placeholder}
          />
          <button
            type="button"
            onClick={handleAdd}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            Add
          </button>
        </div>
        <div className="flex flex-wrap gap-2">
          {skills.map((skill, index) => (
            <span
              key={index}
              className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-full text-sm"
            >
              {skill}
              <button
                type="button"
                onClick={() => onRemove(index)}
                className="ml-1 text-blue-200 hover:text-white"
              >
                ×
              </button>
            </span>
          ))}
        </div>
      </div>
    );
  };

  // Prescreen Question Builder Component
  const PrescreenQuestionBuilder = ({ question, index, onUpdate, onRemove }) => {
    const [optionInput, setOptionInput] = useState('');

    const addOption = () => {
      if (optionInput.trim()) {
        const newOptions = [...(question.options || []), optionInput.trim()];
        onUpdate('options', newOptions);
        setOptionInput('');
      }
    };

    const removeOption = (optionIndex) => {
      const newOptions = (question.options || []).filter((_, i) => i !== optionIndex);
      onUpdate('options', newOptions);
    };

    return (
      <div className="p-4 bg-gray-800 rounded-lg border border-gray-700">
        <div className="flex items-center justify-between mb-3">
          <span className="text-sm font-medium text-gray-300">Question {index + 1}</span>
          <button
            type="button"
            onClick={onRemove}
            className="text-red-400 hover:text-red-300"
          >
            <Minus size={16} />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="text-sm text-gray-400 mb-1 block">Question Type</label>
            <select
              value={question.type}
              onChange={(e) => onUpdate('type', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="text">Text</option>
              <option value="select">Multiple Choice</option>
              <option value="textarea">Long Text</option>
              <option value="number">Number</option>
            </select>
          </div>

          <div>
            <label className="text-sm text-gray-400 mb-1 block">Question</label>
            <input
              type="text"
              value={question.question}
              onChange={(e) => onUpdate('question', e.target.value)}
              className="w-full px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Enter your question..."
            />
          </div>

          {question.type === 'select' && (
            <div>
              <label className="text-sm text-gray-400 mb-1 block">Options</label>
              <div className="flex gap-2 mb-2">
                <input
                  type="text"
                  value={optionInput}
                  onChange={(e) => setOptionInput(e.target.value)}
                  onKeyPress={(e) => e.key === 'Enter' && addOption()}
                  className="flex-1 px-3 py-2 bg-gray-700 border border-gray-600 rounded text-white text-sm focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="Add an option..."
                />
                <button
                  type="button"
                  onClick={addOption}
                  className="px-3 py-2 bg-blue-600 text-white rounded text-sm hover:bg-blue-700"
                >
                  Add
                </button>
              </div>
              <div className="space-y-1">
                {(question.options || []).map((option, optionIndex) => (
                  <div key={optionIndex} className="flex items-center justify-between p-2 bg-gray-700 rounded">
                    <span className="text-sm text-white">{option}</span>
                    <button
                      type="button"
                      onClick={() => removeOption(optionIndex)}
                      className="text-red-400 hover:text-red-300"
                    >
                      ×
                    </button>
                  </div>
                ))}
              </div>
            </div>
          )}

          <label className="flex items-center gap-2 text-sm text-gray-300">
            <input
              type="checkbox"
              checked={question.required}
              onChange={(e) => onUpdate('required', e.target.checked)}
              className="w-4 h-4 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
            />
            Required question
          </label>
        </div>
      </div>
    );
  };

  return (
    <form onSubmit={handleFormSubmit} className="max-w-3xl mx-auto py-8 px-4 sm:px-6 lg:px-8">
      <StepIndicator />
      
      {/* Render current step */}
      {currentStep === 1 && renderStep1()}
      {currentStep === 2 && renderStep2()}
      {currentStep === 3 && renderStep3()}
      {currentStep === 4 && renderStep4()}
      {currentStep === 5 && renderStep5()}

      {/* Navigation buttons */}
      <div className="flex justify-between mt-6">
        <button
          type="button"
          onClick={prevStep}
          className="px-4 py-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
        >
          &larr; Back
        </button>
        
        <button
          type="submit"
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          {currentStep < 5 ? 'Next &rarr;' : 'Submit Job Posting'}
        </button>
      </div>
    </form>
  );
};

export default ComprehensiveJobPostingForm;
