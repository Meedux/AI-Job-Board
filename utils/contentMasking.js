// DEPRECATED: Job content masking is no longer used
// Job content is now FREE for all job seekers
// Premium features focus on AI tools and convenience features
// Use premiumFeatures.js instead

import { processJobContent, maskVulgarWords, hasPremiumAccess, PREMIUM_FEATURES } from './premiumFeatures.js';

// Legacy function for backward compatibility
export function maskJobData(job, user, subscription) {
  // No masking - just process for content moderation
  return processJobContent(job, user, subscription);
}

// Legacy function for backward compatibility
export function maskContent(content, user, subscription, options = {}) {
  // Only mask vulgar words for content moderation
  if (options.maskVulgar !== false) {
    return maskVulgarWords(content);
  }
  return content;
}

// Re-export premium features functions
export { 
  processJobContent, 
  maskVulgarWords, 
  hasPremiumAccess, 
  PREMIUM_FEATURES 
} from './premiumFeatures.js';

// Additional exports for backward compatibility

/**
 * Check if user has premium access
 * @param {Object} user - User object
 * @param {Object} subscription - User subscription object
 * @returns {boolean} - True if user has premium access
 */
export function hasPremiumAccess(user, subscription) {
  if (!user) return false;
  
  // Admin users always have premium access
  if (user.isAdmin) return true;
  
  // Check subscription status
  if (subscription && subscription.status === 'active') {
    const planType = subscription.plan?.planType || subscription.planType;
    return ['premium', 'enterprise', 'basic'].includes(planType);
  }
  
  return false;
}

/**
 * Mask vulgar words in text
 * @param {string} text - Text to mask
 * @returns {string} - Masked text
 */
export function maskVulgarWords(text) {
  if (!text || typeof text !== 'string') return text;
  
  let maskedText = text;
  
  VULGAR_WORDS.forEach(word => {
    const regex = new RegExp(`\\b${word}\\b`, 'gi');
    maskedText = maskedText.replace(regex, (match) => {
      return '*'.repeat(match.length);
    });
  });
  
  return maskedText;
}

/**
 * Mask email addresses
 * @param {string} text - Text to mask
 * @returns {string} - Masked text
 */
export function maskEmails(text) {
  if (!text || typeof text !== 'string') return text;
  
  return text.replace(EMAIL_PATTERN, (email) => {
    const [localPart, domain] = email.split('@');
    const maskedLocal = localPart.length > 2 
      ? `${localPart.substring(0, 2)}${'*'.repeat(localPart.length - 2)}`
      : '*'.repeat(localPart.length);
    return `${maskedLocal}@${domain}`;
  });
}

/**
 * Mask phone numbers
 * @param {string} text - Text to mask
 * @returns {string} - Masked text
 */
export function maskPhoneNumbers(text) {
  if (!text || typeof text !== 'string') return text;
  
  return text.replace(PHONE_PATTERN, (phone) => {
    return `${phone.substring(0, 4)}${'*'.repeat(phone.length - 4)}`;
  });
}

/**
 * Mask addresses
 * @param {string} text - Text to mask
 * @returns {string} - Masked text
 */
export function maskAddresses(text) {
  if (!text || typeof text !== 'string') return text;
  
  return text.replace(ADDRESS_PATTERN, (address) => {
    const words = address.split(' ');
    if (words.length > 2) {
      return `${words[0]} ${'*'.repeat(words.slice(1, -1).join(' ').length)} ${words[words.length - 1]}`;
    }
    return '*'.repeat(address.length);
  });
}

/**
 * Mask URLs
 * @param {string} text - Text to mask
 * @returns {string} - Masked text
 */
export function maskUrls(text) {
  if (!text || typeof text !== 'string') return text;
  
  return text.replace(URL_PATTERN, '[CONTACT INFO HIDDEN - UPGRADE TO VIEW]');
}

/**
 * Mask social media handles
 * @param {string} text - Text to mask
 * @returns {string} - Masked text
 */
export function maskSocialHandles(text) {
  if (!text || typeof text !== 'string') return text;
  
  return text.replace(SOCIAL_HANDLE_PATTERN, '[CONTACT INFO HIDDEN - UPGRADE TO VIEW]');
}

/**
 * Mask job title for seniority levels
 * @param {string} title - Job title to mask
 * @returns {string} - Masked title
 */
export function maskJobTitle(title) {
  if (!title || typeof title !== 'string') return title;
  
  let maskedTitle = title;
  
  JOB_TITLE_PLACEHOLDERS.forEach(placeholder => {
    const regex = new RegExp(`\\b${placeholder}\\b`, 'gi');
    maskedTitle = maskedTitle.replace(regex, '[PREMIUM]');
  });
  
  return maskedTitle;
}

