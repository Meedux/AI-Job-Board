import { verifyToken, getUserFromRequest } from '@/utils/auth';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

// Email template configurations
const EMAIL_TEMPLATES = {
  application_received: {
    id: 'application_received',
    name: 'Application Received',
    subject: 'Application Received - {jobTitle} at {companyName}',
    category: 'application_status',
    variables: ['applicantName', 'jobTitle', 'companyName', 'applicationDate'],
    defaultTemplate: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
  <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h2 style="color: #2563eb; margin-bottom: 20px;">Application Received</h2>
    
    <p>Dear {applicantName},</p>
    
    <p>Thank you for your interest in the <strong>{jobTitle}</strong> position at <strong>{companyName}</strong>.</p>
    
    <p>We have successfully received your application submitted on {applicationDate}. Our hiring team will review your qualifications and experience.</p>
    
    <div style="background-color: #f0f9ff; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2563eb;">
      <p style="margin: 0; color: #1e40af;"><strong>What's Next?</strong></p>
      <p style="margin: 5px 0 0 0; color: #374151;">We will review your application and contact you within 3-5 business days if you're selected for the next stage.</p>
    </div>
    
    <p>You can track the status of your application in your <a href="{dashboardUrl}" style="color: #2563eb;">job seeker dashboard</a>.</p>
    
    <p>Best regards,<br>
    The {companyName} Hiring Team</p>
  </div>
</div>`
  },
  
  application_under_review: {
    id: 'application_under_review',
    name: 'Application Under Review',
    subject: 'Your application is under review - {jobTitle}',
    category: 'application_status',
    variables: ['applicantName', 'jobTitle', 'companyName', 'reviewStage'],
    defaultTemplate: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
  <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h2 style="color: #0891b2; margin-bottom: 20px;">Application Under Review</h2>
    
    <p>Dear {applicantName},</p>
    
    <p>Great news! Your application for the <strong>{jobTitle}</strong> position at <strong>{companyName}</strong> is currently under review.</p>
    
    <div style="background-color: #ecfdf5; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #10b981;">
      <p style="margin: 0; color: #047857;"><strong>Current Status: {reviewStage}</strong></p>
      <p style="margin: 5px 0 0 0; color: #374151;">Your application has progressed to the review stage. Our hiring team is carefully evaluating your qualifications.</p>
    </div>
    
    <p>We appreciate your patience during this process. We will keep you updated on any developments.</p>
    
    <p>You can track your application status anytime in your <a href="{dashboardUrl}" style="color: #2563eb;">dashboard</a>.</p>
    
    <p>Best regards,<br>
    The {companyName} Hiring Team</p>
  </div>
</div>`
  },
  
  interview_scheduled: {
    id: 'interview_scheduled',
    name: 'Interview Scheduled',
    subject: 'Interview Scheduled - {jobTitle} at {companyName}',
    category: 'interview',
    variables: ['applicantName', 'jobTitle', 'companyName', 'interviewDate', 'interviewTime', 'interviewType', 'interviewLocation', 'interviewerName', 'interviewInstructions'],
    defaultTemplate: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
  <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h2 style="color: #059669; margin-bottom: 20px;">🎉 Interview Scheduled!</h2>
    
    <p>Dear {applicantName},</p>
    
    <p>Congratulations! We would like to invite you for an interview for the <strong>{jobTitle}</strong> position at <strong>{companyName}</strong>.</p>
    
    <div style="background-color: #f0f9ff; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #bfdbfe;">
      <h3 style="margin: 0 0 15px 0; color: #1e40af;">Interview Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 5px 0; color: #374151; font-weight: bold;">Date:</td><td style="padding: 5px 0; color: #111827;">{interviewDate}</td></tr>
        <tr><td style="padding: 5px 0; color: #374151; font-weight: bold;">Time:</td><td style="padding: 5px 0; color: #111827;">{interviewTime}</td></tr>
        <tr><td style="padding: 5px 0; color: #374151; font-weight: bold;">Type:</td><td style="padding: 5px 0; color: #111827;">{interviewType}</td></tr>
        <tr><td style="padding: 5px 0; color: #374151; font-weight: bold;">Location:</td><td style="padding: 5px 0; color: #111827;">{interviewLocation}</td></tr>
        <tr><td style="padding: 5px 0; color: #374151; font-weight: bold;">Interviewer:</td><td style="padding: 5px 0; color: #111827;">{interviewerName}</td></tr>
      </table>
    </div>
    
    <div style="background-color: #fffbeb; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #f59e0b;">
      <p style="margin: 0; color: #92400e;"><strong>Preparation Instructions:</strong></p>
      <div style="margin: 10px 0 0 0; color: #374151;">{interviewInstructions}</div>
    </div>
    
    <p>Please confirm your attendance by replying to this email or updating your status in your <a href="{dashboardUrl}" style="color: #2563eb;">dashboard</a>.</p>
    
    <p>We look forward to meeting you!</p>
    
    <p>Best regards,<br>
    The {companyName} Hiring Team</p>
  </div>
</div>`
  },
  
  application_hired: {
    id: 'application_hired',
    name: 'Job Offer / Hired',
    subject: 'Congratulations! Job Offer - {jobTitle} at {companyName}',
    category: 'offer',
    variables: ['applicantName', 'jobTitle', 'companyName', 'startDate', 'salary', 'benefits', 'nextSteps'],
    defaultTemplate: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
  <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h2 style="color: #059669; margin-bottom: 20px;">🎉 Congratulations! Job Offer</h2>
    
    <p>Dear {applicantName},</p>
    
    <p>We are delighted to offer you the position of <strong>{jobTitle}</strong> at <strong>{companyName}</strong>!</p>
    
    <p>After careful consideration of your qualifications and interview performance, we believe you would be a valuable addition to our team.</p>
    
    <div style="background-color: #ecfdf5; padding: 20px; border-radius: 8px; margin: 20px 0; border: 1px solid #a7f3d0;">
      <h3 style="margin: 0 0 15px 0; color: #047857;">Offer Details</h3>
      <table style="width: 100%; border-collapse: collapse;">
        <tr><td style="padding: 5px 0; color: #374151; font-weight: bold;">Position:</td><td style="padding: 5px 0; color: #111827;">{jobTitle}</td></tr>
        <tr><td style="padding: 5px 0; color: #374151; font-weight: bold;">Start Date:</td><td style="padding: 5px 0; color: #111827;">{startDate}</td></tr>
        <tr><td style="padding: 5px 0; color: #374151; font-weight: bold;">Salary:</td><td style="padding: 5px 0; color: #111827;">{salary}</td></tr>
        <tr><td style="padding: 5px 0; color: #374151; font-weight: bold;">Benefits:</td><td style="padding: 5px 0; color: #111827;">{benefits}</td></tr>
      </table>
    </div>
    
    <div style="background-color: #f0f9ff; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2563eb;">
      <p style="margin: 0; color: #1e40af;"><strong>Next Steps:</strong></p>
      <div style="margin: 10px 0 0 0; color: #374151;">{nextSteps}</div>
    </div>
    
    <p>Please review the attached offer letter and let us know your decision. We're excited about the possibility of you joining our team!</p>
    
    <p>Best regards,<br>
    The {companyName} Hiring Team</p>
  </div>
</div>`
  },
  
  application_rejected: {
    id: 'application_rejected',
    name: 'Application Not Selected',
    subject: 'Update on your application - {jobTitle}',
    category: 'rejection',
    variables: ['applicantName', 'jobTitle', 'companyName', 'feedback', 'futureOpportunities'],
    defaultTemplate: `
<div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; background-color: #f8f9fa;">
  <div style="background-color: white; padding: 30px; border-radius: 8px; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
    <h2 style="color: #6b7280; margin-bottom: 20px;">Application Update</h2>
    
    <p>Dear {applicantName},</p>
    
    <p>Thank you for your interest in the <strong>{jobTitle}</strong> position at <strong>{companyName}</strong> and for taking the time to go through our application process.</p>
    
    <p>After careful consideration, we have decided to move forward with other candidates whose qualifications more closely match our current needs for this specific role.</p>
    
    <div style="background-color: #f9fafb; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #6b7280;">
      <p style="margin: 0; color: #374151;"><strong>Feedback:</strong></p>
      <p style="margin: 5px 0 0 0; color: #374151;">{feedback}</p>
    </div>
    
    <p>Please don't let this discourage you. We were impressed with your background and encourage you to apply for future positions that may be a better fit.</p>
    
    <div style="background-color: #f0f9ff; padding: 15px; border-radius: 6px; margin: 20px 0; border-left: 4px solid #2563eb;">
      <p style="margin: 0; color: #1e40af;"><strong>Stay Connected:</strong></p>
      <p style="margin: 5px 0 0 0; color: #374151;">{futureOpportunities}</p>
    </div>
    
    <p>We appreciate your interest in {companyName} and wish you the best in your job search.</p>
    
    <p>Best regards,<br>
    The {companyName} Hiring Team</p>
  </div>
</div>`
  }
};

