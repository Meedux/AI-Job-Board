// Job Alert Service
// Manages job notifications, email alerts, and user preferences

import { PrismaClient } from '@prisma/client';
import emailItService from './emailItService';
import { logSystemEvent, logError } from './dataLogger';
import { createNotification, NOTIFICATION_TYPES, CATEGORIES, PRIORITY } from './notificationService';

const prisma = new PrismaClient();

export class JobAlertService {
  constructor() {
    this.emailService = emailItService;
  }

  /**
   * Send job alerts to users based on their preferences
   * @param {Array} jobs - Array of new job postings
   * @param {string} alertType - Type of alert (new_jobs, daily_digest, weekly_digest)
   */
  async sendJobAlerts(jobs, alertType = 'new_jobs') {
    try {
      // Get users who have enabled job alerts
      const usersWithAlerts = await this.getUsersWithJobAlerts();
      
      if (usersWithAlerts.length === 0) {
        console.log('No users with job alerts enabled');
        return;
      }

      // Filter jobs based on user preferences
      const results = [];
      
      for (const user of usersWithAlerts) {
        try {
          // Get user's job preferences
          const preferences = await this.getUserJobPreferences(user.id);
          
          // Filter jobs based on preferences
          const relevantJobs = this.filterJobsByPreferences(jobs, preferences);
          
          if (relevantJobs.length === 0) {
            continue; // Skip if no relevant jobs
          }

          // Get user stats for email
          const stats = await this.getUserJobStats(user.id);
          
          // Send job alert email using EmailIt
          const result = await this.emailService.sendJobAlert(
            user.email,
            user.fullName || user.firstName,
            relevantJobs
          );

          results.push({
            userId: user.id,
            email: user.email,
            success: true,
            jobCount: relevantJobs.length,
            messageId: result.messageId
          });

          // Create in-app notification
          await createNotification({
            type: NOTIFICATION_TYPES.JOB_POSTED,
            title: `${relevantJobs.length} New Job${relevantJobs.length !== 1 ? 's' : ''} Found`,
            message: `We found ${relevantJobs.length} new job opportunities matching your preferences.`,
            category: CATEGORIES.JOB,
            priority: PRIORITY.MEDIUM,
            userId: user.id,
            metadata: {
              jobCount: relevantJobs.length,
              alertType,
              jobIds: relevantJobs.map(job => job.id)
            }
          });

        } catch (error) {
          console.error(`Failed to send job alert to user ${user.id}:`, error);
          results.push({
            userId: user.id,
            email: user.email,
            success: false,
            error: error.message
          });
        }
      }

      // Log bulk alert results
      const successful = results.filter(r => r.success).length;
      const failed = results.filter(r => !r.success).length;

      await logSystemEvent(
        'job_alerts_sent',
        `Sent ${alertType} alerts to ${successful} users, ${failed} failed`,
        {
          totalUsers: usersWithAlerts.length,
          successful,
          failed,
          alertType,
          totalJobs: jobs.length
        }
      );

      return results;
    } catch (error) {
      console.error('Error sending job alerts:', error);
      await logError('job_alerts_error', error, { alertType, jobCount: jobs.length });
      throw error;
    }
  }

  /**
   * Get users who have enabled job alerts
   */
  async getUsersWithJobAlerts() {
    try {
      const users = await prisma.user.findMany({
        where: {
          isActive: true,
          // Add job alert preferences filter here when we implement user preferences
          NOT: {
            email: null
          }
        },
        include: {
          subscriptions: {
            where: {
              status: 'active'
            },
            include: {
              plan: true
            }
          }
        }
      });

      return users;
    } catch (error) {
      console.error('Error fetching users with job alerts:', error);
      throw error;
    }
  }

  /**
   * Get user's job preferences
   * @param {string} userId - User ID
   */
  async getUserJobPreferences(userId) {
    try {
      // For now, return default preferences
      // In the future, this would come from a user_preferences table
      return {
        keywords: [],
        locations: [],
        jobTypes: [],
        salaryRange: { min: 0, max: 1000000 },
        experienceLevel: [],
        remoteWork: null,
        categories: []
      };
    } catch (error) {
      console.error('Error fetching user job preferences:', error);
      return {};
    }
  }

