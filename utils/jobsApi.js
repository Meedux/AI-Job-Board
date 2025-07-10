// Client-side utilities for fetching jobs data from Prisma-based API
'use client';

import { useState, useEffect, useCallback } from 'react';

// Cache for API responses
const apiCache = new Map();
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

// Jobs hook for client-side data fetching
export const useJobs = (filters = {}) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [initialLoad, setInitialLoad] = useState(true);

  const fetchJobs = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // Build query parameters
      const params = new URLSearchParams();
      
      if (filters.search) params.append('search', filters.search);
      if (filters.location) params.append('location', filters.location);
      if (filters.type) params.append('type', filters.type);
      if (filters.level) params.append('level', filters.level);
      if (filters.category) params.append('category', filters.category);
      if (filters.remote) params.append('remote', 'true');
      if (filters.limit) params.append('limit', filters.limit.toString());
      if (filters.page) params.append('page', filters.page.toString());

      const cacheKey = params.toString();
      const now = Date.now();
      
      // Check cache first
      if (apiCache.has(cacheKey)) {
        const { data, timestamp } = apiCache.get(cacheKey);
        if (now - timestamp < CACHE_EXPIRY) {
          setJobs(data.jobs || []);
          setTotal(data.total || 0);
          setLoading(false);
          if (initialLoad) setInitialLoad(false);
          return;
        }
        apiCache.delete(cacheKey);
      }

      const response = await fetch(`/api/jobs?${params.toString()}`);
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      const data = await response.json();
      
      // Cache the response
      apiCache.set(cacheKey, { data, timestamp: now });
      
      setJobs(data.jobs || []);
      setTotal(data.total || 0);
      
    } catch (err) {
      console.error('Error fetching jobs:', err);
      setError(err.message || 'Failed to fetch jobs');
      setJobs([]);
      setTotal(0);
    } finally {
      setLoading(false);
      if (initialLoad) {
        setInitialLoad(false);
      }
    }
  }, [filters, initialLoad]);

  useEffect(() => {
    fetchJobs();
  }, [fetchJobs]);

  return { jobs, loading, error, total, initialLoad, refetch: fetchJobs };
};

// Hook for fetching a single job
export const useJob = (slug) => {
  const [job, setJob] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!slug) return;

    const fetchJob = async () => {
      try {
        setLoading(true);
        setError(null);

        const response = await fetch(`/api/jobs/${slug}`);
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setJob(data.job || data);
        
      } catch (err) {
        console.error('Error fetching job:', err);
        setError(err.message || 'Failed to fetch job');
        setJob(null);
      } finally {
        setLoading(false);
      }
    };

    fetchJob();
  }, [slug]);

  return { job, loading, error };
};

// Companies hook
export const useCompanies = () => {
  const [companies, setCompanies] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCompanies = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/companies');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setCompanies(data.companies || []);
      } catch (err) {
        console.error('Error fetching companies:', err);
        setError(err.message);
        setCompanies([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCompanies();
  }, []);

  return { companies, loading, error };
};

// Categories hook
export const useCategories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    const fetchCategories = async () => {
      try {
        setLoading(true);
        const response = await fetch('/api/categories');
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }

        const data = await response.json();
        setCategories(data.categories || []);
      } catch (err) {
        console.error('Error fetching categories:', err);
        setError(err.message);
        setCategories([]);
      } finally {
        setLoading(false);
      }
    };

    fetchCategories();
  }, []);

  return { categories, loading, error };
};

// Utility functions for direct API calls
export const jobsApi = {
  // Fetch jobs with filters
  getJobs: async (filters = {}) => {
    const params = new URLSearchParams();
    
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value.toString());
      }
    });

    const response = await fetch(`/api/jobs?${params.toString()}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch jobs: ${response.status}`);
    }

    return await response.json();
  },

  // Get single job by slug
  getJob: async (slug) => {
    const response = await fetch(`/api/jobs/${slug}`);
    
    if (!response.ok) {
      throw new Error(`Failed to fetch job: ${response.status}`);
    }

    return await response.json();
  },

  // Create new job (requires authentication)
  createJob: async (jobData, token) => {
    const response = await fetch('/api/jobs', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
      body: JSON.stringify(jobData)
    });

    if (!response.ok) {
      throw new Error(`Failed to create job: ${response.status}`);
    }

    return await response.json();
  }
};
