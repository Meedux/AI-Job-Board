/**
 * User Content Masking Utility
 * Premium feature for hiding sensitive user information in profiles
 */

/**
 * Masks an email address
 * @param {string} email - The email to mask
 * @returns {string} - Masked email
 */
export function maskEmail(email) {
  if (!email || typeof email !== 'string') return email;
  
  const [localPart, domain] = email.split('@');
  if (!localPart || !domain) return email;
  
  const maskedLocal = localPart.length > 2 
    ? localPart.substring(0, 2) + '*'.repeat(localPart.length - 2)
    : '*'.repeat(localPart.length);
    
  return `${maskedLocal}@${domain}`;
}

/**
 * Masks a phone number
 * @param {string} phone - The phone number to mask
 * @returns {string} - Masked phone number
 */
export function maskPhone(phone) {
  if (!phone || typeof phone !== 'string') return phone;
  
  // Remove all non-digit characters
  const digits = phone.replace(/\D/g, '');
  
  if (digits.length < 4) return '*'.repeat(phone.length);
  
  // Show first 2 and last 2 digits, mask the middle
  const masked = digits.substring(0, 2) + 
                '*'.repeat(digits.length - 4) + 
                digits.substring(digits.length - 2);
  
  // Preserve original formatting pattern
  let result = '';
  let maskedIndex = 0;
  
  for (let i = 0; i < phone.length; i++) {
    if (/\d/.test(phone[i])) {
      result += masked[maskedIndex++];
    } else {
      result += phone[i];
    }
  }
  
  return result;
}

/**
 * Masks an address (shows only city and country)
 * @param {string} address - The address to mask
 * @returns {string} - Masked address
 */
export function maskAddress(address) {
  if (!address || typeof address !== 'string') return address;
  
  // Simple heuristic: keep last 2 parts (usually city, country)
  const parts = address.split(',').map(part => part.trim());
  
  if (parts.length <= 2) {
    return '*'.repeat(Math.max(1, parts[0].length - 5)) + parts.slice(-1).join(', ');
  }
  
  // Show only city and country (last 2 parts)
  const visibleParts = parts.slice(-2);
  const maskedCount = parts.length - 2;
  
  return `${'*'.repeat(maskedCount * 3)} ${visibleParts.join(', ')}`;
}

/**
 * Masks a full name (shows first name initial and last name)
 * @param {string} fullName - The full name to mask
 * @returns {string} - Masked name
 */
export function maskFullName(fullName) {
  if (!fullName || typeof fullName !== 'string') return fullName;
  
  const nameParts = fullName.trim().split(' ');
  
  if (nameParts.length === 1) {
    return nameParts[0].charAt(0) + '*'.repeat(Math.max(0, nameParts[0].length - 1));
  }
  
  // Show first initial and last name
  const firstName = nameParts[0];
  const lastName = nameParts[nameParts.length - 1];
  
  return `${firstName.charAt(0)}. ${lastName}`;
}

/**
 * Masks any string by showing first and last few characters
 * @param {string} text - The text to mask
 * @param {number} showStart - Number of characters to show at start (default: 2)
 * @param {number} showEnd - Number of characters to show at end (default: 2)
 * @returns {string} - Masked text
 */
export function maskGenericText(text, showStart = 2, showEnd = 2) {
  if (!text || typeof text !== 'string') return text;
  
  if (text.length <= showStart + showEnd) {
    return '*'.repeat(text.length);
  }
  
  const start = text.substring(0, showStart);
  const end = text.substring(text.length - showEnd);
  const maskLength = text.length - showStart - showEnd;
  
  return `${start}${'*'.repeat(maskLength)}${end}`;
}

/**
 * Main masking function that masks all sensitive fields in user data
 * @param {Object} userData - User data object
 * @param {boolean} maskingEnabled - Whether masking is enabled
 * @returns {Object} - User data with masked fields if enabled
 */
export function maskUserData(userData, maskingEnabled = false) {
  if (!maskingEnabled || !userData) return userData;
  
  const maskedData = { ...userData };
  
  // Mask email
  if (maskedData.email) {
    maskedData.email = maskEmail(maskedData.email);
  }
  
  // Mask full name
  if (maskedData.fullName) {
    maskedData.fullName = maskFullName(maskedData.fullName);
  }
  
  // Mask first and last name separately if available
  if (maskedData.firstName) {
    maskedData.firstName = maskedData.firstName.charAt(0) + '*'.repeat(Math.max(0, maskedData.firstName.length - 1));
  }
  
  if (maskedData.lastName) {
    maskedData.lastName = maskGenericText(maskedData.lastName, 1, 1);
  }
  
  // Mask address
  if (maskedData.fullAddress) {
    maskedData.fullAddress = maskAddress(maskedData.fullAddress);
  }
  
  // Mask any phone numbers if they exist in the data
  Object.keys(maskedData).forEach(key => {
    if (key.toLowerCase().includes('phone') || key.toLowerCase().includes('contact')) {
      if (typeof maskedData[key] === 'string' && maskedData[key]) {
        maskedData[key] = maskPhone(maskedData[key]);
      }
    }
  });
  
  return maskedData;
}

/**
 * Check if user has access to content masking (premium feature)
 * @param {Object} subscription - User subscription data
 * @returns {boolean} - Whether user can use content masking
 */
export function canUseContentMasking(subscription) {
  if (!subscription) return false;
  
  // Check if subscription is active
  if (subscription.status !== 'active') return false;
  
  // Free tier users cannot use content masking
  const planType = subscription.plan?.planType || subscription.planType;
  if (planType === 'free') return false;
  
  // All other tiers (basic, premium, enterprise) can use it
  return ['basic', 'premium', 'enterprise'].includes(planType);
}

/**
 * Masks content in job applications and resume data
 * @param {Object} applicationData - Job application or resume data
 * @param {boolean} maskingEnabled - Whether masking is enabled
 * @returns {Object} - Masked application data
 */
export function maskApplicationData(applicationData, maskingEnabled = false) {
  if (!maskingEnabled || !applicationData) return applicationData;
  
  const maskedData = { ...applicationData };
  
  // Mask resume URL or content
  if (maskedData.resumeUrl) {
    maskedData.resumeUrl = maskGenericText(maskedData.resumeUrl, 10, 10);
  }
  
  // Mask cover letter content (show first and last sentences)
  if (maskedData.coverLetter) {
    const sentences = maskedData.coverLetter.split('.');
    if (sentences.length > 2) {
      const firstSentence = sentences[0] + '.';
      const lastSentence = sentences[sentences.length - 1];
      const maskedMiddle = ' [...content masked...] ';
      maskedData.coverLetter = firstSentence + maskedMiddle + lastSentence;
    }
  }
  
  // Mask any embedded contact information
  if (maskedData.contactInfo) {
    maskedData.contactInfo = maskUserData(maskedData.contactInfo, true);
  }
  
  return maskedData;
}
