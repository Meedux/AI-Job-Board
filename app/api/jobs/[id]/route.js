// API route to fetch individual job details
import { 
  fetchSheetData, 
  convertContentSheetToJobs, 
  processJobsWithDocContent 
} from '../../../../utils/googleApi';

export async function GET(request, { params }) {
  try {
    const jobSlug = params.id; // This will be the slug since we're using slug as ID

    if (!jobSlug) {
      return Response.json(
        { error: 'Job slug is required' },
        { status: 400 }
      );
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
      return Response.json(
        { error: 'No jobs data found' },
        { status: 404 }
      );
    }

    // Convert sheet rows to job objects using new structure
    const jobs = convertContentSheetToJobs(sheetData);

    // Find the specific job by slug (which is used as ID)
    const job = jobs.find(j => j.slug === jobSlug || j.id === jobSlug);

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
