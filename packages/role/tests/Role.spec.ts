import { beforeEach, describe, expect, test } from "bun:test";
import { ERole, ROLE_HIERARCHY, Role } from "@/index";

describe("Role", () => {
  let role: Role;

  beforeEach(() => {
    role = new Role();
  });

  describe("getRoleLevel", () => {
    test("should return correct level for GUEST role", () => {
      expect(role.getRoleLevel(ERole.GUEST)).toBe(0);
    });

    test("should return correct level for USER role", () => {
      expect(role.getRoleLevel(ERole.USER)).toBe(1);
    });

    test("should return correct level for PREMIUM_USER role", () => {
      expect(role.getRoleLevel(ERole.PREMIUM_USER)).toBe(2);
    });

    test("should return correct level for MODERATOR role", () => {
      expect(role.getRoleLevel(ERole.MODERATOR)).toBe(3);
    });

    test("should return correct level for EDITOR role", () => {
      expect(role.getRoleLevel(ERole.EDITOR)).toBe(4);
    });

    test("should return correct level for MANAGER role", () => {
      expect(role.getRoleLevel(ERole.MANAGER)).toBe(5);
    });

    test("should return correct level for ADMIN role", () => {
      expect(role.getRoleLevel(ERole.ADMIN)).toBe(6);
    });

    test("should return correct level for SUPER_ADMIN role", () => {
      expect(role.getRoleLevel(ERole.SUPER_ADMIN)).toBe(7);
    });

    test("should return correct level for SYSTEM role", () => {
      expect(role.getRoleLevel(ERole.SYSTEM)).toBe(8);
    });

    test("should return -1 for invalid role", () => {
      expect(role.getRoleLevel("INVALID_ROLE" as ERole)).toBe(-1);
    });

    test("should handle all roles from ROLE_HIERARCHY", () => {
      ROLE_HIERARCHY.forEach((roleType, index) => {
        expect(role.getRoleLevel(roleType)).toBe(index);
      });
    });
  });

  describe("hasRole", () => {
    test("should return true when user role equals required role", () => {
      expect(role.hasRole(ERole.USER, ERole.USER)).toBe(true);
      expect(role.hasRole(ERole.ADMIN, ERole.ADMIN)).toBe(true);
    });

    test("should return true when user role is higher than required role", () => {
      expect(role.hasRole(ERole.ADMIN, ERole.USER)).toBe(true);
      expect(role.hasRole(ERole.SUPER_ADMIN, ERole.MODERATOR)).toBe(true);
      expect(role.hasRole(ERole.SYSTEM, ERole.GUEST)).toBe(true);
    });

    test("should return false when user role is lower than required role", () => {
      expect(role.hasRole(ERole.USER, ERole.ADMIN)).toBe(false);
      expect(role.hasRole(ERole.GUEST, ERole.USER)).toBe(false);
      expect(role.hasRole(ERole.MODERATOR, ERole.SUPER_ADMIN)).toBe(false);
    });

    test("should handle GUEST role permissions", () => {
      expect(role.hasRole(ERole.GUEST, ERole.GUEST)).toBe(true);
      expect(role.hasRole(ERole.GUEST, ERole.USER)).toBe(false);
      expect(role.hasRole(ERole.GUEST, ERole.ADMIN)).toBe(false);
    });

    test("should handle SYSTEM role permissions", () => {
      expect(role.hasRole(ERole.SYSTEM, ERole.GUEST)).toBe(true);
      expect(role.hasRole(ERole.SYSTEM, ERole.USER)).toBe(true);
      expect(role.hasRole(ERole.SYSTEM, ERole.ADMIN)).toBe(true);
      expect(role.hasRole(ERole.SYSTEM, ERole.SYSTEM)).toBe(true);
    });

    test("should handle hierarchical permissions correctly", () => {
      // Test ascending hierarchy
      expect(role.hasRole(ERole.USER, ERole.GUEST)).toBe(true);
      expect(role.hasRole(ERole.PREMIUM_USER, ERole.USER)).toBe(true);
      expect(role.hasRole(ERole.MODERATOR, ERole.PREMIUM_USER)).toBe(true);
      expect(role.hasRole(ERole.EDITOR, ERole.MODERATOR)).toBe(true);
      expect(role.hasRole(ERole.MANAGER, ERole.EDITOR)).toBe(true);
      expect(role.hasRole(ERole.ADMIN, ERole.MANAGER)).toBe(true);
      expect(role.hasRole(ERole.SUPER_ADMIN, ERole.ADMIN)).toBe(true);
      expect(role.hasRole(ERole.SYSTEM, ERole.SUPER_ADMIN)).toBe(true);
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
    test("should return only GUEST for GUEST role", () => {
      const inheritedRoles = role.getInheritedRoles(ERole.GUEST);
      expect(inheritedRoles).toEqual([ERole.GUEST]);
    });

    test("should return GUEST and USER for USER role", () => {
      const inheritedRoles = role.getInheritedRoles(ERole.USER);
      expect(inheritedRoles).toEqual([ERole.GUEST, ERole.USER]);
    });

    test("should return all roles up to ADMIN for ADMIN role", () => {
      const inheritedRoles = role.getInheritedRoles(ERole.ADMIN);
      const expected = [
        ERole.GUEST,
        ERole.USER,
        ERole.PREMIUM_USER,
        ERole.MODERATOR,
        ERole.EDITOR,
        ERole.MANAGER,
        ERole.ADMIN,
      ];
      expect(inheritedRoles).toEqual(expected);
    });

    test("should return all roles for SYSTEM role", () => {
      const inheritedRoles = role.getInheritedRoles(ERole.SYSTEM);
      expect(inheritedRoles).toEqual(ROLE_HIERARCHY);
    });

    test("should return correct roles for PREMIUM_USER", () => {
      const inheritedRoles = role.getInheritedRoles(ERole.PREMIUM_USER);
      expect(inheritedRoles).toEqual([ERole.GUEST, ERole.USER, ERole.PREMIUM_USER]);
    });

    test("should return correct roles for MODERATOR", () => {
      const inheritedRoles = role.getInheritedRoles(ERole.MODERATOR);
      expect(inheritedRoles).toEqual([ERole.GUEST, ERole.USER, ERole.PREMIUM_USER, ERole.MODERATOR]);
    });

    test("should return empty array for invalid role", () => {
      const inheritedRoles = role.getInheritedRoles("INVALID_ROLE" as ERole);
      expect(inheritedRoles).toEqual([]);
    });

    test("should maintain order from ROLE_HIERARCHY", () => {
      const inheritedRoles = role.getInheritedRoles(ERole.MANAGER);
      const expected = ROLE_HIERARCHY.slice(0, 6); // GUEST to MANAGER (index 5 + 1)
      expect(inheritedRoles).toEqual(expected);
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
      const inheritedRoles = role.getInheritedRoles(ERole.EDITOR);
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
      expect(role.hasRole(ERole.SYSTEM, ERole.GUEST)).toBe(true);
      expect(role.hasRole(ERole.GUEST, ERole.SYSTEM)).toBe(false);

      const systemInherited = role.getInheritedRoles(ERole.SYSTEM);
      const guestInherited = role.getInheritedRoles(ERole.GUEST);

      expect(systemInherited).toContain(ERole.GUEST);
      expect(guestInherited).not.toContain(ERole.SYSTEM);
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
  });
});
