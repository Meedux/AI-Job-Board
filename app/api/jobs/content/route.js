import { NextResponse } from 'next/server';
import { fetchDocContent, extractDocIdFromUrl } from '../../../../utils/googleApi';

export async function POST(request) {
  try {
    const { contentUrl } = await request.json();
    
    console.log('Received content URL:', contentUrl);
    
    if (!contentUrl) {
      return NextResponse.json({ error: 'Content URL is required' }, { status: 400 });
    }

    // Extract document ID from the URL
    const docId = extractDocIdFromUrl(contentUrl);
    console.log('Extracted document ID:', docId);
    
    if (!docId) {
      return NextResponse.json({ error: 'Invalid Google Docs URL format' }, { status: 400 });
    }

    // Check environment variables
    console.log('Environment check:', {
      hasClientEmail: !!process.env.GOOGLE_CLIENT_EMAIL,
      hasPrivateKey: !!process.env.GOOGLE_PRIVATE_KEY,
      clientEmail: process.env.GOOGLE_CLIENT_EMAIL
    });

    // Fetch content from Google Docs
    const content = await fetchDocContent(docId);
    
    console.log('Content fetched successfully, length:', content?.length || 0);
    
    return NextResponse.json({ content });
    
  } catch (error) {
    console.error('Error in content API route:', error);
    console.error('Error stack:', error.stack);
    return NextResponse.json(
      { error: 'Failed to fetch job content', details: error.message },
      { status: 500 }
    );
  }
}
