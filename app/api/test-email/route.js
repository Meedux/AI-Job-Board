import { NextResponse } from 'next/server';
import emailItService from '../../../utils/emailItService';

export async function POST(request) {
  try {
    const { email, subject, message } = await request.json();
    
    if (!email || !subject || !message) {
      return NextResponse.json(
        { error: 'Email, subject, and message are required' },
        { status: 400 }
      );
    }

    // Validate email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email format' },
        { status: 400 }
      );
    }

    // Create HTML email content
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
        <h2 style="color: #4F46E5;">Test Email from GetGetHired</h2>
        <p>Hello!</p>
        <div style="background-color: #F9FAFB; padding: 20px; border-radius: 8px; margin: 20px 0;">
          ${message.replace(/\n/g, '<br>')}
        </div>
        <p style="color: #6B7280; font-size: 12px;">
          Sent at: ${new Date().toLocaleString()}<br>
          Service: EmailIt API<br>
          From: ${emailItService.fromEmail}
        </p>
      </div>
    `;

    console.log(`🧪 Testing email send to: ${email}`);
    
    // Send email using EmailIt
    const result = await emailItService.sendEmail(email, subject, html, 'test');
    
    if (result.success) {
      return NextResponse.json({
        success: true,
        message: 'Email sent successfully!',
        messageId: result.messageId,
        details: {
          to: email,
          subject: subject,
          service: 'EmailIt',
          timestamp: new Date().toISOString()
        }
      });
    } else {
      console.error('EmailIt send failed:', result.error);
      return NextResponse.json(
        { 
          error: 'Failed to send email', 
          details: result.error,
          service: 'EmailIt'
        },
        { status: 500 }
      );
    }
    
  } catch (error) {
    console.error('Email test API error:', error);
    return NextResponse.json(
      { 
        error: 'Internal server error', 
        details: error.message 
      },
      { status: 500 }
    );
  }
}
