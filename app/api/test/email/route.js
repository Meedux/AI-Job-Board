import { NextResponse } from 'next/server';
import emailItService from '../../../../utils/emailItService';
import { getRequestInfo } from '../../../../utils/dataLogger';

export async function GET(request) {
  const { userAgent, ipAddress } = getRequestInfo(request);
  
  try {
    console.log('🧪 Testing EmailIt service connection...');
    
    // Test email sending with EmailIt
    const testEmail = 'test@example.com';
    const result = await emailItService.sendEmail(
      testEmail,
      'EmailIt Service Test',
      '<h1>Test Email</h1><p>This is a test email from EmailIt service.</p>',
      'test'
    );
    
    if (result.success) {
      console.log('✅ EmailIt service is working correctly');
      return NextResponse.json({
        success: true,
        message: 'EmailIt service is configured correctly',
        messageId: result.messageId,
        service: 'EmailIt'
      });
    } else {
      console.error('❌ EmailIt service test failed:', result.error);
      return NextResponse.json({
        success: false,
        error: result.error,
        service: 'EmailIt'
      }, { status: 500 });
    }
  } catch (error) {
    console.error('❌ Email service test error:', error);
    return NextResponse.json({
      success: false,
      error: 'Failed to test email service',
      details: error.message,
      service: 'mailgun'
    }, { status: 500 });
  }
}
