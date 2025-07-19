// Email Templates for Job Alerts and Notifications
// Modern, dark-themed HTML templates with consistent branding

// Base email template styles (dark theme)
const BASE_STYLES = `
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif;
      background-color: #111827;
      color: #f9fafb;
      line-height: 1.6;
      margin: 0;
      padding: 0;
    }
    
    .email-container {
      max-width: 600px;
      margin: 0 auto;
      background-color: #1f2937;
      border-radius: 16px;
      overflow: hidden;
      box-shadow: 0 20px 25px -5px rgba(0, 0, 0, 0.1);
    }
    
    .header {
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      padding: 32px 24px;
      text-align: center;
    }
    
    .header h1 {
      color: #ffffff;
      font-size: 28px;
      font-weight: 700;
      margin: 0;
      text-shadow: 0 2px 4px rgba(0, 0, 0, 0.1);
    }
    
    .header p {
      color: #e5e7eb;
      font-size: 16px;
      margin: 8px 0 0 0;
    }
    
    .content {
      padding: 32px 24px;
    }
    
    .job-card {
      background-color: #374151;
      border: 1px solid #4b5563;
      border-radius: 12px;
      padding: 24px;
      margin-bottom: 24px;
      transition: all 0.3s ease;
    }
    
    .job-card:hover {
      border-color: #3b82f6;
      transform: translateY(-2px);
    }
    
    .job-title {
      color: #3b82f6;
      font-size: 20px;
      font-weight: 600;
      margin-bottom: 8px;
      text-decoration: none;
    }
    
    .job-company {
      color: #d1d5db;
      font-size: 16px;
      font-weight: 500;
      margin-bottom: 12px;
    }
    
    .job-details {
      display: flex;
      flex-wrap: wrap;
      gap: 16px;
      margin-bottom: 16px;
    }
    
    .job-detail {
      background-color: #4b5563;
      color: #e5e7eb;
      padding: 6px 12px;
      border-radius: 20px;
      font-size: 14px;
      font-weight: 500;
    }
    
    .job-salary {
      color: #10b981;
      font-weight: 600;
    }
    
    .job-location {
      color: #f59e0b;
    }
    
    .job-type {
      color: #8b5cf6;
    }
    
    .job-description {
      color: #d1d5db;
      font-size: 14px;
      line-height: 1.6;
      margin-bottom: 16px;
    }
    
    .apply-btn {
      background: linear-gradient(135deg, #3b82f6 0%, #8b5cf6 100%);
      color: #ffffff;
      text-decoration: none;
      padding: 12px 24px;
      border-radius: 8px;
      font-weight: 600;
      display: inline-block;
      transition: all 0.3s ease;
    }
    
    .apply-btn:hover {
      transform: translateY(-2px);
      box-shadow: 0 8px 16px rgba(59, 130, 246, 0.3);
    }
    
    .stats-section {
      background-color: #374151;
      border-radius: 12px;
      padding: 24px;
      margin: 24px 0;
    }
    
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
      gap: 16px;
    }
    
    .stat-item {
      text-align: center;
      padding: 16px;
      background-color: #4b5563;
      border-radius: 8px;
    }
    
    .stat-number {
      font-size: 24px;
      font-weight: 700;
      color: #3b82f6;
      margin-bottom: 4px;
    }
    
    .stat-label {
      font-size: 12px;
      color: #9ca3af;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .footer {
      background-color: #111827;
      padding: 24px;
      text-align: center;
      border-top: 1px solid #374151;
    }
    
    .footer p {
      color: #6b7280;
      font-size: 14px;
      margin-bottom: 8px;
    }
    
    .footer a {
      color: #3b82f6;
      text-decoration: none;
    }
    
    .footer a:hover {
      text-decoration: underline;
    }
    
    .social-links {
      margin: 16px 0;
    }
    
    .social-links a {
      color: #9ca3af;
      text-decoration: none;
      margin: 0 8px;
      font-size: 16px;
    }
    
    .premium-badge {
      background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
      color: #ffffff;
      padding: 4px 8px;
      border-radius: 4px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    .upgrade-banner {
      background: linear-gradient(135deg, #f59e0b 0%, #f97316 100%);
      color: #ffffff;
      padding: 16px;
      border-radius: 8px;
      margin: 24px 0;
      text-align: center;
    }
    
    .upgrade-banner h3 {
      margin-bottom: 8px;
      font-size: 18px;
    }
    
    .upgrade-banner p {
      font-size: 14px;
      margin-bottom: 16px;
    }
    
    .upgrade-btn {
      background-color: #ffffff;
      color: #f59e0b;
      padding: 12px 24px;
      border-radius: 8px;
      text-decoration: none;
      font-weight: 600;
      display: inline-block;
    }
    
    .notification-type {
      padding: 8px 16px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.5px;
      margin-bottom: 16px;
      display: inline-block;
    }
    
    .notification-job-alert {
      background-color: #065f46;
      color: #10b981;
    }
    
    .notification-resume-alert {
      background-color: #7c2d12;
      color: #f97316;
    }
    
    .notification-reminder {
      background-color: #7c3aed;
      color: #a855f7;
    }
    
    .notification-message {
      background-color: #1e40af;
      color: #3b82f6;
    }
    
    .notification-announcement {
      background-color: #dc2626;
      color: #ef4444;
    }
    
    @media (max-width: 600px) {
      .email-container {
        margin: 0;
        border-radius: 0;
      }
      
      .header, .content, .footer {
        padding: 24px 16px;
      }
      
      .job-card {
        padding: 16px;
      }
      
      .job-details {
        flex-direction: column;
        gap: 8px;
      }
      
      .stats-grid {
        grid-template-columns: 1fr;
      }
    }
  </style>
`;

