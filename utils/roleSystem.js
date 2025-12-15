/**
 * Enhanced User Role System Constants and Utilities
 * Supports Super Admin, Employer Admin, Sub-users, and Job Seekers
 */

// User Roles
export const USER_ROLES = {
  SUPER_ADMIN: 'super_admin',
  EMPLOYER_ADMIN: 'employer_admin',
  SUB_USER: 'sub_user',
  JOB_SEEKER: 'job_seeker',
  OWNER: 'owner',
  MAIN_ADMIN: 'main_admin',
  STAFF: 'staff',
  VENDOR: 'vendor',
  CLIENT: 'client'
};

// Sub-user Types
export const SUB_USER_TYPES = {
  STAFF: 'staff',
  VENDOR: 'vendor',
  CUSTOMER: 'customer'
};

// Employer Types
export const EMPLOYER_TYPES = {
  // Local Employers
  LOCAL_DIRECT: 'local_direct',
  LOCAL_PEA: 'local_pea',
  LOCAL_DO174: 'local_do174',
  LOCAL_PSA: 'local_psa',
  LOCAL_GOVERNMENT: 'local_government',
  
  // Abroad Employers
  ABROAD_RECRUITMENT: 'abroad_recruitment',
  ABROAD_MANNING: 'abroad_manning',
  ABROAD_DMW: 'abroad_dmw'
};

// Access Levels (1-10 scale)
export const ACCESS_LEVELS = {
  FULL_ACCESS: 10,
  ADMIN_ACCESS: 8,
  MANAGER_ACCESS: 6,
  STAFF_ACCESS: 4,
  LIMITED_ACCESS: 2,
  VIEW_ONLY: 1
};

// Account Status
export const ACCOUNT_STATUS = {
  ACTIVE: 'active',
  SUSPENDED: 'suspended',
  EXPIRED: 'expired',
  PENDING: 'pending'
};

// Permission Categories
export const PERMISSIONS = {
  WORKSPACE: {
    CREATE: 'workspace_create',
    DELETE: 'workspace_delete',
    RENAME: 'workspace_rename',
    ASSIGN: 'workspace_assign',
    VIEW_ALL: 'workspace_view_all',
    VIEW_ASSIGNED: 'workspace_view_assigned',
    WIPE: 'workspace_wipe'
  },

  USER_ADMIN: {
    INVITE_STAFF: 'user_invite_staff',
    INVITE_VENDOR: 'user_invite_vendor',
    INVITE_CLIENT: 'user_invite_client'
  },

  // Super Admin Permissions
  SUPER_ADMIN: {
    USER_MANAGEMENT: 'user_management',
    SUBSCRIPTION_MANAGEMENT: 'subscription_management',
    PRICING_CONTROL: 'pricing_control',
    SYSTEM_SETTINGS: 'system_settings',
    RESUME_EXPORT: 'resume_export',
    REMINDER_MANAGEMENT: 'reminder_management',
    ANALYTICS_ACCESS: 'analytics_access'
  },
  
  // Employer Admin Permissions
  EMPLOYER_ADMIN: {
    SUB_USER_MANAGEMENT: 'sub_user_management',
    JOB_POSTING: 'job_posting',
    CANDIDATE_MANAGEMENT: 'candidate_management',
    ATS_ACCESS: 'ats_access',
    SUBSCRIPTION_PURCHASE: 'subscription_purchase',
    ADDON_PURCHASE: 'addon_purchase',
    CREDIT_ALLOCATION: 'credit_allocation'
  },
  
  // Sub-user Permissions
  SUB_USER: {
    ATS_VIEW: 'ats_view',
    ATS_EDIT: 'ats_edit',
    RESUME_VIEW: 'resume_view',
    RESUME_DOWNLOAD: 'resume_download',
    CANDIDATE_CONTACT: 'candidate_contact',
    JOB_VIEW: 'job_view',
    JOB_EDIT: 'job_edit',
    NOTATION_ONLY: 'notation_only'
  }
};

