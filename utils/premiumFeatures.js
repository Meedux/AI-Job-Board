// Premium Features and Access Control Utility
// NEW APPROACH: Job content is FREE for all job seekers
// Premium features focus on AI tools and convenience features

// Premium feature definitions
export const PREMIUM_FEATURES = {
  // AI-powered tools
  AI_RESUME_BUILDER: 'ai_resume_builder',
  AI_RESUME_ANALYZER: 'ai_resume_analyzer',
  AI_COVER_LETTER_GENERATOR: 'ai_cover_letter_generator',
  AI_INTERVIEW_PREP: 'ai_interview_prep',
  AI_SKILL_MATCHER: 'ai_skill_matcher',
  
  // Convenience features
  ONE_CLICK_APPLY: 'one_click_apply',
  LAZY_APPLY: 'lazy_apply',
  BULK_APPLY: 'bulk_apply',
  RESUME_VISIBILITY: 'resume_visibility',
  PRIORITY_SUPPORT: 'priority_support',
  ADVANCED_FILTERS: 'advanced_filters',
  
  // Privacy features
  CONTENT_MASKING: 'content_masking',
  
  // Enhanced features
  UNLIMITED_APPLICATIONS: 'unlimited_applications',
  JOB_ALERTS: 'job_alerts',
  COMPANY_INSIGHTS: 'company_insights',
  SALARY_INSIGHTS: 'salary_insights',
  
  // Job posting features
  PRESCREEN_QUESTIONS: 'prescreen_questions'
};

// Vulgar words list (still used for content moderation)
const VULGAR_WORDS = [
  'fuck', 'shit', 'damn', 'ass', 'bitch', 'bastard', 'hell', 'piss', 'crap',
  'fucking', 'bullshit', 'dickhead', 'asshole', 'motherfucker', 'slutty',
  'whore', 'pussy', 'cock', 'dick', 'tits', 'boobs', 'sex', 'horny',
  'nude', 'naked', 'porn', 'xxx', 'adult', 'escort', 'massage', 'dating',
  // Add more as needed
];

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
 * Check if user has access to a specific premium feature
 * @param {string} feature - Premium feature to check
 * @param {Object} user - User object
 * @param {Object} subscription - User subscription object
 * @returns {boolean} - True if user has access to the feature
 */
export function hasPremiumFeature(feature, user, subscription) {
  if (!user) return false;
  
  // Admin users always have access to all features
  if (user.isAdmin) return true;
  
  // Check subscription status
  if (!subscription || subscription.status !== 'active') {
    return false;
  }
  
  const planType = subscription.plan?.planType || subscription.planType;
  
  // Feature access based on plan type
  switch (planType) {
    case 'basic':
      return [
        PREMIUM_FEATURES.JOB_ALERTS,
        PREMIUM_FEATURES.ADVANCED_FILTERS,
        PREMIUM_FEATURES.RESUME_VISIBILITY,
        PREMIUM_FEATURES.CONTENT_MASKING
      ].includes(feature);
      
    case 'premium':
      return [
        PREMIUM_FEATURES.JOB_ALERTS,
        PREMIUM_FEATURES.ADVANCED_FILTERS,
        PREMIUM_FEATURES.RESUME_VISIBILITY,
        PREMIUM_FEATURES.CONTENT_MASKING,
        PREMIUM_FEATURES.AI_RESUME_ANALYZER,
        PREMIUM_FEATURES.ONE_CLICK_APPLY,
        PREMIUM_FEATURES.LAZY_APPLY,
        PREMIUM_FEATURES.UNLIMITED_APPLICATIONS,
        PREMIUM_FEATURES.COMPANY_INSIGHTS,
        PREMIUM_FEATURES.SALARY_INSIGHTS,
        PREMIUM_FEATURES.PRESCREEN_QUESTIONS
      ].includes(feature);
      
    case 'enterprise':
      return true; // All features available
      
    default:
      return false;
  }
}