/**
 * Job Alert Email Template
 * @param {Object} options - Template options
 * @param {Array} options.jobs - Array of job objects
 * @param {Object} options.user - User object
 * @param {Object} options.subscription - User subscription
 * @param {string} options.alertType - Type of alert (new_jobs, daily_digest, weekly_digest)
 * @param {Object} options.stats - Stats object
 * @returns {string} - HTML email template
 */
export function jobAlertTemplate({ jobs = [], user, subscription, alertType = 'new_jobs', stats = {} }) {
  const userName = user?.fullName || user?.firstName || 'Job Seeker';
  const isPremium = subscription?.status === 'active' && ['premium', 'enterprise', 'basic'].includes(subscription?.plan?.planType);
  
  const alertTitles = {
    new_jobs: 'New Job Opportunities',
    daily_digest: 'Daily Job Digest',
    weekly_digest: 'Weekly Job Digest'
  };
  
  const alertTitle = alertTitles[alertType] || 'Job Alert';
  
  const jobsHtml = jobs.map(job => {
    const salary = job.salary ? 
      (job.salary.from && job.salary.to ? 
        `₱${job.salary.from.toLocaleString()} - ₱${job.salary.to.toLocaleString()}` :
        job.salary.from ? `₱${job.salary.from.toLocaleString()}+` : 
        job.salary.to ? `Up to ₱${job.salary.to.toLocaleString()}` : ''
      ) : '';
    
    const location = job.location || 'Not specified';
    const type = job.type || job.jobType || 'Full-time';
    const company = job.company?.name || job.company_name || 'Company';
    const description = job.description ? 
      job.description.substring(0, 150) + (job.description.length > 150 ? '...' : '') : 
      'No description available';
    
    return `
      <div class="job-card">
        <h2 class="job-title">${job.title}</h2>
        <p class="job-company">${company}</p>
        <div class="job-details">
          ${salary ? `<span class="job-detail job-salary">${salary}</span>` : ''}
          <span class="job-detail job-location">${location}</span>
          <span class="job-detail job-type">${type}</span>
          ${job.remote === 'Yes' || job.remote === true ? '<span class="job-detail" style="color: #10b981;">Remote</span>' : ''}
          ${job.is_featured ? '<span class="premium-badge">Featured</span>' : ''}
        </div>
        <p class="job-description">${description}</p>
        <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://getgethired.com'}/jobs/${job.id}" class="apply-btn">
          View Job Details
        </a>
      </div>
    `;
  }).join('');
  
  const statsHtml = Object.keys(stats).length > 0 ? `
    <div class="stats-section">
      <h3 style="color: #f9fafb; margin-bottom: 16px; text-align: center;">Your Job Search Summary</h3>
      <div class="stats-grid">
        ${stats.totalJobs ? `
          <div class="stat-item">
            <div class="stat-number">${stats.totalJobs}</div>
            <div class="stat-label">New Jobs</div>
          </div>
        ` : ''}
        ${stats.applications ? `
          <div class="stat-item">
            <div class="stat-number">${stats.applications}</div>
            <div class="stat-label">Applications</div>
          </div>
        ` : ''}
        ${stats.matches ? `
          <div class="stat-item">
            <div class="stat-number">${stats.matches}</div>
            <div class="stat-label">Matches</div>
          </div>
        ` : ''}
        ${stats.views ? `
          <div class="stat-item">
            <div class="stat-number">${stats.views}</div>
            <div class="stat-label">Profile Views</div>
          </div>
        ` : ''}
      </div>
    </div>
  ` : '';
  
  const upgradeHtml = !isPremium ? `
    <div class="upgrade-banner">
      <h3>🚀 Unlock Premium Features</h3>
      <p>Get access to premium job listings, direct employer contact, and advanced search filters.</p>
      <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://getgethired.com'}/pricing" class="upgrade-btn">
        Upgrade Now
      </a>
    </div>
  ` : '';
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${alertTitle} - GetGetHired</title>
      ${BASE_STYLES}
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>GetGetHired</h1>
          <p>Your Career Opportunities Await</p>
        </div>
        
        <div class="content">
          <div class="notification-type notification-job-alert">
            Job Alert
          </div>
          
          <h2 style="color: #f9fafb; margin-bottom: 8px;">${alertTitle}</h2>
          <p style="color: #9ca3af; margin-bottom: 24px;">
            Hello ${userName}, we found ${jobs.length} new job${jobs.length !== 1 ? 's' : ''} matching your preferences.
          </p>
          
          ${jobsHtml}
          
          ${statsHtml}
          
          ${upgradeHtml}
          
          <div style="text-align: center; margin-top: 32px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://getgethired.com'}/dashboard" 
               style="background-color: #374151; color: #f9fafb; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
              View All Jobs
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p>© 2025 GetGetHired. All rights reserved.</p>
          <p>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://getgethired.com'}/dashboard">Dashboard</a> | 
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://getgethired.com'}/profile">Profile</a> | 
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://getgethired.com'}/unsubscribe">Unsubscribe</a>
          </p>
          <div class="social-links">
            <a href="https://facebook.com/getgethired">Facebook</a>
            <a href="https://twitter.com/getgethired">Twitter</a>
            <a href="https://linkedin.com/company/getgethired">LinkedIn</a>
          </div>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Resume Alert Email Template
 * @param {Object} options - Template options
 * @param {Array} options.candidates - Array of candidate objects
 * @param {Object} options.user - User object (employer)
 * @param {Object} options.job - Job object
 * @returns {string} - HTML email template
 */
export function resumeAlertTemplate({ candidates = [], user, job }) {
  const userName = user?.fullName || user?.firstName || 'Employer';
  
  const candidatesHtml = candidates.map(candidate => `
    <div class="job-card">
      <h3 style="color: #3b82f6; margin-bottom: 8px;">${candidate.fullName}</h3>
      <p style="color: #d1d5db; margin-bottom: 12px;">${candidate.email}</p>
      <div class="job-details">
        ${candidate.experience ? `<span class="job-detail">${candidate.experience} years exp</span>` : ''}
        ${candidate.location ? `<span class="job-detail job-location">${candidate.location}</span>` : ''}
        ${candidate.skills ? `<span class="job-detail">${candidate.skills.slice(0, 2).join(', ')}</span>` : ''}
      </div>
      <p class="job-description">${candidate.summary || 'No summary available'}</p>
      <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://getgethired.com'}/candidates/${candidate.id}" class="apply-btn">
        View Profile
      </a>
    </div>
  `).join('');
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>New Resume Matches - GetGetHired</title>
      ${BASE_STYLES}
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>GetGetHired</h1>
          <p>Connect with Top Talent</p>
        </div>
        
        <div class="content">
          <div class="notification-type notification-resume-alert">
            Resume Alert
          </div>
          
          <h2 style="color: #f9fafb; margin-bottom: 8px;">New Resume Matches</h2>
          <p style="color: #9ca3af; margin-bottom: 24px;">
            Hello ${userName}, we found ${candidates.length} new candidate${candidates.length !== 1 ? 's' : ''} 
            ${job ? `for your "${job.title}" position` : 'matching your search criteria'}.
          </p>
          
          ${candidatesHtml}
          
          <div style="text-align: center; margin-top: 32px;">
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://getgethired.com'}/dashboard" 
               style="background-color: #374151; color: #f9fafb; padding: 12px 24px; border-radius: 8px; text-decoration: none; font-weight: 500;">
              View All Candidates
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p>© 2025 GetGetHired. All rights reserved.</p>
          <p>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://getgethired.com'}/dashboard">Dashboard</a> | 
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://getgethired.com'}/profile">Profile</a> | 
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://getgethired.com'}/unsubscribe">Unsubscribe</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * General Notification Email Template
 * @param {Object} options - Template options
 * @param {string} options.type - Notification type (reminder, message, announcement)
 * @param {string} options.title - Notification title
 * @param {string} options.message - Notification message
 * @param {Object} options.user - User object
 * @param {string} options.actionUrl - Action URL (optional)
 * @param {string} options.actionText - Action button text (optional)
 * @returns {string} - HTML email template
 */
export function notificationTemplate({ type, title, message, user, actionUrl, actionText }) {
  const userName = user?.fullName || user?.firstName || 'User';
  
  const typeClasses = {
    reminder: 'notification-reminder',
    message: 'notification-message',
    announcement: 'notification-announcement'
  };
  
  const typeClass = typeClasses[type] || 'notification-message';
  
  const actionHtml = actionUrl && actionText ? `
    <div style="text-align: center; margin-top: 32px;">
      <a href="${actionUrl}" class="apply-btn">
        ${actionText}
      </a>
    </div>
  ` : '';
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>${title} - GetGetHired</title>
      ${BASE_STYLES}
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>GetGetHired</h1>
          <p>Your Career Partner</p>
        </div>
        
        <div class="content">
          <div class="notification-type ${typeClass}">
            ${type.charAt(0).toUpperCase() + type.slice(1)}
          </div>
          
          <h2 style="color: #f9fafb; margin-bottom: 8px;">${title}</h2>
          <p style="color: #9ca3af; margin-bottom: 24px;">Hello ${userName},</p>
          
          <div class="job-card">
            <p style="color: #d1d5db; line-height: 1.6;">${message}</p>
          </div>
          
          ${actionHtml}
        </div>
        
        <div class="footer">
          <p>© 2025 GetGetHired. All rights reserved.</p>
          <p>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://getgethired.com'}/dashboard">Dashboard</a> | 
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://getgethired.com'}/profile">Profile</a> | 
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://getgethired.com'}/unsubscribe">Unsubscribe</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

/**
 * Welcome Email Template
 * @param {Object} options - Template options
 * @param {Object} options.user - User object
 * @param {boolean} options.isEmployer - Whether user is an employer
 * @returns {string} - HTML email template
 */
export function welcomeTemplate({ user, isEmployer = false }) {
  const userName = user?.fullName || user?.firstName || 'User';
  
  const content = isEmployer ? {
    title: 'Welcome to GetGetHired for Employers',
    message: 'Start posting jobs and finding the perfect candidates for your team.',
    features: [
      'Post unlimited job listings',
      'Access to qualified candidates',
      'Advanced filtering tools',
      'Real-time notifications'
    ],
    actionUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://getgethired.com'}/post-job`,
    actionText: 'Post Your First Job'
  } : {
    title: 'Welcome to GetGetHired',
    message: 'Your journey to finding the perfect job starts here.',
    features: [
      'Browse thousands of job opportunities',
      'AI-powered job matching',
      'Resume builder and analyzer',
      'Direct employer connections'
    ],
    actionUrl: `${process.env.NEXT_PUBLIC_BASE_URL || 'https://getgethired.com'}/jobs`,
    actionText: 'Explore Jobs'
  };
  
  const featuresHtml = content.features.map(feature => `
    <div style="display: flex; align-items: center; margin-bottom: 12px;">
      <span style="color: #10b981; margin-right: 8px;">✓</span>
      <span style="color: #d1d5db;">${feature}</span>
    </div>
  `).join('');
  
  return `
    <!DOCTYPE html>
    <html lang="en">
    <head>
      <meta charset="UTF-8">
      <meta name="viewport" content="width=device-width, initial-scale=1.0">
      <title>Welcome to GetGetHired</title>
      ${BASE_STYLES}
    </head>
    <body>
      <div class="email-container">
        <div class="header">
          <h1>GetGetHired</h1>
          <p>Your Career Success Platform</p>
        </div>
        
        <div class="content">
          <div class="notification-type notification-message">
            Welcome
          </div>
          
          <h2 style="color: #f9fafb; margin-bottom: 8px;">${content.title}</h2>
          <p style="color: #9ca3af; margin-bottom: 24px;">Hello ${userName},</p>
          
          <div class="job-card">
            <p style="color: #d1d5db; line-height: 1.6; margin-bottom: 24px;">
              ${content.message}
            </p>
            
            <h3 style="color: #f9fafb; margin-bottom: 16px;">What you can do:</h3>
            ${featuresHtml}
          </div>
          
          <div style="text-align: center; margin-top: 32px;">
            <a href="${content.actionUrl}" class="apply-btn">
              ${content.actionText}
            </a>
          </div>
        </div>
        
        <div class="footer">
          <p>© 2025 GetGetHired. All rights reserved.</p>
          <p>
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://getgethired.com'}/dashboard">Dashboard</a> | 
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://getgethired.com'}/profile">Profile</a> | 
            <a href="${process.env.NEXT_PUBLIC_BASE_URL || 'https://getgethired.com'}/help">Help</a>
          </p>
        </div>
      </div>
    </body>
    </html>
  `;
}

export default {
  jobAlertTemplate,
  resumeAlertTemplate,
  notificationTemplate,
  welcomeTemplate
};
