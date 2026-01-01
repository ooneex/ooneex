import { describe, expect, test } from "bun:test";
import { AssertRouteNamespace } from "@/constraints/AssertRouteNamespace";

describe("AssertRouteNamespace", () => {
  const validator = new AssertRouteNamespace();

  describe("getConstraint", () => {
    test("should return a string constraint with min length 3", () => {
      const constraint = validator.getConstraint();
      expect(constraint).toBeDefined();
    });
  });

  describe("getErrorMessage", () => {
    test("should return appropriate error message listing namespaces", () => {
      const message = validator.getErrorMessage();
      expect(message).toContain("Route namespace must be one of");
      expect(message).toContain("api");
    });
  });

  describe("validate", () => {
    describe("valid namespaces", () => {
      test("should accept all valid namespaces", () => {
        expect(validator.validate("api").isValid).toBe(true);
        expect(validator.validate("client").isValid).toBe(true);
        expect(validator.validate("admin").isValid).toBe(true);
        expect(validator.validate("public").isValid).toBe(true);
        expect(validator.validate("auth").isValid).toBe(true);
        expect(validator.validate("webhook").isValid).toBe(true);
        expect(validator.validate("internal").isValid).toBe(true);
        expect(validator.validate("external").isValid).toBe(true);
        expect(validator.validate("system").isValid).toBe(true);
        expect(validator.validate("health").isValid).toBe(true);
        expect(validator.validate("metrics").isValid).toBe(true);
        expect(validator.validate("docs").isValid).toBe(true);
      });

      test("should accept namespaces case-insensitively", () => {
        expect(validator.validate("API").isValid).toBe(true);
        expect(validator.validate("Api").isValid).toBe(true);
        expect(validator.validate("ADMIN").isValid).toBe(true);
      });
    });

    describe("invalid namespaces", () => {
      test("should reject namespaces with whitespace", () => {
        expect(validator.validate(" api").isValid).toBe(false);
        expect(validator.validate("api ").isValid).toBe(false);
        expect(validator.validate(" api ").isValid).toBe(false);
      });

      test("should reject invalid namespace names", () => {
        expect(validator.validate("invalid").isValid).toBe(false);
        expect(validator.validate("custom").isValid).toBe(false);
        expect(validator.validate("test").isValid).toBe(false);
      });

      test("should reject too short strings", () => {
        expect(validator.validate("ap").isValid).toBe(false);
        expect(validator.validate("a").isValid).toBe(false);
      });

      test("should reject non-string values", () => {
        expect(validator.validate(123).isValid).toBe(false);
        expect(validator.validate(null).isValid).toBe(false);
        expect(validator.validate(undefined).isValid).toBe(false);
      });
    });
  });
});
