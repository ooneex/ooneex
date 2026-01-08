import { describe, expect, test } from "bun:test";
import { StatRepository } from "@/repositories/common/StatRepository";

describe("StatRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(StatRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof StatRepository).toBe("function");
    expect(StatRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(StatRepository.prototype.open).toBeDefined();
      expect(typeof StatRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(StatRepository.prototype.close).toBeDefined();
      expect(typeof StatRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(StatRepository.prototype.find).toBeDefined();
      expect(typeof StatRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(StatRepository.prototype.findOne).toBeDefined();
      expect(typeof StatRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(StatRepository.prototype.findOneBy).toBeDefined();
      expect(typeof StatRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(StatRepository.prototype.create).toBeDefined();
      expect(typeof StatRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(StatRepository.prototype.createMany).toBeDefined();
      expect(typeof StatRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(StatRepository.prototype.update).toBeDefined();
      expect(typeof StatRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(StatRepository.prototype.updateMany).toBeDefined();
      expect(typeof StatRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(StatRepository.prototype.delete).toBeDefined();
      expect(typeof StatRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(StatRepository.prototype.count).toBeDefined();
      expect(typeof StatRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(StatRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof StatRepository.prototype[name as keyof typeof StatRepository.prototype] === "function",
      );
      expect(methods.length).toBe(11);
    });

    test("should have all required repository methods", () => {
      const requiredMethods = [
        "open",
        "close",
        "find",
        "findOne",
        "findOneBy",
        "create",
        "createMany",
        "update",
        "updateMany",
        "delete",
        "count",
      ];

      const methods = Object.getOwnPropertyNames(StatRepository.prototype).filter((name) => name !== "constructor");

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
