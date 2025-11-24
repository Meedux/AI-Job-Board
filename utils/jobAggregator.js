import { db } from './db';
import fetch from 'node-fetch';
import { parse } from 'node-html-parser';

/**
 * Basic crawler - given a list of URLs, fetches page, tries to discover job postings (basic heuristics)
 * This is intentionally small and safe: it returns normalized candidate jobs for later review.
 */
export async function crawlUrls(urls = [], options = {}) {
  const jobs = [];

  for (const url of urls) {
    try {
      const res = await fetch(url, { timeout: 10_000 });
      if (!res.ok) {
        console.warn('[crawlUrls] fetch failed', url, res.status);
        continue;
      }

      const text = await res.text();
      const root = parse(text);

      // Heuristic: look for job-like blocks
      // Search for common tags / classes
      const selectors = ['[class*=job-]', '[id*=job-]', 'article', 'li', '.posting', '.job', '.job-card'];
      let found = [];

      for (const sel of selectors) {
        const nodes = root.querySelectorAll(sel);
        if (nodes && nodes.length) found = found.concat(nodes);
      }

      // Fallback: treat entire page as one candidate
      if (found.length === 0) found = [root];

      for (const node of found.slice(0, 30)) {
        const title = (node.querySelector('h1') || node.querySelector('h2') || node.querySelector('h3') || node.querySelector('.title') || node.querySelector('.job-title'))?.text?.trim() || '';
        const company = (node.querySelector('.company') || node.querySelector('[class*=company]') || root.querySelector('meta[property="og:site_name"]'))?.text?.trim() || '';
        const location = (node.querySelector('.location') || node.querySelector('[class*=location]'))?.text?.trim() || '';
        const salary = (node.querySelector('[class*=salary]') || node.querySelector('.pay'))?.text?.trim() || null;
        const link = node.querySelector('a')?.getAttribute('href') || url;
        const desc = (node.querySelector('p') || node.querySelector('.description') || node.querySelector('.summary'))?.text?.trim() || '';

        // Skip if nothing useful
        if (!title && !company && !desc) continue;

        const normalized = normalizeJobData({ title, company, location, salary, link, description: desc, source: url });
        jobs.push(normalized);
      }

    } catch (err) {
      console.warn('[crawlUrls] error', url, err.message);
    }
  }

  return jobs;
}

/**
 * Normalize scraped or imported job payloads to site schema
 */
export function normalizeJobData(raw = {}) {
  const title = raw.title?.replace(/\s+/g, ' ').trim();
  const company = raw.company || raw.companyName || raw.employer || '';
  const location = raw.location || raw.city || raw.region || '';
  const { salary } = raw;

  const salaryParsed = parseSalaryString(salary);

  return {
    title: title || 'Untitled Job',
    companyName: company || 'Unknown',
    location: location || 'Remote',
    salaryFrom: salaryParsed?.from || null,
    salaryTo: salaryParsed?.to || null,
    salaryCurrency: salaryParsed?.currency || 'PHP',
    salaryRaw: salary || null,
    description: raw.description || raw.desc || '',
    sourceUrl: raw.link || raw.source || null,
    sourceHost: raw.source ? new URL(raw.source).host : raw.link ? tryHost(raw.link) : null,
    postedAt: new Date().toISOString()
  };
}

function tryHost(url) {
  try { return new URL(url).host; } catch (_) { return null; }
}

function parseSalaryString(s) {
  if (!s) return null;
  // super-simple parse: look for currency symbols and ranges like 1,000 - 2,000
  const out = { raw: s };
  const matchRange = s.match(/\$?\s*([\d,]+)\s*[-–—to]+\s*\$?\s*([\d,]+)/);
  if (matchRange) {
    out.from = parseInt(matchRange[1].replace(/,/g, ''), 10);
    out.to = parseInt(matchRange[2].replace(/,/g, ''), 10);
    out.currency = s.includes('$') ? 'USD' : 'PHP';
    return out;
  }

  const single = s.match(/\$\s*([\d,]+)/) || s.match(/([\d,]+)\s*(PHP|₱)/i);
  if (single) {
    out.from = parseInt((single[1] || single[0]).replace(/,/g, ''), 10);
    out.currency = s.includes('$') ? 'USD' : 'PHP';
  }
  return out;
}

/**
 * Convert internal job list to a minimal RSS feed XML string
 */
export function generateRSSFeed(jobs = [], opts = {}) {
  const title = opts.title || 'Job Feed';
  const description = opts.description || 'Aggregated job feed';
  const link = opts.link || 'https://example.com';

  const items = jobs.map(job => `
    <item>
      <title>${escapeXml(job.title || job.jobTitle || 'Job')}</title>
      <link>${escapeXml(job.sourceUrl || `${link}/jobs/${job.id || ''}`)}</link>
      <description>${escapeXml(job.description || '')}</description>
      <author>${escapeXml(job.companyName || '')}</author>
      <pubDate>${new Date(job.postedAt || Date.now()).toUTCString()}</pubDate>
    </item>
  `).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>\n<rss version="2.0">\n<channel>\n<title>${escapeXml(title)}</title>\n<link>${escapeXml(link)}</link>\n<description>${escapeXml(description)}</description>\n${items}\n</channel>\n</rss>`;
}

function escapeXml(s) {
  if (!s) return '';
  return String(s).replace(/[<>&"']/g, c => ({ '<':'&lt;','>':'&gt;','&':'&amp;','"':'&quot;',"'":"&apos;" })[c]);
}

/**
 * Prepare job objects for external platforms (Indeed / Google Jobs schema skeletons)
 */
export function prepareGoogleJobsSchema(job) {
  // Minimal Google job posting structured data (JSON-LD)
  return {
    '@context': 'https://schema.org',
    '@type': 'JobPosting',
    title: job.title,
    description: job.description || '',
    datePosted: job.postedAt || new Date().toISOString(),
    validThrough: job.expiresAt || null,
    employmentType: job.jobType || 'FULL_TIME',
    hiringOrganization: {
      '@type': 'Organization',
      name: job.companyName,
    },
    jobLocation: {
      '@type': 'Place',
      address: { '@type': 'PostalAddress', addressLocality: job.location }
    }
  };
}

export function prepareIndeedSchema(job) {
  // Indeed requires a simple XML/JSON structure per their ingestion docs; provide a placeholder
  return {
    title: job.title,
    company: job.companyName,
    city: job.location,
    country: job.country || 'PH',
    description: job.description,
    url: job.sourceUrl
  };
}

/**
 * Stubs for posting to 3rd-party networks.
 * In production you must implement OAuth and publisher API calls.
 */
export async function postToLinkedIn(job, creds) {
  console.log('[postToLinkedIn] stub - job', job.title);
  return { success: true, message: 'Stubbed post' };
}

export async function postToFacebook(job, creds) {
  console.log('[postToFacebook] stub - job', job.title);
  return { success: true, message: 'Stubbed post' };
}

export async function enqueueJobAlert(job) {
  // placeholder - the real implementation should push to notification queue
  console.log('[enqueueJobAlert] queued alert for job', job.title);
  return true;
}
