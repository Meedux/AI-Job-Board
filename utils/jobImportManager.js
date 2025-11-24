import crypto from 'crypto';
import { prisma } from './db';
import { db } from './db';

// Create a short deterministic signature used for deduplication
function signatureForJob(job) {
  const parts = [job.title||'', job.companyName||'', job.location||'', job.sourceUrl||'']
    .map(s => (s || '').toString().trim().toLowerCase())
    .join('|');
  return crypto.createHash('sha1').update(parts).digest('hex');
}

export async function persistImportedJobs(jobs = [], opts = {}){
  const created = [];
  for (const raw of jobs) {
    const sig = signatureForJob(raw);

    // If sourceUrl present, prefer checking by sourceUrl first
    let existing = null;
    if (raw.sourceUrl) {
      existing = await prisma.importedJob.findFirst({ where: { sourceUrl: raw.sourceUrl } });
    }

    if (!existing) {
      existing = await prisma.importedJob.findFirst({ where: { signature: sig } });
    }

    if (existing) {
      // already imported
      created.push({ existing, skipped: true });
      continue;
    }

    const data = {
      title: raw.title || 'Untitled Role',
      companyName: raw.companyName || null,
      location: raw.location || null,
      salaryFrom: raw.salaryFrom ?? null,
      salaryTo: raw.salaryTo ?? null,
      salaryCurrency: raw.salaryCurrency ?? null,
      salaryRaw: raw.salaryRaw ?? null,
      description: raw.description ?? null,
      sourceUrl: raw.sourceUrl ?? null,
      sourceHost: raw.sourceHost ?? null,
      normalized: raw,
      signature: sig,
      createdById: opts.createdById ?? null,
    };

    const inserted = await prisma.importedJob.create({ data });
    created.push({ existing: inserted, skipped: false });
  }
  return created;
}

export async function listPendingImports({ limit = 50, offset = 0 } = {}){
  const items = await prisma.importedJob.findMany({ where: { status: 'pending' }, orderBy: { createdAt: 'desc' }, take: limit, skip: offset });
  return items;
}

export async function getImportedJob(id){
  return await prisma.importedJob.findUnique({ where: { id } });
}

// Approve import: create a canonical Job record and mark imported job approved
export async function approveImport(importId, approverId){
  const imp = await prisma.importedJob.findUnique({ where: { id: importId } });
  if (!imp) throw new Error('Import not found');
  if (imp.status === 'approved') return imp;

  // Build minimal job payload from normalized record
  const payload = imp.normalized || {};
  // Determine some sane defaults
  const jobData = {
    title: imp.title || payload.title || 'Imported Job',
    description: imp.description || payload.description || null,
    salaryFrom: imp.salaryFrom ?? null,
    salaryTo: imp.salaryTo ?? null,
    salaryCurrency: imp.salaryCurrency ?? payload.salaryCurrency ?? 'PHP',
    location: imp.location ?? payload.location ?? null,
    status: 'active',
    postedAt: new Date(),
    // Do not auto-assign postedBy or company unless provided
  };

  // Use db.jobs.create which handles company connectOrCreate
  const createdJob = await db.jobs.create(jobData);

  const updated = await prisma.importedJob.update({
    where: { id: importId },
    data: {
      status: 'approved',
      approvedAt: new Date(),
      approvedById: approverId,
      publishedJobId: createdJob.id
    }
  });

  return { imported: updated, job: createdJob };
}

export async function rejectImport(importId, approverId, reason){
  const imp = await prisma.importedJob.update({ where: { id: importId }, data: { status: 'rejected', approvedAt: new Date(), approvedById: approverId } });
  // Optionally store reason as metadata, for now append to normalized
  if (reason) {
    try { await prisma.importedJob.update({ where: { id: importId }, data: { normalized: { ...imp.normalized, __rejectionReason: reason } } }); } catch(e){}
  }
  return imp;
}

export default { persistImportedJobs, listPendingImports, approveImport, rejectImport, getImportedJob };
