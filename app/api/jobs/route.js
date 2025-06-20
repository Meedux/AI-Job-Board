// API route to fetch jobs from Google Sheets
import { 
  fetchSheetData, 
  convertContentSheetToJobs, 
  processJobsWithDocContent,
  filterJobs
} from '../../../utils/googleApi';

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
