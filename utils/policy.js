// Centralized policy helpers for employer verification and posting rules
// Keep logic simple and data-driven — route handlers may query DB and pass
// derived values (e.g. `verified` boolean, activeCount) into these helpers.

export function isSuperAdmin(user) {
  return user && (user.role === 'super_admin' || user.isSuperAdmin === true);
}

export function isVerified(user, verifiedDoc) {
  if (verifiedDoc) return true;
  if (!user) return false;
  const status = (user.verificationStatus || user.verification_status || '').toString().toLowerCase();
  return status === 'verified' || status === 'approved' || status === 'active';
}

/**
 * Decision object returned by policy checks:
 * { allowed: boolean, limited?: boolean, message?: string }
 */
export function canCreateJob({ user, verified = false, activeCount = 0, jobData = {} } = {}) {
  // Super admin bypasses all checks
  if (isSuperAdmin(user)) return { allowed: true };

  // Role guard — callers may also check this separately; keep defensive here
  const allowedRoles = ['super_admin', 'employer_admin', 'sub_user'];
  if (!user || !allowedRoles.includes(user.role)) {
    return { allowed: false, message: 'Insufficient permissions to post jobs' };
  }

  // If user is verified, allow creating jobs without restriction
  if (verified || isVerified(user, verified)) {
    return { allowed: true };
  }

  // Unverified accounts: soft restrictions
  // - Limit to 1 active (non-closed) posting
  if (activeCount >= 1) {
    return { allowed: false, message: 'Account not verified — limit of 1 active posting for unverified accounts' };
  }

  // - Disallow placement/placement fees for unverified accounts
  if (jobData && jobData.hasPlacementFee === true) {
    return { allowed: false, message: 'Account not verified — placement fees are restricted to verified employers' };
  }
  if (jobData && jobData.isPlacement === true) {
    return { allowed: false, message: 'Account not verified — placement job types require verification' };
  }

  // For other cases, allow but mark as limited — UI may use `limited` to show messaging
  return { allowed: true, limited: true, message: 'Unverified account — some features restricted until verification' };
}

export function canGenerateShortlink({ user, job } = {}) {
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  if (!job) return false;
  // owners and the user who posted the job may generate shortlinks
  if (job.postedById && job.postedById === user.id) return true;
  // if job has a company owner relation, allow if user created the company
  if (job.company && job.company.createdById && job.company.createdById === user.id) return true;
  return false;
}

export function canViewContactDetails({ viewer, owner } = {}) {
  if (!viewer) return false;
  if (isSuperAdmin(viewer)) return true;
  if (!owner) return true; // public
  if (viewer.id === owner.id) return true;
  // Verified viewers can see contact info
  if (isVerified(viewer)) return true;
  return false;
}

export function canRevealResume({ user } = {}) {
  // Resume DB reveals require a verified company/account in our rules.
  if (!user) return false;
  if (isSuperAdmin(user)) return true;
  return isVerified(user);
}

export default {
  isSuperAdmin,
  isVerified,
  canCreateJob,
  canGenerateShortlink,
  canViewContactDetails,
};