  /**
   * Filter jobs based on user preferences
   * @param {Array} jobs - Array of jobs
   * @param {Object} preferences - User preferences
   */
  filterJobsByPreferences(jobs, preferences) {
    if (!preferences || Object.keys(preferences).length === 0) {
      return jobs; // Return all jobs if no preferences
    }

    return jobs.filter(job => {
      // Filter by keywords
      if (preferences.keywords && preferences.keywords.length > 0) {
        const hasKeyword = preferences.keywords.some(keyword => 
          job.title.toLowerCase().includes(keyword.toLowerCase()) ||
          (job.description && job.description.toLowerCase().includes(keyword.toLowerCase()))
        );
        if (!hasKeyword) return false;
      }

      // Filter by location
      if (preferences.locations && preferences.locations.length > 0) {
        const hasLocation = preferences.locations.some(location =>
          job.location && job.location.toLowerCase().includes(location.toLowerCase())
        );
        if (!hasLocation) return false;
      }

      // Filter by job type
      if (preferences.jobTypes && preferences.jobTypes.length > 0) {
        const hasJobType = preferences.jobTypes.includes(job.jobType);
        if (!hasJobType) return false;
      }

      // Filter by salary range
      if (preferences.salaryRange) {
        const { min, max } = preferences.salaryRange;
        if (job.salaryFrom && job.salaryFrom < min) return false;
        if (job.salaryTo && job.salaryTo > max) return false;
      }

      // Filter by experience level
      if (preferences.experienceLevel && preferences.experienceLevel.length > 0) {
        const hasExperienceLevel = preferences.experienceLevel.includes(job.experienceLevel);
        if (!hasExperienceLevel) return false;
      }

      // Filter by remote work
      if (preferences.remoteWork !== null) {
        const isRemote = job.remoteType === 'full' || job.remoteType === 'hybrid';
        if (preferences.remoteWork && !isRemote) return false;
        if (!preferences.remoteWork && isRemote) return false;
      }

      return true;
    });
  }

  /**
   * Get user's job search stats
   * @param {string} userId - User ID
   */
  async getUserJobStats(userId) {
    try {
      const [applications, totalJobs] = await Promise.all([
        prisma.jobApplication.count({
          where: { userId }
        }),
        prisma.job.count({
          where: { status: 'active' }
        })
      ]);

      return {
        applications,
        totalJobs,
        matches: 0, // Would calculate based on preferences
        views: 0 // Would track profile views
      };
    } catch (error) {
      console.error('Error fetching user job stats:', error);
      return {};
    }
  }

