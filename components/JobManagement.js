'use client';

import { useState, useEffect } from 'react';
import JobPostingForm from './JobPostingForm';

export default function JobManagement() {
  const { user } = useAuth();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [filterStatus, setFilterStatus] = useState('all');
  const [showJobForm, setShowJobForm] = useState(false);
  const [editingJob, setEditingJob] = useState(null);
  const [duplicatingJob, setDuplicatingJob] = useState(null);

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

  const handleEditJob = (job) => {
    setEditingJob(job);
    setShowJobForm(true);
  };

  const handleDuplicateJob = async (job) => {
    try {
      setLoading(true);
      
      // Create a new job based on the existing one
      const duplicatedJobData = {
        ...job,
        title: `${job.title} (Copy)`,
        id: undefined, // Remove ID to create new
        createdAt: undefined,
        updatedAt: undefined,
        applicationsCount: 0,
        viewsCount: 0,
        status: 'draft', // Start as draft
        slug: undefined // Will be auto-generated
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
      case 'active': return 'bg-green-100 text-green-800';
      case 'draft': return 'bg-gray-100 text-gray-800';
      case 'paused': return 'bg-yellow-100 text-yellow-800';
      case 'closed': return 'bg-red-100 text-red-800';
      case 'expired': return 'bg-orange-100 text-orange-800';
      default: return 'bg-gray-100 text-gray-800';
    }
  };

  const JobCard = ({ job }) => {
    const [showActions, setShowActions] = useState(false);

    return (
      <div className="bg-white border border-gray-200 rounded-lg p-6 hover:shadow-md transition-shadow">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <h3 className="text-lg font-semibold text-gray-900 mb-1">{job.title}</h3>
            <p className="text-gray-600 text-sm">{job.companyName || 'No company'}</p>
            <div className="flex items-center gap-4 mt-2 text-sm text-gray-500">
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
                className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
              >
                <MoreHorizontal className="w-4 h-4" />
              </button>
              
              {showActions && (
                <div className="absolute right-0 top-full mt-1 w-48 bg-white border border-gray-200 rounded-lg shadow-lg z-10">
                  <button
                    onClick={() => {
                      handleEditJob(job);
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Edit3 className="w-4 h-4" />
                    Edit Job
                  </button>
                  
                  <button
                    onClick={() => {
                      handleDuplicateJob(job);
                      setShowActions(false);
                    }}
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                  >
                    <Copy className="w-4 h-4" />
                    Duplicate Job
                  </button>
                  
                  <a
                    href={`/jobs/${job.slug || job.id}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="w-full px-4 py-2 text-left text-sm hover:bg-gray-50 flex items-center gap-2"
                    onClick={() => setShowActions(false)}
                  >
                    <ExternalLink className="w-4 h-4" />
                    View Job Page
                  </a>
                  
                  <div className="border-t border-gray-100">
                    <select
                      value={job.status}
                      onChange={(e) => {
                        handleStatusChange(job.id, e.target.value);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-sm bg-transparent border-none focus:outline-none"
                    >
                      <option value="draft">Draft</option>
                      <option value="active">Active</option>
                      <option value="paused">Paused</option>
                      <option value="closed">Closed</option>
                    </select>
                  </div>
                  
                  <div className="border-t border-gray-100">
                    <button
                      onClick={() => {
                        handleDeleteJob(job.id);
                        setShowActions(false);
                      }}
                      className="w-full px-4 py-2 text-left text-sm text-red-600 hover:bg-red-50 flex items-center gap-2"
                    >
                      <Trash2 className="w-4 h-4" />
                      Delete Job
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        <div className="grid grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
          <div>
            <span className="font-medium">Applications:</span> {job.applicationsCount || 0}
          </div>
          <div>
            <span className="font-medium">Views:</span> {job.viewsCount || 0}
          </div>
          <div>
            <span className="font-medium">Posted:</span> {new Date(job.postedAt || job.createdAt).toLocaleDateString()}
          </div>
        </div>

        {job.description && (
          <p className="text-gray-700 text-sm line-clamp-2 mb-4">
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
              className="px-3 py-1 text-sm bg-blue-100 text-blue-700 rounded-lg hover:bg-blue-200 transition-colors"
            >
              Quick Edit
            </button>
            <button
              onClick={() => handleDuplicateJob(job)}
              className="px-3 py-1 text-sm bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
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
        <div className="bg-white rounded-lg w-full max-w-4xl max-h-screen overflow-y-auto">
          <div className="p-6">
            <h2 className="text-xl font-semibold mb-4">
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

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">Manage Jobs</h1>
          <p className="text-gray-600">Create, edit, and manage your job postings</p>
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
      <div className="bg-white border border-gray-200 rounded-lg p-4 mb-6">
        <div className="flex items-center gap-4">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search jobs by title or company..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>
          
          <div className="flex items-center gap-2">
            <Filter className="w-4 h-4 text-gray-400" />
            <select
              value={filterStatus}
              onChange={(e) => setFilterStatus(e.target.value)}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
        <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
          <p className="text-red-700">{error}</p>
        </div>
      )}

      {/* Loading State */}
      {loading && (
        <div className="text-center py-12">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
          <p className="text-gray-600 mt-2">Loading jobs...</p>
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
        <div className="text-center py-12">
          <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
            <Building2 className="w-8 h-8 text-gray-400" />
          </div>
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            {searchTerm || filterStatus !== 'all' ? 'No jobs found' : 'No jobs posted yet'}
          </h3>
          <p className="text-gray-600 mb-4">
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