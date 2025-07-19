// Email notification utility using Nodemailer
// Supports SMTP, Gmail, and other email services

import nodemailer from 'nodemailer';
import { logEmailNotification, logError, logSystemEvent } from './dataLogger';
import { createNotification, NOTIFICATION_TYPES, CATEGORIES, PRIORITY } from './notificationService';
import { 
  jobAlertTemplate, 
  resumeAlertTemplate, 
  notificationTemplate, 
  welcomeTemplate 
} from './emailTemplates';

class EmailNotificationService {
  constructor() {
    this.enabled = process.env.EMAIL_NOTIFICATIONS_ENABLED === 'true';
    this.fromEmail = process.env.EMAIL_FROM || 'noreply@getgethired.com';
    this.adminEmails = [
      'admin@getgethired.com',
      'support@getgethired.com'
    ];
    this.adminDomains = [
      'getgethired.com'
    ];
    
    // Initialize the transporter (will be null for async creation like Ethereal)
    this.transporter = this.createTransporter();
    this.isTransporterReady = !this.enabled || !!this.transporter;
  }

  // Create email transporter based on environment configuration
  createTransporter() {
    if (!this.enabled) {
      return null;
    }

    // Gmail configuration (most common)
    if (process.env.EMAIL_SERVICE === 'gmail') {
      return nodemailer.createTransporter({
        service: 'gmail',
        auth: {
          user: process.env.EMAIL_USER, // your gmail address
          pass: process.env.EMAIL_APP_PASSWORD // gmail app password (not regular password)
        }
      });
    }

    // SMTP configuration (generic - works with most providers)
    if (process.env.SMTP_HOST) {
      return nodemailer.createTransporter({
        host: process.env.SMTP_HOST, // e.g., smtp.gmail.com, smtp.mailgun.org
        port: parseInt(process.env.SMTP_PORT) || 587,
        secure: process.env.SMTP_SECURE === 'true', // true for 465, false for other ports
        auth: {
          user: process.env.SMTP_USER,
          pass: process.env.SMTP_PASSWORD
        }
      });
    }

    // Ethereal Email (for testing - creates fake accounts)
    if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST && !process.env.EMAIL_SERVICE) {
      console.log('📧 Development mode: Will use Ethereal Email for testing');
      return null; // Will be created async in ensureTransporter
    }