export const ROLE_PERMISSION_MATRIX = {
  [USER_ROLES.OWNER]: [
    ...Object.values(PERMISSIONS.WORKSPACE),
    ...Object.values(PERMISSIONS.USER_ADMIN),
    ...Object.values(PERMISSIONS.SUPER_ADMIN)
  ],
  [USER_ROLES.MAIN_ADMIN]: [
    PERMISSIONS.WORKSPACE.CREATE,
    PERMISSIONS.WORKSPACE.RENAME,
    PERMISSIONS.WORKSPACE.ASSIGN,
    PERMISSIONS.WORKSPACE.VIEW_ALL,
    PERMISSIONS.WORKSPACE.WIPE,
    PERMISSIONS.USER_ADMIN.INVITE_STAFF,
    PERMISSIONS.USER_ADMIN.INVITE_VENDOR,
    PERMISSIONS.USER_ADMIN.INVITE_CLIENT,
    PERMISSIONS.EMPLOYER_ADMIN.SUB_USER_MANAGEMENT,
    PERMISSIONS.EMPLOYER_ADMIN.JOB_POSTING,
    PERMISSIONS.EMPLOYER_ADMIN.CANDIDATE_MANAGEMENT,
    PERMISSIONS.EMPLOYER_ADMIN.ATS_ACCESS
  ],
  [USER_ROLES.STAFF]: [
    PERMISSIONS.WORKSPACE.VIEW_ASSIGNED,
    PERMISSIONS.SUB_USER.ATS_VIEW,
    PERMISSIONS.SUB_USER.ATS_EDIT,
    PERMISSIONS.SUB_USER.RESUME_VIEW,
    PERMISSIONS.SUB_USER.JOB_EDIT
  ],
  [USER_ROLES.VENDOR]: [
    PERMISSIONS.WORKSPACE.VIEW_ASSIGNED,
    PERMISSIONS.SUB_USER.RESUME_VIEW,
    PERMISSIONS.SUB_USER.CANDIDATE_CONTACT
  ],
  [USER_ROLES.CLIENT]: [
    PERMISSIONS.WORKSPACE.VIEW_ASSIGNED,
    PERMISSIONS.SUB_USER.RESUME_VIEW,
    PERMISSIONS.SUB_USER.NOTATION_ONLY
  ]
};

// Employer Type Labels
export const EMPLOYER_TYPE_LABELS = {
  [EMPLOYER_TYPES.LOCAL_DIRECT]: 'Direct Employer',
  [EMPLOYER_TYPES.LOCAL_PEA]: 'Private Employment Agency (PEA)',
  [EMPLOYER_TYPES.LOCAL_DO174]: 'D.O. 174 Contracting',
  [EMPLOYER_TYPES.LOCAL_PSA]: 'Private Security Agency (PSA)',
  [EMPLOYER_TYPES.LOCAL_GOVERNMENT]: 'Government Jobs',
  [EMPLOYER_TYPES.ABROAD_RECRUITMENT]: 'Recruitment Agency (Land-based)',
  [EMPLOYER_TYPES.ABROAD_MANNING]: 'Manning Agency (Sea-Based)',
  [EMPLOYER_TYPES.ABROAD_DMW]: 'DMW Jobs (Government to Government)'
};

// Role Labels
export const ROLE_LABELS = {
  [USER_ROLES.SUPER_ADMIN]: 'Super Administrator',
  [USER_ROLES.EMPLOYER_ADMIN]: 'Employer Admin',
  [USER_ROLES.SUB_USER]: 'Sub-user',
  [USER_ROLES.JOB_SEEKER]: 'Job Seeker',
  [USER_ROLES.OWNER]: 'Owner',
  [USER_ROLES.MAIN_ADMIN]: 'Main Admin',
  [USER_ROLES.STAFF]: 'Staff',
  [USER_ROLES.VENDOR]: 'Vendor',
  [USER_ROLES.CLIENT]: 'Client'
};

/**
 * Check if user has specific permission
 * @param {Object} user - User object
 * @param {string} permission - Permission to check
 * @returns {boolean}
 */
export function hasPermission(user, permission) {
  if (!user || !user.role) return false;
  
  // Super admin has all permissions
  if (user.role === USER_ROLES.SUPER_ADMIN) return true;
  
  // Check user permissions object
  if (user.permissions && typeof user.permissions === 'object') {
    return user.permissions[permission] === true;
  }

   // Fallback to role matrix defaults when permissions object is absent
  if (ROLE_PERMISSION_MATRIX[user.role]) {
    return ROLE_PERMISSION_MATRIX[user.role].includes(permission);
  }
  
  return false;
}

/**
 * Check if user can manage another user
 * @param {Object} manager - Manager user object
 * @param {Object} targetUser - Target user object
 * @returns {boolean}
 */
export function canManageUser(manager, targetUser) {
  if (!manager || !targetUser) return false;
  
  // Super admin can manage anyone
  if (manager.role === USER_ROLES.SUPER_ADMIN) return true;
  
  // Employer admin can manage their sub-users
  if (manager.role === USER_ROLES.EMPLOYER_ADMIN && 
      targetUser.parentUserId === manager.id) {
    return true;
  }
  
  return false;
}

/**
 * Get default permissions for a role
 * @param {string} role - User role
 * @param {string} userType - Sub-user type (if applicable)
 * @returns {Object}
 */
