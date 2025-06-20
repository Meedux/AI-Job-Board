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

// Convert sheet rows to job objects
export const convertSheetRowsToJobs = (rows) => {
  if (!rows || rows.length === 0) return [];

  // Assume first row contains headers
  const headers = rows[0];
  const jobs = [];

  for (let i = 1; i < rows.length; i++) {
    const row = rows[i];
    const job = {};

    headers.forEach((header, index) => {
      job[header.toLowerCase().replace(/\s+/g, '_')] = row[index] || '';
    });

    jobs.push(job);
  }

  return jobs;
};

// Extract Google Doc ID from URL
export const extractDocIdFromUrl = (url) => {
  if (!url) return null;
  
  const match = url.match(/\/document\/d\/([a-zA-Z0-9-_]+)/);
  return match ? match[1] : null;
};

// Process jobs and fetch additional content from Google Docs
export const processJobsWithDocContent = async (jobs) => {
  const processedJobs = [];

  for (const job of jobs) {
    const processedJob = { ...job };

    // Check if job has a Google Doc URL for description
    if (job.description_doc_url) {
      const docId = extractDocIdFromUrl(job.description_doc_url);
      if (docId) {
        try {
          const docContent = await fetchDocContent(docId);
          processedJob.full_description = docContent;
        } catch (error) {
          console.error(`Failed to fetch doc content for job ${job.id}:`, error);
          processedJob.full_description = job.description || '';
        }
      }
    }

    processedJobs.push(processedJob);
  }

  return processedJobs;
};
