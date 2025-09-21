import { NextResponse } from 'next/server';
import { getBaseUrl, getVerificationUrl, getPasswordResetUrl, isLocalhost } from '../../../../utils/domainConfig';

export async function GET(request) {
  try {
    // Test domain configuration
    const baseUrl = getBaseUrl(request);
    const testToken = 'test-token-' + Date.now();
    const verificationUrl = getVerificationUrl(testToken, request);
    const passwordResetUrl = getPasswordResetUrl(testToken, request);
    
    // Get request info for debugging
    const host = request.headers.get('host');
    const protocol = request.headers.get('x-forwarded-proto') || 'http';
    const userAgent = request.headers.get('user-agent');
    
    return NextResponse.json({
      success: true,
      message: 'Domain configuration test',
      config: {
        baseUrl,
        isLocalhost: isLocalhost(baseUrl),
        testUrls: {
          verification: verificationUrl,
          passwordReset: passwordResetUrl
        }
      },
      environment: {
        NODE_ENV: process.env.NODE_ENV,
        NEXT_PUBLIC_BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || 'Not set',
        VERCEL_URL: process.env.VERCEL_URL || 'Not set'
      },
      requestInfo: {
        host,
        protocol,
        userAgent: userAgent?.substring(0, 100) + '...'
      },
      warnings: isLocalhost(baseUrl) ? [
        'Using localhost - this will break in production!',
        'Set NEXT_PUBLIC_BASE_URL environment variable for production'
      ] : []
    });
    
  } catch (error) {
    console.error('❌ Domain config test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Domain configuration test failed'
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

    // Import here to avoid circular dependencies
    const emailItService = (await import('../../../../utils/emailItService')).default;
    
    console.log(`🧪 Testing verification email with dynamic URL to: ${email}`);
    
    const testToken = 'test-verification-' + Date.now();
    const result = await emailItService.sendVerificationEmail(
      email, 
      testToken, 
      'Test User',
      request // Pass request for dynamic URL generation
    );
    
    const baseUrl = getBaseUrl(request);
    const verificationUrl = getVerificationUrl(testToken, request);
    
    return NextResponse.json({
      success: result.success,
      message: result.success ? 'Test verification email sent with dynamic URL' : 'Test email failed',
      emailResult: result,
      urlInfo: {
        baseUrl: baseUrl,
        verificationUrl: verificationUrl,
        isLocalhost: isLocalhost(baseUrl)
      },
      warnings: isLocalhost(baseUrl) ? [
        'Email sent with localhost URL - will not work in production!'
      ] : []
    });
    
  } catch (error) {
    console.error('❌ Email test error:', error);
    return NextResponse.json({
      success: false,
      error: error.message,
      message: 'Email test failed'
    }, { status: 500 });
  }
}