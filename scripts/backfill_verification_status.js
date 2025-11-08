// Backfill script to populate new verification fields after adding schema changes
// Run with: node scripts/backfill_verification_status.js

import { PrismaClient } from '@prisma/client';
const prisma = new PrismaClient();

async function main() {
  console.log('Starting backfill: verification_status and tin defaults');

  // Backfill verificationStatus from isVerified
  const users = await prisma.user.findMany({ select: { id: true, isVerified: true, taxId: true, tin: true } });
  console.log(`Found ${users.length} users`);

  for (const u of users) {
    const status = u.isVerified ? 'verified' : 'unverified';
    const updates = {};
    updates.verificationStatus = status;
    // If tin is empty but taxId exists, copy taxId -> tin to populate
    if ((!u.tin || u.tin === '') && u.taxId) updates.tin = u.taxId;

    try {
      await prisma.user.update({ where: { id: u.id }, data: updates });
    } catch (e) {
      console.error(`Failed to update user ${u.id}:`, e.message);
    }
  }

  console.log('Backfill complete.');
}

main().catch((e) => {
  console.error(e);
  process.exit(1);
}).finally(async () => {
  await prisma.$disconnect();
});
