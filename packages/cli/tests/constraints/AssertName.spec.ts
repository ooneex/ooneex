import { describe, expect, test } from "bun:test";
import { AssertName } from "@/constraints/AssertName";

describe("AssertName", () => {
  const validator = new AssertName();

  describe("getConstraint", () => {
    test("should return a string constraint with min length 1", () => {
      const constraint = validator.getConstraint();
      expect(constraint).toBeDefined();
    });
  });

  describe("getErrorMessage", () => {
    test("should return appropriate error message", () => {
      const message = validator.getErrorMessage();
      expect(message).toBe("Name must contain only letters, and numbers");
    });
  });

  describe("validate", () => {
    describe("valid names", () => {
      test("should accept alphanumeric names", () => {
        expect(validator.validate("User").isValid).toBe(true);
        expect(validator.validate("user123").isValid).toBe(true);
        expect(validator.validate("User123Name").isValid).toBe(true);
        expect(validator.validate("a").isValid).toBe(true);
        expect(validator.validate("ABC").isValid).toBe(true);
        expect(validator.validate("123").isValid).toBe(true);
      });
    });

    describe("invalid names", () => {
      test("should reject empty string", () => {
        const result = validator.validate("");
        expect(result.isValid).toBe(false);
      });

      test("should reject names with special characters", () => {
        expect(validator.validate("user-name").isValid).toBe(false);
        expect(validator.validate("user_name").isValid).toBe(false);
        expect(validator.validate("user.name").isValid).toBe(false);
        expect(validator.validate("user@name").isValid).toBe(false);
        expect(validator.validate("user name").isValid).toBe(false);
      });

      test("should reject non-string values", () => {
        expect(validator.validate(123).isValid).toBe(false);
        expect(validator.validate(null).isValid).toBe(false);
        expect(validator.validate(undefined).isValid).toBe(false);
        expect(validator.validate({}).isValid).toBe(false);
        expect(validator.validate([]).isValid).toBe(false);
      });
    });
  });
});
