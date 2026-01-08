import { describe, expect, test } from "bun:test";
import { Migration20251225182641319 } from "@/migrations/user/Migration20251225182641319";

describe("Migration20251225182641319", () => {
  test("should be a class", () => {
    expect(typeof Migration20251225182641319).toBe("function");
    expect(Migration20251225182641319.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have up method", () => {
      expect(Migration20251225182641319.prototype.up).toBeDefined();
      expect(typeof Migration20251225182641319.prototype.up).toBe("function");
    });

    test("should have down method", () => {
      expect(Migration20251225182641319.prototype.down).toBeDefined();
      expect(typeof Migration20251225182641319.prototype.down).toBe("function");
    });

    test("should have getVersion method", () => {
      expect(Migration20251225182641319.prototype.getVersion).toBeDefined();
      expect(typeof Migration20251225182641319.prototype.getVersion).toBe("function");
    });

    test("should have getDependencies method", () => {
      expect(Migration20251225182641319.prototype.getDependencies).toBeDefined();
      expect(typeof Migration20251225182641319.prototype.getDependencies).toBe("function");
    });
  });

  describe("getVersion", () => {
    test("should return correct version string", () => {
      const migration = new Migration20251225182641319();
      expect(migration.getVersion()).toBe("20251225182641319");
    });
  });

  describe("getDependencies", () => {
    test("should return an array", () => {
      const migration = new Migration20251225182641319();
      expect(Array.isArray(migration.getDependencies())).toBe(true);
    });
  });

  describe("method count", () => {
    test("should have exactly 4 public methods", () => {
      const methods = Object.getOwnPropertyNames(Migration20251225182641319.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof Migration20251225182641319.prototype[name as keyof typeof Migration20251225182641319.prototype] ===
            "function",
      );
      expect(methods.length).toBe(4);
    });
  });
});
