import assert from 'assert';
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

(async () => {
  try {
    const now = Date.now();
    const email = `test.user.${now}@example.test`;
    // create test user
    const created = await prisma.user.create({ data: { email, password: 'testpass' } });
    assert(created && created.id, 'User should be created');

    // update profile fields
    const vcardPath = `/uploads/vcards/test-${now}.vcf`;
    const qrPath = `/uploads/profiles/test-${now}.png`;
    const shareUrl = `https://example.test/profile/${created.id}?s=testslug${now}`;

    const updated = await prisma.user.update({ where: { id: created.id }, data: { vcardUrl: vcardPath, qrImagePath: qrPath, shareableLink: shareUrl } });

    assert(updated.vcardUrl === vcardPath, 'vcardUrl should be persisted');
    assert(updated.qrImagePath === qrPath, 'qrImagePath should be persisted');
    assert(updated.shareableLink === shareUrl, 'shareableLink should be persisted');

    // clean up
    await prisma.user.delete({ where: { id: created.id } });
    console.log('dbProfileFields tests passed');
  } catch (err) {
    console.error('dbProfileFields test failed:', err);
    process.exit(1);
  } finally {
    await prisma.$disconnect();
  }
})();
