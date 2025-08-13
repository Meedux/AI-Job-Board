import { NextResponse } from 'next/server';
import emailItService from '../../../../utils/emailItService';

export async function GET(request) {
  try {
    console.log('🧪 Testing EmailIt API connection...');
    
    const result = await emailItService.testConnection();
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'EmailIt API connection successful',
        endpoint: result.endpoint,
        response: result.response
      });
    } else {
      return NextResponse.json({
        success: false,
        error: result.error,
        message: 'EmailIt API connection failed'
      }, { status: 500 });
    }
    
  } catch (error) {
    console.error('❌ EmailIt test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'EmailIt API test failed'
    }, { status: 500 });
  }
}

export async function POST(request) {
  try {
    const { email } = await request.json();
    
    if (!email) {
      return NextResponse.json({
        success: false,
        error: 'Email address is required'
      }, { status: 400 });
    }

    console.log(`🧪 Testing verification email send to: ${email}`);
    
    const result = await emailItService.sendVerificationEmail(
      email, 
      'test-token-' + Date.now(), 
      'Test User'
    );
    
    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Test email sent successfully' : 'Test email failed',
      messageId: result.messageId,
      error: result.error
    });
    
  } catch (error) {
    console.error('❌ EmailIt send test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'EmailIt send test failed'
    }, { status: 500 });
  }
}
