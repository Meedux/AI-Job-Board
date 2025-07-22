'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '@/contexts/AuthContext';
import { Upload, Send, User, Briefcase, FileText } from 'lucide-react';

const FIELD_TYPES = {
  TEXT: 'text',
  EMAIL: 'email',
  PHONE: 'phone',
  DATE: 'date',
  TEXTAREA: 'textarea',
  SELECT: 'select',
  CHECKBOX: 'checkbox',
  RADIO: 'radio',
  FILE: 'file'
};

const JobApplicationForm = ({ job, customForm = null, onSubmit, onCancel }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [uploadedFiles, setUploadedFiles] = useState({});

  // Create dynamic validation schema based on form fields
  const createValidationSchema = (fields) => {
    const schemaFields = {};
    
    fields.forEach(field => {
      let fieldSchema;
      
      switch (field.type) {
        case FIELD_TYPES.EMAIL:
          fieldSchema = yup.string().email('Invalid email format');
          break;
        case FIELD_TYPES.PHONE:
          fieldSchema = yup.string().matches(/^[\+]?[1-9][\d]{0,15}$/, 'Invalid phone number');
          break;
        case FIELD_TYPES.DATE:
          fieldSchema = yup.date();
          break;
        case FIELD_TYPES.FILE:
          fieldSchema = yup.mixed();
          break;
        case FIELD_TYPES.CHECKBOX:
          fieldSchema = yup.array().of(yup.string());
          break;
        default:
          fieldSchema = yup.string();
      }
      
      if (field.required) {
        fieldSchema = fieldSchema.required(`${field.label} is required`);
      }
      
      if (field.validation?.minLength) {
        fieldSchema = fieldSchema.min(field.validation.minLength, `Minimum ${field.validation.minLength} characters required`);
      }
      
      schemaFields[field.id] = fieldSchema;
    });
    
    return yup.object(schemaFields);
  };

  // Get form fields (custom or default)
  const getFormFields = () => {
    console.log('🔍 JobApplicationForm - getFormFields called');
    console.log('🔍 JobApplicationForm - customForm prop:', customForm);
    console.log('🔍 JobApplicationForm - customForm type:', typeof customForm);
    console.log('🔍 JobApplicationForm - customForm.fields:', customForm?.fields);
    console.log('🔍 JobApplicationForm - customForm.fields type:', typeof customForm?.fields);
    
    if (customForm && customForm.fields) {
      console.log('✅ JobApplicationForm - Using CUSTOM form fields:', customForm.fields);
      console.log('✅ JobApplicationForm - Custom form field count:', customForm.fields.length);
      return customForm.fields;
    }
    
    console.log('❌ JobApplicationForm - Using DEFAULT form fields (custom form not available)');
    // Default job application form
    return [
      {
        id: 'full_name',
        type: FIELD_TYPES.TEXT,
        label: 'Full Name',
        placeholder: 'Enter your full name',
        required: true
      },
      {
        id: 'email',
        type: FIELD_TYPES.EMAIL,
        label: 'Email Address',
        placeholder: 'Enter your email',
        required: true
      },
      {
        id: 'phone',
        type: FIELD_TYPES.PHONE,
        label: 'Phone Number',
        placeholder: 'Enter your phone number',
        required: true
      },
      {
        id: 'current_position',
        type: FIELD_TYPES.TEXT,
        label: 'Current Position',
        placeholder: 'Your current job title',
        required: false
      },
      {
        id: 'experience_years',
        type: FIELD_TYPES.SELECT,
        label: 'Years of Experience',
        required: true,
        options: ['0-1 years', '1-3 years', '3-5 years', '5-10 years', '10+ years']
      },
      {
        id: 'cover_letter',
        type: FIELD_TYPES.TEXTAREA,
        label: 'Cover Letter',
        placeholder: 'Tell us why you\'re interested in this position...',
        required: true
      },
      {
        id: 'resume',
        type: FIELD_TYPES.FILE,
        label: 'Resume/CV',
        required: true,
        validation: { fileTypes: ['.pdf', '.doc', '.docx'] }
      },
      {
        id: 'portfolio',
        type: FIELD_TYPES.FILE,
        label: 'Portfolio (Optional)',
        required: false,
        validation: { fileTypes: ['.pdf', '.doc', '.docx', '.zip'] }
      },
      {
        id: 'availability',
        type: FIELD_TYPES.SELECT,
        label: 'Availability',
        required: true,
        options: ['Immediately', 'Within 2 weeks', 'Within 1 month', 'Within 2 months', 'Other']
      },
      {
        id: 'salary_expectation',
        type: FIELD_TYPES.TEXT,
        label: 'Salary Expectation',
        placeholder: 'Enter your expected salary range',
        required: false
      }
    ];
  };

  const formFields = getFormFields();
  const validationSchema = createValidationSchema(formFields);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    setValue,
    watch
  } = useForm({
    resolver: yupResolver(validationSchema),
    defaultValues: {
      full_name: user?.fullName || '',
      email: user?.email || '',
      ...formFields.reduce((acc, field) => {
        if (field.type === FIELD_TYPES.CHECKBOX) {
          acc[field.id] = [];
        } else {
          acc[field.id] = '';
        }
        return acc;
      }, {})
    }
  });

  const handleFileUpload = (fieldId, files) => {
    if (files && files.length > 0) {
      const file = files[0];
      setUploadedFiles(prev => ({
        ...prev,
        [fieldId]: file
      }));
      setValue(fieldId, file);
    }
  };

  const onFormSubmit = async (data) => {
    setLoading(true);
    try {
      console.log('📤 JobApplicationForm - Starting form submission');
      console.log('📤 JobApplicationForm - Job object:', job);
      console.log('📤 JobApplicationForm - Job ID:', job?.id);
      console.log('📤 JobApplicationForm - Job ID type:', typeof job?.id);
      
      // Create FormData for file uploads
      const formData = new FormData();
      
      // Add regular form fields
      Object.keys(data).forEach(key => {
        if (data[key] !== null && data[key] !== undefined) {
          if (Array.isArray(data[key])) {
            formData.append(key, JSON.stringify(data[key]));
          } else if (data[key] instanceof File) {
            formData.append(key, data[key]);
          } else {
            formData.append(key, data[key]);
          }
        }
      });
      
      // Add job ID
      if (job?.id) {
        formData.append('jobId', job.id);
        console.log('✅ JobApplicationForm - Added jobId to FormData:', job.id);
      } else {
        console.error('❌ JobApplicationForm - No job.id available!');
        throw new Error('Job ID is missing');
      }
      
      // Add uploaded files
      Object.keys(uploadedFiles).forEach(fieldId => {
        if (uploadedFiles[fieldId]) {
          formData.append(`file_${fieldId}`, uploadedFiles[fieldId]);
        }
      });
      
      // Debug FormData contents
      console.log('📤 JobApplicationForm - FormData contents:');
      for (let [key, value] of formData.entries()) {
        console.log(`📤 ${key}:`, value);
      }
      
      await onSubmit(formData);
    } catch (error) {
      console.error('Error submitting application:', error);
    } finally {
      setLoading(false);
    }
  };

  const renderField = (field) => {
    const fieldError = errors[field.id];
    
    switch (field.type) {
      case FIELD_TYPES.TEXT:
      case FIELD_TYPES.EMAIL:
      case FIELD_TYPES.PHONE:
        return (
          <input
            {...register(field.id)}
            type={field.type}
            placeholder={field.placeholder}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      case FIELD_TYPES.TEXTAREA:
        return (
          <textarea
            {...register(field.id)}
            placeholder={field.placeholder}
            rows={4}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent resize-vertical"
          />
        );

      case FIELD_TYPES.SELECT:
        return (
          <select
            {...register(field.id)}
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="">Select an option</option>
            {field.options?.map((option, index) => (
              <option key={index} value={typeof option === 'string' ? option : option?.value || option?.name || option}>
                {typeof option === 'string' ? option : option?.label || option?.name || option?.value || option}
              </option>
            ))}
          </select>
        );

      case FIELD_TYPES.CHECKBOX:
        return (
          <div className="space-y-3">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center gap-3 text-gray-300 hover:text-white cursor-pointer">
                <input
                  type="checkbox"
                  value={typeof option === 'string' ? option : option?.value || option?.name || option}
                  {...register(field.id)}
                  className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 rounded focus:ring-blue-500"
                />
                {typeof option === 'string' ? option : option?.label || option?.name || option?.value || option}
              </label>
            ))}
          </div>
        );

      case FIELD_TYPES.RADIO:
        return (
          <div className="space-y-3">
            {field.options?.map((option, index) => (
              <label key={index} className="flex items-center gap-3 text-gray-300 hover:text-white cursor-pointer">
                <input
                  type="radio"
                  value={typeof option === 'string' ? option : option?.value || option?.name || option}
                  {...register(field.id)}
                  className="w-4 h-4 text-blue-600 bg-gray-800 border-gray-600 focus:ring-blue-500"
                />
                {typeof option === 'string' ? option : option?.label || option?.name || option?.value || option}
              </label>
            ))}
          </div>
        );

      case FIELD_TYPES.DATE:
        return (
          <input
            {...register(field.id)}
            type="date"
            className="w-full px-4 py-3 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        );

      case FIELD_TYPES.FILE:
        return (
          <div className="space-y-3">
            <div
              className="w-full p-6 border-2 border-dashed border-gray-600 rounded-lg hover:border-gray-500 transition-colors cursor-pointer"
              onClick={() => document.getElementById(field.id).click()}
            >
              <div className="text-center">
                <Upload className="mx-auto h-12 w-12 text-gray-400" />
                <div className="mt-2">
                  <span className="text-white font-medium">Click to upload</span>
                  <p className="text-gray-400 text-sm mt-1">
                    {uploadedFiles[field.id] ? uploadedFiles[field.id].name : 
                     `Supported formats: ${field.validation?.fileTypes?.join(', ') || 'All files'}`}
                  </p>
                </div>
              </div>
            </div>
            <input
              id={field.id}
              type="file"
              onChange={(e) => handleFileUpload(field.id, e.target.files)}
              accept={field.validation?.fileTypes?.join(',')}
              className="hidden"
            />
          </div>
        );

      default:
        return null;
    }
  };

  return (
    <div className="max-w-2xl mx-auto bg-gray-900 rounded-xl shadow-2xl overflow-hidden">
      {/* Header */}
      <div className="bg-gradient-to-r from-blue-600 to-purple-600 p-6">
        <div className="flex items-center gap-3 mb-2">
          <Briefcase className="text-white" size={24} />
          <h2 className="text-2xl font-bold text-white">Apply for Position</h2>
          {customForm && customForm.fields && customForm.fields.length > 0 ? (
            <span className="bg-green-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Custom Form ({customForm.fields.length} fields)
            </span>
          ) : (
            <span className="bg-gray-500 text-white text-xs px-2 py-1 rounded-full font-medium">
              Default Form
            </span>
          )}
        </div>
        <h3 className="text-xl text-blue-100">{job?.title}</h3>
        <p className="text-blue-200">{job?.company_name || job?.company?.name || 'Company'} • {typeof job?.location === 'string' ? job?.location : job?.location?.name || job?.location?.location || 'Location'}</p>
        
        {/* Debug info */}
        <div className="mt-2 text-xs text-blue-200 bg-blue-800/30 px-2 py-1 rounded">
          DEBUG: customForm={customForm ? 'YES' : 'NO'} | fields={customForm?.fields ? customForm.fields.length : 0} | type={getFormFields().length > 10 ? 'DEFAULT' : 'CUSTOM'}
        </div>
      </div>

      {/* Form */}
      <div className="p-6">
        {customForm && (
          <div className="mb-6 p-4 bg-gray-800 rounded-lg border-l-4 border-blue-500">
            <h4 className="text-white font-semibold mb-2">{customForm.title}</h4>
            {customForm.description && (
              <p className="text-gray-300 text-sm">{customForm.description}</p>
            )}
          </div>
        )}

        <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
          {formFields.map((field) => (
            <div key={field.id}>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                {field.label}
                {field.required && <span className="text-red-400 ml-1">*</span>}
              </label>
              
              {renderField(field)}
              
              {errors[field.id] && (
                <p className="mt-2 text-sm text-red-400">
                  {errors[field.id].message}
                </p>
              )}
            </div>
          ))}

          {/* Terms and Conditions */}
          <div className="bg-gray-800 rounded-lg p-4">
            <label className="flex items-start gap-3 text-gray-300 cursor-pointer">
              <input
                type="checkbox"
                required
                className="w-4 h-4 mt-1 text-blue-600 bg-gray-700 border-gray-600 rounded focus:ring-blue-500"
              />
              <span className="text-sm">
                I agree that the information provided is accurate and I consent to the processing of my personal data for recruitment purposes.
              </span>
            </label>
          </div>

          {/* Submit Buttons */}
          <div className="flex gap-4 pt-4 border-t border-gray-700">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 px-6 py-3 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={loading}
              className="flex-1 px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center justify-center gap-2"
            >
              <Send size={18} />
              {loading ? 'Submitting...' : 'Submit Application'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default JobApplicationForm;
