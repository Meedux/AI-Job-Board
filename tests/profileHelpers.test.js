import assert from 'assert';
import { generateShareSlug, createVCardString, generateQRCodeDataUrl } from '../utils/profileHelpers.js';

// Test slug generator
const slug = generateShareSlug();
assert(typeof slug === 'string' && slug.length === 8, 'Slug should be a string of length 8');
assert(/^[a-z0-9]{8}$/.test(slug), 'Slug should only contain lowercase alphanumerics');

// Test vCard string creation
const sampleUser = { id: 'u-test', fullName: 'Test Candidate', email: 'test@example.com', phone: '+123456789', companyName: 'Acme Inc.' };
const vcardStr = createVCardString(sampleUser, 'https://example.test');
assert(vcardStr.startsWith('BEGIN:VCARD'), 'vCard should start with BEGIN:VCARD');
assert(vcardStr.includes('FN:Test Candidate'), 'vCard should include full name');
assert(vcardStr.includes('TEL:+123456789'), 'vCard should include phone number');
assert(vcardStr.includes('EMAIL:test@example.com'), 'vCard should include email');
assert(vcardStr.includes('URL:https://example.test/profile/u-test'), 'vCard should include profile URL');

(async () => {
  // QR Code generation should return a data URL
  const qr = await generateQRCodeDataUrl('https://example.test/profile/u-test');
  assert(typeof qr === 'string' && qr.startsWith('data:image/png;base64,'), 'QR function should return a data URL');
  console.log('profileHelpers tests passed');
})().catch(e => { console.error(e); process.exit(1); });
