// API route to fetch jobs from Google Sheets with caching
import { 
  fetchSheetData, 
  convertContentSheetToJobs, 
  processJobsWithDocContent,
  filterJobs,
  sortJobs,
  addJobToSheet
} from '../../../utils/googleApi';
import { verifyToken } from '../../../utils/auth';
import { logUserAction, logAPIRequest, logError, getRequestInfo } from '../../../utils/dataLogger';
import { notifyJobPosted } from '../../../utils/notificationService';

// Simple in-memory cache
const cache = new Map();
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const location = searchParams.get('location') || '';
    const type = searchParams.get('type') || '';
    const level = searchParams.get('level') || '';
    const category = searchParams.get('category') || '';
    const remote = searchParams.get('remote') === 'true';
    const includeExpired = searchParams.get('includeExpired') === 'true';
    const sortBy = searchParams.get('sortBy') || '';

    // Create cache key from all parameters
    const cacheKey = `jobs-${JSON.stringify({
      search, location, type, level, category, remote, includeExpired, sortBy, limit
    })}`;

    // Check cache first
    if (cache.has(cacheKey)) {
      const { data, timestamp } = cache.get(cacheKey);
      if (Date.now() - timestamp < CACHE_DURATION) {
        return Response.json(data, {
          headers: {
            'Cache-Control': 'public, max-age=300, s-maxage=300',
            'X-Cache': 'HIT'
          }
        });
      }
      cache.delete(cacheKey);
    }

    // Configuration - using "Content" sheet as specified
    const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
    const SHEET_RANGE = process.env.GOOGLE_SHEET_RANGE || 'Content!A:P'; // Covers columns A-P for all expected data

    if (!SPREADSHEET_ID) {
      return Response.json(
        { error: 'Google Spreadsheet ID not configured' },
        { status: 500 }
      );
    }

    // Fetch data from Google Sheets
    const sheetData = await fetchSheetData(SPREADSHEET_ID, SHEET_RANGE);
    
    if (!sheetData || sheetData.length === 0) {
      return Response.json({ jobs: [], total: 0 });
    }

    // Convert sheet rows to job objects using new structure
    let jobs = convertContentSheetToJobs(sheetData);

    // Apply filters using the new filtering function
    const filters = {
      search,
      location,
      type,
      level,
      category,
      remote,
      includeExpired
    };
    
    jobs = filterJobs(jobs, filters);

    // Apply sorting
    jobs = sortJobs(jobs, sortBy);

    // Apply limit and pagination
    const totalJobs = jobs.length;
    const paginatedJobs = jobs.slice(0, limit);

    // Process jobs with Google Docs content (if any)
    const processedJobs = await processJobsWithDocContent(paginatedJobs);

    const responseData = {
      jobs: processedJobs,
      total: totalJobs,
      limit,
      hasMore: totalJobs > limit,
      filters: filters // Return applied filters for debugging
    };

    // Cache the response
    cache.set(cacheKey, { data: responseData, timestamp: Date.now() });

    return Response.json(responseData, {
      headers: {
        'Cache-Control': 'public, max-age=300, s-maxage=300',
        'X-Cache': 'MISS'
      }
    });

  } catch (error) {
    console.error('Error in /api/jobs:', error);
    return Response.json(
      { error: 'Failed to fetch jobs data' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  const startTime = Date.now();
  const { userAgent, ipAddress } = getRequestInfo(request);
  let userId = null;

  try {
    // Log API request
    await logAPIRequest('POST', '/api/jobs', null, ipAddress);

    // Get authentication token
    const token = request.cookies.get('auth-token')?.value;
    let user = null;

    if (token) {
      try {
        user = verifyToken(token);
        userId = user?.uid;
      } catch (error) {
        console.warn('Invalid token for job posting:', error.message);
      }
    }

    const { jobData } = await request.json();

    if (!jobData || !Array.isArray(jobData) || jobData.length !== 16) {
      return Response.json(
        { error: 'Invalid job data. Expected array with 16 elements (A-P columns).' },
        { status: 400 }
      );
    }

    // Validate required fields (Job Title, Company Name, Company Website, Application Link, Categories)
    const [jobTitle, , , , , , , , , , , linkToApply, companyName, , companyWebsite, categories] = jobData;
    
    if (!jobTitle || !companyName || !companyWebsite || !linkToApply || !categories) {
      return Response.json(
        { error: 'Missing required fields: Job Title, Company Name, Company Website, Application Link, and Categories are required.' },
        { status: 400 }
      );
    }

    // Add job to Google Sheets
    const result = await addJobToSheet(jobData);

    // Log the job posting action
    if (user) {
      await logUserAction(
        user.uid,
        user.email,
        'JOB_POSTED',
        `Job posted: ${jobTitle} at ${companyName}`,
        { jobTitle, companyName, categories },
        ipAddress
      );
    }

    // Send job posted notification
    try {
      await notifyJobPosted(jobTitle, companyName, userId, user?.email, ipAddress);
      console.log('📱 Job posting notification sent');
    } catch (error) {
      console.error('Failed to send job posting notification:', error);
      await logError(
        'JOB_POSTING_NOTIFICATION_ERROR',
        'api/jobs',
        error.message,
        error.stack,
        userId,
        { jobTitle, companyName },
        'error'
      );
    }

    // Log successful API response
    const responseTime = Date.now() - startTime;
    await logAPIRequest(
      'POST',
      '/api/jobs',
      userId,
      ipAddress,
      200,
      responseTime
    );

    return Response.json({
      success: true,
      message: 'Job posted successfully',
      result
    });

  } catch (error) {
    console.error('Error posting job:', error);
    
    // Log error
    await logError(
      'JOB_POSTING_ERROR',
      'api/jobs',
      error.message,
      error.stack,
      userId,
      null,
      'error'
    );
    
    // Log failed API response
    const responseTime = Date.now() - startTime;
    await logAPIRequest(
      'POST',
      '/api/jobs',
      userId,
      ipAddress,
      500,
      responseTime
    );
    
    return Response.json(
      { error: 'Failed to post job' },
      { status: 500 }
    );
  }
}
