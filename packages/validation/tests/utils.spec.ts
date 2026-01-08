import { describe, expect, test } from "bun:test";
import { Assert, jsonSchemaToTypeString } from "@/utils";

describe("Assert", () => {
  test("should create string type constraint", () => {
    const constraint = Assert("string");

    expect(constraint("hello")).toBe("hello");
    expect(constraint(123).toString()).toContain("must be a string");
  });

  test("should create number type constraint", () => {
    const constraint = Assert("number");

    expect(constraint(123)).toBe(123);
    expect(constraint("hello").toString()).toContain("must be a number");
  });

  test("should create boolean type constraint", () => {
    const constraint = Assert("boolean");

    expect(constraint(true)).toBe(true);
    expect(constraint(false)).toBe(false);
    expect(constraint("true").toString()).toContain("must be");
  });

  test("should create string length constraint", () => {
    const constraint = Assert("1 <= string <= 10");

    expect(constraint("hello")).toBe("hello");
    expect(constraint("").toString()).toContain("non-empty");
    expect(constraint("12345678901").toString()).toContain("at most");
  });

  test("should create number range constraint", () => {
    const constraint = Assert("1 <= number <= 100");

    expect(constraint(50)).toBe(50);
    expect(constraint(0).toString()).toContain("at least");
    expect(constraint(101).toString()).toContain("at most");
  });

  test("should create regex constraint", () => {
    const constraint = Assert(/^[a-z]+$/);

    expect(constraint("hello")).toBe("hello");
    expect(constraint("HELLO").toString()).toContain("match");
  });

  test("should create email constraint", () => {
    const constraint = Assert("string.email");

    expect(constraint("test@example.com")).toBe("test@example.com");
    expect(constraint("invalid").toString()).toContain("email");
  });

  test("should create integer constraint", () => {
    const constraint = Assert("number.integer");

    expect(constraint(42)).toBe(42);
    expect(constraint(3.14).toString()).toContain("integer");
  });
});

describe("jsonSchemaToTypeString", () => {
  describe("primitive types", () => {
    test("should convert string type", () => {
      const result = jsonSchemaToTypeString({ type: "string" });
      expect(result).toBe("string");
    });

    test("should convert number type", () => {
      const result = jsonSchemaToTypeString({ type: "number" });
      expect(result).toBe("number");
    });

    test("should convert integer type to number", () => {
      const result = jsonSchemaToTypeString({ type: "integer" });
      expect(result).toBe("number");
    });

    test("should convert boolean type", () => {
      const result = jsonSchemaToTypeString({ type: "boolean" });
      expect(result).toBe("boolean");
    });

    test("should convert null type", () => {
      const result = jsonSchemaToTypeString({ type: "null" });
      expect(result).toBe("null");
    });
  });

  describe("array types", () => {
    test("should convert array with items to typed array", () => {
      const result = jsonSchemaToTypeString({
        type: "array",
        items: { type: "string" },
      });
      expect(result).toBe("string[]");
    });

    test("should convert array with number items", () => {
      const result = jsonSchemaToTypeString({
        type: "array",
        items: { type: "number" },
      });
      expect(result).toBe("number[]");
    });

    test("should convert array without items to unknown[]", () => {
      const result = jsonSchemaToTypeString({ type: "array" });
      expect(result).toBe("unknown[]");
    });

    test("should convert nested array types", () => {
      const result = jsonSchemaToTypeString({
        type: "array",
        items: {
          type: "array",
          items: { type: "string" },
        },
      });
      expect(result).toBe("string[][]");
    });
  });

  describe("object types", () => {
    test("should convert object with properties", () => {
      const result = jsonSchemaToTypeString({
        type: "object",
        properties: {
          name: { type: "string" },
          age: { type: "number" },
        },
      });
      expect(result).toBe("{ name?: string; age?: number }");
    });

    test("should mark required properties without optional", () => {
      const result = jsonSchemaToTypeString({
        type: "object",
        properties: {
          name: { type: "string" },
          age: { type: "number" },
        },
        required: ["name"],
      });
      expect(result).toBe("{ name: string; age?: number }");
    });

    test("should convert object without properties to Record", () => {
      const result = jsonSchemaToTypeString({ type: "object" });
      expect(result).toBe("Record<string, unknown>");
    });

    test("should handle nested objects", () => {
      const result = jsonSchemaToTypeString({
        type: "object",
        properties: {
          user: {
            type: "object",
            properties: {
              name: { type: "string" },
            },
          },
        },
      });
      expect(result).toBe("{ user?: { name?: string } }");
    });
  });

  describe("union types (anyOf/oneOf)", () => {
    test("should convert anyOf to union type", () => {
      const result = jsonSchemaToTypeString({
        anyOf: [{ type: "string" }, { type: "number" }],
      });
      expect(result).toBe("string | number");
    });

    test("should convert oneOf to union type", () => {
      const result = jsonSchemaToTypeString({
        oneOf: [{ type: "boolean" }, { type: "null" }],
      });
      expect(result).toBe("boolean | null");
    });

    test("should handle multiple types in union", () => {
      const result = jsonSchemaToTypeString({
        anyOf: [{ type: "string" }, { type: "number" }, { type: "boolean" }],
      });
      expect(result).toBe("string | number | boolean");
    });
  });

  describe("intersection types (allOf)", () => {
    test("should convert allOf to intersection type", () => {
      const result = jsonSchemaToTypeString({
        allOf: [
          { type: "object", properties: { name: { type: "string" } } },
          { type: "object", properties: { age: { type: "number" } } },
        ],
      });
      expect(result).toBe("{ name?: string } & { age?: number }");
    });
  });

  describe("edge cases", () => {
    test("should return unknown for null schema", () => {
      const result = jsonSchemaToTypeString(null);
      expect(result).toBe("unknown");
    });

    test("should return unknown for undefined schema", () => {
      const result = jsonSchemaToTypeString(undefined);
      expect(result).toBe("unknown");
    });

    test("should return unknown for empty object", () => {
      const result = jsonSchemaToTypeString({});
      expect(result).toBe("unknown");
    });

    test("should return unknown for non-object schema", () => {
      const result = jsonSchemaToTypeString("string");
      expect(result).toBe("unknown");
    });

    test("should return unknown for invalid type", () => {
      const result = jsonSchemaToTypeString({ type: "invalid" });
      expect(result).toBe("unknown");
    });

    test("should handle complex nested schema", () => {
      const result = jsonSchemaToTypeString({
        type: "object",
        properties: {
          users: {
            type: "array",
            items: {
              type: "object",
              properties: {
                id: { type: "number" },
                name: { type: "string" },
                active: { type: "boolean" },
              },
              required: ["id", "name"],
            },
          },
        },
        required: ["users"],
      });
      expect(result).toBe("{ users: { id: number; name: string; active?: boolean }[] }");
    });
  });
});
