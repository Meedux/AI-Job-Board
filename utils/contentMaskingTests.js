/**
 * Content Masking Test Utility
 * Tests all aspects of the content masking feature
 */

import { 
  maskEmail, 
  maskPhone, 
  maskAddress, 
  maskFullName, 
  maskGenericText,
  maskUserData,
  canUseContentMasking,
  maskApplicationData
} from './userContentMasking.js';

// Test data
const testUser = {
  fullName: 'John Michael Smith',
  firstName: 'John',
  lastName: 'Smith',
  email: 'john.smith@example.com',
  fullAddress: '123 Main Street, Apartment 4B, New York City, NY, USA',
  phone: '+1-555-123-4567',
  contact: '09171234567'
};

const testSubscriptions = {
  free: { plan: { planType: 'free' }, status: 'active' },
  basic: { plan: { planType: 'basic' }, status: 'active' },
  premium: { plan: { planType: 'premium' }, status: 'active' },
  enterprise: { plan: { planType: 'enterprise' }, status: 'active' },
  inactive: { plan: { planType: 'premium' }, status: 'inactive' }
};

const testApplication = {
  resumeUrl: 'https://drive.google.com/file/d/1234567890abcdefg/view',
  coverLetter: 'Dear Hiring Manager, I am writing to express my interest in the Software Developer position. I have extensive experience in JavaScript and React. I believe I would be a great fit for your team. Thank you for your consideration.',
  contactInfo: testUser
};

/**
 * Run all content masking tests
 */
export function runContentMaskingTests() {
  console.log('🧪 Running Content Masking Tests\n');

  // Test individual masking functions
  console.log('📧 Email Masking Tests:');
  console.log('Original:', testUser.email);
  console.log('Masked:', maskEmail(testUser.email));
  console.log('Edge case (short):', maskEmail('a@b.com'));
  console.log();

  console.log('📱 Phone Masking Tests:');
  console.log('Original:', testUser.phone);
  console.log('Masked:', maskPhone(testUser.phone));
  console.log('Local format:', maskPhone(testUser.contact));
  console.log();

  console.log('🏠 Address Masking Tests:');
  console.log('Original:', testUser.fullAddress);
  console.log('Masked:', maskAddress(testUser.fullAddress));
  console.log();

  console.log('👤 Name Masking Tests:');
  console.log('Original:', testUser.fullName);
  console.log('Masked:', maskFullName(testUser.fullName));
  console.log('Single name:', maskFullName('John'));
  console.log();

  console.log('🔒 Generic Text Masking Tests:');
  console.log('Original:', 'sensitive-document-123');
  console.log('Masked:', maskGenericText('sensitive-document-123'));
  console.log();

  // Test full user data masking
  console.log('👥 Full User Data Masking Test:');
  console.log('Original User:', JSON.stringify(testUser, null, 2));
  const maskedUser = maskUserData(testUser, true);
  console.log('Masked User:', JSON.stringify(maskedUser, null, 2));
  console.log();

  // Test subscription access
  console.log('💎 Subscription Access Tests:');
  Object.entries(testSubscriptions).forEach(([tier, subscription]) => {
    const canUse = canUseContentMasking(subscription);
    console.log(`${tier}: ${canUse ? '✅ Can use' : '❌ Cannot use'} content masking`);
  });
  console.log();

  // Test application data masking
  console.log('📄 Application Data Masking Test:');
  console.log('Original Application:', JSON.stringify(testApplication, null, 2));
  const maskedApplication = maskApplicationData(testApplication, true);
  console.log('Masked Application:', JSON.stringify(maskedApplication, null, 2));
  console.log();

  console.log('✅ All tests completed!');
}

/**
 * Interactive test function for browser console
 */
export function testContentMasking() {
  if (typeof window !== 'undefined') {
    runContentMaskingTests();
    
    // Add test functions to window for easy access
    window.contentMaskingTests = {
      maskEmail,
      maskPhone,
      maskAddress,
      maskFullName,
      maskGenericText,
      maskUserData,
      canUseContentMasking,
      maskApplicationData,
      testUser,
      testSubscriptions,
      testApplication,
      runAll: runContentMaskingTests
    };
    
    console.log('🎯 Content masking test functions added to window.contentMaskingTests');
    console.log('Try: window.contentMaskingTests.runAll()');
  }
}

// Export for use in other components
export {
  testUser,
  testSubscriptions,
  testApplication
};
