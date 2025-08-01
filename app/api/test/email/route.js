import { NextResponse } from 'next/server';
import { testEmailConnection } from '../../../../utils/externalEmailService';
import { getRequestInfo } from '../../../../utils/dataLogger';

export async function GET(request) {
  const { userAgent, ipAddress } = getRequestInfo(request);
  
  try {
    console.log('🧪 Testing external email service connection...');
    
    const result = await testEmailConnection();
    
    if (result.success) {
      console.log('✅ Mailgun email service is working correctly');
      return NextResponse.json({
        success: true,
        message: 'Mailgun email service is configured correctly',
        messageId: result.messageId,
        service: 'mailgun'
      });
    } else {
      console.error('❌ Mailgun email service test failed:', result.message);
      return NextResponse.json({
        success: false,
        error: result.message,
        service: 'mailgun'
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
