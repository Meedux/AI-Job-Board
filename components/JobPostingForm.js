'use client';

import { useState, useEffect } from 'react';
import { useForm, Controller } from 'react-hook-form';
import { yupResolver } from '@hookform/resolvers/yup';
import * as yup from 'yup';
import { useAuth } from '@/contexts/AuthContext';
import RichTextEditor from './RichTextEditor';
import { Save, X, MapPin, DollarSign, Clock, Users, Building } from 'lucide-react';

// Validation schema
const jobSchema = yup.object({
  title: yup.string().required('Job title is required').min(3, 'Title must be at least 3 characters'),
  companyId: yup.string().required('Company is required'),
  location: yup.string().required('Location is required'),
  jobType: yup.string().required('Job type is required'),
  workMode: yup.string().required('Work mode is required'),
  experienceLevel: yup.string().required('Experience level is required'),
  salaryMin: yup.number().nullable().transform((value, originalValue) => 
    originalValue === '' ? null : value
  ),
  salaryMax: yup.number().nullable().transform((value, originalValue) => 
    originalValue === '' ? null : value
  ).when('salaryMin', {
    is: (val) => val !== null && val !== undefined,
    then: (schema) => schema.min(yup.ref('salaryMin'), 'Maximum salary must be greater than minimum'),
  }),
  description: yup.string().required('Job description is required').min(50, 'Description must be at least 50 characters'),
  requirements: yup.string().required('Job requirements are required').min(20, 'Requirements must be at least 20 characters'),
  benefits: yup.string(),
  applicationDeadline: yup.date().nullable().transform((value, originalValue) => 
    originalValue === '' ? null : value
  ),
  skillsRequired: yup.array().of(yup.string()),
  category: yup.string().required('Category is required'),
});

