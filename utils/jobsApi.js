// Client-side utilities for fetching jobs data
import { useState, useEffect, useCallback } from 'react';
export const jobsApi = {
  // Fetch jobs with optional filters
  getJobs: async (filters = {}) => {
    try {
      const params = new URLSearchParams();
      
      // All available filter options
      if (filters.search) params.append('search', filters.search);
      if (filters.location) params.append('location', filters.location);
      if (filters.type) params.append('type', filters.type);
      if (filters.level) params.append('level', filters.level);
      if (filters.category) params.append('category', filters.category);
      if (filters.remote) params.append('remote', 'true');
      if (filters.includeExpired) params.append('includeExpired', 'true');
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

  // Fetch individual job details (by slug)
  getJob: async (jobSlug) => {
    try {
      const response = await fetch(`/api/jobs/${jobSlug}`);
      
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
  const fetchJobs = useCallback(async () => {
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
  }, [filters]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return {
    jobs,
    loading,
    error,
    total,
    refetch: fetchJobs
  };
};

// Hook for fetching individual job
export const useJob = (jobSlug) => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const fetchJob = useCallback(async () => {
    if (!jobSlug) return;
    
    setLoading(true);
    setError(null);
    
    try {
      const result = await jobsApi.getJob(jobSlug);
      setJob(result.job);
    } catch (err) {
      setError(err.message);
      setJob(null);
    } finally {
      setLoading(false);
    }
  }, [jobSlug]);

  useEffect(() => {
    fetchJob();
  }, [fetchJob]);

  return {
    job,
    loading,
    error,
    refetch: fetchJob
  };
};
