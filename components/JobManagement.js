'use client';

import { useState, useEffect } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import JobPostingForm from './JobPostingForm';
import FormBuilder from './FormBuilder';
import {
  MoreHorizontal,
  Edit3,
  Copy,
  ExternalLink,
  Trash2,
  Plus,
  Search,
  Filter,
  Building2
} from 'lucide-react';

export default function JobManagement() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showApplicationFormEditor, setShowApplicationFormEditor] = useState(false);
  const [editingApplicationForm, setEditingApplicationForm] = useState(null);
  // Missing state causing runtime errors
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);

  useEffect(() => {
    fetchJobs();
  }, []);

  const fetchJobs = async () => {
    try {
      setLoading(true);
      const response = await fetch('/api/jobs/manage');
      if (!response.ok) throw new Error('Failed to fetch jobs');
      
      const data = await response.json();
      setJobs(data.jobs || []);
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError('Failed to load jobs');
    } finally {
      setLoading(false);
    }
  };

  const handleEditApplicationForm = async (job) => {
    try {
      setLoading(true);
      
      // Fetch the application form for this job
      const response = await fetch(`/api/application-forms?jobId=${job.id}`);
      if (!response.ok) {
        throw new Error('Failed to fetch application form');
      }
      
      const data = await response.json();
      if (data.form) {
        setEditingApplicationForm({
          ...data.form,
          jobId: job.id,
          jobTitle: job.title
        });
        setShowApplicationFormEditor(true);
      } else {
        alert('No custom application form found for this job. You can create one from the job posting interface.');
      }
    } catch (err) {
      console.error('Error fetching application form:', err);
      alert(`Failed to load application form: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  const handleDuplicateJob = async (job) => {
    try {
      setLoading(true);
      
      // Create a clean payload for duplication using server-side field names
      const duplicatedJobData = {
        title: `${job.title} (Copy)`,
        description: job.description || job.full_description || '',
        requirements: job.requirements || '',
        benefits: job.benefits || '',
        location: job.location || '',
        jobType: job.jobType || job.type || 'full-time',
        // map workMode/remote to remoteType if present
        remoteType: job.workMode === 'remote' ? 'full' : (job.workMode === 'hybrid' ? 'hybrid' : (job.remote_type || 'no')),
        experienceLevel: job.experienceLevel || job.level || 'mid',
        salaryFrom: job.salaryMin || job.salary?.from || null,
        salaryTo: job.salaryMax || job.salary?.to || null,
        salaryCurrency: job.salaryCurrency || job.salary?.currency || 'PHP',
        applicationDeadline: job.applicationDeadline || job.expiresAt || null,
        status: 'draft',
        slug: undefined,
        // include company info if available
        companyId: job.companyId || job.company?.id || job.company_id || null,
        // categories: send category ids if available (job.categories assumed to be array of category objects or ids)
        categories: job.categories && Array.isArray(job.categories) ? job.categories.map(c => (c.id || c.categoryId || c.category?.id || c)) : undefined
      };

      const response = await fetch('/api/jobs', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(duplicatedJobData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to duplicate job');
      }

      const newJob = await response.json();
      
      // Refresh jobs list
      await fetchJobs();
      
      // Show success message
      alert('Job duplicated successfully! You can now edit the duplicated job.');
      
    } catch (err) {
      console.error('Error duplicating job:', err);
      alert(`Failed to duplicate job: ${err.message}`);
    } finally {
      setLoading(false);
    }
  };

  // Open edit/create overlay
  const handleEditJob = (job) => {
    setEditingJob(job);
    setShowJobForm(true);
  };

  const handleDeleteJob = async (jobId) => {
    if (!confirm('Are you sure you want to delete this job? This action cannot be undone.')) {
      return;
    }

    try {
      const response = await fetch(`/api/jobs/${jobId}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        throw new Error('Failed to delete job');
      }

      // Remove from local state
      setJobs(jobs.filter(job => job.id !== jobId));
      alert('Job deleted successfully');
      
    } catch (err) {
      console.error('Error deleting job:', err);
      alert(`Failed to delete job: ${err.message}`);
    }
  };

  const handleStatusChange = async (jobId, newStatus) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ status: newStatus }),
      });

      if (!response.ok) {
        throw new Error('Failed to update job status');
      }

      // Update local state
      setJobs(jobs.map(job => 
        job.id === jobId ? { ...job, status: newStatus } : job
      ));
      
    } catch (err) {
      console.error('Error updating job status:', err);
      alert(`Failed to update job status: ${err.message}`);
    }
  };

  const filteredJobs = jobs.filter(job => {
    const matchesSearch = job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                         job.companyName?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesFilter = filterStatus === 'all' || job.status === filterStatus;
    return matchesSearch && matchesFilter;
  });

  const getStatusColor = (status) => {
    switch (status) {
      case 'active': return 'bg-green-800 text-green-100';
      case 'draft': return 'bg-neutral-700 text-gray-100';
      case 'paused': return 'bg-yellow-800 text-yellow-100';
      case 'closed': return 'bg-red-800 text-red-100';
      case 'expired': return 'bg-orange-800 text-orange-100';
      default: return 'bg-neutral-700 text-gray-100';
    }
  };

  const JobCard = ({ job }) => {
    const [showActions, setShowActions] = useState(false);

    return (
      <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-white mb-1">{job.title}</h3>
            <p className="text-gray-300 text-sm">{job.companyName || 'No company'}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-400">
              <span>{job.location}</span>
              <span>{job.jobType}</span>
              <span>{job.workMode}</span>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(job.status)}`}>
              {job.status}
            </span>
            
            <div className="relative">
              <button
                onClick={() => setShowActions(!showActions)}
                className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
              >
                <MoreHorizontal className="w-4 h-4 text-gray-300" />
              </button>
              
              {showActions && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-neutral-800 border border-neutral-700 rounded-lg shadow-lg z-10">
                    <button
                      onClick={() => {
                        handleEditJob(job);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-700 flex items-center gap-2 text-gray-100"
                    >
                      <Edit3 className="w-4 h-4 text-gray-100" />
                      Edit Job
                    </button>
                  
                    <button
                      onClick={() => {
                        handleDuplicateJob(job);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-700 flex items-center gap-2 text-gray-100"
                    >
                      <Copy className="w-4 h-4 text-gray-100" />
                      Duplicate Job
                    </button>
                  
                    <a
                      href={`/jobs/${job.slug || job.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-700 flex items-center gap-2 text-gray-100"
                      onClick={() => setShowActions(false)}
                    >
                      <ExternalLink className="w-4 h-4 text-gray-100" />
                      View Job Page
                    </a>
                  
                    <button
                      onClick={() => {
                        handleEditApplicationForm(job);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm hover:bg-neutral-700 flex items-center gap-2 text-gray-100"
                    >
                      <Edit3 className="w-4 h-4 text-gray-100" />
                      Edit Application Form
                    </button>
                  
                    <div className="border-t border-neutral-700">
                    <select
                      value={job.status}
                      onChange={(e) => {
                        handleStatusChange(job.id, e.target.value);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-sm bg-transparent border-none focus:outline-none text-gray-100"
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  
                    <div className="border-t border-neutral-700">
                    <button
                      onClick={() => {
                        handleDeleteJob(job.id);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-400 hover:bg-neutral-700 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4 text-red-400" />
                      Delete Job
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

  <div className="grid grid-cols-3 gap-4 text-sm text-gray-400 mb-4">
          <div>
            <span className="font-medium text-gray-200">Applications:</span> {job.applicationsCount || 0}
          </div>
          <div>
            <span className="font-medium">Views:</span> {job.viewsCount || 0}
          </div>
          <div>
            <span className="font-medium">Posted:</span> {new Date(job.postedAt || job.createdAt).toLocaleDateString()}
          </div>
        </div>

        {job.description && (
            <p className="text-gray-300 text-sm line-clamp-2 mb-4">
            {job.description.replace(/<[^>]*>/g, '').substring(0, 100)}...
          </p>
        )}

        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm text-gray-500">
            {job.applicationDeadline && (
              <span>Deadline: {new Date(job.applicationDeadline).toLocaleDateString()}</span>
            )}
          </div>
          
            <div className="flex items-center gap-2">
            <button
              onClick={() => handleEditJob(job)}
              className="px-3 py-1 text-sm bg-blue-700 text-white rounded-lg hover:bg-blue-600 transition-colors"
            >
              Quick Edit
            </button>
            <button
              onClick={() => handleDuplicateJob(job)}
              className="px-3 py-1 text-sm bg-neutral-700 text-white rounded-lg hover:bg-neutral-600 transition-colors"
            >
              Duplicate
            </button>
          </div>
        </div>
      </div>
    );
  };

  if (showJobForm) {
    // Import and render job posting form
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-neutral-800 rounded-lg w-full max-w-4xl max-h-screen overflow-y-auto text-white">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4 text-white">
              {editingJob ? 'Edit Job' : 'Create New Job'}
            </h2>
            <JobPostingForm
              initialData={editingJob}
              onSubmit={async (jobData) => {
                try {
                  setLoading(true);
                  const url = editingJob ? `/api/jobs/${editingJob.id}` : '/api/jobs';
                  const method = editingJob ? 'PUT' : 'POST';

                  const response = await fetch(url, {
                    method,
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(jobData),
                  });

                  if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to save job');
                  }

                  setShowJobForm(false);
                  setEditingJob(null);
                  await fetchJobs();
                } catch (err) {
                  console.error('Error saving job:', err);
                  alert(`Failed to save job: ${err.message}`);
                } finally {
                  setLoading(false);
                }
              }}
              onCancel={() => {
                setShowJobForm(false);
                setEditingJob(null);
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  if (showApplicationFormEditor) {
    return (
      <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
        <div className="bg-neutral-800 rounded-lg w-full max-w-4xl max-h-screen overflow-y-auto text-white">
          <div className="p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-xl font-semibold text-white">
                Edit Application Form - {editingApplicationForm?.jobTitle}
              </h2>
              <button
                onClick={() => {
                  setShowApplicationFormEditor(false);
                  setEditingApplicationForm(null);
                }}
                className="p-2 hover:bg-neutral-700 rounded-lg transition-colors"
              >
                <X className="w-5 h-5 text-gray-300" />
              </button>
            </div>
            
            <FormBuilder
              initialForm={editingApplicationForm}
              jobId={editingApplicationForm?.jobId}
              onSave={async (formData) => {
                try {
                  setLoading(true);
                  const response = await fetch(`/api/application-forms?id=${editingApplicationForm.id}`, {
                    method: 'PUT',
                    headers: {
                      'Content-Type': 'application/json',
                    },
                    body: JSON.stringify(formData),
                  });

                  if (!response.ok) {
                    const errorData = await response.json();
                    throw new Error(errorData.error || 'Failed to update application form');
                  }

                  setShowApplicationFormEditor(false);
                  setEditingApplicationForm(null);
                  alert('Application form updated successfully!');
                  
                } catch (err) {
                  console.error('Error updating application form:', err);
                  alert(`Failed to update application form: ${err.message}`);
                } finally {
                  setLoading(false);
                }
              }}
              onPreview={(formData) => {
                // Handle preview - could open in new window or modal
                console.log('Preview form:', formData);
              }}
            />
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-white">Manage Jobs</h1>
          <p className="text-gray-300">Create, edit, and manage your job postings</p>
        </div>
        
        <button
          onClick={() => setShowJobForm(true)}
          className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          <Plus className="w-4 h-4" />
          Create New Job
        </button>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-neutral-800 border border-neutral-700 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs by title or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-neutral-700 rounded-lg bg-neutral-900 text-white focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            >
              <option value="all">All Status</option>
              <option value="active">Active</option>
              <option value="draft">Draft</option>
              <option value="paused">Paused</option>
              <option value="closed">Closed</option>
              <option value="expired">Expired</option>
            </select>
          </div>
        </div>
      </div>

      {/* Error State */}
      {error && (
        <div className="bg-red-900 border border-red-700 rounded-lg p-4 mb-6">
          <p className="text-red-200">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-400 mx-auto"></div>
          <p className="text-gray-300 mt-2">Loading jobs...</p>
        </div>
      )}

      {/* Jobs Grid */}
      {!loading && filteredJobs.length > 0 && (
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {filteredJobs.map((job) => (
            <JobCard key={job.id} job={job} />
          ))}
        </div>
      )}

      {/* Empty State */}
      {!loading && filteredJobs.length === 0 && (
        <div className="text-center py-12 text-white">
          <div className="w-16 h-16 bg-neutral-700 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-gray-300" />
          </div>
          <h3 className="text-lg font-medium text-white mb-2">
            {searchTerm || filterStatus !== 'all' ? 'No jobs found' : 'No jobs posted yet'}
          </h3>
          <p className="text-gray-300 mb-4">
            {searchTerm || filterStatus !== 'all' 
              ? 'Try adjusting your search or filter criteria'
              : 'Get started by creating your first job posting'
            }
          </p>
          {(!searchTerm && filterStatus === 'all') && (
            <button
              onClick={() => setShowJobForm(true)}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
            >
              Create Your First Job
            </button>
          )}
        </div>
      )}
    </div>
  );
}