const JobPostingForm = ({ onSubmit, onCancel, initialData = null, isEditing = false }) => {
  const { user } = useAuth();
  const [loading, setLoading] = useState(false);
  const [skillInput, setSkillInput] = useState('');
  const [companies, setCompanies] = useState([]);
  const [loadingCompanies, setLoadingCompanies] = useState(true);

  // Load companies
  useEffect(() => {
    const loadCompanies = async () => {
      try {
        const response = await fetch('/api/companies');
        if (response.ok) {
          const companiesData = await response.json();
          setCompanies(companiesData);
        }
      } catch (error) {
        console.error('Error loading companies:', error);
      } finally {
        setLoadingCompanies(false);
      }
    };

    loadCompanies();
  }, []);

  const {
    register,
    handleSubmit,
    control,
    formState: { errors },
    watch,
    setValue,
    getValues
  } = useForm({
    resolver: yupResolver(jobSchema),
    defaultValues: {
      title: initialData?.title || '',
      companyId: initialData?.companyId || '',
      location: initialData?.location || '',
      jobType: initialData?.jobType || 'full-time',
      workMode: initialData?.workMode || 'on-site',
      experienceLevel: initialData?.experienceLevel || 'mid-level',
      salaryMin: initialData?.salaryMin || '',
      salaryMax: initialData?.salaryMax || '',
      description: initialData?.description || '',
      requirements: initialData?.requirements || '',
      benefits: initialData?.benefits || '',
      applicationDeadline: initialData?.applicationDeadline ? 
        new Date(initialData.applicationDeadline).toISOString().split('T')[0] : '',
      skillsRequired: initialData?.skillsRequired || [],
      category: initialData?.category || '',
    }
  });

  const skillsRequired = watch('skillsRequired');

  const handleAddSkill = (e) => {
    e.preventDefault();
    if (skillInput.trim() && !skillsRequired.includes(skillInput.trim())) {
      setValue('skillsRequired', [...skillsRequired, skillInput.trim()]);
      setSkillInput('');
    }
  };

  const handleRemoveSkill = (skillToRemove) => {
    setValue('skillsRequired', skillsRequired.filter(skill => skill !== skillToRemove));
  };

  const onFormSubmit = async (data) => {
    setLoading(true);
    try {
      await onSubmit(data);
    } catch (error) {
      console.error('Error submitting job:', error);
    } finally {
      setLoading(false);
    }
  };

  const jobTypes = [
    { value: 'full-time', label: 'Full Time' },
    { value: 'part-time', label: 'Part Time' },
    { value: 'contract', label: 'Contract' },
    { value: 'freelance', label: 'Freelance' },
    { value: 'internship', label: 'Internship' },
  ];

  const workModes = [
    { value: 'on-site', label: 'On-site' },
    { value: 'remote', label: 'Remote' },
    { value: 'hybrid', label: 'Hybrid' },
  ];

  const experienceLevels = [
    { value: 'entry-level', label: 'Entry Level' },
    { value: 'mid-level', label: 'Mid Level' },
    { value: 'senior-level', label: 'Senior Level' },
    { value: 'executive', label: 'Executive' },
  ];

  const categories = [
    { value: 'technology', label: 'Technology' },
    { value: 'marketing', label: 'Marketing' },
    { value: 'sales', label: 'Sales' },
    { value: 'design', label: 'Design' },
    { value: 'finance', label: 'Finance' },
    { value: 'human-resources', label: 'Human Resources' },
    { value: 'operations', label: 'Operations' },
    { value: 'customer-service', label: 'Customer Service' },
    { value: 'other', label: 'Other' },
  ];

  return (
    <div className="max-w-4xl mx-auto bg-gray-900 rounded-lg shadow-xl p-6">
      <div className="flex items-center justify-between mb-6">
        <h2 className="text-2xl font-bold text-white flex items-center gap-2">
          <Building className="text-blue-400" />
          {isEditing ? 'Edit Job Posting' : 'Create New Job Posting'}
        </h2>
        <button
          type="button"
          onClick={onCancel}
          className="p-2 text-gray-400 hover:text-white hover:bg-gray-700 rounded-lg transition-colors"
        >
          <X size={20} />
        </button>
      </div>

      <form onSubmit={handleSubmit(onFormSubmit)} className="space-y-6">
        {/* Basic Information */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Job Title *
            </label>
            <input
              {...register('title')}
              type="text"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. Senior Frontend Developer"
            />
            {errors.title && (
              <p className="mt-1 text-sm text-red-400">{errors.title.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Company *
            </label>
            <select
              {...register('companyId')}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              disabled={loadingCompanies}
            >
              <option value="">
                {loadingCompanies ? 'Loading companies...' : 'Select a company'}
              </option>
              {companies.map((company) => (
                <option key={company.id} value={company.id}>
                  {company.name}
                </option>
              ))}
            </select>
            {errors.companyId && (
              <p className="mt-1 text-sm text-red-400">{errors.companyId.message}</p>
            )}
            {!loadingCompanies && companies.length === 0 && (
              <p className="mt-1 text-sm text-yellow-400">
                No companies found. Please create a company first in the admin panel.
              </p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <MapPin size={16} />
              Location *
            </label>
            <input
              {...register('location')}
              type="text"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. New York, NY or Remote"
            />
            {errors.location && (
              <p className="mt-1 text-sm text-red-400">{errors.location.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Category *
            </label>
            <select
              {...register('category')}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Select a category</option>
              {categories.map((category) => (
                <option key={category.value} value={category.value}>
                  {category.label}
                </option>
              ))}
            </select>
            {errors.category && (
              <p className="mt-1 text-sm text-red-400">{errors.category.message}</p>
            )}
          </div>
        </div>

        {/* Job Details */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Clock size={16} />
              Job Type *
            </label>
            <select
              {...register('jobType')}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {jobTypes.map((type) => (
                <option key={type.value} value={type.value}>
                  {type.label}
                </option>
              ))}
            </select>
            {errors.jobType && (
              <p className="mt-1 text-sm text-red-400">{errors.jobType.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Work Mode *
            </label>
            <select
              {...register('workMode')}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {workModes.map((mode) => (
                <option key={mode.value} value={mode.value}>
                  {mode.label}
                </option>
              ))}
            </select>
            {errors.workMode && (
              <p className="mt-1 text-sm text-red-400">{errors.workMode.message}</p>
            )}
          </div>

          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <Users size={16} />
              Experience Level *
            </label>
            <select
              {...register('experienceLevel')}
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              {experienceLevels.map((level) => (
                <option key={level.value} value={level.value}>
                  {level.label}
                </option>
              ))}
            </select>
            {errors.experienceLevel && (
              <p className="mt-1 text-sm text-red-400">{errors.experienceLevel.message}</p>
            )}
          </div>
        </div>

        {/* Salary Range */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div>
            <label className="flex items-center gap-2 text-sm font-medium text-gray-300 mb-2">
              <DollarSign size={16} />
              Minimum Salary
            </label>
            <input
              {...register('salaryMin')}
              type="number"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 50000"
            />
            {errors.salaryMin && (
              <p className="mt-1 text-sm text-red-400">{errors.salaryMin.message}</p>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-300 mb-2">
              Maximum Salary
            </label>
            <input
              {...register('salaryMax')}
              type="number"
              className="w-full px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="e.g. 80000"
            />
            {errors.salaryMax && (
              <p className="mt-1 text-sm text-red-400">{errors.salaryMax.message}</p>
            )}
          </div>
        </div>

        {/* Application Deadline */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Application Deadline
          </label>
          <input
            {...register('applicationDeadline')}
            type="date"
            className="w-full md:w-1/3 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500"
          />
          {errors.applicationDeadline && (
            <p className="mt-1 text-sm text-red-400">{errors.applicationDeadline.message}</p>
          )}
        </div>

        {/* Skills Required */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Skills Required
          </label>
          <div className="flex gap-2 mb-3">
            <input
              type="text"
              value={skillInput}
              onChange={(e) => setSkillInput(e.target.value)}
              onKeyPress={(e) => e.key === 'Enter' && handleAddSkill(e)}
              className="flex-1 px-3 py-2 bg-gray-800 border border-gray-700 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="Type a skill and press Enter"
            />
            <button
              type="button"
              onClick={handleAddSkill}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {skillsRequired.map((skill, index) => (
              <span
                key={index}
                className="inline-flex items-center gap-1 px-3 py-1 bg-blue-600 text-white rounded-full text-sm"
              >
                {skill}
                <button
                  type="button"
                  onClick={() => handleRemoveSkill(skill)}
                  className="ml-1 text-blue-200 hover:text-white"
                >
                  <X size={14} />
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Job Description */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Job Description *
          </label>
          <Controller
            name="description"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                content={field.value}
                onChange={field.onChange}
                placeholder="Describe the role, responsibilities, and what makes this position exciting..."
              />
            )}
          />
          {errors.description && (
            <p className="mt-1 text-sm text-red-400">{errors.description.message}</p>
          )}
        </div>

        {/* Requirements */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Requirements *
          </label>
          <Controller
            name="requirements"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                content={field.value}
                onChange={field.onChange}
                placeholder="List the required qualifications, experience, and skills..."
              />
            )}
          />
          {errors.requirements && (
            <p className="mt-1 text-sm text-red-400">{errors.requirements.message}</p>
          )}
        </div>

        {/* Benefits */}
        <div>
          <label className="block text-sm font-medium text-gray-300 mb-2">
            Benefits & Perks
          </label>
          <Controller
            name="benefits"
            control={control}
            render={({ field }) => (
              <RichTextEditor
                content={field.value}
                onChange={field.onChange}
                placeholder="Describe the benefits, perks, and company culture..."
              />
            )}
          />
          {errors.benefits && (
            <p className="mt-1 text-sm text-red-400">{errors.benefits.message}</p>
          )}
        </div>

        {/* Form Actions */}
        <div className="flex justify-end gap-4 pt-6 border-t border-gray-700">
          <button
            type="button"
            onClick={onCancel}
            className="px-6 py-2 text-gray-400 hover:text-white hover:bg-gray-700 border border-gray-600 rounded-lg transition-colors"
          >
            Cancel
          </button>
          <button
            type="submit"
            disabled={loading}
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2"
          >
            <Save size={16} />
            {loading ? 'Saving...' : (isEditing ? 'Update Job' : 'Post Job')}
          </button>
        </div>
      </form>
    </div>
  );
};

export default JobPostingForm;
