'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Header from '@/components/Header';
import Footer from '@/components/Footer';
import { 
  Search,
  MapPin,
  Clock,
  DollarSign,
  Building,
  ChevronRight,
  Filter,
  Briefcase
} from 'lucide-react';

const JobsPage = () => {
  const router = useRouter();
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [locationFilter, setLocationFilter] = useState('');
  const [typeFilter, setTypeFilter] = useState('');
  const [filteredJobs, setFilteredJobs] = useState([]);

  useEffect(() => {
    fetchJobs();
  }, []);

  useEffect(() => {
    filterJobs();
  }, [jobs, searchTerm, locationFilter, typeFilter]);

  const fetchJobs = async () => {
    try {
      const response = await fetch('/api/jobs');
      const result = await response.json();
      
      if (result.success) {
        setJobs(result.jobs || []);
      }
    } catch (error) {
      console.error('Error fetching jobs:', error);
    } finally {
      setLoading(false);
    }
  };

  const filterJobs = () => {
    let filtered = jobs;

    if (searchTerm) {
      filtered = filtered.filter(job => 
        job.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.company?.name || job.company_name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
        (job.description || '').toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (locationFilter) {
      filtered = filtered.filter(job => 
        job.location.toLowerCase().includes(locationFilter.toLowerCase())
      );
    }

    if (typeFilter) {
      filtered = filtered.filter(job => 
        (job.type || job.jobType || '').toLowerCase() === typeFilter.toLowerCase()
      );
    }

    setFilteredJobs(filtered);
  };

  const handleJobClick = (job) => {
    // Remove direct navigation to job page - will use modal in JobCard instead
    // router.push(`/jobs/${job.id}`);
  };

  const formatSalary = (job) => {
    const from = job.salary?.from || job.salaryFrom;
    const to = job.salary?.to || job.salaryTo;
    
    if (!from && !to) return 'Salary not specified';
    
    if (from && to) {
      return `$${from.toLocaleString()} - $${to.toLocaleString()}`;
    } else if (from) {
      return `From $${from.toLocaleString()}`;
    } else if (to) {
      return `Up to $${to.toLocaleString()}`;
    }
    
    return 'Competitive salary';
  };

  const getUniqueValues = (field) => {
    return [...new Set(jobs.map(job => job[field] || job[field.replace(/([A-Z])/g, '_$1').toLowerCase()] || '').filter(Boolean))];
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-900">
        <Header />
        <div className="flex justify-center items-center py-20">
          <div className="text-white">Loading jobs...</div>
        </div>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-900">
      <Header />
      
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold text-white mb-4">Find Your Dream Job</h1>
          <p className="text-xl text-gray-400 max-w-3xl mx-auto">
            Discover amazing opportunities from top companies. Apply with ease using our streamlined application process.
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-gray-800 rounded-lg p-6 mb-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Search jobs, companies..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Location Filter */}
            <div className="relative">
              <MapPin className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <input
                type="text"
                placeholder="Location"
                value={locationFilter}
                onChange={(e) => setLocationFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Job Type Filter */}
            <div className="relative">
              <Briefcase className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" size={20} />
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full pl-10 pr-4 py-3 bg-gray-700 border border-gray-600 rounded-lg text-white focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none"
              >
                <option value="">All Job Types</option>
                <option value="full-time">Full Time</option>
                <option value="part-time">Part Time</option>
                <option value="contract">Contract</option>
                <option value="freelance">Freelance</option>
                <option value="internship">Internship</option>
              </select>
            </div>

            {/* Clear Filters */}
            <button
              onClick={() => {
                setSearchTerm('');
                setLocationFilter('');
                setTypeFilter('');
              }}
              className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center justify-center gap-2"
            >
              <Filter size={20} />
              Clear Filters
            </button>
          </div>
        </div>

        {/* Results Count */}
        <div className="mb-6">
          <p className="text-gray-400">
            Showing {filteredJobs.length} of {jobs.length} jobs
          </p>
        </div>

        {/* Jobs Grid */}
        {filteredJobs.length === 0 ? (
          <div className="text-center py-16">
            <Briefcase className="mx-auto h-16 w-16 text-gray-400 mb-4" />
            <h3 className="text-xl font-semibold text-white mb-2">No jobs found</h3>
            <p className="text-gray-400 mb-6">
              {jobs.length === 0 ? 'No jobs available at the moment.' : 'Try adjusting your search criteria.'}
            </p>
            {jobs.length === 0 && (
              <button
                onClick={() => router.push('/admin/post-job')}
                className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                Post the First Job
              </button>
            )}
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {filteredJobs.map((job) => (
              <div
                key={job.id}
                onClick={() => handleJobClick(job)}
                className="bg-gray-800 rounded-lg p-6 hover:bg-gray-750 transition-colors cursor-pointer border border-gray-700 hover:border-gray-600"
              >
                {/* Job Header */}
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <h3 className="text-xl font-semibold text-white mb-2 line-clamp-2">
                      {job.title}
                    </h3>
                    <div className="flex items-center gap-2 text-gray-300 mb-2">
                      <Building size={16} />
                      <span>{job.company?.name || job.company_name}</span>
                    </div>
                    <div className="flex items-center gap-2 text-gray-400">
                      <MapPin size={16} />
                      <span>{job.location}</span>
                    </div>
                  </div>
                  <ChevronRight className="text-gray-400 ml-4" size={20} />
                </div>

                {/* Job Details */}
                <div className="grid grid-cols-2 gap-4 mb-4">
                  <div className="flex items-center gap-2 text-gray-400">
                    <Clock size={16} />
                    <span className="text-sm">{job.type || job.jobType}</span>
                  </div>
                  <div className="flex items-center gap-2 text-gray-400">
                    <DollarSign size={16} />
                    <span className="text-sm">{formatSalary(job)}</span>
                  </div>
                </div>

                {/* Job Tags */}
                <div className="flex flex-wrap gap-2 mb-4">
                  <span className="px-2 py-1 bg-blue-600 text-blue-100 rounded text-xs">
                    {job.level || job.experienceLevel || 'Entry Level'}
                  </span>
                  <span className="px-2 py-1 bg-purple-600 text-purple-100 rounded text-xs">
                    {job.remote === 'Yes' || job.remote_type === 'full' ? 'Remote' : 
                     job.remote === 'Hybrid' || job.remote_type === 'hybrid' ? 'Hybrid' : 'On-site'}
                  </span>
                  {job.status && (
                    <span className="px-2 py-1 bg-green-600 text-green-100 rounded text-xs">
                      {job.status}
                    </span>
                  )}
                </div>

                {/* Job Description Preview */}
                <div className="text-gray-400 text-sm line-clamp-2 mb-4">
                  {job.description ? job.description.replace(/<[^>]*>/g, '').substring(0, 150) + '...' : 'No description available.'}
                </div>

                {/* Skills */}
                {(job.required_skills || job.requiredSkills) && (job.required_skills?.length > 0 || job.requiredSkills?.length > 0) && (
                  <div className="flex flex-wrap gap-1">
                    {(job.required_skills || job.requiredSkills).slice(0, 3).map((skill, index) => (
                      <span 
                        key={index}
                        className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs"
                      >
                        {skill}
                      </span>
                    ))}
                    {(job.required_skills || job.requiredSkills).length > 3 && (
                      <span className="px-2 py-1 bg-gray-700 text-gray-300 rounded text-xs">
                        +{(job.required_skills || job.requiredSkills).length - 3} more
                      </span>
                    )}
                  </div>
                )}

                {/* Posted Date */}
                <div className="text-gray-500 text-xs mt-4">
                  Posted {new Date(job.posted_time || job.postedAt || job.createdAt).toLocaleDateString()}
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Call to Action for Employers */}
        <div className="mt-16 text-center bg-gray-800 rounded-lg p-8">
          <h2 className="text-2xl font-bold text-white mb-4">Looking to hire talent?</h2>
          <p className="text-gray-400 mb-6">
            Post your job opening and reach thousands of qualified candidates.
          </p>
          <button
            onClick={() => router.push('/admin/post-job')}
            className="px-8 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors font-semibold"
          >
            Post a Job
          </button>
        </div>
      </main>

      <Footer />
    </div>
  );
};

export default JobsPage;
