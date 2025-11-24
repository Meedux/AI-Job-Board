import dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config();

async function main(){
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  const res = await client.query("SELECT column_name, data_type, udt_name, column_default FROM information_schema.columns WHERE table_name='job_bookmarks' ORDER BY ordinal_position;");
  console.log(JSON.stringify(res.rows, null, 2));
  await client.end();
}

main().catch(err => { console.error(err); process.exit(1); });