/**
 * Mask sensitive contact information
 * @param {string} text - Text to mask
 * @returns {string} - Masked text
 */
export function maskContactInfo(text) {
  if (!text) return text;
  
  let maskedText = text;
  
  // Mask emails
  maskedText = maskEmails(maskedText);
  
  // Mask phone numbers
  maskedText = maskPhoneNumbers(maskedText);
  
  // Mask URLs
  maskedText = maskUrls(maskedText);
  
  // Mask social handles
  maskedText = maskSocialHandles(maskedText);
  
  return maskedText;
}

/**
 * Main content masking function
 * @param {string} content - Content to mask
 * @param {Object} user - User object
 * @param {Object} subscription - User subscription object
 * @param {Object} options - Masking options
 * @returns {string} - Masked content
 */
export function maskContent(content, user, subscription, options = {}) {
  if (!content) return content;
  
  // If user has premium access, return original content
  if (hasPremiumAccess(user, subscription)) {
    return content;
  }
  
  let maskedContent = content;
  
  // Apply masking based on options
  if (options.maskVulgar !== false) {
    maskedContent = maskVulgarWords(maskedContent);
  }
  
  if (options.maskContact !== false) {
    maskedContent = maskContactInfo(maskedContent);
  }
  
  if (options.maskAddress !== false) {
    maskedContent = maskAddresses(maskedContent);
  }
  
  return maskedContent;
}

/**
 * Mask job data for free users
 * @param {Object} job - Job object
 * @param {Object} user - User object
 * @param {Object} subscription - User subscription object
 * @returns {Object} - Masked job object
 */
export function maskJobData(job, user, subscription) {
  if (!job) return job;
  
  // If user has premium access, return original job
  if (hasPremiumAccess(user, subscription)) {
    return job;
  }
  
  const maskedJob = { ...job };
  
  // Mask job title
  if (maskedJob.title) {
    maskedJob.title = maskJobTitle(maskedJob.title);
  }
  
  // Mask job description
  if (maskedJob.description) {
    maskedJob.description = maskContent(maskedJob.description, user, subscription);
  }
  
  // Mask company contact info
  if (maskedJob.company) {
    maskedJob.company = {
      ...maskedJob.company,
      description: maskedJob.company.description 
        ? maskContent(maskedJob.company.description, user, subscription)
        : maskedJob.company.description
    };
  }
  
  // Hide sensitive application details
  if (maskedJob.applyEmail) {
    maskedJob.applyEmail = '[UPGRADE TO VIEW EMAIL]';
  }
  
  if (maskedJob.applyUrl) {
    maskedJob.applyUrl = '[UPGRADE TO VIEW APPLY LINK]';
  }
  
  // Mask location if it contains specific address
  if (maskedJob.location) {
    maskedJob.location = maskAddresses(maskedJob.location);
  }
  
  return maskedJob;
}

/**
 * Check if content contains sensitive information
 * @param {string} content - Content to check
 * @returns {boolean} - True if content contains sensitive info
 */
export function containsSensitiveInfo(content) {
  if (!content) return false;
  
  return EMAIL_PATTERN.test(content) || 
         PHONE_PATTERN.test(content) || 
         URL_PATTERN.test(content) || 
         SOCIAL_HANDLE_PATTERN.test(content) ||
         VULGAR_WORDS.some(word => content.toLowerCase().includes(word));
}

/**
 * Get masking summary for content
 * @param {string} content - Content to analyze
 * @returns {Object} - Masking summary
 */
export function getMaskingSummary(content) {
  if (!content) return {};
  
  return {
    hasEmails: EMAIL_PATTERN.test(content),
    hasPhones: PHONE_PATTERN.test(content),
    hasUrls: URL_PATTERN.test(content),
    hasSocialHandles: SOCIAL_HANDLE_PATTERN.test(content),
    hasVulgarWords: VULGAR_WORDS.some(word => content.toLowerCase().includes(word)),
    hasAddresses: ADDRESS_PATTERN.test(content),
    totalSensitiveItems: [
      EMAIL_PATTERN.test(content),
      PHONE_PATTERN.test(content),
      URL_PATTERN.test(content),
      SOCIAL_HANDLE_PATTERN.test(content),
      VULGAR_WORDS.some(word => content.toLowerCase().includes(word)),
      ADDRESS_PATTERN.test(content)
    ].filter(Boolean).length
  };
}

// This functionality is now provided by premiumFeatures.js
// Legacy functions are maintained for backward compatibility
