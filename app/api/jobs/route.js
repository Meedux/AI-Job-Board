// API route to fetch jobs from Google Sheets
import { 
  fetchSheetData, 
  convertSheetRowsToJobs, 
  processJobsWithDocContent 
} from '../../../utils/googleApi';

export async function GET(request) {
  try {
    const { searchParams } = new URL(request.url);
    const limit = parseInt(searchParams.get('limit')) || 10;
    const search = searchParams.get('search') || '';
    const location = searchParams.get('location') || '';
    const type = searchParams.get('type') || '';

    // Configuration - these should be environment variables
    const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
    const SHEET_RANGE = process.env.GOOGLE_SHEET_RANGE || 'Jobs!A:Z'; // Adjust range as needed

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

    // Convert sheet rows to job objects
    let jobs = convertSheetRowsToJobs(sheetData);

    // Filter jobs based on search parameters
    if (search) {
      const searchLower = search.toLowerCase();
      jobs = jobs.filter(job => 
        (job.title?.toLowerCase().includes(searchLower)) ||
        (job.company?.toLowerCase().includes(searchLower)) ||
        (job.description?.toLowerCase().includes(searchLower)) ||
        (job.skills?.toLowerCase().includes(searchLower))
      );
    }

    if (location) {
      const locationLower = location.toLowerCase();
      jobs = jobs.filter(job => 
        job.location?.toLowerCase().includes(locationLower)
      );
    }

    if (type) {
      jobs = jobs.filter(job => 
        job.type?.toLowerCase() === type.toLowerCase()
      );
    }

    // Limit results
    const totalJobs = jobs.length;
    jobs = jobs.slice(0, limit);

    // Process jobs with Google Docs content (if any)
    const processedJobs = await processJobsWithDocContent(jobs);

    return Response.json({
      jobs: processedJobs,
      total: totalJobs,
      limit,
      hasMore: totalJobs > limit
    });

  } catch (error) {
    console.error('Error in /api/jobs:', error);
    return Response.json(
      { error: 'Failed to fetch jobs data' },
      { status: 500 }
    );
  }
}
