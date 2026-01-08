import { describe, expect, test } from "bun:test";
import { Migration20251229124723709 } from "@/migrations/currency/Migration20251229124723709";

describe("Migration20251229124723709", () => {
  test("should be a class", () => {
    expect(typeof Migration20251229124723709).toBe("function");
    expect(Migration20251229124723709.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have up method", () => {
      expect(Migration20251229124723709.prototype.up).toBeDefined();
      expect(typeof Migration20251229124723709.prototype.up).toBe("function");
    });

    test("should have down method", () => {
      expect(Migration20251229124723709.prototype.down).toBeDefined();
      expect(typeof Migration20251229124723709.prototype.down).toBe("function");
    });

    test("should have getVersion method", () => {
      expect(Migration20251229124723709.prototype.getVersion).toBeDefined();
      expect(typeof Migration20251229124723709.prototype.getVersion).toBe("function");
    });

    test("should have getDependencies method", () => {
      expect(Migration20251229124723709.prototype.getDependencies).toBeDefined();
      expect(typeof Migration20251229124723709.prototype.getDependencies).toBe("function");
    });
  });

  describe("getVersion", () => {
    test("should return correct version string", () => {
      const migration = new Migration20251229124723709();
      expect(migration.getVersion()).toBe("20251229124723709");
    });
  });

  describe("getDependencies", () => {
    test("should return an array", () => {
      const migration = new Migration20251229124723709();
      expect(Array.isArray(migration.getDependencies())).toBe(true);
    });
  });

  describe("method count", () => {
    test("should have exactly 4 public methods", () => {
      const methods = Object.getOwnPropertyNames(Migration20251229124723709.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof Migration20251229124723709.prototype[name as keyof typeof Migration20251229124723709.prototype] ===
            "function",
      );
      expect(methods.length).toBe(4);
    });
  });
});
