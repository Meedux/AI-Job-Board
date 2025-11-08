import assert from 'assert';
import * as policy from '../utils/policy.js';

// Simple smoke tests for policy helpers
const verifiedUser = { id: 'u-verified', role: 'employer_admin', verificationStatus: 'verified' };
const unverifiedUser = { id: 'u-unverified', role: 'employer_admin', verificationStatus: 'pending' };
const jobOwned = { id: 'j1', postedById: 'u-verified', company: { createdById: 'u-verified' } };
const jobNotOwned = { id: 'j2', postedById: 'someone-else' };

// canCreateJob
const c1 = policy.canCreateJob({ user: verifiedUser, verified: true, activeCount: 0, jobData: {} });
assert(c1.allowed === true, 'Verified user should be allowed to create job');

const c2 = policy.canCreateJob({ user: unverifiedUser, verified: false, activeCount: 1, jobData: {} });
assert(c2.allowed === false, 'Unverified user with existing active posting should be blocked');

// canGenerateShortlink
assert(policy.canGenerateShortlink({ user: verifiedUser, job: jobOwned }) === true, 'Owner should generate shortlink');
assert(policy.canGenerateShortlink({ user: verifiedUser, job: jobNotOwned }) === false, 'Non-owner should not generate shortlink');

// canRevealResume
assert(policy.canRevealResume({ user: verifiedUser }) === true, 'Verified user can reveal resumes');
assert(policy.canRevealResume({ user: unverifiedUser }) === false, 'Unverified user cannot reveal resumes');

console.log('policy tests passed');
