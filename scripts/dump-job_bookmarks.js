import dotenv from 'dotenv';
import { Client } from 'pg';
import fs from 'fs';

dotenv.config();

async function main(){
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const res = await client.query('SELECT * FROM job_bookmarks;');
  const file = './scripts/job_bookmarks_backup.json';
  fs.writeFileSync(file, JSON.stringify(res.rows, null, 2), 'utf8');
  console.log('Wrote', res.rowCount, 'rows to', file);
  await client.end();
}

main().catch(err => { console.error(err); process.exit(1); });
