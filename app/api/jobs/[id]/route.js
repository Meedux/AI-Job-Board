// API route to fetch individual job details
import { 
  fetchSheetData, 
  convertSheetRowsToJobs, 
  processJobsWithDocContent 
} from '../../../../utils/googleApi';

export async function GET(request, { params }) {
  try {
    const jobId = params.id;

    if (!jobId) {
      return Response.json(
        { error: 'Job ID is required' },
        { status: 400 }
      );
    }

    // Configuration
    const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
    const SHEET_RANGE = process.env.GOOGLE_SHEET_RANGE || 'Jobs!A:Z';

    if (!SPREADSHEET_ID) {
      return Response.json(
        { error: 'Google Spreadsheet ID not configured' },
        { status: 500 }
      );
    }

    // Fetch data from Google Sheets
    const sheetData = await fetchSheetData(SPREADSHEET_ID, SHEET_RANGE);
    
    if (!sheetData || sheetData.length === 0) {
      return Response.json(
        { error: 'No jobs data found' },
        { status: 404 }
      );
    }

    // Convert sheet rows to job objects
    const jobs = convertSheetRowsToJobs(sheetData);

    // Find the specific job
    const job = jobs.find(j => j.id === jobId || j.slug === jobId);

    if (!job) {
      return Response.json(
        { error: 'Job not found' },
        { status: 404 }
      );
    }

    // Process job with Google Docs content
    const [processedJob] = await processJobsWithDocContent([job]);

    return Response.json({ job: processedJob });

  } catch (error) {
    console.error('Error in /api/jobs/[id]:', error);
    return Response.json(
      { error: 'Failed to fetch job details' },
      { status: 500 }
    );
  }
}
