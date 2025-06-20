// Client-side utilities for fetching jobs data
import { useState, useEffect } from 'react';
export const jobsApi = {
  // Fetch jobs with optional filters
  getJobs: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.location) params.append('location', filters.location);
      if (filters.type) params.append('type', filters.type);
      if (filters.limit) params.append('limit', filters.limit.toString());

      const response = await fetch(`/api/jobs?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching jobs:', error);
      throw error;
    }
  },

  // Fetch individual job details
  getJob: async (jobId) => {
    try {
      const response = await fetch(`/api/jobs/${jobId}`);
      
      if (!response.ok) {
        if (response.status === 404) {
          throw new Error('Job not found');
        }
        throw new Error('Failed to fetch job details');
      }

      return await response.json();
    } catch (error) {
      console.error('Error fetching job details:', error);
      throw error;
    }
  }
};

// Hook for fetching jobs (can be used with React)
export const useJobs = (filters = {}) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);

  const fetchJobs = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const result = await jobsApi.getJobs(filters);
      setJobs(result.jobs);
      setTotal(result.total);
    } catch (err) {
      setError(err.message);
      setJobs([]);
      setTotal(0);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJobs();
  }, [JSON.stringify(filters)]);

  return {
    jobs,
    loading,
    error,
    total,
    refetch: fetchJobs
  };
};

// Hook for fetching individual job
export const useJob = (jobId) => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchJob = async () => {
    if (!jobId) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await jobsApi.getJob(jobId);
      setJob(result.job);
    } catch (err) {
      setError(err.message);
      setJob(null);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchJob();
  }, [jobId]);

  return {
    job,
    loading,
    error,
    refetch: fetchJob
  };
};
