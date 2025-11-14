import { ROLE_HIERARCHY } from "./constants";
import type { ERole, IRole } from "./types";

export class Role implements IRole {
  public getRoleLevel(role: ERole): number {
    return ROLE_HIERARCHY.indexOf(role);
  }

  public hasRole(userRole: ERole, requiredRole: ERole): boolean {
    return this.getRoleLevel(userRole) >= this.getRoleLevel(requiredRole);
  }

  public getInheritedRoles(role: ERole): ERole[] {
    const roleLevel = this.getRoleLevel(role);
    return ROLE_HIERARCHY.slice(0, roleLevel + 1);
  }
}
