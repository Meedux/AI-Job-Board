import dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config();

async function main(){
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const res = await client.query("SELECT table_name, column_name, data_type, udt_name FROM information_schema.columns WHERE table_schema='public' AND table_name IN ('jobs','job_bookmarks') ORDER BY table_name, column_name;");
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}

main().catch(err => { console.error(err); process.exit(1); });
