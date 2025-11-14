export enum ERole {
  GUEST = "ROLE_GUEST",
  USER = "ROLE_USER",
  PREMIUM_USER = "ROLE_PREMIUM_USER",
  MODERATOR = "ROLE_MODERATOR",
  EDITOR = "ROLE_EDITOR",
  MANAGER = "ROLE_MANAGER",
  ADMIN = "ROLE_ADMIN",
  SUPER_ADMIN = "ROLE_SUPER_ADMIN",
  SYSTEM = "ROLE_SYSTEM",
}

export type RoleType = `${ERole}`;

// biome-ignore lint/suspicious/noExplicitAny: trust me
export type RoleClassType = new (...args: any[]) => IRole;

export interface IRole {
  getRoleLevel: (role: ERole) => number;
  hasRole: (userRole: ERole, requiredRole: ERole) => boolean;
  getInheritedRoles: (role: ERole) => ERole[];
}
