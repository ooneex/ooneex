import { ERole } from "./types";

export const ROLE_HIERARCHY: ERole[] = [
  // Restricted access states (lowest)
  ERole.BANNED,
  ERole.SUSPENDED,

  // Basic user levels
  ERole.GUEST,
  ERole.TRIAL_USER,
  ERole.USER,
  ERole.MEMBER,
  ERole.SUBSCRIBER,
  ERole.PREMIUM_USER,
  ERole.VIP_USER,

  // Content creation roles
  ERole.CONTRIBUTOR,
  ERole.AUTHOR,
  ERole.REVIEWER,
  ERole.EDITOR,
  ERole.CURATOR,

  // Technical roles
  ERole.DEVELOPER,
  ERole.DESIGNER,
  ERole.TESTER,
  ERole.TECHNICAL_LEAD,
  ERole.DEVOPS,

  // Support and analysis
  ERole.SUPPORT_AGENT,
  ERole.ANALYST,
  ERole.MODERATOR,

  // Management hierarchy
  ERole.SUPERVISOR,
  ERole.TEAM_LEAD,
  ERole.MANAGER,
  ERole.DEPARTMENT_HEAD,

  // Domain-specific managers
  ERole.CONTENT_MANAGER,
  ERole.MARKETING_MANAGER,
  ERole.SALES_MANAGER,
  ERole.PRODUCT_MANAGER,
  ERole.HR_MANAGER,
  ERole.FINANCE_MANAGER,

  // Senior management
  ERole.DIRECTOR,
  ERole.OWNER,

  // Governance and security
  ERole.COMPLIANCE_OFFICER,
  ERole.SECURITY_OFFICER,
  ERole.AUDITOR,

  // Administrative roles
  ERole.ADMIN,
  ERole.SUPER_ADMIN,

  // System roles (highest)
  ERole.SYSTEM,
];
