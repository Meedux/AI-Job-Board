/*
  Simple end-to-end script to test the resume upload endpoint. Requires:
  - BLOB_READ_WRITE_TOKEN set in env (when testing Vercel Blob)
  - NEXT_PUBLIC_BASE_URL or run against localhost

  Usage:
  node scripts/test-blob-upload.js
*/

import fs from 'fs';
import path from 'path';
import fetch from 'node-fetch';
import FormData from 'form-data';

const APP_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
const TEST_USER_ID = process.env.TEST_USER_ID;
const TEST_AUTH_TOKEN = process.env.TEST_AUTH_TOKEN; // optional: use bearer token to authenticate

async function run() {
  if (!TEST_USER_ID) {
    console.error('Please set TEST_USER_ID in environment to the user id to attach the resume to.');
    process.exit(1);
  }

  const sampleFilePath = path.join(process.cwd(), 'tests', 'fixtures', 'sample_resume.pdf');
  if (!fs.existsSync(sampleFilePath)) {
    console.error('Missing sample resume at tests/fixtures/sample_resume.pdf. Create one to run this test.');
    process.exit(1);
  }

  const form = new FormData();
  form.append('resume', fs.createReadStream(sampleFilePath));
  form.append('userId', TEST_USER_ID);

  const headers = {
    ...(TEST_AUTH_TOKEN ? { Authorization: `Bearer ${TEST_AUTH_TOKEN}` } : {})
  };

  try {
    const res = await fetch(`${APP_URL}/api/upload/resume`, {
      method: 'POST',
      body: form,
      headers
    });

    const json = await res.json();
    console.log('Upload response status:', res.status);
    console.log('Response body:', json);

    if (res.ok && json.resumeUrl) {
      console.log('Blob upload test succeeded.');
      process.exit(0);
    }

    console.error('Blob upload test failed.');
    process.exit(2);
  } catch (err) {
    console.error('Error running blob upload test:', err);
    process.exit(3);
  }
}

run();
