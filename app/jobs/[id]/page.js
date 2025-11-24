import JobOverview from '@/components/JobOverview';
import { prisma, db } from '@/utils/db';

export default async function JobPage({ params }) {
  const id = params.id;

  // Try to fetch by slug first, then by id
  let job = await db.jobs.findBySlug(id);
  if (!job) {
    // fallback: try find by id using prisma directly
      job = await prisma.job.findUnique({ where: { id }, include: { company: true, employerType: { include: { requirements: true } }, applicationForm: true, postedBy: { select: { id: true, verificationDocuments: { where: { status: 'verified' }, select: { category: true } } } } } });

      // expose employerVerifiedCategories for page rendering
      if (job?.postedBy?.verificationDocuments) {
        job.employerVerifiedCategories = Array.from(new Set(job.postedBy.verificationDocuments.map(d => d.category).filter(Boolean)));
        delete job.postedBy.verificationDocuments;
      }
  }

  if (!job) {
    return (
      <div className="max-w-4xl mx-auto p-8">
        <h1 className="text-xl font-semibold">Job not found</h1>
        <p className="mt-2 text-sm text-gray-600">We couldn't locate the job you're looking for.</p>
      </div>
    );
  }

  // Increment view count (fire-and-forget)
  try { await db.jobs.incrementViews(job.id); } catch (e) { console.warn('Failed to increment views', e); }

  return (
    <div className="min-h-screen bg-gray-900 p-8">
      <div className="max-w-6xl mx-auto">
            <JobOverview job={job} displayMode="full" onApply={() => {/* full page apply handled by JobOverview or application hooks */}} />
      </div>
    </div>
  );
}


  
