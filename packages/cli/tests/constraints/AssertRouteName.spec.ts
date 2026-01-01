import { describe, expect, test } from "bun:test";
import { AssertRouteName } from "@/constraints/AssertRouteName";

describe("AssertRouteName", () => {
  const validator = new AssertRouteName();

  describe("getConstraint", () => {
    test("should return a string constraint with min length 7", () => {
      const constraint = validator.getConstraint();
      expect(constraint).toBeDefined();
    });
  });

  describe("getErrorMessage", () => {
    test("should return appropriate error message with format example", () => {
      const message = validator.getErrorMessage();
      expect(message).toContain("namespace.resource.action");
      expect(message).toContain("api.users.list");
    });
  });

  describe("validate", () => {
    describe("valid route names", () => {
      test("should accept valid route names with all valid namespaces", () => {
        expect(validator.validate("api.users.list").isValid).toBe(true);
        expect(validator.validate("client.posts.show").isValid).toBe(true);
        expect(validator.validate("admin.settings.update").isValid).toBe(true);
        expect(validator.validate("public.pages.read").isValid).toBe(true);
        expect(validator.validate("auth.session.create").isValid).toBe(true);
        expect(validator.validate("webhook.events.process").isValid).toBe(true);
        expect(validator.validate("internal.jobs.run").isValid).toBe(true);
        expect(validator.validate("external.apis.fetch").isValid).toBe(true);
        expect(validator.validate("system.cache.clear").isValid).toBe(true);
        expect(validator.validate("health.status.ping").isValid).toBe(true);
        expect(validator.validate("metrics.data.export").isValid).toBe(true);
        expect(validator.validate("docs.api.read").isValid).toBe(true);
      });

      test("should accept route names with various valid actions", () => {
        expect(validator.validate("api.users.create").isValid).toBe(true);
        expect(validator.validate("api.users.delete").isValid).toBe(true);
        expect(validator.validate("api.users.index").isValid).toBe(true);
        expect(validator.validate("api.users.search").isValid).toBe(true);
        expect(validator.validate("api.users.export").isValid).toBe(true);
      });

      test("should accept route names with alphanumeric resource segments", () => {
        expect(validator.validate("api.user123.list").isValid).toBe(true);
        expect(validator.validate("api.Users.list").isValid).toBe(true);
        expect(validator.validate("api.userPosts.list").isValid).toBe(true);
      });
    });

    describe("invalid route names", () => {
      test("should reject route names with whitespace", () => {
        expect(validator.validate(" api.users.list").isValid).toBe(false);
        expect(validator.validate("api.users.list ").isValid).toBe(false);
        expect(validator.validate(" api.users.list ").isValid).toBe(false);
      });

      test("should reject route names without three segments", () => {
        expect(validator.validate("api.users").isValid).toBe(false);
        expect(validator.validate("api").isValid).toBe(false);
        expect(validator.validate("api.users.list.extra").isValid).toBe(false);
      });

      test("should reject route names with invalid namespaces", () => {
        const result = validator.validate("invalid.users.list");
        expect(result.isValid).toBe(false);
        expect(result.message).toContain("Invalid namespace");
      });

      test("should reject route names with invalid actions", () => {
        const result = validator.validate("api.users.invalidaction");
        expect(result.isValid).toBe(false);
        expect(result.message).toContain("Invalid action");
      });

      test("should reject route names with invalid resource segments", () => {
        const result = validator.validate("api.user-name.list");
        expect(result.isValid).toBe(false);
      });

      test("should reject too short strings", () => {
        expect(validator.validate("a.b.c").isValid).toBe(false);
      });

      test("should reject non-string values", () => {
        expect(validator.validate(123).isValid).toBe(false);
        expect(validator.validate(null).isValid).toBe(false);
        expect(validator.validate(undefined).isValid).toBe(false);
      });
    });
  });
});