/**
 * Get available premium features for user
 * @param {Object} user - User object
 * @param {Object} subscription - User subscription object
 * @returns {Array} - Array of available premium features
 */
export function getAvailablePremiumFeatures(user, subscription) {
  if (!user) return [];
  
  // Admin users get all features
  if (user.isAdmin) return Object.values(PREMIUM_FEATURES);
  
  if (!subscription || subscription.status !== 'active') {
    return [];
  }
  
  const planType = subscription.plan?.planType || subscription.planType;
  
  switch (planType) {
    case 'basic':
      return [
        PREMIUM_FEATURES.JOB_ALERTS,
        PREMIUM_FEATURES.ADVANCED_FILTERS,
        PREMIUM_FEATURES.RESUME_VISIBILITY,
        PREMIUM_FEATURES.CONTENT_MASKING
      ];
      
    case 'premium':
      return [
        PREMIUM_FEATURES.JOB_ALERTS,
        PREMIUM_FEATURES.ADVANCED_FILTERS,
        PREMIUM_FEATURES.RESUME_VISIBILITY,
        PREMIUM_FEATURES.CONTENT_MASKING,
        PREMIUM_FEATURES.AI_RESUME_ANALYZER,
        PREMIUM_FEATURES.ONE_CLICK_APPLY,
        PREMIUM_FEATURES.LAZY_APPLY,
        PREMIUM_FEATURES.UNLIMITED_APPLICATIONS,
        PREMIUM_FEATURES.COMPANY_INSIGHTS,
        PREMIUM_FEATURES.SALARY_INSIGHTS,
        PREMIUM_FEATURES.PRESCREEN_QUESTIONS
      ];
      
    case 'enterprise':
      return Object.values(PREMIUM_FEATURES);
      
    default:
      return [];
  }
}

/**
 * Mask vulgar words in text (still used for content moderation)
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
 * Process job content for display (NO MASKING for job seekers)
 * @param {Object} job - Job object
 * @param {Object} user - User object
 * @param {Object} subscription - User subscription object
 * @returns {Object} - Processed job object
 */
export function processJobContent(job, user, subscription) {
  if (!job) return job;
  
  const processedJob = { ...job };
  
  // Apply content moderation (remove vulgar words)
  if (processedJob.description) {
    processedJob.description = maskVulgarWords(processedJob.description);
  }
  
  if (processedJob.requirements) {
    processedJob.requirements = maskVulgarWords(processedJob.requirements);
  }
  
  if (processedJob.title) {
    processedJob.title = maskVulgarWords(processedJob.title);
  }
  
  // Add premium feature indicators
  processedJob.premiumFeatures = getAvailablePremiumFeatures(user, subscription);
  processedJob.hasPremiumAccess = hasPremiumAccess(user, subscription);
  
  return processedJob;
}

/**
 * Check if content contains vulgar words
 * @param {string} content - Content to check
 * @returns {boolean} - True if content contains vulgar words
 */
export function containsVulgarWords(content) {
  if (!content) return false;
  
  return VULGAR_WORDS.some(word => content.toLowerCase().includes(word));
}

/**
 * Get premium feature usage limits
 * @param {string} feature - Premium feature
 * @param {Object} subscription - User subscription object
 * @returns {Object} - Usage limits for the feature
 */