    // Fallback to console logging if no email service configured
    console.log('⚠️ No email service configured. Set EMAIL_SERVICE=gmail or SMTP_* variables.');
    return null;
  }

  // Create Ethereal Email transporter for testing
  async createEtherealTransporter() {
    try {
      const testAccount = await nodemailer.createTestAccount();
      
      const transporter = nodemailer.createTransporter({
        host: 'smtp.ethereal.email',
        port: 587,
        secure: false,
        auth: {
          user: testAccount.user,
          pass: testAccount.pass
        }
      });

      console.log('📧 Ethereal Email account created for testing:');
      console.log('📧 User:', testAccount.user);
      console.log('📧 Password:', testAccount.pass);
      console.log('📧 Preview emails at: https://ethereal.email');

      return transporter;
    } catch (error) {
      console.error('Failed to create Ethereal account:', error);
      return null;
    }
  }

  // Ensure transporter is ready (create Ethereal if needed)
  async ensureTransporter() {
    if (this.transporter) {
      return this.transporter;
    }

    if (process.env.NODE_ENV === 'development' && !process.env.SMTP_HOST && !process.env.EMAIL_SERVICE) {
      this.transporter = await this.createEtherealTransporter();
      this.isTransporterReady = true;
      return this.transporter;
    }

    return null;
  }

  // Real email sending function using Nodemailer
  async sendEmail({ to, subject, text, html }) {
    if (!this.enabled) {
      console.log('📧 Email notifications disabled');
      // Log disabled email attempt
      await logEmailNotification(
        'generic',
        to,
        subject,
        'disabled',
        'nodemailer',
        null,
        'Email notifications disabled'
      ).catch(console.error);
      return { success: false, reason: 'disabled' };
    }

    // Ensure transporter is ready
    const transporter = await this.ensureTransporter();
    
    if (!transporter) {
      console.log('📧 No email transporter configured');
      // Log configuration error
      await logEmailNotification(
        'generic',
        to,
        subject,
        'failed',
        'nodemailer',
        null,
        'No email transporter configured'
      ).catch(console.error);
      return { success: false, reason: 'no_transporter' };
    }

    try {
      const mailOptions = {
        from: `"GetGetHired" <${this.fromEmail}>`,
        to,
        subject,
        text: text || html?.replace(/<[^>]*>/g, ''), // Strip HTML for text version
        html: html || text?.replace(/\n/g, '<br>') // Convert text to HTML if needed
      };

      const info = await transporter.sendMail(mailOptions);
      
      console.log('📧 Email sent successfully to:', to);
      console.log('📧 Message ID:', info.messageId);
      
      // Log preview URL for Ethereal emails
      if (process.env.NODE_ENV === 'development') {
        const previewUrl = nodemailer.getTestMessageUrl(info);
        if (previewUrl) {
          console.log('📧 Preview URL:', previewUrl);
        }
      }

      // Log successful email
      await logEmailNotification(
        'generic',
        to,
        subject,
        'success',
        'nodemailer',
        info.messageId,
        null
      ).catch(console.error);

      // Create notification for successful email
      try {
        await createNotification({
          type: NOTIFICATION_TYPES.EMAIL_SENT,
          title: 'Email Sent Successfully',
          message: `Email sent to ${to}: ${subject}`,
          category: CATEGORIES.EMAIL,
          priority: PRIORITY.LOW,
          metadata: { 
            recipient: to, 
            subject, 
            messageId: info.messageId,
            service: 'nodemailer'
          }
        });
      } catch (notificationError) {
        console.error('Failed to create email notification:', notificationError);
      }

      return { 
        success: true, 
        messageId: info.messageId,
        previewUrl: nodemailer.getTestMessageUrl(info)
      };
    } catch (error) {
      console.error('📧 Failed to send email to:', to, error);
      
      // Log failed email
      await logEmailNotification(
        'generic',
        to,
        subject,
        'failed',
        'nodemailer',
        null,
        error.message
      ).catch(console.error);
      
      // Create notification for failed email
      try {
        await createNotification({
          type: NOTIFICATION_TYPES.EMAIL_FAILED,
          title: 'Email Delivery Failed',
          message: `Failed to send email to ${to}: ${error.message}`,
          category: CATEGORIES.EMAIL,
          priority: PRIORITY.HIGH,
          metadata: { 
            recipient: to, 
            subject, 
            error: error.message,
            service: 'nodemailer'
          }
        });
      } catch (notificationError) {
        console.error('Failed to create email failure notification:', notificationError);
      }
      
      // Log error details
      await logError(
        'EMAIL_SEND_ERROR',
        'emailService',
        error.message,
        error.stack,
        null,
        { to, subject },
        'error'
      ).catch(console.error);
      return { 
        success: false, 
        error: error.message 
      };
    }
  }

  // Send notification to admins about new user registration
  async notifyNewUserRegistration(userData) {
    const subject = 'New User Registration - GetGetHired';
    const text = `
A new user has registered on GetGetHired:

Name: ${userData.fullName}
Email: ${userData.email}
Nickname: ${userData.nickname || 'Not provided'}
Age: ${userData.age}
Registration Date: ${new Date().toLocaleString()}

View user details in the admin dashboard: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin
    `;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #111827; color: #e5e7eb; padding: 20px; border-radius: 8px;">
        <h2 style="color: #3b82f6; margin-bottom: 20px;">New User Registration</h2>
        <p>A new user has registered on GetGetHired:</p>
        
        <div style="background: #1f2937; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <p><strong>Name:</strong> ${userData.fullName}</p>
          <p><strong>Email:</strong> ${userData.email}</p>
          <p><strong>Nickname:</strong> ${userData.nickname || 'Not provided'}</p>
          <p><strong>Age:</strong> ${userData.age}</p>
          <p><strong>Registration Date:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <p>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin" 
             style="background: #3b82f6; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Admin Dashboard
          </a>
        </p>
      </div>
    `;

    // Log system event
    await logSystemEvent(
      'EMAIL_NOTIFICATION',
      'emailService',
      `Sending new user registration notification for ${userData.email}`,
      'info',
      { userEmail: userData.email, userFullName: userData.fullName }
    ).catch(console.error);

    const results = [];
    for (const adminEmail of this.adminEmails) {
      try {
        const result = await this.sendEmail({
          to: adminEmail,
          subject,
          text,
          html
        });
        
        // Log specific email notification
        await logEmailNotification(
          'user_registration',
          adminEmail,
          subject,
          result.success ? 'success' : 'failed',
          'nodemailer',
          result.messageId,
          result.success ? null : result.error
        ).catch(console.error);
        
        results.push({ email: adminEmail, ...result });
      } catch (error) {
        // Log failed email notification
        await logEmailNotification(
          'user_registration',
          adminEmail,
          subject,
          'failed',
          'nodemailer',
          null,
          error.message
        ).catch(console.error);
        
        results.push({ email: adminEmail, success: false, error: error.message });
      }
    }

    return results;
  }

  // Send notification about new job posting
  async notifyNewJobPosting(jobData) {
    const subject = 'New Job Posted - GetGetHired';
    const text = `
A new job has been posted on GetGetHired:

Title: ${jobData.title}
Company: ${jobData.company}
Location: ${jobData.location}
Type: ${jobData.type}
Level: ${jobData.level}
Posted: ${new Date().toLocaleString()}

View job details in the admin dashboard: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin
    `;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #111827; color: #e5e7eb; padding: 20px; border-radius: 8px;">
        <h2 style="color: #10b981; margin-bottom: 20px;">New Job Posted</h2>
        <p>A new job has been posted on GetGetHired:</p>
        
        <div style="background: #1f2937; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <p><strong>Title:</strong> ${jobData.title}</p>
          <p><strong>Company:</strong> ${jobData.company}</p>
          <p><strong>Location:</strong> ${jobData.location}</p>
          <p><strong>Type:</strong> ${jobData.type}</p>
          <p><strong>Level:</strong> ${jobData.level}</p>
          <p><strong>Posted:</strong> ${new Date().toLocaleString()}</p>
        </div>
        
        <p>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin" 
             style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Admin Dashboard
          </a>
        </p>
      </div>
    `;

    const results = [];
    for (const adminEmail of this.adminEmails) {
      const result = await this.sendEmail({
        to: adminEmail,
        subject,
        text,
        html
      });
      results.push({ email: adminEmail, ...result });
    }

    return results;
  }

  // Send notification about system events
  async notifySystemEvent(eventType, message, details = {}) {
    const subject = `System Event: ${eventType} - GetGetHired`;
    const text = `
System Event Notification:

Event: ${eventType}
Message: ${message}
Time: ${new Date().toLocaleString()}
Details: ${JSON.stringify(details, null, 2)}

Check the admin dashboard: ${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin
    `;

    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #111827; color: #e5e7eb; padding: 20px; border-radius: 8px;">
        <h2 style="color: #f59e0b; margin-bottom: 20px;">System Event</h2>
        
        <div style="background: #1f2937; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <p><strong>Event:</strong> ${eventType}</p>
          <p><strong>Message:</strong> ${message}</p>
          <p><strong>Time:</strong> ${new Date().toLocaleString()}</p>
          ${Object.keys(details).length > 0 ? `<p><strong>Details:</strong></p><pre style="background: #374151; padding: 10px; border-radius: 4px; overflow-x: auto;">${JSON.stringify(details, null, 2)}</pre>` : ''}
        </div>
        
        <p>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin" 
             style="background: #f59e0b; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            View Admin Dashboard
          </a>
        </p>
      </div>
    `;

    const results = [];
    for (const adminEmail of this.adminEmails) {
      const result = await this.sendEmail({
        to: adminEmail,
        subject,
        text,
        html
      });
      results.push({ email: adminEmail, ...result });
    }

    return results;
  }

  // Send custom email to specific recipients
  async sendCustomEmail({ to, subject, message, isHtml = false }) {
    const emailData = {
      to: Array.isArray(to) ? to : [to],
      subject,
    };

    if (isHtml) {
      emailData.html = message;
    } else {
      emailData.text = message;
    }

    const results = [];
    for (const recipient of emailData.to) {
      const result = await this.sendEmail({
        ...emailData,
        to: recipient
      });
      results.push({ email: recipient, ...result });
    }

    return results;
  }

  // Test email functionality
  async sendTestEmail(toEmail) {
    const subject = 'Test Email - GetGetHired Email Service';
    const html = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; background: #111827; color: #e5e7eb; padding: 20px; border-radius: 8px;">
        <h2 style="color: #10b981; margin-bottom: 20px;">🎉 Email Service Test</h2>
        <p>Congratulations! Your GetGetHired email service is working correctly.</p>
        
        <div style="background: #1f2937; padding: 15px; border-radius: 6px; margin: 15px 0;">
          <p><strong>Test Details:</strong></p>
          <p>✅ Email service: Active</p>
          <p>✅ SMTP connection: Working</p>
          <p>✅ Template rendering: Functional</p>
          <p>✅ Time sent: ${new Date().toLocaleString()}</p>
        </div>
        
        <p>
          <a href="${process.env.NEXT_PUBLIC_SITE_URL || 'http://localhost:3000'}/admin" 
             style="background: #10b981; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px; display: inline-block;">
            Return to Admin Dashboard
          </a>
        </p>
        
        <hr style="border: 1px solid #374151; margin: 20px 0;">
        <p style="font-size: 12px; color: #9ca3af;">
          This is a test email from GetGetHired admin system. If you received this email unexpectedly, please ignore it.
        </p>
      </div>
    `;

    return await this.sendEmail({
      to: toEmail,
      subject,
      html
    });
  }

  // Verify email service configuration
  async verifyConnection() {
    if (!this.enabled) {
      return { success: false, message: 'Email service is disabled' };
    }

    const transporter = await this.ensureTransporter();
    
    if (!transporter) {
      return { success: false, message: 'No email transporter configured' };
    }

    try {
      await transporter.verify();
      return { success: true, message: 'Email service connection verified' };
    } catch (error) {
      return { success: false, message: `Connection failed: ${error.message}` };
    }
  }

  // Enhanced job alert email
  async sendJobAlert({ user, jobs, alertType = 'new_jobs', stats = {} }) {
    if (!user || !user.email) {
      throw new Error('User email is required for job alerts');
    }

    const subject = {
      new_jobs: `🚀 ${jobs.length} New Job${jobs.length !== 1 ? 's' : ''} Found!`,
      daily_digest: `📊 Daily Job Digest - ${jobs.length} Opportunities`,
      weekly_digest: `📈 Weekly Job Digest - ${jobs.length} Opportunities`
    }[alertType] || 'Job Alert';

    const html = jobAlertTemplate({ 
      jobs, 
      user, 
      subscription: user.subscription,
      alertType,
      stats
    });

    try {
      const result = await this.sendEmail({
        to: user.email,
        subject,
        html
      });

      // Log job alert sent
      await logEmailNotification(
        'job_alert',
        user.email,
        subject,
        'success',
        'nodemailer',
        result.messageId,
        null,
        { 
          userId: user.id,
          alertType,
          jobCount: jobs.length,
          stats
        }
      ).catch(console.error);

      return result;
    } catch (error) {
      // Log job alert failed
      await logEmailNotification(
        'job_alert',
        user.email,
        subject,
        'failed',
        'nodemailer',
        null,
        error.message,
        { 
          userId: user.id,
          alertType,
          jobCount: jobs.length
        }
      ).catch(console.error);

      throw error;
    }
  }

  // Resume alert email for employers
  async sendResumeAlert({ user, candidates, job }) {
    if (!user || !user.email) {
      throw new Error('User email is required for resume alerts');
    }

    const subject = `👥 ${candidates.length} New Candidate${candidates.length !== 1 ? 's' : ''} Found${job ? ` for "${job.title}"` : ''}`;

    const html = resumeAlertTemplate({ 
      candidates, 
      user, 
      job
    });

    try {
      const result = await this.sendEmail({
        to: user.email,
        subject,
        html
      });

      // Log resume alert sent
      await logEmailNotification(
        'resume_alert',
        user.email,
        subject,
        'success',
        'nodemailer',
        result.messageId,
        null,
        { 
          userId: user.id,
          candidateCount: candidates.length,
          jobId: job?.id
        }
      ).catch(console.error);

      return result;
    } catch (error) {
      // Log resume alert failed
      await logEmailNotification(
        'resume_alert',
        user.email,
        subject,
        'failed',
        'nodemailer',
        null,
        error.message,
        { 
          userId: user.id,
          candidateCount: candidates.length,
          jobId: job?.id
        }
      ).catch(console.error);

      throw error;
    }
  }

  // General notification email
  async sendNotification({ user, type, title, message, actionUrl, actionText }) {
    if (!user || !user.email) {
      throw new Error('User email is required for notifications');
    }

    const subject = title;
    const html = notificationTemplate({ 
      type, 
      title, 
      message, 
      user, 
      actionUrl, 
      actionText 
    });

    try {
      const result = await this.sendEmail({
        to: user.email,
        subject,
        html
      });

      // Log notification sent
      await logEmailNotification(
        'notification',
        user.email,
        subject,
        'success',
        'nodemailer',
        result.messageId,
        null,
        { 
          userId: user.id,
          notificationType: type,
          actionUrl
        }
      ).catch(console.error);

      return result;
    } catch (error) {
      // Log notification failed
      await logEmailNotification(
        'notification',
        user.email,
        subject,
        'failed',
        'nodemailer',
        null,
        error.message,
        { 
          userId: user.id,
          notificationType: type
        }
      ).catch(console.error);

      throw error;
    }
  }

  // Welcome email
  async sendWelcomeEmail({ user, isEmployer = false }) {
    if (!user || !user.email) {
      throw new Error('User email is required for welcome email');
    }

    const subject = isEmployer ? 
      '🎉 Welcome to GetGetHired for Employers!' : 
      '🎉 Welcome to GetGetHired!';

    const html = welcomeTemplate({ user, isEmployer });

    try {
      const result = await this.sendEmail({
        to: user.email,
        subject,
        html
      });

      // Log welcome email sent
      await logEmailNotification(
        'welcome',
        user.email,
        subject,
        'success',
        'nodemailer',
        result.messageId,
        null,
        { 
          userId: user.id,
          isEmployer
        }
      ).catch(console.error);

      return result;
    } catch (error) {
      // Log welcome email failed
      await logEmailNotification(
        'welcome',
        user.email,
        subject,
        'failed',
        'nodemailer',
        null,
        error.message,
        { 
          userId: user.id,
          isEmployer
        }
      ).catch(console.error);

      throw error;
    }
  }

  // Bulk job alert sending
  async sendBulkJobAlerts({ userList, jobs, alertType = 'new_jobs', stats = {} }) {
    const results = [];
    
    for (const user of userList) {
      try {
        const result = await this.sendJobAlert({
          user,
          jobs,
          alertType,
          stats
        });
        results.push({ 
          user: user.email, 
          success: true, 
          messageId: result.messageId 
        });
      } catch (error) {
        console.error(`Failed to send job alert to ${user.email}:`, error);
        results.push({ 
          user: user.email, 
          success: false, 
          error: error.message 
        });
      }
    }

    // Log bulk sending summary
    const successful = results.filter(r => r.success).length;
    const failed = results.filter(r => !r.success).length;

    await logSystemEvent(
      'bulk_job_alerts',
      `Sent job alerts to ${successful} users, ${failed} failed`,
      { 
        totalUsers: userList.length,
        successful,
        failed,
        alertType,
        jobCount: jobs.length
      }
    ).catch(console.error);

    return results;
  }
}

// Export singleton instance
export const emailService = new EmailNotificationService();

// Export class for testing
export { EmailNotificationService };
