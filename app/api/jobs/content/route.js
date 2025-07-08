import { NextResponse } from 'next/server';
import { fetchDocContent, extractDocIdFromUrl } from '../../../../utils/googleApi';

export async function POST(request) {
  try {
    const { contentUrl } = await request.json();
    
    if (!contentUrl) {
      return NextResponse.json({ error: 'Content URL is required' }, { status: 400 });
    }

    // Extract document ID from the URL
    const docId = extractDocIdFromUrl(contentUrl);
    if (!docId) {
      return NextResponse.json({ error: 'Invalid Google Docs URL format' }, { status: 400 });
    }

    // Fetch content from Google Docs
    const content = await fetchDocContent(docId);
    
    return NextResponse.json({ content });
    
  } catch (error) {
    console.error('Error fetching Google Docs content:', error);
    return NextResponse.json(
      { error: 'Failed to fetch job content', details: error.message },
      { status: 500 }
    );
  }
}