export function getPremiumFeatureLimits(feature, subscription) {
  if (!subscription || subscription.status !== 'active') {
    return { allowed: false, limit: 0, used: 0 };
  }
  
  const planType = subscription.plan?.planType || subscription.planType;
  
  const limits = {
    basic: {
      [PREMIUM_FEATURES.AI_RESUME_ANALYZER]: { limit: 5, period: 'month' },
      [PREMIUM_FEATURES.ONE_CLICK_APPLY]: { limit: 20, period: 'month' },
      [PREMIUM_FEATURES.JOB_ALERTS]: { limit: 3, period: 'unlimited' }
    },
    premium: {
      [PREMIUM_FEATURES.AI_RESUME_ANALYZER]: { limit: 50, period: 'month' },
      [PREMIUM_FEATURES.AI_RESUME_BUILDER]: { limit: 10, period: 'month' },
      [PREMIUM_FEATURES.AI_COVER_LETTER_GENERATOR]: { limit: 30, period: 'month' },
      [PREMIUM_FEATURES.ONE_CLICK_APPLY]: { limit: 100, period: 'month' },
      [PREMIUM_FEATURES.LAZY_APPLY]: { limit: 50, period: 'month' },
      [PREMIUM_FEATURES.JOB_ALERTS]: { limit: 10, period: 'unlimited' }
    },
    enterprise: {
      // Unlimited for enterprise
    }
  };
  
  if (planType === 'enterprise') {
    return { allowed: true, limit: -1, used: 0 }; // -1 means unlimited
  }
  
  const planLimits = limits[planType];
  if (!planLimits || !planLimits[feature]) {
    return { allowed: false, limit: 0, used: 0 };
  }
  
  return {
    allowed: true,
    limit: planLimits[feature].limit,
    period: planLimits[feature].period,
    used: 0 // This should be fetched from usage tracking
  };
}

/**
 * Get premium feature descriptions for UI
 * @returns {Object} - Premium feature descriptions
 */
export function getPremiumFeatureDescriptions() {
  return {
    [PREMIUM_FEATURES.AI_RESUME_BUILDER]: {
      title: 'AI Resume Builder',
      description: 'Create professional resumes with AI assistance',
      icon: '🤖'
    },
    [PREMIUM_FEATURES.AI_RESUME_ANALYZER]: {
      title: 'AI Resume Analyzer',
      description: 'Get AI-powered feedback on your resume',
      icon: '🔍'
    },
    [PREMIUM_FEATURES.AI_COVER_LETTER_GENERATOR]: {
      title: 'AI Cover Letter Generator',
      description: 'Generate personalized cover letters with AI',
      icon: '✍️'
    },
    [PREMIUM_FEATURES.ONE_CLICK_APPLY]: {
      title: 'One-Click Apply',
      description: 'Apply to jobs with a single click',
      icon: '⚡'
    },
    [PREMIUM_FEATURES.LAZY_APPLY]: {
      title: 'Lazy Apply',
      description: 'Apply to multiple jobs automatically',
      icon: '🚀'
    },
    [PREMIUM_FEATURES.RESUME_VISIBILITY]: {
      title: 'Resume Visibility',
      description: 'Make your resume visible to employers',
      icon: '👁️'
    },
    [PREMIUM_FEATURES.JOB_ALERTS]: {
      title: 'Job Alerts',
      description: 'Get notified of new jobs matching your criteria',
      icon: '🔔'
    },
    [PREMIUM_FEATURES.ADVANCED_FILTERS]: {
      title: 'Advanced Filters',
      description: 'Use advanced search filters to find perfect jobs',
      icon: '🔧'
    },
    [PREMIUM_FEATURES.COMPANY_INSIGHTS]: {
      title: 'Company Insights',
      description: 'Get detailed company information and culture insights',
      icon: '🏢'
    },
    [PREMIUM_FEATURES.SALARY_INSIGHTS]: {
      title: 'Salary Insights',
      description: 'View salary ranges and compensation data',
      icon: '💰'
    },
    [PREMIUM_FEATURES.PRESCREEN_QUESTIONS]: {
      title: 'Prescreen Questions',
      description: 'Add custom questions for candidates to answer',
      icon: '❓'
    }
  };
}

export default {
  PREMIUM_FEATURES,
  hasPremiumAccess,
  hasPremiumFeature,
  getAvailablePremiumFeatures,
  processJobContent,
  maskVulgarWords,
  containsVulgarWords,
  getPremiumFeatureLimits,
  getPremiumFeatureDescriptions
};
