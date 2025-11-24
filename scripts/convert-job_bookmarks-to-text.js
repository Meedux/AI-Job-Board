import dotenv from 'dotenv';
import { Client } from 'pg';

dotenv.config();

async function main(){
  const client = new Client({ connectionString: process.env.DATABASE_URL, ssl: { rejectUnauthorized: false } });
  await client.connect();
  try {
    console.log('Altering id...');
    await client.query("ALTER TABLE job_bookmarks ALTER COLUMN id TYPE text USING id::text;");
    console.log('Altering job_id...');
    await client.query("ALTER TABLE job_bookmarks ALTER COLUMN job_id TYPE text USING job_id::text;");
    console.log('Altering user_id...');
    await client.query("ALTER TABLE job_bookmarks ALTER COLUMN user_id TYPE text USING user_id::text;");
    console.log('Done');
  } catch (e){
    console.error('Failed to alter:', e.message);
  }
  await client.end();
}

main().catch(err => { console.error(err); process.exit(1); });