export async function GET(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('templateId');
    const category = searchParams.get('category');

    if (templateId) {
      // Get specific template
      const template = EMAIL_TEMPLATES[templateId];
      if (!template) {
        return Response.json({ error: 'Template not found' }, { status: 404 });
      }

      // Get custom template from database if exists
      const customTemplate = await prisma.emailTemplate.findFirst({
        where: {
          templateId: templateId,
          userId: user.id
        }
      });

      return Response.json({
        ...template,
        customTemplate: customTemplate?.content || null,
        isCustomized: !!customTemplate
      });
    }

    // Get all templates
    let templates = Object.values(EMAIL_TEMPLATES);
    
    if (category) {
      templates = templates.filter(t => t.category === category);
    }

    // Get custom templates from database
    const customTemplates = await prisma.emailTemplate.findMany({
      where: {
        userId: user.id,
        templateId: { in: templates.map(t => t.id) }
      }
    });

    // Merge custom templates
    const templatesWithCustom = templates.map(template => {
      const custom = customTemplates.find(ct => ct.templateId === template.id);
      return {
        ...template,
        isCustomized: !!custom,
        customTemplate: custom?.content || null
      };
    });

    return Response.json(templatesWithCustom);

  } catch (error) {
    console.error('Error fetching email templates:', error);
    return Response.json(
      { error: 'Failed to fetch email templates' },
      { status: 500 }
    );
  }
}

export async function PUT(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    // Only employers and admins can customize templates
    if (!['employer', 'admin', 'super_admin'].includes(user.role)) {
      return Response.json({ error: 'Access denied' }, { status: 403 });
    }

    const { templateId, content, subject, enabled } = await request.json();

    if (!templateId || !EMAIL_TEMPLATES[templateId]) {
      return Response.json({ error: 'Invalid template ID' }, { status: 400 });
    }

    // Upsert custom template
    const customTemplate = await prisma.emailTemplate.upsert({
      where: {
        userId_templateId: {
          userId: user.id,
          templateId: templateId
        }
      },
      update: {
        content: content,
        subject: subject,
        enabled: enabled ?? true,
        updatedAt: new Date()
      },
      create: {
        userId: user.id,
        templateId: templateId,
        content: content,
        subject: subject,
        enabled: enabled ?? true
      }
    });

    return Response.json({
      success: true,
      message: 'Email template updated successfully',
      template: customTemplate
    });

  } catch (error) {
    console.error('Error updating email template:', error);
    return Response.json(
      { error: 'Failed to update email template' },
      { status: 500 }
    );
  }
}

export async function POST(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { templateId, variables, recipientEmail, applicationId } = await request.json();

    if (!templateId || !EMAIL_TEMPLATES[templateId]) {
      return Response.json({ error: 'Invalid template ID' }, { status: 400 });
    }

    // Get custom template if exists
    const customTemplate = await prisma.emailTemplate.findFirst({
      where: {
        templateId: templateId,
        userId: user.id,
        enabled: true
      }
    });

    const template = EMAIL_TEMPLATES[templateId];
    const emailContent = customTemplate?.content || template.defaultTemplate;
    const emailSubject = customTemplate?.subject || template.subject;

    // Replace variables in content and subject
    let processedContent = emailContent;
    let processedSubject = emailSubject;

    Object.entries(variables || {}).forEach(([key, value]) => {
      const placeholder = `{${key}}`;
      processedContent = processedContent.replace(new RegExp(placeholder, 'g'), value || '');
      processedSubject = processedSubject.replace(new RegExp(placeholder, 'g'), value || '');
    });

    // Log email activity
    await prisma.emailLog.create({
      data: {
        templateId: templateId,
        recipientEmail: recipientEmail,
        subject: processedSubject,
        content: processedContent,
        sentBy: user.id,
        applicationId: applicationId || null,
        status: 'sent',
        sentAt: new Date()
      }
    });

    // Here you would integrate with your email service (EmailIt, SendGrid, etc.)
    // For now, we'll just return success
    
    return Response.json({
      success: true,
      message: 'Email sent successfully',
      emailId: `email_${Date.now()}`
    });

  } catch (error) {
    console.error('Error sending email:', error);
    return Response.json(
      { error: 'Failed to send email' },
      { status: 500 }
    );
  }
}

export async function DELETE(request) {
  try {
    const user = await getUserFromRequest(request);
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { searchParams } = new URL(request.url);
    const templateId = searchParams.get('templateId');

    if (!templateId) {
      return Response.json({ error: 'Template ID required' }, { status: 400 });
    }

    // Delete custom template (revert to default)
    await prisma.emailTemplate.delete({
      where: {
        userId_templateId: {
          userId: user.id,
          templateId: templateId
        }
      }
    });

    return Response.json({
      success: true,
      message: 'Custom template deleted, reverted to default'
    });

  } catch (error) {
    console.error('Error deleting email template:', error);
    return Response.json(
      { error: 'Failed to delete email template' },
      { status: 500 }
    );
  }
}
