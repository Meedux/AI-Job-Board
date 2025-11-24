#!/usr/bin/env node
// Lightweight aggregator runner: crawl, persist, and write a static RSS feed
import fs from 'fs';
import path from 'path';
import { crawlUrls, normalizeJobData, generateRSSFeed } from '../utils/jobAggregator.js';
import { persistImportedJobs } from '../utils/jobImportManager.js';

async function run() {
  try {
    // read config URLs environment or file
    const configPath = path.resolve(process.cwd(), 'scripts', 'aggregator-urls.json');
    let urls = [];
    if (fs.existsSync(configPath)) {
      urls = JSON.parse(fs.readFileSync(configPath, 'utf8')) || [];
    } else if (process.env.AGGREGATOR_URLS) {
      urls = process.env.AGGREGATOR_URLS.split(',').map(s => s.trim()).filter(Boolean);
    }

    if (!Array.isArray(urls) || urls.length === 0) {
      console.log('No aggregator URLs configured. Create scripts/aggregator-urls.json or set AGGREGATOR_URLS');
      process.exit(0);
    }

    console.log('Crawling', urls.length, 'urls...');
    const raw = await crawlUrls(urls);
    const normalized = raw.map(normalizeJobData);

    // Persist
    const created = await persistImportedJobs(normalized, { createdById: null });
    console.log('Persisted', created.length, 'imports');

    // Generate RSS for all normalized jobs and write static file
    const rss = generateRSSFeed(normalized);
    const outDir = path.join(process.cwd(), 'public', 'feeds');
    if (!fs.existsSync(outDir)) fs.mkdirSync(outDir, { recursive: true });
    const outPath = path.join(outDir, 'aggregated.xml');
    fs.writeFileSync(outPath, rss, 'utf8');
    console.log('Wrote RSS feed to', outPath);
  } catch (e) {
    console.error('Aggregator run failed:', e);
    process.exit(1);
  }
}

run();
