import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();

async function seedATS() {
  try {
    console.log('🌱 Starting ATS seed...');

    // Create test employer
    const employer = await prisma.user.upsert({
      where: { email: 'employer@test.com' },
      update: {},
      create: {
        email: 'employer@test.com',
        password: '$2b$10$dummy_hash',
        fullName: 'Test Employer',
        name: 'Test Employer',
        role: 'employer_admin',
        companyName: 'Tech Solutions Inc.',
        isActive: true
      }
    });

    console.log('✅ Created employer:', employer.email);

    // Create company
    const company = await prisma.company.upsert({
      where: { name: 'Tech Solutions Inc.' },
      update: {},
      create: {
        name: 'Tech Solutions Inc.',
        description: 'Leading technology solutions provider',
        location: 'Manila, Philippines',
        industry: 'Technology',
        websiteUrl: 'https://techsolutions.com',
        createdById: employer.id
      }
    });

    console.log('✅ Created company:', company.name);

    // Create test job
    const job = await prisma.job.upsert({
      where: { slug: 'senior-fullstack-developer' },
      update: {},
      create: {
        title: 'Senior Fullstack Developer',
        slug: 'senior-fullstack-developer',
        description: 'We are looking for an experienced fullstack developer.',
        requirements: 'Minimum 5 years experience in React, Node.js',
        salaryFrom: 80000,
        salaryTo: 120000,
        location: 'Manila, Philippines',
        remoteType: 'hybrid',
        jobType: 'full-time',
        experienceLevel: 'senior',
        requiredSkills: ['React', 'Node.js', 'PostgreSQL'],
        status: 'active',
        companyId: company.id,
        postedById: employer.id,
        city: 'Manila',
        country: 'Philippines'
      }
    });

    console.log('✅ Created job:', job.title);

    // Create job seekers
    const jobSeeker1 = await prisma.user.upsert({
      where: { email: 'john.doe@email.com' },
      update: {},
      create: {
        email: 'john.doe@email.com',
        password: '$2b$10$dummy_hash',
        fullName: 'John Doe',
        name: 'John Doe',
        role: 'job_seeker',
        location: 'Manila, Philippines',
        phone: '+63912345678',
        skills: ['React', 'Node.js', 'TypeScript'],
        resumeUrl: 'https://example.com/resumes/john-doe.pdf'
      }
    });

    const jobSeeker2 = await prisma.user.upsert({
      where: { email: 'jane.smith@email.com' },
      update: {},
      create: {
        email: 'jane.smith@email.com',
        password: '$2b$10$dummy_hash',
        fullName: 'Jane Smith',
        name: 'Jane Smith',
        role: 'job_seeker',
        location: 'Cebu, Philippines',
        phone: '+63923456789',
        skills: ['Figma', 'Adobe XD', 'User Research'],
        resumeUrl: 'https://example.com/resumes/jane-smith.pdf'
      }
    });

    console.log('✅ Created job seekers');

    // Create applications
    await prisma.jobApplication.upsert({
      where: { 
        jobId_applicantId: {
          jobId: job.id,
          applicantId: jobSeeker1.id
        }
      },
      update: {},
      create: {
        jobId: job.id,
        applicantId: jobSeeker1.id,
        coverLetter: 'I am excited to apply for this position.',
        stage: 'new',
        rating: 4,
        notes: 'Strong technical background',
        tags: ['High Priority'],
        isFavorite: true,
        source: 'direct'
      }
    });

    await prisma.jobApplication.upsert({
      where: { 
        jobId_applicantId: {
          jobId: job.id,
          applicantId: jobSeeker2.id
        }
      },
      update: {},
      create: {
        jobId: job.id,
        applicantId: jobSeeker2.id,
        coverLetter: 'I would love to contribute to your team.',
        stage: 'reviewing',
        rating: 5,
        notes: 'Excellent portfolio',
        tags: ['Top Talent'],
        isFavorite: true,
        source: 'referral'
      }
    });

    console.log('✅ Created applications');
    console.log('🎉 ATS seed data created successfully!');
    console.log('📧 Employer login: employer@test.com');

  } catch (error) {
    console.error('❌ Error seeding ATS data:', error);
    throw error;
  } finally {
    await prisma.$disconnect();
  }
}

// Run the seeder
seedATS()
  .then(() => {
    console.log('✅ Seeding completed!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('❌ Seeding failed:', error);
    process.exit(1);
  });
