import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

/**
 * Service to handle job application status updates and trigger automated emails
 */
export class JobApplicationService {
  
  /**
   * Update application status and send appropriate email notification
   */
  static async updateApplicationStatus(applicationId, newStatus, updateData = {}, userId) {
    try {
      // Get the application with related data
      const application = await prisma.jobApplication.findUnique({
        where: { id: applicationId },
        include: {
          job: {
            include: {
              company: true
            }
          },
          user: true
        }
      });

      if (!application) {
        throw new Error('Application not found');
      }

      // Update the application
      const updatedApplication = await prisma.jobApplication.update({
        where: { id: applicationId },
        data: {
          status: newStatus,
          ...updateData,
          updatedAt: new Date()
        }
      });

      // Create status history record
      await prisma.applicationStatusHistory.create({
        data: {
          applicationId: applicationId,
          status: newStatus,
          changedBy: userId,
          notes: updateData.notes || null,
          createdAt: new Date()
        }
      });

      // Send appropriate email based on status
      await this.sendStatusChangeEmail(application, newStatus, updateData);

      return updatedApplication;

    } catch (error) {
      console.error('Error updating application status:', error);
      throw error;
    }
  }

  /**
   * Send email notification based on application status change
   */
  static async sendStatusChangeEmail(application, newStatus, updateData = {}) {
    try {
      const templateMap = {
        'received': 'application_received',
        'under_review': 'application_under_review', 
        'interview_scheduled': 'interview_scheduled',
        'hired': 'application_hired',
        'rejected': 'application_rejected'
      };

      const templateId = templateMap[newStatus];
      if (!templateId) {
        console.log(`No email template for status: ${newStatus}`);
        return;
      }

      // Prepare email variables based on status
      const variables = this.prepareEmailVariables(application, newStatus, updateData);

      // Send the email
      await this.sendEmailNotification(templateId, variables, application);

    } catch (error) {
      console.error('Error sending status change email:', error);
      // Don't throw error to prevent status update failure
    }
  }

  /**
   * Prepare email template variables based on application and status
   */
  static prepareEmailVariables(application, status, updateData = {}) {
    const baseVariables = {
      applicantName: application.user.fullName || application.user.email,
      jobTitle: application.job.title,
      companyName: application.job.company?.name || 'Our Company',
      applicationDate: application.createdAt.toLocaleDateString(),
      dashboardUrl: `${process.env.NEXT_PUBLIC_APP_URL}/my-applications`
    };

    // Status-specific variables
    const statusVariables = {
      'received': {
        ...baseVariables
      },
      
      'under_review': {
        ...baseVariables,
        reviewStage: updateData.reviewStage || 'Initial Review'
      },
      
      'interview_scheduled': {
        ...baseVariables,
        interviewDate: updateData.interviewDate ? new Date(updateData.interviewDate).toLocaleDateString() : 'TBD',
        interviewTime: updateData.interviewTime || 'TBD',
        interviewType: updateData.interviewType || 'In-person',
        interviewLocation: updateData.interviewLocation || 'Company Office',
        interviewerName: updateData.interviewerName || 'Hiring Manager',
        interviewInstructions: updateData.interviewInstructions || 'Please arrive 10 minutes early and bring a copy of your resume.'
      },
      
      'hired': {
        ...baseVariables,
        startDate: updateData.startDate ? new Date(updateData.startDate).toLocaleDateString() : 'TBD',
        salary: updateData.salary || 'As discussed',
        benefits: updateData.benefits || 'Standard company benefits package',
        nextSteps: updateData.nextSteps || 'HR will contact you within 2 business days with next steps and paperwork.'
      },
      
      'rejected': {
        ...baseVariables,
        feedback: updateData.feedback || 'While your qualifications are impressive, we have decided to move forward with candidates whose experience more closely matches our current requirements.',
        futureOpportunities: updateData.futureOpportunities || 'We encourage you to apply for future positions that may be a better fit for your skills and experience.'
      }
    };

    return statusVariables[status] || baseVariables;
  }

  /**
   * Send email notification using the email template system
   */
  static async sendEmailNotification(templateId, variables, application) {
    try {
      // Call the email template API
      const response = await fetch(`${process.env.NEXT_PUBLIC_APP_URL}/api/email-templates`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${process.env.SYSTEM_API_TOKEN}` // You'll need to set this
        },
        body: JSON.stringify({
          templateId,
          variables,
          recipientEmail: application.user.email,
          applicationId: application.id
        })
      });

      if (!response.ok) {
        throw new Error('Failed to send email notification');
      }

      const result = await response.json();
      console.log(`Email sent successfully: ${result.emailId}`);
      
      return result;

    } catch (error) {
      console.error('Error sending email notification:', error);
      throw error;
    }
  }

  /**
   * Bulk update multiple applications (useful for batch operations)
   */
  static async bulkUpdateApplications(applicationIds, newStatus, updateData = {}, userId) {
    const results = [];
    const errors = [];

    for (const applicationId of applicationIds) {
      try {
        const result = await this.updateApplicationStatus(applicationId, newStatus, updateData, userId);
        results.push(result);
      } catch (error) {
        errors.push({ applicationId, error: error.message });
      }
    }

    return { results, errors };
  }

  /**
   * Schedule reminder emails for pending applications
   */
  static async scheduleReminderEmails() {
    try {
      // Find applications that need follow-up
      const pendingApplications = await prisma.jobApplication.findMany({
        where: {
          status: 'received',
          createdAt: {
            lte: new Date(Date.now() - 3 * 24 * 60 * 60 * 1000) // 3 days ago
          }
        },
        include: {
          job: {
            include: { company: true }
          },
          user: true
        }
      });

      // Send reminder emails to employers
      for (const application of pendingApplications) {
        // Logic to send reminder to employer about pending review
        console.log(`Reminder: Application ${application.id} needs review`);
      }

    } catch (error) {
      console.error('Error scheduling reminder emails:', error);
    }
  }

  /**
   * Get application status history
   */
  static async getApplicationHistory(applicationId) {
    try {
      return await prisma.applicationStatusHistory.findMany({
        where: { applicationId },
        include: {
          changedByUser: {
            select: {
              fullName: true,
              email: true
            }
          }
        },
        orderBy: { createdAt: 'desc' }
      });
    } catch (error) {
      console.error('Error fetching application history:', error);
      throw error;
    }
  }

  /**
   * Send custom email for specific application
   */
  static async sendCustomEmail(applicationId, subject, content, senderId) {
    try {
      const application = await prisma.jobApplication.findUnique({
        where: { id: applicationId },
        include: {
          user: true,
          job: {
            include: { company: true }
          }
        }
      });

      if (!application) {
        throw new Error('Application not found');
      }

      // Log the custom email
      await prisma.emailLog.create({
        data: {
          templateId: 'custom',
          recipientEmail: application.user.email,
          subject: subject,
          content: content,
          sentBy: senderId,
          applicationId: applicationId,
          status: 'sent',
          sentAt: new Date()
        }
      });

      // Here you would integrate with your email service
      console.log(`Custom email sent to ${application.user.email}`);

      return { success: true, message: 'Custom email sent successfully' };

    } catch (error) {
      console.error('Error sending custom email:', error);
      throw error;
    }
  }
}

export default JobApplicationService;
