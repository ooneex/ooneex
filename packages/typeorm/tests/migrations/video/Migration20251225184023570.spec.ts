import { describe, expect, test } from "bun:test";
import { Migration20251225184023570 } from "@/migrations/video/Migration20251225184023570";

describe("Migration20251225184023570", () => {
  test("should be a class", () => {
    expect(typeof Migration20251225184023570).toBe("function");
    expect(Migration20251225184023570.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have up method", () => {
      expect(Migration20251225184023570.prototype.up).toBeDefined();
      expect(typeof Migration20251225184023570.prototype.up).toBe("function");
    });

    test("should have down method", () => {
      expect(Migration20251225184023570.prototype.down).toBeDefined();
      expect(typeof Migration20251225184023570.prototype.down).toBe("function");
    });

    test("should have getVersion method", () => {
      expect(Migration20251225184023570.prototype.getVersion).toBeDefined();
      expect(typeof Migration20251225184023570.prototype.getVersion).toBe("function");
    });

    test("should have getDependencies method", () => {
      expect(Migration20251225184023570.prototype.getDependencies).toBeDefined();
      expect(typeof Migration20251225184023570.prototype.getDependencies).toBe("function");
    });
  });

  describe("getVersion", () => {
    test("should return correct version string", () => {
      const migration = new Migration20251225184023570();
      expect(migration.getVersion()).toBe("20251225184023570");
    });
  });

  describe("getDependencies", () => {
    test("should return an array", () => {
      const migration = new Migration20251225184023570();
      expect(Array.isArray(migration.getDependencies())).toBe(true);
    });
  });

  describe("method count", () => {
    test("should have exactly 4 public methods", () => {
      const methods = Object.getOwnPropertyNames(Migration20251225184023570.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof Migration20251225184023570.prototype[name as keyof typeof Migration20251225184023570.prototype] ===
            "function",
      );
      expect(methods.length).toBe(4);
    });
  });
});
