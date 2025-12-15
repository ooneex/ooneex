import { beforeEach, describe, expect, test } from "bun:test";
import { ERole, ROLE_HIERARCHY, Role } from "@/index";

describe("Role", () => {
  let role: Role;

  beforeEach(() => {
    role = new Role();
  });

  describe("getRoleLevel", () => {
    test("should return correct level for BANNED role (lowest)", () => {
      expect(role.getRoleLevel(ERole.BANNED)).toBe(0);
    });

    test("should return correct level for SUSPENDED role", () => {
      expect(role.getRoleLevel(ERole.SUSPENDED)).toBe(1);
    });

    test("should return correct level for GUEST role", () => {
      expect(role.getRoleLevel(ERole.GUEST)).toBe(2);
    });

    test("should return correct level for TRIAL_USER role", () => {
      expect(role.getRoleLevel(ERole.TRIAL_USER)).toBe(3);
    });

    test("should return correct level for USER role", () => {
      expect(role.getRoleLevel(ERole.USER)).toBe(4);
    });

    test("should return correct level for SYSTEM role (highest)", () => {
      expect(role.getRoleLevel(ERole.SYSTEM)).toBe(ROLE_HIERARCHY.length - 1);
    });

    test("should return -1 for invalid role", () => {
      expect(role.getRoleLevel("INVALID_ROLE" as ERole)).toBe(-1);
    });

    test("should handle all roles from ROLE_HIERARCHY", () => {
      ROLE_HIERARCHY.forEach((roleType, index) => {
        expect(role.getRoleLevel(roleType)).toBe(index);
      });
    });

    test("should handle domain-specific manager roles", () => {
      const managerRoles = [
        ERole.CONTENT_MANAGER,
        ERole.MARKETING_MANAGER,
        ERole.SALES_MANAGER,
        ERole.PRODUCT_MANAGER,
        ERole.HR_MANAGER,
        ERole.FINANCE_MANAGER,
      ];

      managerRoles.forEach((managerRole) => {
        const level = role.getRoleLevel(managerRole);
        expect(level).toBeGreaterThan(-1);
        expect(level).toBeLessThan(ROLE_HIERARCHY.length);
      });
    });

    test("should handle technical roles", () => {
      const techRoles = [ERole.DEVELOPER, ERole.DESIGNER, ERole.TESTER, ERole.TECHNICAL_LEAD, ERole.DEVOPS];

      techRoles.forEach((techRole) => {
        const level = role.getRoleLevel(techRole);
        expect(level).toBeGreaterThan(-1);
        expect(level).toBeLessThan(ROLE_HIERARCHY.length);
      });
    });

    test("should handle governance roles", () => {
      const governanceRoles = [ERole.COMPLIANCE_OFFICER, ERole.SECURITY_OFFICER, ERole.AUDITOR];

      governanceRoles.forEach((govRole) => {
        const level = role.getRoleLevel(govRole);
        expect(level).toBeGreaterThan(-1);
        expect(level).toBeLessThan(ROLE_HIERARCHY.length);
      });
    });
  });

  describe("hasRole", () => {
    test("should return true when user role equals required role", () => {
      expect(role.hasRole(ERole.USER, ERole.USER)).toBe(true);
      expect(role.hasRole(ERole.ADMIN, ERole.ADMIN)).toBe(true);
      expect(role.hasRole(ERole.BANNED, ERole.BANNED)).toBe(true);
    });

    test("should return true when user role is higher than required role", () => {
      expect(role.hasRole(ERole.ADMIN, ERole.USER)).toBe(true);
      expect(role.hasRole(ERole.SUPER_ADMIN, ERole.MODERATOR)).toBe(true);
      expect(role.hasRole(ERole.SYSTEM, ERole.GUEST)).toBe(true);
      expect(role.hasRole(ERole.USER, ERole.BANNED)).toBe(true);
    });

    test("should return false when user role is lower than required role", () => {
      expect(role.hasRole(ERole.USER, ERole.ADMIN)).toBe(false);
      expect(role.hasRole(ERole.GUEST, ERole.USER)).toBe(false);
      expect(role.hasRole(ERole.MODERATOR, ERole.SUPER_ADMIN)).toBe(false);
      expect(role.hasRole(ERole.BANNED, ERole.USER)).toBe(false);
    });

    test("should handle restricted access roles", () => {
      // BANNED should not have access to any other role
      expect(role.hasRole(ERole.BANNED, ERole.GUEST)).toBe(false);
      expect(role.hasRole(ERole.BANNED, ERole.USER)).toBe(false);
      expect(role.hasRole(ERole.BANNED, ERole.ADMIN)).toBe(false);

      // SUSPENDED should not have access to higher roles but has access to BANNED
      expect(role.hasRole(ERole.SUSPENDED, ERole.BANNED)).toBe(true);
      expect(role.hasRole(ERole.SUSPENDED, ERole.GUEST)).toBe(false);
      expect(role.hasRole(ERole.SUSPENDED, ERole.USER)).toBe(false);
    });

    test("should handle GUEST role permissions", () => {
      expect(role.hasRole(ERole.GUEST, ERole.BANNED)).toBe(true);
      expect(role.hasRole(ERole.GUEST, ERole.SUSPENDED)).toBe(true);
      expect(role.hasRole(ERole.GUEST, ERole.GUEST)).toBe(true);
      expect(role.hasRole(ERole.GUEST, ERole.USER)).toBe(false);
      expect(role.hasRole(ERole.GUEST, ERole.ADMIN)).toBe(false);
    });

    test("should handle SYSTEM role permissions", () => {
      // SYSTEM should have access to all roles
      Object.values(ERole).forEach((roleValue) => {
        expect(role.hasRole(ERole.SYSTEM, roleValue as ERole)).toBe(true);
      });
    });

    test("should handle user progression roles", () => {
      const userProgression = [ERole.USER, ERole.MEMBER, ERole.SUBSCRIBER, ERole.PREMIUM_USER, ERole.VIP_USER];

      for (let i = 0; i < userProgression.length; i++) {
        for (let j = 0; j <= i; j++) {
          const higherRole = userProgression[i];
          const lowerRole = userProgression[j];
          if (higherRole && lowerRole) {
            expect(role.hasRole(higherRole, lowerRole)).toBe(true);
          }
        }
      }
    });

    test("should handle content creation roles hierarchy", () => {
      // Each role should have access to previous roles in the hierarchy
      expect(role.hasRole(ERole.AUTHOR, ERole.CONTRIBUTOR)).toBe(true);
      expect(role.hasRole(ERole.REVIEWER, ERole.AUTHOR)).toBe(true);
      expect(role.hasRole(ERole.EDITOR, ERole.REVIEWER)).toBe(true);
      expect(role.hasRole(ERole.CURATOR, ERole.EDITOR)).toBe(true);
    });

    test("should handle management hierarchy", () => {
      const managementHierarchy = [
        ERole.SUPERVISOR,
        ERole.TEAM_LEAD,
        ERole.MANAGER,
        ERole.DEPARTMENT_HEAD,
        ERole.DIRECTOR,
        ERole.OWNER,
      ];

      for (let i = 0; i < managementHierarchy.length; i++) {
        for (let j = 0; j <= i; j++) {
          const higherRole = managementHierarchy[i];
          const lowerRole = managementHierarchy[j];
          if (higherRole && lowerRole) {
            expect(role.hasRole(higherRole, lowerRole)).toBe(true);
          }
        }
      }
    });

    test("should handle domain-specific manager permissions", () => {
      const domainManagers = [
        ERole.CONTENT_MANAGER,
        ERole.MARKETING_MANAGER,
        ERole.SALES_MANAGER,
        ERole.PRODUCT_MANAGER,
        ERole.HR_MANAGER,
        ERole.FINANCE_MANAGER,
      ];

      // Domain managers should have access to basic user roles
      domainManagers.forEach((manager) => {
        expect(role.hasRole(manager, ERole.USER)).toBe(true);
        expect(role.hasRole(manager, ERole.GUEST)).toBe(true);
        expect(role.hasRole(manager, ERole.MEMBER)).toBe(true);
      });

      // But should not have access to ADMIN roles
      domainManagers.forEach((manager) => {
        expect(role.hasRole(manager, ERole.ADMIN)).toBe(false);
        expect(role.hasRole(manager, ERole.SUPER_ADMIN)).toBe(false);
      });
    });

    test("should handle invalid roles", () => {
      // Invalid user role with valid required role returns false (-1 >= validLevel is false)
      expect(role.hasRole("INVALID_ROLE" as ERole, ERole.USER)).toBe(false);
      // Valid user role with invalid required role returns true (validLevel >= -1 is true)
      expect(role.hasRole(ERole.USER, "INVALID_ROLE" as ERole)).toBe(true);
      // Both invalid roles returns true (-1 >= -1 is true)
      expect(role.hasRole("INVALID_ROLE" as ERole, "ANOTHER_INVALID" as ERole)).toBe(true);
    });

    test("should be consistent across multiple calls", () => {
      const userRole = ERole.ADMIN;
      const requiredRole = ERole.USER;
      const result1 = role.hasRole(userRole, requiredRole);
      const result2 = role.hasRole(userRole, requiredRole);
      expect(result1).toBe(result2);
      expect(result1).toBe(true);
    });
  });

  describe("getInheritedRoles", () => {
    test("should return only BANNED for BANNED role", () => {
      const inheritedRoles = role.getInheritedRoles(ERole.BANNED);
      expect(inheritedRoles).toEqual([ERole.BANNED]);
    });

    test("should return BANNED and SUSPENDED for SUSPENDED role", () => {
      const inheritedRoles = role.getInheritedRoles(ERole.SUSPENDED);
      expect(inheritedRoles).toEqual([ERole.BANNED, ERole.SUSPENDED]);
    });

    test("should return correct roles up to GUEST", () => {
      const inheritedRoles = role.getInheritedRoles(ERole.GUEST);
      expect(inheritedRoles).toEqual([ERole.BANNED, ERole.SUSPENDED, ERole.GUEST]);
    });

    test("should return correct roles up to USER", () => {
      const inheritedRoles = role.getInheritedRoles(ERole.USER);
      expect(inheritedRoles).toEqual([ERole.BANNED, ERole.SUSPENDED, ERole.GUEST, ERole.TRIAL_USER, ERole.USER]);
    });

    test("should return all roles for SYSTEM role", () => {
      const inheritedRoles = role.getInheritedRoles(ERole.SYSTEM);
      expect(inheritedRoles).toEqual(ROLE_HIERARCHY);
    });

    test("should return correct roles for ADMIN", () => {
      const inheritedRoles = role.getInheritedRoles(ERole.ADMIN);
      const adminIndex = ROLE_HIERARCHY.indexOf(ERole.ADMIN);
      const expected = ROLE_HIERARCHY.slice(0, adminIndex + 1);
      expect(inheritedRoles).toEqual(expected);
    });

    test("should return empty array for invalid role", () => {
      const inheritedRoles = role.getInheritedRoles("INVALID_ROLE" as ERole);
      expect(inheritedRoles).toEqual([]);
    });

    test("should maintain order from ROLE_HIERARCHY", () => {
      Object.values(ERole).forEach((roleValue) => {
        const roleType = roleValue as ERole;
        const inheritedRoles = role.getInheritedRoles(roleType);
        const roleIndex = ROLE_HIERARCHY.indexOf(roleType);

        if (roleIndex !== -1) {
          const expected = ROLE_HIERARCHY.slice(0, roleIndex + 1);
          expect(inheritedRoles).toEqual(expected);
        }
      });
    });

    test("should include the role itself in inherited roles", () => {
      Object.values(ERole).forEach((roleType) => {
        const inheritedRoles = role.getInheritedRoles(roleType as ERole);
        if (inheritedRoles.length > 0) {
          expect(inheritedRoles).toContain(roleType as ERole);
        }
      });
    });

    test("should return roles in ascending order of hierarchy", () => {
      const testRoles = [ERole.EDITOR, ERole.MANAGER, ERole.ADMIN, ERole.DIRECTOR];

      testRoles.forEach((testRole) => {
        const inheritedRoles = role.getInheritedRoles(testRole);
        for (let i = 1; i < inheritedRoles.length; i++) {
          const currentRole = inheritedRoles[i];
          const previousRole = inheritedRoles[i - 1];
          if (currentRole && previousRole) {
            const currentLevel = role.getRoleLevel(currentRole);
            const previousLevel = role.getRoleLevel(previousRole);
            expect(currentLevel).toBeGreaterThan(previousLevel);
          }
        }
      });
    });

    test("should handle domain-specific roles correctly", () => {
      const domainRoles = [ERole.FINANCE_MANAGER, ERole.HR_MANAGER, ERole.CONTENT_MANAGER, ERole.MARKETING_MANAGER];

      domainRoles.forEach((domainRole) => {
        const inheritedRoles = role.getInheritedRoles(domainRole);
        expect(inheritedRoles).toContain(domainRole);
        expect(inheritedRoles).toContain(ERole.USER);
        expect(inheritedRoles).toContain(ERole.GUEST);
        expect(inheritedRoles).toContain(ERole.BANNED);
      });
    });

    test("should handle technical roles correctly", () => {
      const techRoles = [ERole.DEVELOPER, ERole.DESIGNER, ERole.TESTER, ERole.DEVOPS];

      techRoles.forEach((techRole) => {
        const inheritedRoles = role.getInheritedRoles(techRole);
        expect(inheritedRoles).toContain(techRole);
        expect(inheritedRoles).toContain(ERole.USER);
        expect(inheritedRoles.length).toBeGreaterThan(0);
      });
    });
  });

  describe("integration tests", () => {
    test("should work correctly with all three methods together", () => {
      const userRole = ERole.MANAGER;
      const requiredRole = ERole.USER;

      // User should have the required role
      expect(role.hasRole(userRole, requiredRole)).toBe(true);

      // User's inherited roles should include the required role
      const inheritedRoles = role.getInheritedRoles(userRole);
      expect(inheritedRoles).toContain(requiredRole);

      // Role levels should be consistent
      expect(role.getRoleLevel(userRole)).toBeGreaterThan(role.getRoleLevel(requiredRole));
    });

    test("should handle edge cases consistently", () => {
      // Test with highest and lowest roles
      expect(role.hasRole(ERole.SYSTEM, ERole.BANNED)).toBe(true);
      expect(role.hasRole(ERole.BANNED, ERole.SYSTEM)).toBe(false);

      const systemInherited = role.getInheritedRoles(ERole.SYSTEM);
      const bannedInherited = role.getInheritedRoles(ERole.BANNED);

      expect(systemInherited).toContain(ERole.BANNED);
      expect(bannedInherited).not.toContain(ERole.SYSTEM);
    });

    test("should maintain consistency across role hierarchy", () => {
      for (let i = 0; i < ROLE_HIERARCHY.length; i++) {
        for (let j = 0; j <= i; j++) {
          const higherRole = ROLE_HIERARCHY[i];
          const lowerRole = ROLE_HIERARCHY[j];

          if (higherRole && lowerRole) {
            // Higher role should have access to lower role
            expect(role.hasRole(higherRole, lowerRole)).toBe(true);

            // Inherited roles should include the lower role
            const inherited = role.getInheritedRoles(higherRole);
            expect(inherited).toContain(lowerRole);
          }
        }
      }
    });

    test("should handle special purpose roles", () => {
      const specialRoles = [ERole.TRIAL_USER, ERole.SUSPENDED, ERole.BANNED];

      specialRoles.forEach((specialRole) => {
        const level = role.getRoleLevel(specialRole);
        const inherited = role.getInheritedRoles(specialRole);

        expect(level).toBeGreaterThanOrEqual(0);
        expect(inherited).toContain(specialRole);
      });
    });

    test("should properly handle role transitions", () => {
      // Test typical user progression
      const userProgression = [ERole.GUEST, ERole.TRIAL_USER, ERole.USER, ERole.PREMIUM_USER, ERole.VIP_USER];

      for (let i = 1; i < userProgression.length; i++) {
        const currentRole = userProgression[i];
        const previousRole = userProgression[i - 1];

        if (currentRole && previousRole) {
          expect(role.hasRole(currentRole, previousRole)).toBe(true);
          const inherited = role.getInheritedRoles(currentRole);
          expect(inherited).toContain(previousRole);
        }
      }
    });

    test("should validate complete role hierarchy structure", () => {
      // Ensure every role in the enum is in the hierarchy
      const allEnumRoles = Object.values(ERole);
      expect(ROLE_HIERARCHY).toHaveLength(allEnumRoles.length);

      allEnumRoles.forEach((enumRole) => {
        expect(ROLE_HIERARCHY).toContain(enumRole as ERole);
      });

      // Ensure hierarchy is properly ordered
      for (let i = 1; i < ROLE_HIERARCHY.length; i++) {
        const currentRole = ROLE_HIERARCHY[i];
        const previousRole = ROLE_HIERARCHY[i - 1];

        if (currentRole && previousRole) {
          expect(role.getRoleLevel(currentRole)).toBeGreaterThan(role.getRoleLevel(previousRole));
        }
      }
    });
  });
});
