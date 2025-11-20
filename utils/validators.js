// Validation helpers for employer compliance identifiers and licenses
// Note: Patterns are pragmatic and conservative; adjust to official specs as needed.

export function isValidTIN(tin) {
  if (!tin) return false;
  const cleaned = String(tin).replace(/[^0-9]/g, '');
  // PH TIN commonly 9 or 12 digits (e.g., 123-456-789-000)
  return cleaned.length === 9 || cleaned.length === 12;
}

export function isValidBIRFormCode(formCode) {
  if (!formCode) return false;
  const code = String(formCode).trim();
  // Common employer forms: 2303 (Certificate of Registration), 2316, 0605
  return /^(2303|2316|0605)$/.test(code);
}

export function isValidDOLELicense(license, subtype = '') {
  if (!license) return false;
  const val = String(license).trim();
  // Very loose: alnum + dashes, length 6-20
  if (!/^[A-Za-z0-9-]{6,20}$/.test(val)) return false;
  // If subtype indicates PEA/SRA/SRS/PSA/Manpower, accept the above; refine later as needed
  return true;
}

export function isValidDMWLicense(license, dmwType = '') {
  if (!license) return false;
  const val = String(license).trim();
  // DMW (formerly POEA) licenses often alnum with slashes or dashes; allow alnum/\-/
  return /^[A-Za-z0-9-\/]{6,24}$/.test(val);
}

export function validateCompliance({ tin, birFormCode, doleLicense, dmwLicense, subtype, dmwType }) {
  const errors = {};
  if (tin !== undefined && !isValidTIN(tin)) errors.tin = 'Invalid TIN format';
  if (birFormCode !== undefined && !isValidBIRFormCode(birFormCode)) errors.birFormCode = 'Unsupported BIR form code';
  if (doleLicense !== undefined && !isValidDOLELicense(doleLicense, subtype)) errors.doleLicense = 'Invalid DOLE license';
  if (dmwLicense !== undefined && !isValidDMWLicense(dmwLicense, dmwType)) errors.dmwLicense = 'Invalid DMW license';
  return { valid: Object.keys(errors).length === 0, errors };
}
