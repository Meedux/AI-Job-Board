import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function main() {
  console.log('Seeding employer type requirements...');

  // Fetch some employer types by code for mapping
  const types = await prisma.employerType.findMany({});
  const byCode = Object.fromEntries(types.map(t => [t.code, t]));

  const rows = [];

  // Direct employers (local)
  if (byCode['direct_single']) {
    rows.push({ employerTypeId: byCode['direct_single'].id, provider: 'TIN', code: 'TIN', label: 'Tax Identification Number', required: true, schema: { pattern: '^[0-9-]{9,12}$' } });
    rows.push({ employerTypeId: byCode['direct_single'].id, provider: 'BIR', code: 'BIR-2303', label: 'BIR Form 2303 (Certificate of Registration)', required: true });
    rows.push({ employerTypeId: byCode['direct_single'].id, provider: 'BUSINESS_PERMIT', code: 'BP', label: 'Mayor/Business Permit', required: true });
  }
  if (byCode['direct_corporate']) {
    rows.push({ employerTypeId: byCode['direct_corporate'].id, provider: 'TIN', code: 'TIN', label: 'Corporate TIN', required: true });
    rows.push({ employerTypeId: byCode['direct_corporate'].id, provider: 'BIR', code: 'BIR-2303', label: 'BIR Form 2303', required: true });
    rows.push({ employerTypeId: byCode['direct_corporate'].id, provider: 'BUSINESS_PERMIT', code: 'BP', label: 'Mayor/Business Permit', required: true });
  }

  // PEA (local/abroad/both)
  ['pea_local','pea_abroad','pea_both'].forEach(code => {
    if (byCode[code]) {
      rows.push({ employerTypeId: byCode[code].id, provider: 'TIN', code: 'TIN', label: 'Tax Identification Number', required: true });
      rows.push({ employerTypeId: byCode[code].id, provider: 'DOLE', code: 'DOLE-PEA', label: 'DOLE PEA License', required: true, schema: { subtype: 'PEA' } });
      if (byCode[code].category !== 'local') {
        rows.push({ employerTypeId: byCode[code].id, provider: 'DMW', code: 'DMW-LICENSE', label: 'DMW License', required: true });
      }
    }
  });

  // DMW Licensed - Overseas
  if (byCode['dmw_abroad']) {
    rows.push({ employerTypeId: byCode['dmw_abroad'].id, provider: 'DMW', code: 'DMW-LICENSE', label: 'DMW License', required: true });
  }

  // Manpower Agencies
  ['ma_local','ma_abroad','ma_both'].forEach(code => {
    if (byCode[code]) {
      rows.push({ employerTypeId: byCode[code].id, provider: 'TIN', code: 'TIN', label: 'Tax Identification Number', required: true });
      rows.push({ employerTypeId: byCode[code].id, provider: 'DOLE', code: 'DOLE-MANPOWER', label: 'DOLE Manpower License', required: true });
      if (byCode[code].category !== 'local') {
        rows.push({ employerTypeId: byCode[code].id, provider: 'DMW', code: 'DMW-LICENSE', label: 'DMW License', required: true });
      }
    }
  });

  // Insert/upsert
  for (const r of rows) {
    await prisma.employerTypeRequirement.upsert({
      where: { employerTypeId_code: { employerTypeId: r.employerTypeId, code: r.code } },
      update: { ...r },
      create: { ...r }
    });
  }

  console.log('Employer type requirements seeded');
}

main().catch(e => { console.error(e); process.exit(1); }).finally(async () => prisma.$disconnect());