  /**
   * Send resume alerts to employers
   * @param {Array} candidates - Array of new candidate profiles
   * @param {Object} job - Job posting (optional)
   */
  async sendResumeAlerts(candidates, job = null) {
    try {
      // Get employers who have posted jobs recently
      const employers = await this.getEmployersWithActiveJobs();
      
      const results = [];
      
      for (const employer of employers) {
        try {
          // Filter candidates based on job requirements
          const relevantCandidates = job ? 
            this.filterCandidatesByJob(candidates, job) : 
            candidates;

          if (relevantCandidates.length === 0) {
            continue;
          }

          // Send resume alert email using EmailIt
          const result = await this.emailService.sendResumeAlert(
            employer.email,
            employer.fullName || employer.companyName,
            relevantCandidates[0] // Send first candidate as example
          );

          results.push({
            userId: employer.id,
            email: employer.email,
            success: true,
            candidateCount: relevantCandidates.length,
            messageId: result.messageId
          });

          // Create in-app notification
          await createNotification({
            type: NOTIFICATION_TYPES.USER_REGISTRATION,
            title: `${relevantCandidates.length} New Candidate${relevantCandidates.length !== 1 ? 's' : ''} Found`,
            message: `New candidates matching your requirements are now available.`,
            category: CATEGORIES.USER,
            priority: PRIORITY.MEDIUM,
            userId: employer.id,
            metadata: {
              candidateCount: relevantCandidates.length,
              jobId: job?.id
            }
          });

        } catch (error) {
          console.error(`Failed to send resume alert to employer ${employer.id}:`, error);
          results.push({
            userId: employer.id,
            email: employer.email,
            success: false,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error sending resume alerts:', error);
      throw error;
    }
  }

  /**
   * Get employers with active job postings
   */
  async getEmployersWithActiveJobs() {
    try {
      const employers = await prisma.user.findMany({
        where: {
          isActive: true,
          role: {
            in: ['admin', 'recruiter']
          },
          postedJobs: {
            some: {
              status: 'active'
            }
          }
        },
        include: {
          postedJobs: {
            where: {
              status: 'active'
            }
          }
        }
      });

      return employers;
    } catch (error) {
      console.error('Error fetching employers with active jobs:', error);
      throw error;
    }
  }

  /**
   * Filter candidates based on job requirements
   * @param {Array} candidates - Array of candidates
   * @param {Object} job - Job posting
   */
  filterCandidatesByJob(candidates, job) {
    if (!job) return candidates;

    return candidates.filter(candidate => {
      // Add filtering logic based on job requirements
      // This would include skills matching, experience level, location, etc.
      return true; // For now, return all candidates
    });
  }

  /**
   * Send daily job digest
   */
  async sendDailyDigest() {
    try {
      // Get jobs posted in the last 24 hours
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);

      const newJobs = await prisma.job.findMany({
        where: {
          status: 'active',
          postedAt: {
            gte: yesterday
          }
        },
        include: {
          company: true,
          categories: {
            include: {
              category: true
            }
          }
        }
      });

      if (newJobs.length === 0) {
        console.log('No new jobs for daily digest');
        return;
      }

      return await this.sendJobAlerts(newJobs, 'daily_digest');
    } catch (error) {
      console.error('Error sending daily digest:', error);
      throw error;
    }
  }

  /**
   * Send weekly job digest
   */
  async sendWeeklyDigest() {
    try {
      // Get jobs posted in the last 7 days
      const lastWeek = new Date();
      lastWeek.setDate(lastWeek.getDate() - 7);

      const newJobs = await prisma.job.findMany({
        where: {
          status: 'active',
          postedAt: {
            gte: lastWeek
          }
        },
        include: {
          company: true,
          categories: {
            include: {
              category: true
            }
          }
        }
      });

      if (newJobs.length === 0) {
        console.log('No new jobs for weekly digest');
        return;
      }

      return await this.sendJobAlerts(newJobs, 'weekly_digest');
    } catch (error) {
      console.error('Error sending weekly digest:', error);
      throw error;
    }
  }

  /**
   * Send reminder notifications
   * @param {string} type - Type of reminder (profile_incomplete, application_pending, etc.)
   * @param {Object} options - Reminder options
   */
  async sendReminders(type, options = {}) {
    try {
      let users = [];

      switch (type) {
        case 'profile_incomplete':
          users = await prisma.user.findMany({
            where: {
              isActive: true,
              role: 'job_seeker',
              OR: [
                { fullName: null },
                { fullName: '' },
                { fullAddress: null },
                { fullAddress: '' }
              ]
            }
          });
          break;

        case 'application_pending':
          users = await prisma.user.findMany({
            where: {
              isActive: true,
              role: 'job_seeker',
              applications: {
                some: {
                  status: 'pending',
                  appliedAt: {
                    lte: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000) // 7 days ago
                  }
                }
              }
            }
          });
          break;

        default:
          throw new Error(`Unknown reminder type: ${type}`);
      }

      const results = [];

      for (const user of users) {
        try {
          const reminderContent = this.getReminderContent(type, user);
          
          // Send reminder email using EmailIt
          const result = await this.emailService.sendEmail(
            user.email,
            reminderContent.title,
            `<h1>${reminderContent.title}</h1><p>${reminderContent.message}</p><p><a href="${reminderContent.actionUrl}">${reminderContent.actionText}</a></p>`,
            'reminder'
          );

          results.push({
            userId: user.id,
            email: user.email,
            success: true,
            messageId: result.messageId
          });

        } catch (error) {
          console.error(`Failed to send reminder to user ${user.id}:`, error);
          results.push({
            userId: user.id,
            email: user.email,
            success: false,
            error: error.message
          });
        }
      }

      return results;
    } catch (error) {
      console.error('Error sending reminders:', error);
      throw error;
    }
  }

  /**
   * Get reminder content based on type
   * @param {string} type - Reminder type
   * @param {Object} user - User object
   */
  getReminderContent(type, user) {
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || 'https://getgethired.com';
    
    switch (type) {
      case 'profile_incomplete':
        return {
          title: '📝 Complete Your Profile',
          message: 'Your profile is incomplete. Complete it to increase your chances of getting hired and receive better job recommendations.',
          actionUrl: `${baseUrl}/profile`,
          actionText: 'Complete Profile'
        };

      case 'application_pending':
        return {
          title: '⏰ Your Applications Are Pending',
          message: 'You have pending job applications. Check their status and consider applying to more positions to increase your chances.',
          actionUrl: `${baseUrl}/my-applications`,
          actionText: 'View Applications'
        };

      default:
        return {
          title: 'Reminder',
          message: 'This is a reminder from GetGetHired.',
          actionUrl: `${baseUrl}/dashboard`,
          actionText: 'View Dashboard'
        };
    }
  }
}

// Export singleton instance
export const jobAlertService = new JobAlertService();
export default jobAlertService;
