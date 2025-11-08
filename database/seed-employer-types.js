// Seed employer types
import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

const employerTypes = [
  // Direct Employers
  {
    code: 'direct_single',
    label: 'Direct Employer - Single Entity',
    category: 'local',
    type: 'direct',
    subtype: 'single_entity',
    description: 'Individual business owner or single entity employer'
  },
  {
    code: 'direct_corporate',
    label: 'Direct Employer - Corporate',
    category: 'local',
    type: 'direct',
    subtype: 'corporate',
    description: 'Corporate entity hiring directly'
  },

  // Private Employment Agencies (PEA)
  {
    code: 'pea_local',
    label: 'PEA - Local Recruitment',
    category: 'local',
    type: 'agency',
    subtype: 'pea',
    description: 'Private Employment Agency for local recruitment'
  },
  {
    code: 'pea_abroad',
    label: 'PEA - Overseas Recruitment',
    category: 'abroad',
    type: 'agency',
    subtype: 'pea',
    description: 'Private Employment Agency for overseas recruitment'
  },
  {
    code: 'pea_both',
    label: 'PEA - Local & Overseas',
    category: 'both',
    type: 'agency',
    subtype: 'pea',
    description: 'Private Employment Agency for both local and overseas recruitment'
  },

  // Licensed Building Administrators (LB)
  {
    code: 'lb_local',
    label: 'LB - Local Recruitment',
    category: 'local',
    type: 'agency',
    subtype: 'lb',
    description: 'Licensed Building Administrator for local recruitment'
  },
  {
    code: 'lb_abroad',
    label: 'LB - Overseas Recruitment',
    category: 'abroad',
    type: 'agency',
    subtype: 'lb',
    description: 'Licensed Building Administrator for overseas recruitment'
  },
  {
    code: 'lb_both',
    label: 'LB - Local & Overseas',
    category: 'both',
    type: 'agency',
    subtype: 'lb',
    description: 'Licensed Building Administrator for both local and overseas recruitment'
  },

  // Manpower Agencies (MA)
  {
    code: 'ma_local',
    label: 'MA - Local Recruitment',
    category: 'local',
    type: 'agency',
    subtype: 'ma',
    description: 'Manpower Agency for local recruitment'
  },
  {
    code: 'ma_abroad',
    label: 'MA - Overseas Recruitment',
    category: 'abroad',
    type: 'agency',
    subtype: 'ma',
    description: 'Manpower Agency for overseas recruitment'
  },
  {
    code: 'ma_both',
    label: 'MA - Local & Overseas',
    category: 'both',
    type: 'agency',
    subtype: 'ma',
    description: 'Manpower Agency for both local and overseas recruitment'
  },

  // POEA Licensed Agencies
  {
    code: 'poea_abroad',
    label: 'POEA Licensed - Overseas',
    category: 'abroad',
    type: 'agency',
    subtype: 'poea',
    description: 'POEA licensed agency for overseas recruitment'
  },

  // DMW Licensed Agencies
  {
    code: 'dmw_abroad',
    label: 'DMW Licensed - Overseas',
    category: 'abroad',
    type: 'agency',
    subtype: 'dmw',
    description: 'DMW licensed agency for overseas recruitment'
  },

  // Sub-Agencies
  {
    code: 'sub_agency_local',
    label: 'Sub-Agency - Local',
    category: 'local',
    type: 'sub_agency',
    description: 'Sub-agency for local recruitment'
  },
  {
    code: 'sub_agency_abroad',
    label: 'Sub-Agency - Overseas',
    category: 'abroad',
    type: 'sub_agency',
    description: 'Sub-agency for overseas recruitment'
  },
  {
    code: 'sub_agency_both',
    label: 'Sub-Agency - Local & Overseas',
    category: 'both',
    type: 'sub_agency',
    description: 'Sub-agency for both local and overseas recruitment'
  }
];

async function main() {
  console.log('Seeding employer types...');

  for (const employerType of employerTypes) {
    await prisma.employerType.upsert({
      where: { code: employerType.code },
      update: employerType,
      create: employerType,
    });
  }

  console.log('Employer types seeded successfully!');
}

main()
  .catch((e) => {
    console.error(e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });