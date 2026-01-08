import { describe, expect, test } from "bun:test";
import { Migration20251225173353646 } from "@/migrations/book/Migration20251225173353646";

describe("Migration20251225173353646", () => {
  test("should be a class", () => {
    expect(typeof Migration20251225173353646).toBe("function");
    expect(Migration20251225173353646.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have up method", () => {
      expect(Migration20251225173353646.prototype.up).toBeDefined();
      expect(typeof Migration20251225173353646.prototype.up).toBe("function");
    });

    test("should have down method", () => {
      expect(Migration20251225173353646.prototype.down).toBeDefined();
      expect(typeof Migration20251225173353646.prototype.down).toBe("function");
    });

    test("should have getVersion method", () => {
      expect(Migration20251225173353646.prototype.getVersion).toBeDefined();
      expect(typeof Migration20251225173353646.prototype.getVersion).toBe("function");
    });

    test("should have getDependencies method", () => {
      expect(Migration20251225173353646.prototype.getDependencies).toBeDefined();
      expect(typeof Migration20251225173353646.prototype.getDependencies).toBe("function");
    });
  });

  describe("getVersion", () => {
    test("should return correct version string", () => {
      const migration = new Migration20251225173353646();
      expect(migration.getVersion()).toBe("20251225173353646");
    });
  });

  describe("getDependencies", () => {
    test("should return an array", () => {
      const migration = new Migration20251225173353646();
      expect(Array.isArray(migration.getDependencies())).toBe(true);
    });
  });

  describe("method count", () => {
    test("should have exactly 4 public methods", () => {
      const methods = Object.getOwnPropertyNames(Migration20251225173353646.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof Migration20251225173353646.prototype[name as keyof typeof Migration20251225173353646.prototype] ===
            "function",
      );
      expect(methods.length).toBe(4);
    });
  });
});