export function getDefaultPermissions(role, userType = null) {
  const permissions = {};
  
  switch (role) {
    case USER_ROLES.OWNER:
    case USER_ROLES.MAIN_ADMIN:
    case USER_ROLES.STAFF:
    case USER_ROLES.VENDOR:
    case USER_ROLES.CLIENT: {
      const matrixPerms = ROLE_PERMISSION_MATRIX[role] || [];
      matrixPerms.forEach((perm) => {
        permissions[perm] = true;
      });
      break;
    }

    case USER_ROLES.SUPER_ADMIN:
      Object.values(PERMISSIONS.SUPER_ADMIN).forEach(perm => {
        permissions[perm] = true;
      });
      break;
      
    case USER_ROLES.EMPLOYER_ADMIN:
      Object.values(PERMISSIONS.EMPLOYER_ADMIN).forEach(perm => {
        permissions[perm] = true;
      });
      break;
      
    case USER_ROLES.SUB_USER:
      // Base permissions for all sub-users
      permissions[PERMISSIONS.SUB_USER.ATS_VIEW] = true;
      permissions[PERMISSIONS.SUB_USER.JOB_VIEW] = true;
      
      // Type-specific permissions
      if (userType === SUB_USER_TYPES.STAFF) {
        permissions[PERMISSIONS.SUB_USER.ATS_EDIT] = true;
        permissions[PERMISSIONS.SUB_USER.RESUME_VIEW] = true;
        permissions[PERMISSIONS.SUB_USER.JOB_EDIT] = true;
      } else if (userType === SUB_USER_TYPES.VENDOR) {
        permissions[PERMISSIONS.SUB_USER.RESUME_VIEW] = true;
        permissions[PERMISSIONS.SUB_USER.CANDIDATE_CONTACT] = true;
      } else if (userType === SUB_USER_TYPES.CUSTOMER) {
        permissions[PERMISSIONS.SUB_USER.RESUME_VIEW] = true;
        permissions[PERMISSIONS.SUB_USER.RESUME_DOWNLOAD] = true;
        permissions[PERMISSIONS.SUB_USER.NOTATION_ONLY] = true;
      }
      break;
      
    case USER_ROLES.JOB_SEEKER:
      // Job seekers have basic profile permissions
      break;
  }
  
  return permissions;
}

/**
 * Check if user is a main account (not a sub-user)
 * @param {Object} user - User object
 * @returns {boolean}
 */
export function isMainAccount(user) {
  return !user.parentUserId;
}

/**
 * Check if user can access ATS features
 * @param {Object} user - User object
 * @returns {boolean}
 */
export function canAccessATS(user) {
  if (!user) return false;
  
  return user.role === USER_ROLES.SUPER_ADMIN ||
         user.role === USER_ROLES.EMPLOYER_ADMIN ||
         (user.role === USER_ROLES.SUB_USER && hasPermission(user, PERMISSIONS.SUB_USER.ATS_VIEW));
}

/**
 * Get available credit balance for user
 * @param {Object} user - User object
 * @param {string} creditType - 'resume' or 'ai'
 * @returns {number}
 */
export function getAvailableCredits(user, creditType) {
  if (!user) return 0;
  
  if (creditType === 'resume') {
    const allocated = parseInt(user.allocatedResumeCredits) || 0;
    const used = parseInt(user.usedResumeCredits) || 0;
    return Math.max(0, allocated - used);
  } else if (creditType === 'ai') {
    const allocated = parseInt(user.allocatedAiCredits) || 0;
    const used = parseInt(user.usedAiCredits) || 0;
    return Math.max(0, allocated - used);
  }
  
  return 0;
}

/**
 * Check if user can create sub-users
 * @param {Object} user - User object
 * @param {Object} subscription - User subscription
 * @returns {boolean}
 */
export function canCreateSubUsers(user, subscription) {
  if (!user || user.role !== USER_ROLES.EMPLOYER_ADMIN) return false;
  
  // Check if subscription allows sub-users
  if (!subscription || !subscription.plan) {
    // Allow creation if no subscription data is loaded yet (fallback)
    return true;
  }
  
  // Basic subscription or higher required for sub-users
  const planType = subscription.plan.planType;
  return ['basic', 'premium', 'enterprise'].includes(planType);
}

/**
 * Validate role transition
 * @param {string} currentRole - Current user role
 * @param {string} newRole - New role to assign
 * @returns {boolean}
 */
export function validateRoleTransition(currentRole, newRole) {
  // Super admin can change to any role
  if (currentRole === USER_ROLES.SUPER_ADMIN) return true;
  
  // Employer admin can only change between employer_admin and sub_user
  if (currentRole === USER_ROLES.EMPLOYER_ADMIN) {
    return newRole === USER_ROLES.SUB_USER;
  }
  
  // Sub-users can become employer_admin (promotion)
  if (currentRole === USER_ROLES.SUB_USER) {
    return newRole === USER_ROLES.EMPLOYER_ADMIN;
  }
  
  // Job seekers can become employer_admin
  if (currentRole === USER_ROLES.JOB_SEEKER) {
    return newRole === USER_ROLES.EMPLOYER_ADMIN;
  }
  
  return false;
}
