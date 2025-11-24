import dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config();

async function main(){
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const res = await client.query("SELECT conname, contype, conrelid::regclass AS table, pg_get_constraintdef(oid) as def FROM pg_constraint WHERE conrelid = 'job_bookmarks'::regclass;");
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}

main().catch(err => { console.error(err); process.exit(1); });
