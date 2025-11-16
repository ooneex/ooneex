import { describe, expect, test } from "bun:test";
import { Exception } from "@ooneex/exception";
import { Status } from "@ooneex/http-status";
import { PermissionException } from "@/index";

describe("PermissionException", () => {
  describe("Name", () => {
    test("should have correct exception name", () => {
      const exception = new PermissionException("Test message");

      expect(exception.name).toBe("PermissionException");
    });
  });

  describe("Immutable Data", () => {
    test("should have immutable data property", () => {
      const data = { key: "value", count: 42 };
      const exception = new PermissionException("Test message", data);

      expect(Object.isFrozen(exception.data)).toBe(true);
      expect(() => {
        // Intentionally trying to modify readonly property
        (exception.data as { key: string }).key = "modified";
      }).toThrow();
    });
  });

  describe("Constructor", () => {
    test("should create PermissionException with message only", () => {
      const message = "Permission denied";
      const exception = new PermissionException(message);

      expect(exception).toBeInstanceOf(PermissionException);
      expect(exception).toBeInstanceOf(Exception);
      expect(exception).toBeInstanceOf(Error);
      expect(exception.message).toBe(message);
      expect(exception.status).toBe(Status.Code.InternalServerError);
      expect(exception.data).toBeUndefined();
    });

    test("should create PermissionException with message and data", () => {
      const message = "Insufficient permissions for resource access";
      const data = { resource: "user_data", action: "delete", userId: "user-123" };
      const exception = new PermissionException(message, data);

      expect(exception.message).toBe(message);
      expect(exception.status).toBe(Status.Code.InternalServerError);
      expect(exception.data).toEqual(data);
    });

    test("should create PermissionException with empty data object", () => {
      const message = "Empty data test";
      const data = {};
      const exception = new PermissionException(message, data);

      expect(exception.message).toBe(message);
      expect(exception.status).toBe(Status.Code.InternalServerError);
      expect(exception.data).toEqual(data);
    });

    test("should handle null data gracefully", () => {
      const message = "Null data test";
      const exception = new PermissionException(message);

      expect(exception.message).toBe(message);
      expect(exception.status).toBe(Status.Code.InternalServerError);
      expect(exception.data).toBeUndefined();
    });
  });

  describe("Inheritance and Properties", () => {
    test("should inherit all properties from Exception", () => {
      const message = "Permission error";
      const data = { permission: "admin_access", required: true };
      const exception = new PermissionException(message, data);

      // Properties from Exception
      expect(exception.date).toBeInstanceOf(Date);
      expect(exception.status).toBe(Status.Code.InternalServerError);
      expect(exception.data).toEqual(data);
      expect(exception.native).toBeUndefined();
      expect(exception.name).toBe("PermissionException");
      expect(exception.message).toBe(message);
    });

    test("should always set status to InternalServerError", () => {
      const exception1 = new PermissionException("Error 1");
      const exception2 = new PermissionException("Error 2", { key: "value" });

      expect(exception1.status).toBe(Status.Code.InternalServerError);
      expect(exception2.status).toBe(Status.Code.InternalServerError);
      expect(exception1.status).toBe(500);
      expect(exception2.status).toBe(500);
    });

    test("should have readonly data property", () => {
      const data = { permission: "write_access" };
      const exception = new PermissionException("Test", data);

      expect(exception.data).toEqual(data);
      expect(Object.isFrozen(exception.data)).toBe(true);
    });
  });

  describe("Generic Type Support", () => {
    test("should support generic type for data values", () => {
      interface PermissionError {
        resourceType: string;
        requiredPermission: string;
        userPermissions: string[];
        resourceId?: string;
      }

      const errorData: PermissionError = {
        resourceType: "document",
        requiredPermission: "document:write",
        userPermissions: ["document:read", "user:read"],
        resourceId: "doc-456",
      };

      const exception = new PermissionException<PermissionError>("Access denied", errorData);

      expect(exception.data?.resourceType).toBe("document");
      expect(exception.data?.requiredPermission).toBe("document:write");
      expect(exception.data?.userPermissions).toEqual(["document:read", "user:read"]);
      expect(exception.data?.resourceId).toBe("doc-456");
    });

    test("should support string generic type", () => {
      const stringData = {
        permission: "admin_panel_access",
        suggestion: "Contact administrator for elevated permissions",
        helpUrl: "https://docs.example.com/permissions",
      };

      const exception = new PermissionException<typeof stringData>("Permission denied", stringData);

      expect(exception.data?.permission).toBe("admin_panel_access");
      expect(exception.data?.suggestion).toBe("Contact administrator for elevated permissions");
      expect(exception.data?.helpUrl).toBe("https://docs.example.com/permissions");
    });

    test("should support number generic type", () => {
      const numberData = {
        userId: 12345,
        requiredLevel: 5,
        currentLevel: 2,
        resourceCost: 100,
      };

      const exception = new PermissionException<typeof numberData>("Insufficient permission level", numberData);

      expect(exception.data?.userId).toBe(12345);
      expect(exception.data?.requiredLevel).toBe(5);
      expect(exception.data?.currentLevel).toBe(2);
      expect(exception.data?.resourceCost).toBe(100);
    });
  });

  describe("Permission-Specific Error Scenarios", () => {
    test("should handle role-based permission failures", () => {
      const exception = new PermissionException("Role-based access denied", {
        userId: "user-789",
        userRoles: ["user", "editor"],
        requiredRoles: ["admin", "moderator"],
        resource: "user_management",
        action: "delete_user",
      });

      expect(exception.message).toBe("Role-based access denied");
      expect(exception.data?.userId).toBe("user-789");
      expect(exception.data?.userRoles).toEqual(["user", "editor"]);
      expect(exception.data?.requiredRoles).toEqual(["admin", "moderator"]);
      expect(exception.data?.resource).toBe("user_management");
      expect(exception.data?.action).toBe("delete_user");
    });

    test("should handle resource-specific permission failures", () => {
      const exception = new PermissionException("Resource access denied", {
        resourceType: "file",
        resourceId: "file-123",
        resourcePath: "/documents/confidential/report.pdf",
        requiredPermission: "file:read",
        userPermissions: ["file:list"],
        owner: "admin@company.com",
        isPublic: false,
      });

      expect(exception.data?.resourceType).toBe("file");
      expect(exception.data?.resourceId).toBe("file-123");
      expect(exception.data?.resourcePath).toBe("/documents/confidential/report.pdf");
      expect(exception.data?.requiredPermission).toBe("file:read");
      expect(exception.data?.userPermissions).toEqual(["file:list"]);
      expect(exception.data?.owner).toBe("admin@company.com");
      expect(exception.data?.isPublic).toBe(false);
    });

    test("should handle API endpoint permission failures", () => {
      const exception = new PermissionException("API endpoint access denied", {
        endpoint: "/api/v1/admin/users",
        method: "DELETE",
        requiredScope: "admin:users:delete",
        providedScopes: ["user:read", "user:write"],
        apiKey: "key-***redacted***",
        rateLimited: false,
        quotaExceeded: false,
      });

      expect(exception.data?.endpoint).toBe("/api/v1/admin/users");
      expect(exception.data?.method).toBe("DELETE");
      expect(exception.data?.requiredScope).toBe("admin:users:delete");
      expect(exception.data?.providedScopes).toEqual(["user:read", "user:write"]);
      expect(exception.data?.apiKey).toBe("key-***redacted***");
      expect(exception.data?.rateLimited).toBe(false);
      expect(exception.data?.quotaExceeded).toBe(false);
    });

    test("should handle organization-level permission failures", () => {
      const exception = new PermissionException("Organization permission denied", {
        organizationId: "org-456",
        userId: "user-789",
        requiredOrgRole: "owner",
        currentOrgRole: "member",
        feature: "billing_management",
        subscriptionTier: "basic",
        requiredTier: "enterprise",
        trialExpired: true,
      });

      expect(exception.data?.organizationId).toBe("org-456");
      expect(exception.data?.userId).toBe("user-789");
      expect(exception.data?.requiredOrgRole).toBe("owner");
      expect(exception.data?.currentOrgRole).toBe("member");
      expect(exception.data?.feature).toBe("billing_management");
      expect(exception.data?.subscriptionTier).toBe("basic");
      expect(exception.data?.requiredTier).toBe("enterprise");
      expect(exception.data?.trialExpired).toBe(true);
    });

    test("should handle time-based permission failures", () => {
      const exception = new PermissionException("Time-restricted access denied", {
        currentTime: new Date("2024-01-15T10:30:00Z"),
        allowedTimeStart: "09:00",
        allowedTimeEnd: "17:00",
        timezone: "UTC",
        weekdaysOnly: true,
        currentDay: "Monday",
        holidayRestriction: false,
        maintenanceMode: false,
      });

      expect(exception.data?.currentTime).toEqual(new Date("2024-01-15T10:30:00Z"));
      expect(exception.data?.allowedTimeStart).toBe("09:00");
      expect(exception.data?.allowedTimeEnd).toBe("17:00");
      expect(exception.data?.timezone).toBe("UTC");
      expect(exception.data?.weekdaysOnly).toBe(true);
      expect(exception.data?.currentDay).toBe("Monday");
      expect(exception.data?.holidayRestriction).toBe(false);
      expect(exception.data?.maintenanceMode).toBe(false);
    });
  });

  describe("Stack Trace and Debugging", () => {
    test("should maintain proper stack trace", () => {
      function throwPermissionException() {
        throw new PermissionException("Access denied");
      }

      expect(() => throwPermissionException()).toThrow(PermissionException);

      try {
        throwPermissionException();
      } catch (error) {
        expect(error).toBeInstanceOf(PermissionException);
        expect((error as PermissionException).stack).toBeDefined();
        expect((error as PermissionException).stack).toContain("throwPermissionException");
      }
    });

    test("should support stackToJson method from parent Exception", () => {
      const exception = new PermissionException("Test error");
      const stackJson = exception.stackToJson();

      expect(Array.isArray(stackJson)).toBe(true);
      if (stackJson) {
        expect(stackJson.length).toBeGreaterThan(0);
        expect(stackJson[0]).toHaveProperty("source");
      }
    });
  });

  describe("Serialization and Inspection", () => {
    test("should be JSON serializable", () => {
      const exception = new PermissionException("Permission serialization test", {
        component: "permission_manager",
        version: "1.0.0",
        secureMode: true,
      });

      const serialized = JSON.stringify({
        message: exception.message,
        name: exception.name,
        status: exception.status,
        data: exception.data,
        date: exception.date,
      });

      const parsed = JSON.parse(serialized);

      expect(parsed.message).toBe("Permission serialization test");
      expect(parsed.name).toBe("PermissionException");
      expect(parsed.status).toBe(Status.Code.InternalServerError);
      expect(parsed.data.component).toBe("permission_manager");
      expect(parsed.data.version).toBe("1.0.0");
      expect(parsed.data.secureMode).toBe(true);
    });

    test("should have correct toString representation", () => {
      const exception = new PermissionException("Permission string test");
      const stringRep = exception.toString();

      expect(stringRep).toContain("PermissionException");
      expect(stringRep).toContain("Permission string test");
    });

    test("should be JSON serializable with stackToJson", () => {
      const exception = new PermissionException("Stack JSON test", {
        key: "value",
      });

      const json = JSON.stringify({
        message: exception.message,
        status: exception.status,
        data: exception.data,
        date: exception.date,
        stackFrames: exception.stackToJson(),
      });

      const serialized = JSON.stringify(json);
      const parsed = JSON.parse(serialized);

      expect(parsed).toBeDefined();
    });
  });

  describe("Edge Cases", () => {
    test("should handle empty message", () => {
      const exception = new PermissionException("");

      expect(exception.message).toBe("");
      expect(exception.status).toBe(Status.Code.InternalServerError);
    });

    test("should handle very long messages", () => {
      const longMessage = "A".repeat(10000);
      const exception = new PermissionException(longMessage);

      expect(exception.message).toBe(longMessage);
      expect(exception.message.length).toBe(10000);
    });

    test("should handle special characters in message", () => {
      const specialMessage = "Permission denied: 特殊字符 🔒 <script>alert('xss')</script>";
      const exception = new PermissionException(specialMessage);

      expect(exception.message).toBe(specialMessage);
    });

    test("should handle complex nested data", () => {
      const complexData = {
        authentication: {
          method: "oauth2",
          provider: "google",
          status: "expired",
        },
        authorization: {
          type: "rbac",
          roles: ["user", "viewer"],
          permissions: ["read", "list"],
        },
        user: {
          id: "user-123",
          email: "user@example.com",
          verified: true,
        },
        resource: {
          type: "document",
          id: "doc-456",
          path: "/secure/documents",
          sensitive: true,
        },
        metadata: {
          timestamp: new Date(),
          ipAddress: "192.168.1.1",
          userAgent: "Mozilla/5.0",
          sessionId: "sess-789",
        },
        context: {
          feature: "document_access",
          environment: "production",
          version: "2.1.0",
        },
      };

      const exception = new PermissionException("Complex permission denied", complexData);

      expect(exception.data?.authentication.method).toBe("oauth2");
      expect(exception.data?.authorization.type).toBe("rbac");
      expect(exception.data?.user.id).toBe("user-123");
      expect(exception.data?.resource.type).toBe("document");
      expect(exception.data?.metadata.ipAddress).toBe("192.168.1.1");
      expect(exception.data?.context.feature).toBe("document_access");
    });

    test("should handle permission-specific data structures", () => {
      interface PermissionContext {
        sessionId: string;
        permissions: {
          granted: string[];
          denied: string[];
          pending: string[];
        };
        policy: {
          name: string;
          version: string;
          strict: boolean;
        };
        audit: {
          enabled: boolean;
          logLevel: string;
          retentionDays: number;
        };
      }

      const permissionData: PermissionContext = {
        sessionId: "sess-abc123",
        permissions: {
          granted: ["user:read", "file:list"],
          denied: ["admin:write", "system:config"],
          pending: ["user:write"],
        },
        policy: {
          name: "default_policy",
          version: "1.2.0",
          strict: true,
        },
        audit: {
          enabled: true,
          logLevel: "warn",
          retentionDays: 90,
        },
      };

      const exception = new PermissionException<PermissionContext>("Permission context error", permissionData);

      expect(exception.data?.sessionId).toBe("sess-abc123");
      expect(exception.data?.permissions.granted).toEqual(["user:read", "file:list"]);
      expect(exception.data?.permissions.denied).toEqual(["admin:write", "system:config"]);
      expect(exception.data?.permissions.pending).toEqual(["user:write"]);
      expect(exception.data?.policy.name).toBe("default_policy");
      expect(exception.data?.policy.version).toBe("1.2.0");
      expect(exception.data?.policy.strict).toBe(true);
      expect(exception.data?.audit.enabled).toBe(true);
      expect(exception.data?.audit.logLevel).toBe("warn");
      expect(exception.data?.audit.retentionDays).toBe(90);
    });
  });

  describe("Permission-Specific Scenarios", () => {
    test("should handle hierarchical permission failures", () => {
      const exception = new PermissionException("Hierarchical permission denied", {
        hierarchy: "organization > team > project > resource",
        userLevel: "team",
        requiredLevel: "organization",
        organizationId: "org-123",
        teamId: "team-456",
        projectId: "proj-789",
        resourceId: "res-abc",
        inheritanceBlocked: true,
        delegationAllowed: false,
      });

      expect(exception.data?.hierarchy).toBe("organization > team > project > resource");
      expect(exception.data?.userLevel).toBe("team");
      expect(exception.data?.requiredLevel).toBe("organization");
      expect(exception.data?.inheritanceBlocked).toBe(true);
      expect(exception.data?.delegationAllowed).toBe(false);
    });

    test("should handle conditional permission failures", () => {
      const exception = new PermissionException("Conditional permission not met", {
        conditions: [
          { type: "time_range", met: true },
          { type: "ip_whitelist", met: false },
          { type: "mfa_required", met: true },
          { type: "resource_limit", met: false },
        ],
        allConditionsMet: false,
        failedConditions: ["ip_whitelist", "resource_limit"],
        bypassAvailable: false,
        escalationRequired: true,
      });

      expect(exception.data?.conditions).toHaveLength(4);
      expect(exception.data?.allConditionsMet).toBe(false);
      expect(exception.data?.failedConditions).toEqual(["ip_whitelist", "resource_limit"]);
      expect(exception.data?.bypassAvailable).toBe(false);
      expect(exception.data?.escalationRequired).toBe(true);
    });

    test("should handle dynamic permission evaluation failures", () => {
      const exception = new PermissionException("Dynamic permission evaluation failed", {
        evaluationId: "eval-xyz789",
        ruleEngine: "custom_rules_v2",
        evaluatedRules: [
          { id: "rule_1", result: "allow", weight: 0.8 },
          { id: "rule_2", result: "deny", weight: 0.9 },
          { id: "rule_3", result: "allow", weight: 0.7 },
        ],
        finalScore: 0.73,
        threshold: 0.75,
        decision: "deny",
        confidence: 0.85,
        reviewRequired: true,
      });

      expect(exception.data?.evaluationId).toBe("eval-xyz789");
      expect(exception.data?.ruleEngine).toBe("custom_rules_v2");
      expect(exception.data?.evaluatedRules).toHaveLength(3);
      expect(exception.data?.finalScore).toBe(0.73);
      expect(exception.data?.threshold).toBe(0.75);
      expect(exception.data?.decision).toBe("deny");
      expect(exception.data?.confidence).toBe(0.85);
      expect(exception.data?.reviewRequired).toBe(true);
    });
  });
});
