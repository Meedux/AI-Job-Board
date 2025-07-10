// Migration script to move data from Google Sheets to Prisma/PostgreSQL
import { config } from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

// Load environment variables
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
config({ path: join(__dirname, '..', '.env.local') });

import { fetchSheetData, convertContentSheetToJobs } from '../utils/googleApi.js';
import { db, transaction, prisma } from '../utils/db.js';

// Configuration
const SPREADSHEET_ID = process.env.GOOGLE_SPREADSHEET_ID;
const SHEET_RANGE = process.env.GOOGLE_SHEET_RANGE || 'Content!A:P';

// Migration function
export const migrateFromGoogleSheets = async () => {
  console.log('🚀 Starting migration from Google Sheets to PostgreSQL with Prisma...');
  
  try {
    // Check if we have the necessary configuration
    console.log('📋 Checking configuration...');
    console.log('SPREADSHEET_ID:', SPREADSHEET_ID);
    console.log('SHEET_RANGE:', SHEET_RANGE);
    
    if (!SPREADSHEET_ID) {
      throw new Error('GOOGLE_SPREADSHEET_ID environment variable is required');
    }

    // Step 1: Fetch data from Google Sheets
    console.log('📊 Fetching data from Google Sheets...');
    const sheetData = await fetchSheetData(SPREADSHEET_ID, SHEET_RANGE);
    
    if (!sheetData || sheetData.length === 0) {
      console.log('No data found in Google Sheets');
      return;
    }

    // Step 2: Convert sheet data to job objects
    console.log('🔄 Converting sheet data to job objects...');
    const jobs = convertContentSheetToJobs(sheetData);
    console.log(`Found ${jobs.length} jobs to migrate`);

    // Step 3: Extract unique companies from jobs
    console.log('🏢 Extracting companies...');
    const companies = new Map();
    jobs.forEach(job => {
      if (job.company?.name && !companies.has(job.company.name)) {
        companies.set(job.company.name, {
          name: job.company.name,
          logoUrl: job.company.logo || null,
          websiteUrl: job.company.website || null,
          description: null,
          location: job.location || null,
          industry: 'Technology', // Default industry
        });
      }
    });

    // Step 4: Extract unique categories from jobs
    console.log('📂 Extracting categories...');
    const categories = new Set();
    jobs.forEach(job => {
      if (job.categories && job.categories.length > 0) {
        job.categories.forEach(cat => categories.add(cat.trim()));
      }
    });

    // Step 5: Migrate data using Prisma transaction
    console.log('💾 Starting database migration...');
    
    const result = await transaction(async (tx) => {
      const stats = { companies: 0, categories: 0, jobs: 0, failed: 0 };
      
      // Create companies first
      console.log(`🏢 Migrating ${companies.size} companies...`);
      const companyIdMap = new Map();
      
      for (const [companyName, companyData] of companies) {
        try {
          const company = await tx.company.upsert({
            where: { name: companyName },
            update: {
              logoUrl: companyData.logoUrl,
              websiteUrl: companyData.websiteUrl,
              location: companyData.location,
            },
            create: companyData
          });
          
          companyIdMap.set(companyName, company.id);
          stats.companies++;
          console.log(`✅ Migrated company: ${companyName}`);
        } catch (error) {
          console.error(`❌ Failed to migrate company ${companyName}:`, error.message);
        }
      }

      // Create categories
      console.log(`📂 Migrating ${categories.size} categories...`);
      const categoryIdMap = new Map();
      
      for (const categoryName of categories) {
        try {
          const slug = categoryName.toLowerCase()
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .replace(/\s+/g, '-');
          
          const category = await tx.jobCategory.upsert({
            where: { slug },
            update: { name: categoryName },
            create: {
              name: categoryName,
              slug,
              description: `Jobs in ${categoryName}`,
              isActive: true
            }
          });
          
          categoryIdMap.set(categoryName, category.id);
          stats.categories++;
          console.log(`✅ Migrated category: ${categoryName}`);
        } catch (error) {
          console.error(`❌ Failed to migrate category ${categoryName}:`, error.message);
        }
      }

      // Migrate jobs
      console.log(`💼 Migrating ${jobs.length} jobs...`);

      for (const job of jobs) {
        try {
          // Get company ID
          const companyId = job.company?.name ? companyIdMap.get(job.company.name) : null;
          
          if (!companyId) {
            console.warn(`⚠️ Skipping job "${job.title}" - no valid company found`);
            stats.failed++;
            continue;
          }
          
          // Parse salary data
          const salaryFrom = job.salary?.from ? parseInt(job.salary.from.toString().replace(/[^0-9]/g, '')) : null;
          const salaryTo = job.salary?.to ? parseInt(job.salary.to.toString().replace(/[^0-9]/g, '')) : null;
          
          // Map remote field
          let remoteType = 'no';
          if (job.remote && (job.remote.toLowerCase() === 'yes' || job.remote.toLowerCase() === 'true')) {
            remoteType = 'full';
          }

          // Parse dates
          const postedAt = job.posted_time ? new Date(job.posted_time) : new Date();
          const expiresAt = job.expire_time ? new Date(job.expire_time) : null;

          // Ensure slug is unique
          let slug = job.slug || job.title.toLowerCase()
            .replace(/[^a-zA-Z0-9\s]/g, '')
            .replace(/\s+/g, '-');
          
          // Check if slug exists and make it unique
          let uniqueSlug = slug;
          let counter = 1;
          while (true) {
            const existingJob = await tx.job.findUnique({ where: { slug: uniqueSlug } });
            if (!existingJob) break;
            uniqueSlug = `${slug}-${counter}`;
            counter++;
          }

          // Create job
          const newJob = await tx.job.create({
            data: {
              title: job.title || 'Untitled Job',
              slug: uniqueSlug,
              description: job.description || null,
              contentDocUrl: job.content_doc_url || null,
              salaryFrom,
              salaryTo,
              salaryCurrency: 'PHP',
              location: job.location || null,
              remoteType,
              jobType: job.type || 'full-time',
              experienceLevel: job.level || 'mid',
              requiredSkills: [],
              preferredSkills: [],
              applyUrl: job.apply_link || null,
              company: {
                connect: { id: companyId }
              },
              postedAt,
              expiresAt,
              status: 'active'
            }
          });

          // Add job categories
          if (job.categories && job.categories.length > 0) {
            for (const categoryName of job.categories) {
              const categoryId = categoryIdMap.get(categoryName.trim());
              if (categoryId) {
                await tx.jobCategoryAssignment.create({
                  data: {
                    jobId: newJob.id,
                    categoryId
                  }
                });
              }
            }
          }

          stats.jobs++;
          console.log(`✅ Migrated job: ${job.title} (${uniqueSlug})`);
          
        } catch (error) {
          stats.failed++;
          console.error(`❌ Failed to migrate job "${job.title}":`, error.message);
        }
      }

      return stats;
    });

    console.log(`\n🎉 Migration completed!`);
    console.log(`✅ Companies migrated: ${result.companies}`);
    console.log(`✅ Categories migrated: ${result.categories}`);
    console.log(`✅ Jobs migrated: ${result.jobs}`);
    console.log(`❌ Jobs failed: ${result.failed}`);

    return {
      success: true,
      stats: result
    };

  } catch (error) {
    console.error('💥 Migration failed:', error);
    throw error;
  }
};

// Run migration if this script is executed directly
console.log('🎬 Starting migration script execution...');
  
migrateFromGoogleSheets()
.then((result) => {
    console.log('✅ Migration script completed successfully');
    console.log('📊 Results:', result);
    process.exit(0);
})
.catch(error => {
    console.error('❌ Migration script failed:', error);
    console.error('Stack trace:', error.stack);
    process.exit(1);
});
