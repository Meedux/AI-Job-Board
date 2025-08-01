// External Email Verification Service using Mailgun API
// Super reliable, easy setup, and great for production!

import formData from 'form-data';
import Mailgun from 'mailgun.js';
import { logEmailNotification, logError } from './dataLogger';

class ExternalEmailService {
  constructor() {
    this.apiKey = process.env.MAILGUN_API_KEY;
    this.domain = process.env.MAILGUN_DOMAIN;
    this.enabled = !!(this.apiKey && this.domain);
    this.fromEmail = process.env.FROM_EMAIL || 'noreply@yourdomain.com';
    this.companyName = process.env.COMPANY_NAME || 'JobSite';
    
    // Initialize Mailgun
    if (this.enabled) {
      const mailgun = new Mailgun(formData);
      this.mg = mailgun.client({
        username: 'api',
        key: this.apiKey,
        url: 'https://api.mailgun.net' // or 'https://api.eu.mailgun.net' for EU
      });
    }
  }

  // Send email verification
  async sendVerificationEmail(email, token, name) {
    if (!this.enabled) {
      console.log('⚠️ Mailgun email service disabled - missing MAILGUN_API_KEY or MAILGUN_DOMAIN');
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const verificationUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/api/auth/verify-email?token=${token}`;
      
      const messageData = {
        from: `${this.companyName} <${this.fromEmail}>`,
        to: email,
        subject: `Verify your email - ${this.companyName}`,
        html: this.getVerificationEmailTemplate(name, verificationUrl),
      };

      const result = await this.mg.messages.create(this.domain, messageData);
      
      console.log('✅ Verification email sent via Mailgun:', result.id);
      await logEmailNotification(
        'email_verification',
        email,
        'Email Verification',
        'sent',
        'mailgun',
        result.id
      );

      return { success: true, messageId: result.id };
    } catch (error) {
      console.error('❌ Mailgun API error:', error);
      
      // Extract meaningful error message
      const errorMessage = error.message || 'Failed to send email';
      
      await logEmailNotification(
        'email_verification',
        email,
        'Email Verification',
        'failed',
        'mailgun',
        null,
        errorMessage
      );
      
      await logError(
        'EXTERNAL_EMAIL_SEND_ERROR',
        'external-email-service',
        errorMessage,
        error.stack,
        null,
        { email, service: 'mailgun' },
        'error'
      );
      
      return { success: false, message: errorMessage };
    }
  }

  // Send password reset email
  async sendPasswordResetEmail(email, token, name) {
    if (!this.enabled) {
      console.log('⚠️ Mailgun email service disabled - missing MAILGUN_API_KEY or MAILGUN_DOMAIN');
      return { success: false, message: 'Email service not configured' };
    }

    try {
      const resetUrl = `${process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000'}/reset-password?token=${token}`;
      
      const messageData = {
        from: `${this.companyName} <${this.fromEmail}>`,
        to: email,
        subject: `Reset your password - ${this.companyName}`,
        html: this.getPasswordResetEmailTemplate(name, resetUrl),
      };

      const result = await this.mg.messages.create(this.domain, messageData);

      console.log('✅ Password reset email sent via Mailgun:', result.id);
      return { success: true, messageId: result.id };
    } catch (error) {
      console.error('❌ Mailgun API error:', error);
      const errorMessage = error.message || 'Failed to send email';
      return { success: false, message: errorMessage };
    }
  }

  // Email verification template
  getVerificationEmailTemplate(name, verificationUrl) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Verify Your Email - ${this.companyName}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f8f9fa;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        .content {
          padding: 40px 30px;
        }
        .button {
          display: inline-block;
          background: #667eea;
          color: white;
          text-decoration: none;
          padding: 15px 30px;
          border-radius: 6px;
          font-weight: bold;
          margin: 20px 0;
        }
        .footer {
          background: #f8f9fa;
          padding: 20px 30px;
          text-align: center;
          color: #666;
          font-size: 14px;
        }
        .icon {
          font-size: 48px;
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="icon">✉️</div>
          <h1>Welcome to ${this.companyName}!</h1>
          <p>Just one more step to get started</p>
        </div>
        
        <div class="content">
          <h2>Hi ${name || 'there'}! 👋</h2>
          
          <p>Thanks for signing up for ${this.companyName}! To complete your registration and start using your account, please verify your email address by clicking the button below:</p>
          
          <div style="text-align: center;">
            <a href="${verificationUrl}" class="button">
              ✅ Verify My Email
            </a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace;">
            ${verificationUrl}
          </p>
          
          <p><strong>This link will expire in 24 hours</strong> for security reasons.</p>
          
          <p>If you didn't create an account with us, you can safely ignore this email.</p>
          
          <p>Best regards,<br>The ${this.companyName} Team</p>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${this.companyName}. All rights reserved.</p>
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  // Password reset email template
  getPasswordResetEmailTemplate(name, resetUrl) {
    return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Reset Your Password - ${this.companyName}</title>
      <style>
        body {
          font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
          line-height: 1.6;
          color: #333;
          background-color: #f8f9fa;
          margin: 0;
          padding: 20px;
        }
        .container {
          max-width: 600px;
          margin: 0 auto;
          background: white;
          border-radius: 8px;
          box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
          overflow: hidden;
        }
        .header {
          background: linear-gradient(135deg, #ff6b6b 0%, #ee5a24 100%);
          color: white;
          padding: 40px 30px;
          text-align: center;
        }
        .content {
          padding: 40px 30px;
        }
        .button {
          display: inline-block;
          background: #ff6b6b;
          color: white;
          text-decoration: none;
          padding: 15px 30px;
          border-radius: 6px;
          font-weight: bold;
          margin: 20px 0;
        }
        .footer {
          background: #f8f9fa;
          padding: 20px 30px;
          text-align: center;
          color: #666;
          font-size: 14px;
        }
        .icon {
          font-size: 48px;
          margin-bottom: 20px;
        }
      </style>
    </head>
    <body>
      <div class="container">
        <div class="header">
          <div class="icon">🔑</div>
          <h1>Password Reset Request</h1>
          <p>Let's get you back into your account</p>
        </div>
        
        <div class="content">
          <h2>Hi ${name || 'there'}! 👋</h2>
          
          <p>We received a request to reset your password for your ${this.companyName} account. Click the button below to create a new password:</p>
          
          <div style="text-align: center;">
            <a href="${resetUrl}" class="button">
              🔑 Reset My Password
            </a>
          </div>
          
          <p>Or copy and paste this link into your browser:</p>
          <p style="word-break: break-all; background: #f8f9fa; padding: 10px; border-radius: 4px; font-family: monospace;">
            ${resetUrl}
          </p>
          
          <p><strong>This link will expire in 1 hour</strong> for security reasons.</p>
          
          <p>If you didn't request a password reset, you can safely ignore this email. Your password won't be changed.</p>
          
          <p>Best regards,<br>The ${this.companyName} Team</p>
        </div>
        
        <div class="footer">
          <p>© ${new Date().getFullYear()} ${this.companyName}. All rights reserved.</p>
          <p>This is an automated email. Please do not reply to this message.</p>
        </div>
      </div>
    </body>
    </html>
    `;
  }

  // Test email service connection
  async testConnection() {
    if (!this.enabled) {
      return { success: false, message: 'MAILGUN_API_KEY or MAILGUN_DOMAIN not provided' };
    }

    try {
      // Send a test email to verify the service works
      const messageData = {
        from: `${this.companyName} <${this.fromEmail}>`,
        to: this.fromEmail, // Send to self for testing
        subject: 'Mailgun Email Service Test',
        html: '<p>🎉 This is a test email to verify the Mailgun email service is working correctly!</p>',
      };

      const result = await this.mg.messages.create(this.domain, messageData);

      return { success: true, messageId: result.id };
    } catch (error) {
      const errorMessage = error.message || 'Failed to test email service';
      return { success: false, message: errorMessage };
    }
  }
}

// Export singleton instance
export const externalEmailService = new ExternalEmailService();

// Export convenience functions
export const sendVerificationEmail = (email, token, name) => 
  externalEmailService.sendVerificationEmail(email, token, name);

export const sendPasswordResetEmail = (email, token, name) => 
  externalEmailService.sendPasswordResetEmail(email, token, name);

export const testEmailConnection = () => 
  externalEmailService.testConnection();

// Export class for testing
export { ExternalEmailService };
