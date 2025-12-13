import { describe, expect, test } from "bun:test";
import { type } from "arktype";
import { extractParameterNames, isValidRoutePath, routeConfigToTypeString } from "../src/utils";

describe("isValidRoutePath", () => {
  test("validates correct paths", () => {
    expect(isValidRoutePath("/users")).toBe(true);
    expect(isValidRoutePath("/users/:id")).toBe(true);
    expect(isValidRoutePath("/users/:id/posts/:postId")).toBe(true);
    expect(isValidRoutePath("/api/v1/users")).toBe(true);
  });

  test("rejects invalid paths", () => {
    expect(isValidRoutePath("users")).toBe(false);
    expect(isValidRoutePath("/users//posts")).toBe(false);
    expect(isValidRoutePath("/users/:")).toBe(false);
    expect(isValidRoutePath("/users/::id")).toBe(false);
    expect(isValidRoutePath("/:id:")).toBe(false);
  });
});

describe("extractParameterNames", () => {
  test("extracts single parameter", () => {
    expect(extractParameterNames("/users/:id")).toEqual(["id"]);
  });

  test("extracts multiple parameters", () => {
    expect(extractParameterNames("/users/:id/posts/:postId")).toEqual(["id", "postId"]);
  });

  test("returns empty array for paths without parameters", () => {
    expect(extractParameterNames("/users")).toEqual([]);
  });

  test("extracts parameters from complex paths", () => {
    expect(extractParameterNames("/users/:userId/emails/:emailId/state/:state")).toEqual([
      "userId",
      "emailId",
      "state",
    ]);
  });
});

describe("routeConfigToTypeString", () => {
  test("converts simple string params to type string", () => {
    const config = {
      params: {
        id: type("string"),
        emailId: type("string"),
      },
    };

    const result = routeConfigToTypeString(config);

    expect(result).toContain("params: { id: string; emailId: string }");
  });

  test("converts object payload to type string", () => {
    const config = {
      payload: type({
        name: "string",
        age: "number",
      }),
    };

    const result = routeConfigToTypeString(config);

    expect(result).toContain("payload:");
    expect(result).toContain("name: string");
    expect(result).toContain("age: number");
  });

  test("converts queries to type string", () => {
    const config = {
      queries: type({
        limit: "number",
        offset: "number",
      }),
    };

    const result = routeConfigToTypeString(config);

    expect(result).toContain("queries: { limit: number; offset: number }");
  });

  test("converts response to type string", () => {
    const config = {
      response: type({
        success: "boolean",
        message: "string",
      }),
    };

    const result = routeConfigToTypeString(config);

    expect(result).toContain("response:");
    expect(result).toContain("success: boolean");
    expect(result).toContain("message: string");
  });

  test("converts complete route config to type string", () => {
    const config = {
      params: {
        state: type("string"),
        id: type("string"),
        emailId: type("string"),
      },
      payload: type({
        name: "string",
      }),
      queries: type({
        limit: "number",
      }),
      response: type({
        success: "boolean",
        message: "string",
      }),
    };

    const result = routeConfigToTypeString(config);

    expect(result).toContain("response:");
    expect(result).toContain("success: boolean");
    expect(result).toContain("message: string");
    expect(result).toContain("params:");
    expect(result).toContain("state: string");
    expect(result).toContain("id: string");
    expect(result).toContain("emailId: string");
    expect(result).toContain("payload: { name: string }");
    expect(result).toContain("queries: { limit: number }");
  });

  test("handles optional properties", () => {
    const config = {
      payload: type({
        name: "string",
        "age?": "number",
      }),
    };

    const result = routeConfigToTypeString(config);

    expect(result).toContain("payload:");
    expect(result).toContain("name: string");
    expect(result).toContain("age?: number");
  });

  test("handles array types", () => {
    const config = {
      payload: type({
        tags: "string[]",
      }),
    };

    const result = routeConfigToTypeString(config);

    expect(result).toContain("payload:");
    expect(result).toContain("tags: string[]");
  });

  test("handles nested objects", () => {
    const config = {
      payload: type({
        user: {
          name: "string",
          email: "string",
        },
      }),
    };

    const result = routeConfigToTypeString(config);

    expect(result).toContain("payload:");
    expect(result).toContain("user:");
    expect(result).toContain("name: string");
    expect(result).toContain("email: string");
  });

  test("handles boolean types", () => {
    const config = {
      queries: type({
        active: "boolean",
      }),
    };

    const result = routeConfigToTypeString(config);

    expect(result).toContain("queries: { active: boolean }");
  });

  test("handles number types", () => {
    const config = {
      params: {
        count: type("number"),
      },
    };

    const result = routeConfigToTypeString(config);

    expect(result).toContain("params: { count: number }");
  });

  test("handles empty config", () => {
    const config = {};

    const result = routeConfigToTypeString(config);

    expect(result).toBe("{\n  ;\n}");
  });

  test("returns properly formatted multi-line type string", () => {
    const config = {
      response: type({
        success: "boolean",
      }),
      params: {
        id: type("string"),
      },
    };

    const result = routeConfigToTypeString(config);

    expect(result).toMatch(/^\{\n/);
    expect(result).toMatch(/\n\}$/);
    expect(result).toContain(";\n  ");
  });
});
