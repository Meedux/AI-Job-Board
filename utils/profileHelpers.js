import QRCode from 'qrcode';

export function generateShareSlug(length = 8) {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let slug = '';
  for (let i = 0; i < length; i++) slug += chars[Math.floor(Math.random() * chars.length)];
  return slug;
}

export function createVCardString(user = {}, appUrl = 'https://example.com') {
  const fullName = user.fullName || user.nickname || 'Candidate';
  const email = user.email || '';
  const phone = user.phone || '';
  const org = user.companyName || '';
  const url = `${appUrl}/profile/${user.id || 'unknown'}`;

  const vcard = `BEGIN:VCARD\nVERSION:3.0\nFN:${fullName}\nORG:${org}\nTEL:${phone}\nEMAIL:${email}\nURL:${url}\nEND:VCARD`;
  return vcard;
}

export async function generateQRCodeDataUrl(text, opts = { margin: 1, width: 240 }) {
  if (!text) throw new Error('text required');
  return QRCode.toDataURL(text, opts);
}
