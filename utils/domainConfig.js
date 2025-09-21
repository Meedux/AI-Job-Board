// Domain Configuration Utility
// Handles dynamic domain detection for email URLs and other absolute links

/**
 * Gets the current application domain/base URL
 * Priority order:
 * 1. NEXT_PUBLIC_BASE_URL environment variable
 * 2. VERCEL_URL for Vercel deployments  
 * 3. Dynamic detection from request headers
 * 4. Fallback to localhost for development
 */
export function getBaseUrl(request = null) {
  // 1. Check explicit environment variable first
  if (process.env.NEXT_PUBLIC_BASE_URL) {
    console.log('🌍 Using NEXT_PUBLIC_BASE_URL:', process.env.NEXT_PUBLIC_BASE_URL);
    return process.env.NEXT_PUBLIC_BASE_URL;
  }

  // 2. Check Vercel deployment URL
  if (process.env.VERCEL_URL) {
    const vercelUrl = `https://${process.env.VERCEL_URL}`;
    console.log('🚀 Using Vercel URL:', vercelUrl);
    return vercelUrl;
  }

  // 3. Try to detect from request headers (for API routes)
  if (request && request.headers) {
    try {
      const host = request.headers.get('host');
      const protocol = request.headers.get('x-forwarded-proto') || 
                     (host && host.includes('localhost') ? 'http' : 'https');
      
      if (host) {
        const dynamicUrl = `${protocol}://${host}`;
        console.log('🔍 Detected from request headers:', dynamicUrl);
        return dynamicUrl;
      }
    } catch (error) {
      console.warn('⚠️ Failed to detect URL from request headers:', error.message);
    }
  }

  // 4. Production fallback - try common production domains
  if (process.env.NODE_ENV === 'production') {
    // Add your production domains here
    const productionDomains = [
      'https://getgethired.com',
      'https://jobsite.com',
      'https://ai-job-board.vercel.app'
    ];
    
    console.log('🏭 Production mode, using first production domain:', productionDomains[0]);
    return productionDomains[0];
  }

  // 5. Development fallback
  const devUrl = 'http://localhost:3000';
  console.log('🛠️ Development fallback:', devUrl);
  return devUrl;
}

/**
 * Gets verification URL for email verification
 * @param {string} token - Verification token
 * @param {Request} request - Optional request object for dynamic detection
 * @returns {string} Complete verification URL
 */
export function getVerificationUrl(token, request = null) {
  const baseUrl = getBaseUrl(request);
  const verificationUrl = `${baseUrl}/api/auth/verify-email?token=${token}`;
  console.log('📧 Generated verification URL:', verificationUrl);
  return verificationUrl;
}

/**
 * Gets password reset URL
 * @param {string} token - Reset token
 * @param {Request} request - Optional request object for dynamic detection
 * @returns {string} Complete reset URL
 */
export function getPasswordResetUrl(token, request = null) {
  const baseUrl = getBaseUrl(request);
  const resetUrl = `${baseUrl}/reset-password?token=${token}`;
  console.log('🔐 Generated password reset URL:', resetUrl);
  return resetUrl;
}

/**
 * Gets dashboard URL for redirects
 * @param {Request} request - Optional request object for dynamic detection
 * @returns {string} Complete dashboard URL
 */
export function getDashboardUrl(request = null) {
  const baseUrl = getBaseUrl(request);
  return `${baseUrl}/dashboard`;
}

/**
 * Gets login URL for redirects
 * @param {Request} request - Optional request object for dynamic detection
 * @returns {string} Complete login URL
 */
export function getLoginUrl(request = null) {
  const baseUrl = getBaseUrl(request);
  return `${baseUrl}/login`;
}

/**
 * Validates if URL is using localhost (for debugging)
 * @param {string} url - URL to check
 * @returns {boolean} True if localhost
 */
export function isLocalhost(url) {
  return url && url.includes('localhost');
}

/**
 * Environment detection utilities
 */
export const isDevelopment = () => process.env.NODE_ENV === 'development';
export const isProduction = () => process.env.NODE_ENV === 'production';
export const isVercel = () => !!process.env.VERCEL_URL;

// Default export
export default {
  getBaseUrl,
  getVerificationUrl,
  getPasswordResetUrl,
  getDashboardUrl,
  getLoginUrl,
  isLocalhost,
  isDevelopment,
  isProduction,
  isVercel
};