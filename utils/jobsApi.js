// Client-side utilities for fetching jobs data
import { useState, useEffect, useCallback, useMemo, useRef } from 'react';

// Cache for API responses
const apiCache = new Map();
const CACHE_EXPIRY = 5 * 60 * 1000; // 5 minutes

// Debounce function
const debounce = (func, wait) => {
  let timeout;
  return function executedFunction(...args) {
    const later = () => {
      clearTimeout(timeout);
      func(...args);
    };
    clearTimeout(timeout);
    timeout = setTimeout(later, wait);
  };
};

export const jobsApi = {
  // Fetch jobs with optional filters and caching
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

      const cacheKey = params.toString();
      const now = Date.now();
      
      // Check cache first
      if (apiCache.has(cacheKey)) {
        const { data, timestamp } = apiCache.get(cacheKey);
        if (now - timestamp < CACHE_EXPIRY) {
          return data;
        }
        apiCache.delete(cacheKey);
      }

      const response = await fetch(`/api/jobs?${params.toString()}`, {
        cache: 'force-cache',
        next: { revalidate: 300 } // 5 minutes
      });
      
      if (!response.ok) {
        throw new Error('Failed to fetch jobs');
      }

      const data = await response.json();
      
      // Cache the response
      apiCache.set(cacheKey, { data, timestamp: now });
      
      return data;
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

// Hook for fetching jobs with optimizations
export const useJobs = (filters = {}) => {
  const [jobs, setJobs] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [total, setTotal] = useState(0);
  const [initialLoad, setInitialLoad] = useState(true);
  const abortControllerRef = useRef(null);

  // Memoize filters to prevent unnecessary re-renders
  const memoizedFilters = useMemo(() => ({
    search: filters.search || '',
    location: filters.location || '',
    type: filters.type || '',
    level: filters.level || '',
    category: filters.category || '',
    remote: filters.remote || false,
    limit: filters.limit || 20
  }), [
    filters.search,
    filters.location,
    filters.type,
    filters.level,
    filters.category,
    filters.remote,
    filters.limit
  ]);

  const fetchJobs = useCallback(async (isDebounced = false) => {
    // Cancel previous request if it exists
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
    }
    
    abortControllerRef.current = new AbortController();
    
    if (!isDebounced) {
      setLoading(true);
    }
    setError(null);
    
    try {
      const result = await jobsApi.getJobs(memoizedFilters);
      
      // Check if request was aborted
      if (abortControllerRef.current?.signal.aborted) {
        return;
      }
      
      setJobs(result.jobs);
      setTotal(result.total);
      if (initialLoad) {
        setInitialLoad(false);
      }
    } catch (err) {
      if (err.name !== 'AbortError') {
        setError(err.message);
        setJobs([]);
        setTotal(0);
      }
    } finally {
      setLoading(false);
    }
  }, [memoizedFilters, initialLoad]);

  // Debounced version for search
  const debouncedFetchJobs = useMemo(
    () => debounce(() => fetchJobs(true), 300),
    [fetchJobs]
  );

  useEffect(() => {
    // Use debounced fetch for search, immediate for other filters
    if (memoizedFilters.search) {
      debouncedFetchJobs();
    } else {
      fetchJobs();
    }

    return () => {
      if (abortControllerRef.current) {
        abortControllerRef.current.abort();
      }
    };
  }, [memoizedFilters, fetchJobs, debouncedFetchJobs]);

  return {
    jobs,
    loading,
    error,
    total,
    initialLoad,
    refetch: () => fetchJobs(false)
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
