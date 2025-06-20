// Google APIs integration utilities
import { google } from 'googleapis';

// Initialize Google Sheets API
export const getGoogleSheetsInstance = () => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets.readonly',
      'https://www.googleapis.com/auth/documents.readonly',
    ],
  });

  return google.sheets({ version: 'v4', auth });
};

// Initialize Google Docs API
export const getGoogleDocsInstance = () => {
  const auth = new google.auth.GoogleAuth({
    credentials: {
      client_email: process.env.GOOGLE_CLIENT_EMAIL,
      private_key: process.env.GOOGLE_PRIVATE_KEY?.replace(/\\n/g, '\n'),
    },
    scopes: [
      'https://www.googleapis.com/auth/spreadsheets.readonly',
      'https://www.googleapis.com/auth/documents.readonly',
    ],
  });

  return google.docs({ version: 'v1', auth });
};

// Fetch data from Google Sheets
export const fetchSheetData = async (spreadsheetId, range) => {
  try {
    const sheets = getGoogleSheetsInstance();
    const response = await sheets.spreadsheets.values.get({
      spreadsheetId,
      range,
    });

    return response.data.values || [];
  } catch (error) {
    console.error('Error fetching sheet data:', error);
    throw new Error('Failed to fetch sheet data');
  }
};

// Fetch content from Google Docs
export const fetchDocContent = async (documentId) => {
  try {
    const docs = getGoogleDocsInstance();
    const response = await docs.documents.get({
      documentId,
    });

    // Extract text content from the document
    const content = response.data.body.content || [];
    let text = '';

    content.forEach((element) => {
      if (element.paragraph) {
        element.paragraph.elements?.forEach((paragraphElement) => {
          if (paragraphElement.textRun) {
            text += paragraphElement.textRun.content;
          }
        });
      }
    });

    return text;
  } catch (error) {
    console.error('Error fetching doc content:', error);
    throw new Error('Failed to fetch document content');
  }
};

// Convert sheet rows to job objects with new structure
export const convertContentSheetToJobs = (rows) => {
  if (!rows || rows.length === 0) return [];

  // Expected headers: Job Title, Slug, Content, From Salary, To Salary, Job location, Remote, Level, Type of job, Posted Time, Expire Time, Link to apply, Company Name, Company Logo, Company Website, Categories
  const headers = rows[0];
  const jobs = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    if (!row || row.length === 0) continue; // Skip empty rows

    const job = {
      // Use slug as the unique identifier
      id: row[1] || `job-${i}`, // Slug column
      slug: row[1] || `job-${i}`, // Slug column
      title: row[0] || '', // Job Title
      content_doc_url: row[2] || '', // Content (Google Docs URL)
      salary: {
        from: row[3] || '', // From Salary
        to: row[4] || '', // To Salary
        range: row[3] && row[4] ? `${row[3]} - ${row[4]}` : (row[3] || row[4] || '')
      },
      location: row[5] || '', // Job location
      remote: row[6] || '', // Remote
      level: row[7] || '', // Level
      type: row[8] || '', // Type of job
      posted_time: row[9] || '', // Posted Time
      expire_time: row[10] || '', // Expire Time
      apply_link: row[11] || '', // Link to apply
      company: {
        name: row[12] || '', // Company Name
        logo: row[13] || '', // Company Logo
        website: row[14] || '', // Company Website
      },
      categories: row[15] ? row[15].split(',').map(cat => cat.trim()) : [], // Categories
      
      // Additional computed fields
      company_name: row[12] || '', // For backward compatibility
      company_logo: row[13] || '', // For backward compatibility
      postedAt: row[9] || '', // For backward compatibility
      href: `/job/${row[1] || `job-${i}`}`, // Generate href from slug
    };

    jobs.push(job);
  }

  return jobs;
};

// Extract Google Doc ID from URL
export const extractDocIdFromUrl = (url) => {
  if (!url) return null;
  
  // Handle different Google Docs URL formats
  const patterns = [
    /\/document\/d\/([a-zA-Z0-9-_]+)/, // Standard format
    /\/d\/([a-zA-Z0-9-_]+)/, // Shortened format
    /^([a-zA-Z0-9-_]+)$/ // Just the ID
  ];

  for (const pattern of patterns) {
    const match = url.match(pattern);
    if (match) return match[1];
  }
  
  return null;
};

// Process jobs and fetch additional content from Google Docs
export const processJobsWithDocContent = async (jobs) => {
  const processedJobs = [];

  for (const job of jobs) {
    const processedJob = { ...job };

    // Check if job has a Google Doc URL for content
    if (job.content_doc_url) {
      const docId = extractDocIdFromUrl(job.content_doc_url);
      if (docId) {
        try {
          const docContent = await fetchDocContent(docId);
          processedJob.full_description = docContent;
          processedJob.description = docContent.substring(0, 300) + '...'; // Short description
        } catch (error) {
          console.error(`Failed to fetch doc content for job ${job.slug}:`, error);
          processedJob.full_description = 'Content not available';
          processedJob.description = 'Content not available';
        }
      } else {
        console.warn(`Invalid Google Docs URL for job ${job.slug}:`, job.content_doc_url);
        processedJob.full_description = 'Invalid content URL';
        processedJob.description = 'Invalid content URL';
      }
    } else {
      processedJob.full_description = 'No content provided';
      processedJob.description = 'No content provided';
    }

    processedJobs.push(processedJob);
  }

  return processedJobs;
};

// Utility to check if a job is expired
export const isJobExpired = (expireTime) => {
  if (!expireTime) return false;
  
  try {
    const expireDate = new Date(expireTime);
    const now = new Date();
    return expireDate < now;
  } catch (error) {
    return false; // If date parsing fails, assume not expired
  }
};

// Filter jobs based on criteria
export const filterJobs = (jobs, filters = {}) => {
  let filteredJobs = [...jobs];

  // Filter out expired jobs by default
  if (filters.includeExpired !== true) {
    filteredJobs = filteredJobs.filter(job => !isJobExpired(job.expire_time));
  }

  // Search filter
  if (filters.search) {
    const searchLower = filters.search.toLowerCase();
    filteredJobs = filteredJobs.filter(job => 
      job.title?.toLowerCase().includes(searchLower) ||
      job.company?.name?.toLowerCase().includes(searchLower) ||
      job.company_name?.toLowerCase().includes(searchLower) ||
      job.description?.toLowerCase().includes(searchLower) ||
      job.categories?.some(cat => cat.toLowerCase().includes(searchLower))
    );
  }

  // Location filter
  if (filters.location) {
    const locationLower = filters.location.toLowerCase();
    filteredJobs = filteredJobs.filter(job => 
      job.location?.toLowerCase().includes(locationLower) ||
      (filters.location.toLowerCase() === 'remote' && job.remote?.toLowerCase() === 'yes')
    );
  }

  // Job type filter
  if (filters.type) {
    filteredJobs = filteredJobs.filter(job => 
      job.type?.toLowerCase() === filters.type.toLowerCase()
    );
  }

  // Level filter
  if (filters.level) {
    filteredJobs = filteredJobs.filter(job => 
      job.level?.toLowerCase() === filters.level.toLowerCase()
    );
  }

  // Category filter
  if (filters.category) {
    filteredJobs = filteredJobs.filter(job => 
      job.categories?.some(cat => 
        cat.toLowerCase() === filters.category.toLowerCase()
      )
    );
  }

  // Remote filter
  if (filters.remote) {
    filteredJobs = filteredJobs.filter(job => 
      job.remote?.toLowerCase() === 'yes'
    );
  }

  return filteredJobs;
};
