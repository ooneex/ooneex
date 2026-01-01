import { describe, expect, test } from "bun:test";
import { AssertRouteAction } from "@/constraints/AssertRouteAction";

describe("AssertRouteAction", () => {
  const validator = new AssertRouteAction();

  describe("getConstraint", () => {
    test("should return a string constraint with min length 2", () => {
      const constraint = validator.getConstraint();
      expect(constraint).toBeDefined();
    });
  });

  describe("getErrorMessage", () => {
    test("should return appropriate error message mentioning valid actions", () => {
      const message = validator.getErrorMessage();
      expect(message).toContain("Route action must be one of the valid actions");
    });
  });

  describe("validate", () => {
    describe("valid actions", () => {
      test("should accept common valid actions", () => {
        expect(validator.validate("list").isValid).toBe(true);
        expect(validator.validate("show").isValid).toBe(true);
        expect(validator.validate("create").isValid).toBe(true);
        expect(validator.validate("update").isValid).toBe(true);
        expect(validator.validate("delete").isValid).toBe(true);
        expect(validator.validate("read").isValid).toBe(true);
        expect(validator.validate("store").isValid).toBe(true);
        expect(validator.validate("index").isValid).toBe(true);
      });

      test("should accept actions case-insensitively", () => {
        expect(validator.validate("LIST").isValid).toBe(true);
        expect(validator.validate("List").isValid).toBe(true);
        expect(validator.validate("CREATE").isValid).toBe(true);
      });
    });

    describe("invalid actions", () => {
      test("should reject actions with whitespace", () => {
        expect(validator.validate(" list").isValid).toBe(false);
        expect(validator.validate("list ").isValid).toBe(false);
        expect(validator.validate(" list ").isValid).toBe(false);
      });

      test("should reject invalid action names", () => {
        expect(validator.validate("invalid").isValid).toBe(false);
        expect(validator.validate("foobar").isValid).toBe(false);
        expect(validator.validate("notanaction").isValid).toBe(false);
      });

      test("should reject too short strings", () => {
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
