import { describe, expect, test } from "bun:test";
import { ERole, ROLE_HIERARCHY } from "@/index";

describe("constants", () => {
  describe("ROLE_HIERARCHY", () => {
    test("should contain all roles from ERole enum", () => {
      const allRoles = Object.values(ERole);
      expect(ROLE_HIERARCHY).toHaveLength(allRoles.length);

      for (const role of allRoles) {
        expect(ROLE_HIERARCHY).toContain(role);
      }
    });

    test("should have roles in correct hierarchical order", () => {
      const expectedOrder = [
        ERole.GUEST,
        ERole.USER,
        ERole.PREMIUM_USER,
        ERole.MODERATOR,
        ERole.EDITOR,
        ERole.MANAGER,
        ERole.ADMIN,
        ERole.SUPER_ADMIN,
        ERole.SYSTEM,
      ];

      expect(ROLE_HIERARCHY).toEqual(expectedOrder);
    });

    test("should start with GUEST as lowest role", () => {
      expect(ROLE_HIERARCHY[0]).toBe(ERole.GUEST);
    });

    test("should end with SYSTEM as highest role", () => {
      expect(ROLE_HIERARCHY[ROLE_HIERARCHY.length - 1]).toBe(ERole.SYSTEM);
    });

    test("should not contain duplicate roles", () => {
      const uniqueRoles = [...new Set(ROLE_HIERARCHY)];
      expect(ROLE_HIERARCHY).toHaveLength(uniqueRoles.length);
    });

    test("should be an array (immutability depends on implementation)", () => {
      expect(Array.isArray(ROLE_HIERARCHY)).toBe(true);
      // Note: ROLE_HIERARCHY immutability would need to be implemented in constants.ts
      // This test verifies the array structure is correct
    });

    test("should have USER role after GUEST", () => {
      const guestIndex = ROLE_HIERARCHY.indexOf(ERole.GUEST);
      const userIndex = ROLE_HIERARCHY.indexOf(ERole.USER);
      expect(userIndex).toBe(guestIndex + 1);
    });

    test("should have ADMIN role before SUPER_ADMIN", () => {
      const adminIndex = ROLE_HIERARCHY.indexOf(ERole.ADMIN);
      const superAdminIndex = ROLE_HIERARCHY.indexOf(ERole.SUPER_ADMIN);
      expect(superAdminIndex).toBe(adminIndex + 1);
    });

    test("should maintain expected role levels", () => {
      expect(ROLE_HIERARCHY.indexOf(ERole.GUEST)).toBe(0);
      expect(ROLE_HIERARCHY.indexOf(ERole.USER)).toBe(1);
      expect(ROLE_HIERARCHY.indexOf(ERole.PREMIUM_USER)).toBe(2);
      expect(ROLE_HIERARCHY.indexOf(ERole.MODERATOR)).toBe(3);
      expect(ROLE_HIERARCHY.indexOf(ERole.EDITOR)).toBe(4);
      expect(ROLE_HIERARCHY.indexOf(ERole.MANAGER)).toBe(5);
      expect(ROLE_HIERARCHY.indexOf(ERole.ADMIN)).toBe(6);
      expect(ROLE_HIERARCHY.indexOf(ERole.SUPER_ADMIN)).toBe(7);
      expect(ROLE_HIERARCHY.indexOf(ERole.SYSTEM)).toBe(8);
    });
  });
});
