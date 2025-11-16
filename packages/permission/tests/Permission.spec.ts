import { beforeEach, describe, expect, test } from "bun:test";
import { ERole } from "@ooneex/role";
import type { IUser } from "@ooneex/user";
import { Permission, PermissionException } from "@/index";

describe("Permission", () => {
  let permission: Permission;

  beforeEach(() => {
    permission = new Permission();
  });

  describe("Constructor", () => {
    test("should create Permission instance", () => {
      expect(permission).toBeInstanceOf(Permission);
      expect(permission).toBeDefined();
    });

    test("should create Permission with generic type", () => {
      const customPermission = new Permission<"CustomResource">();
      expect(customPermission).toBeInstanceOf(Permission);
    });
  });

  describe("Allow Method", () => {
    test("should allow single action on single subject", () => {
      const result = permission.allow("read", "User");

      expect(result).toBe(permission); // Should return this for chaining
      expect(result).toBeInstanceOf(Permission);
    });

    test("should allow multiple actions on single subject", () => {
      const result = permission.allow(["read", "update"], "User");

      expect(result).toBe(permission);
    });

    test("should allow single action on multiple subjects", () => {
      const result = permission.allow("read", ["User", "UserEntity"]);

      expect(result).toBe(permission);
    });

    test("should allow multiple actions on multiple subjects", () => {
      const result = permission.allow(["read", "update", "delete"], ["User", "UserEntity", "System"]);

      expect(result).toBe(permission);
    });

    test("should allow action with conditions", () => {
      const conditions = { id: "user-123", active: true };
      const result = permission.allow("read", "User", conditions);

      expect(result).toBe(permission);
    });

    test("should allow complex conditions", () => {
      const conditions = {
        $or: [{ createdBy: "user-123" }, { public: true }],
      };
      const result = permission.allow("read", "User", conditions);

      expect(result).toBe(permission);
    });

    test("should allow chaining multiple allow calls", () => {
      const result = permission.allow("read", "User").allow("update", "UserEntity").allow("delete", "System");

      expect(result).toBe(permission);
    });

    test("should work with custom subject types", () => {
      const customPermission = new Permission<"BlogPost">();
      const result = customPermission.allow("read", "BlogPost");

      expect(result).toBe(customPermission);
    });
  });

  describe("Forbid Method", () => {
    test("should forbid single action on single subject", () => {
      const result = permission.forbid("delete", "User");

      expect(result).toBe(permission);
    });

    test("should forbid multiple actions on single subject", () => {
      const result = permission.forbid(["delete", "update"], "User");

      expect(result).toBe(permission);
    });

    test("should forbid single action on multiple subjects", () => {
      const result = permission.forbid("delete", ["User", "System"]);

      expect(result).toBe(permission);
    });

    test("should forbid multiple actions on multiple subjects", () => {
      const result = permission.forbid(["delete", "manage"], ["User", "System", "all"]);

      expect(result).toBe(permission);
    });

    test("should forbid action with conditions", () => {
      const conditions = { sensitive: true };
      const result = permission.forbid("read", "User", conditions);

      expect(result).toBe(permission);
    });

    test("should allow chaining forbid calls", () => {
      const result = permission.forbid("delete", "User").forbid("manage", "System").forbid("update", "all");

      expect(result).toBe(permission);
    });

    test("should allow mixing allow and forbid calls", () => {
      const result = permission
        .allow("read", "User")
        .forbid("delete", "User")
        .allow("update", "UserEntity")
        .forbid("manage", "System");

      expect(result).toBe(permission);
    });
  });

  describe("Build Method", () => {
    test("should build permission and return this", () => {
      const result = permission.allow("read", "User").build();

      expect(result).toBe(permission);
    });

    test("should allow chaining after build", () => {
      const result = permission.allow("read", "User").build().allow("update", "UserEntity");

      expect(result).toBe(permission);
    });

    test("should build empty permission", () => {
      const result = permission.build();

      expect(result).toBe(permission);
    });
  });

  describe("Can Method", () => {
    test("should throw error if permission not built", () => {
      permission.allow("read", "User");

      expect(() => permission.can("read", "User")).toThrow(PermissionException);
      expect(() => permission.can("read", "User")).toThrow("Permission must be built before checking abilities");
    });

    test("should return true for allowed permission", () => {
      permission.allow("read", "User").build();

      expect(permission.can("read", "User")).toBe(true);
    });

    test("should return false for non-allowed permission", () => {
      permission.allow("read", "User").build();

      expect(permission.can("update", "User")).toBe(false);
      expect(permission.can("read", "System")).toBe(false);
    });

    test("should work with field parameter", () => {
      permission.allow("read", "User").build();

      expect(permission.can("read", "User", "name")).toBe(true);
      expect(permission.can("update", "User", "name")).toBe(false);
    });

    test("should work with custom subject types", () => {
      const customPermission = new Permission<"BlogPost">();
      customPermission.allow("read", "BlogPost").build();

      expect(customPermission.can("read", "BlogPost")).toBe(true);
      expect(customPermission.can("update", "BlogPost")).toBe(false);
    });

    test("should handle complex permission rules", () => {
      permission
        .allow("read", "User")
        .forbid("read", "User", { private: true })
        .allow("manage", "all")
        .forbid("delete", "System")
        .build();

      expect(permission.can("read", "User")).toBe(true);
      expect(permission.can("update", "User")).toBe(true);
      expect(permission.can("delete", "User")).toBe(true);
      expect(permission.can("delete", "System")).toBe(false);
    });
  });

  describe("Cannot Method", () => {
    test("should throw error if permission not built", () => {
      permission.allow("read", "User");

      expect(() => permission.cannot("read", "User")).toThrow(PermissionException);
      expect(() => permission.cannot("read", "User")).toThrow("Permission must be built before checking abilities");
    });

    test("should return false for allowed permission", () => {
      permission.allow("read", "User").build();

      expect(permission.cannot("read", "User")).toBe(false);
    });

    test("should return true for non-allowed permission", () => {
      permission.allow("read", "User").build();

      expect(permission.cannot("update", "User")).toBe(true);
      expect(permission.cannot("read", "System")).toBe(true);
    });

    test("should work with field parameter", () => {
      permission.allow("read", "User").build();

      expect(permission.cannot("read", "User", "name")).toBe(false);
      expect(permission.cannot("update", "User", "name")).toBe(true);
    });

    test("should be opposite of can method", () => {
      permission.allow("read", "User").forbid("update", "User").build();

      expect(permission.can("read", "User")).toBe(!permission.cannot("read", "User"));
      expect(permission.can("update", "User")).toBe(!permission.cannot("update", "User"));
    });
  });

  describe("SetCommonPermissions Method", () => {
    let mockUser: IUser;

    beforeEach(() => {
      mockUser = {
        id: "user-123",
        email: "test@example.com",
        name: "Test User",
        lastName: "User",
        firstName: "Test",
        role: ERole.USER,
      };
    });

    test("should return this for chaining", () => {
      const result = permission.setCommonPermissions(mockUser);

      expect(result).toBe(permission);
    });

    describe("SYSTEM Role", () => {
      test("should grant manage all permissions", () => {
        mockUser.role = ERole.SYSTEM;

        permission.setCommonPermissions(mockUser).build();

        expect(permission.can("manage", "all")).toBe(true);
        expect(permission.can("read", "User")).toBe(true);
        expect(permission.can("update", "User")).toBe(true);
        expect(permission.can("delete", "User")).toBe(true);
        expect(permission.can("create", "System")).toBe(true);
      });
    });

    describe("SUPER_ADMIN Role", () => {
      test("should grant manage all permissions", () => {
        mockUser.role = ERole.SUPER_ADMIN;

        permission.setCommonPermissions(mockUser).build();

        expect(permission.can("manage", "all")).toBe(true);
        expect(permission.can("read", "User")).toBe(true);
        expect(permission.can("update", "User")).toBe(true);
        expect(permission.can("delete", "User")).toBe(true);
        expect(permission.can("create", "System")).toBe(true);
      });
    });

    describe("ADMIN Role", () => {
      test("should grant manage all permissions", () => {
        mockUser.role = ERole.ADMIN;

        permission.setCommonPermissions(mockUser).build();

        expect(permission.can("manage", "all")).toBe(true);
        expect(permission.can("read", "User")).toBe(true);
        expect(permission.can("update", "User")).toBe(true);
        expect(permission.can("delete", "User")).toBe(true);
        expect(permission.can("create", "System")).toBe(true);
      });
    });

    describe("USER Role", () => {
      test("should grant read and update on own user entities", () => {
        mockUser.role = ERole.USER;

        permission.setCommonPermissions(mockUser).build();

        expect(permission.can("read", "User")).toBe(true);
        expect(permission.can("update", "User")).toBe(true);
        expect(permission.can("read", "UserEntity")).toBe(true);
        expect(permission.can("update", "UserEntity")).toBe(true);
        expect(permission.can("read", "AuthUser")).toBe(true);
        expect(permission.can("update", "AuthUser")).toBe(true);
        expect(permission.can("read", "AuthUserEntity")).toBe(true);
        expect(permission.can("update", "AuthUserEntity")).toBe(true);
        expect(permission.can("delete", "User")).toBe(false);
        expect(permission.can("create", "System")).toBe(false);
      });
    });

    describe("MEMBER Role", () => {
      test("should grant read and update on own user entities", () => {
        mockUser.role = ERole.MEMBER;

        permission.setCommonPermissions(mockUser).build();

        expect(permission.can("read", "User")).toBe(true);
        expect(permission.can("update", "User")).toBe(true);
        expect(permission.can("read", "UserEntity")).toBe(true);
        expect(permission.can("update", "UserEntity")).toBe(true);
        expect(permission.can("read", "AuthUser")).toBe(true);
        expect(permission.can("update", "AuthUser")).toBe(true);
        expect(permission.can("read", "AuthUserEntity")).toBe(true);
        expect(permission.can("update", "AuthUserEntity")).toBe(true);
        expect(permission.can("delete", "User")).toBe(false);
      });
    });

    describe("SUBSCRIBER Role", () => {
      test("should grant read only on own user entities", () => {
        mockUser.role = ERole.SUBSCRIBER;

        permission.setCommonPermissions(mockUser).build();

        expect(permission.can("read", "User")).toBe(true);
        expect(permission.can("read", "UserEntity")).toBe(true);
        expect(permission.can("read", "AuthUser")).toBe(true);
        expect(permission.can("read", "AuthUserEntity")).toBe(true);
        expect(permission.can("update", "User")).toBe(false);
        expect(permission.can("update", "UserEntity")).toBe(false);
        expect(permission.can("delete", "User")).toBe(false);
      });
    });

    describe("TRIAL_USER Role", () => {
      test("should grant read only on limited user entities", () => {
        mockUser.role = ERole.TRIAL_USER;

        permission.setCommonPermissions(mockUser).build();

        expect(permission.can("read", "User")).toBe(true);
        expect(permission.can("read", "AuthUser")).toBe(true);
        expect(permission.can("read", "UserEntity")).toBe(false);
        expect(permission.can("read", "AuthUserEntity")).toBe(false);
        expect(permission.can("update", "User")).toBe(false);
        expect(permission.can("delete", "User")).toBe(false);
      });
    });

    describe("SUSPENDED Role", () => {
      test("should grant read only on own user entities", () => {
        mockUser.role = ERole.SUSPENDED;

        permission.setCommonPermissions(mockUser).build();

        expect(permission.can("read", "User")).toBe(true);
        expect(permission.can("read", "UserEntity")).toBe(true);
        expect(permission.can("read", "AuthUser")).toBe(true);
        expect(permission.can("read", "AuthUserEntity")).toBe(true);
        expect(permission.can("update", "User")).toBe(false);
        expect(permission.can("delete", "User")).toBe(false);
      });
    });

    describe("GUEST Role", () => {
      test("should grant read only on public user entities", () => {
        mockUser.role = ERole.GUEST;

        permission.setCommonPermissions(mockUser).build();

        expect(permission.can("read", "User")).toBe(true);
        expect(permission.can("read", "UserEntity")).toBe(true);
        expect(permission.can("read", "AuthUser")).toBe(true);
        expect(permission.can("read", "AuthUserEntity")).toBe(true);
        expect(permission.can("update", "User")).toBe(false);
        expect(permission.can("delete", "User")).toBe(false);
      });
    });

    describe("Unknown Role", () => {
      test("should not grant any specific permissions for unknown roles", () => {
        mockUser.role = "ROLE_UNKNOWN" as ERole;

        permission.setCommonPermissions(mockUser).build();

        // Should not have any specific permissions granted
        expect(permission.can("manage", "all")).toBe(false);
        expect(permission.can("read", "User")).toBe(false);
        expect(permission.can("update", "User")).toBe(false);
      });
    });

    test("should allow chaining with other permission methods", () => {
      mockUser.role = ERole.USER;

      const result = permission.setCommonPermissions(mockUser).allow("read", "System").forbid("delete", "all").build();

      expect(result).toBe(permission);
      expect(permission.can("read", "User")).toBe(true);
      expect(permission.can("read", "System")).toBe(true);
      expect(permission.can("delete", "User")).toBe(false);
    });
  });

  describe("Complex Permission Scenarios", () => {
    let adminUser: IUser;
    let regularUser: IUser;
    let guestUser: IUser;

    beforeEach(() => {
      adminUser = {
        id: "admin-123",
        email: "admin@example.com",
        name: "Admin User",
        lastName: "User",
        firstName: "Admin",
        role: ERole.ADMIN,
      };

      regularUser = {
        id: "user-456",
        email: "user@example.com",
        name: "Regular User",
        lastName: "User",
        firstName: "Regular",
        role: ERole.USER,
      };

      guestUser = {
        id: "guest-789",
        email: "guest@example.com",
        name: "Guest User",
        lastName: "User",
        firstName: "Guest",
        role: ERole.GUEST,
      };
    });

    test("should handle hierarchical permissions correctly", () => {
      permission
        .setCommonPermissions(regularUser)
        .allow("read", "System", { public: true })
        .forbid("read", "System", { sensitive: true })
        .build();

      expect(permission.can("read", "User")).toBe(true);
      expect(permission.can("update", "User")).toBe(true);
      expect(permission.can("read", "System")).toBe(true);
      expect(permission.can("delete", "User")).toBe(false);
    });

    test("should handle conditional permissions with user context", () => {
      permission
        .setCommonPermissions(regularUser)
        .allow("read", "User", { department: "engineering" })
        .forbid("read", "User", { confidential: true })
        .build();

      expect(permission.can("read", "User")).toBe(true);
      expect(permission.can("update", "User")).toBe(true);
    });

    test("should work with multiple users having different permissions", () => {
      const adminPermission = new Permission().setCommonPermissions(adminUser).build();

      const userPermission = new Permission().setCommonPermissions(regularUser).build();

      const guestPermission = new Permission().setCommonPermissions(guestUser).build();

      // Admin can manage everything
      expect(adminPermission.can("manage", "all")).toBe(true);
      expect(adminPermission.can("delete", "System")).toBe(true);

      // User can read/update own data
      expect(userPermission.can("read", "User")).toBe(true);
      expect(userPermission.can("update", "User")).toBe(true);
      expect(userPermission.can("delete", "User")).toBe(false);
      expect(userPermission.can("manage", "all")).toBe(false);

      // Guest can only read public data
      expect(guestPermission.can("read", "User")).toBe(true);
      expect(guestPermission.can("update", "User")).toBe(false);
      expect(guestPermission.can("delete", "User")).toBe(false);
    });
  });

  describe("Edge Cases and Error Handling", () => {
    test("should handle empty subjects array", () => {
      const result = permission.allow("read", []);
      expect(result).toBe(permission);
    });

    test("should handle empty actions array", () => {
      const result = permission.allow([], "User");
      expect(result).toBe(permission);
    });

    test("should handle undefined conditions", () => {
      const result = permission.allow("read", "User", undefined);
      expect(result).toBe(permission);
    });

    test("should handle null conditions", () => {
      const result = permission.allow("read", "User", undefined);
      expect(result).toBe(permission);
    });

    test("should maintain permission state across multiple builds", () => {
      permission.allow("read", "User").build();

      expect(permission.can("read", "User")).toBe(true);

      // Build again shouldn't affect existing permissions
      permission.build();
      expect(permission.can("read", "User")).toBe(true);

      // Add more permissions after rebuild
      permission.allow("update", "User").build();

      expect(permission.can("read", "User")).toBe(true);
      expect(permission.can("update", "User")).toBe(true);
    });

    test("should handle complex nested conditions", () => {
      const complexConditions = {
        $and: [
          { active: true },
          {
            $or: [{ createdBy: "user-123" }, { public: true, verified: true }],
          },
          { deletedAt: { $exists: false } },
        ],
      };

      const result = permission.allow("read", "User", complexConditions).build();

      expect(result).toBe(permission);
      expect(permission.can("read", "User")).toBe(true);
    });
  });

  describe("Generic Type Support", () => {
    test("should work with custom subject types", () => {
      const blogPermission = new Permission<"BlogPost" | "Comment" | "Category">();

      blogPermission
        .allow("read", "BlogPost")
        .allow(["create", "update"], "Comment")
        .forbid("delete", "Category")
        .build();

      expect(blogPermission.can("read", "BlogPost")).toBe(true);
      expect(blogPermission.can("create", "Comment")).toBe(true);
      expect(blogPermission.can("update", "Comment")).toBe(true);
      expect(blogPermission.cannot("delete", "Category")).toBe(true);
    });

    test("should combine built-in and custom subject types", () => {
      const mixedPermission = new Permission<"BlogPost" | "Article">();

      mixedPermission
        .allow("read", ["User", "BlogPost", "Article"])
        .allow("manage", "all")
        .forbid("delete", "BlogPost")
        .build();

      expect(mixedPermission.can("read", "User")).toBe(true);
      expect(mixedPermission.can("read", "BlogPost")).toBe(true);
      expect(mixedPermission.can("read", "Article")).toBe(true);
      expect(mixedPermission.can("create", "User")).toBe(true);
      expect(mixedPermission.cannot("delete", "BlogPost")).toBe(true);
    });
  });

  describe("Method Chaining", () => {
    test("should support extensive method chaining", () => {
      const mockUser: IUser = {
        id: "chain-user",
        email: "chain@example.com",
        name: "Chain User",
        lastName: "User",
        firstName: "Chain",
        role: ERole.USER,
      };

      const result = permission
        .allow("read", "User")
        .forbid("delete", "User")
        .allow(["create", "update"], "UserEntity")
        .setCommonPermissions(mockUser)
        .forbid("manage", "System")
        .allow("read", "System", { public: true })
        .build();

      expect(result).toBe(permission);
      expect(permission.can("read", "User")).toBe(true);
      expect(permission.can("update", "User")).toBe(true);
      expect(permission.can("create", "UserEntity")).toBe(true);
      expect(permission.cannot("delete", "User")).toBe(true);
      expect(permission.cannot("manage", "System")).toBe(true);
      expect(permission.can("read", "System")).toBe(true);
    });
  });

  describe("Performance and State Management", () => {
    test("should handle large numbers of permissions efficiently", () => {
      const startTime = Date.now();

      // Add many permissions
      for (let i = 0; i < 100; i++) {
        permission.allow("read", "User").allow("update", "UserEntity").forbid("delete", "System");
      }

      permission.build();

      const endTime = Date.now();
      const duration = endTime - startTime;

      // Should complete within reasonable time (less than 1 second)
      expect(duration).toBeLessThan(1000);
      expect(permission.can("read", "User")).toBe(true);
    });

    test("should maintain consistent state across multiple operations", () => {
      permission.allow("read", "User").build();

      expect(permission.can("read", "User")).toBe(true);

      // Check state consistency
      for (let i = 0; i < 10; i++) {
        expect(permission.can("read", "User")).toBe(true);
        expect(permission.cannot("delete", "User")).toBe(true);
      }
    });
  });
});
