// API route to fetch jobs from Google Sheets
import { 
  fetchSheetData, 
  convertContentSheetToJobs, 
  processJobsWithDocContent,
  filterJobs,
  sortJobs,
  addJobToSheet
} from '../../../utils/googleApi';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const location = searchParams.get('location') || '';
    const type = searchParams.get('type') || '';
    const level = searchParams.get('level') || '';
    const category = searchParams.get('category') || '';
    const remote = searchParams.get('remote') === 'true';
    const includeExpired = searchParams.get('includeExpired') === 'true';
    const sortBy = searchParams.get('sortBy') || '';

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
    let jobs = convertContentSheetToJobs(sheetData);    // Apply filters using the new filtering function
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

    return Response.json({
      jobs: processedJobs,
      total: totalJobs,
      limit,
      hasMore: totalJobs > limit,
      filters: filters // Return applied filters for debugging
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
  try {
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

    return Response.json({
      success: true,
      message: 'Job posted successfully',
      result
    });

  } catch (error) {
    console.error('Error posting job:', error);
    return Response.json(
      { error: 'Failed to post job' },
      { status: 500 }
    );
  }
}
