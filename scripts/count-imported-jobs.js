import dotenv from 'dotenv';
import { PrismaClient } from '@prisma/client';

dotenv.config();
const prisma = new PrismaClient();

async function main(){
  const c = await prisma.importedJob.count();
  const b = await prisma.jobBookmark.count();
  console.log('imported_jobs count =', c);
  console.log('job_bookmarks count =', b);
}

main().catch(e => { console.error(e); process.exit(1); }).finally(() => prisma.$disconnect());
