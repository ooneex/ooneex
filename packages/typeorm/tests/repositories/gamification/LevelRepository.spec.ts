import { describe, expect, test } from "bun:test";
import { LevelRepository } from "@/repositories/gamification/LevelRepository";

describe("LevelRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(LevelRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof LevelRepository).toBe("function");
    expect(LevelRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(LevelRepository.prototype.open).toBeDefined();
      expect(typeof LevelRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(LevelRepository.prototype.close).toBeDefined();
      expect(typeof LevelRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(LevelRepository.prototype.find).toBeDefined();
      expect(typeof LevelRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(LevelRepository.prototype.findOne).toBeDefined();
      expect(typeof LevelRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(LevelRepository.prototype.findOneBy).toBeDefined();
      expect(typeof LevelRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(LevelRepository.prototype.create).toBeDefined();
      expect(typeof LevelRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(LevelRepository.prototype.createMany).toBeDefined();
      expect(typeof LevelRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(LevelRepository.prototype.update).toBeDefined();
      expect(typeof LevelRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(LevelRepository.prototype.updateMany).toBeDefined();
      expect(typeof LevelRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(LevelRepository.prototype.delete).toBeDefined();
      expect(typeof LevelRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(LevelRepository.prototype.count).toBeDefined();
      expect(typeof LevelRepository.prototype.count).toBe("function");
    });
  });

  describe("custom methods", () => {
    test("should have findByCode method", () => {
      expect(LevelRepository.prototype.findByCode).toBeDefined();
      expect(typeof LevelRepository.prototype.findByCode).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 12 public methods", () => {
      const methods = Object.getOwnPropertyNames(LevelRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof LevelRepository.prototype[name as keyof typeof LevelRepository.prototype] === "function",
      );
      expect(methods.length).toBe(12);
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
        "findByCode",
      ];

      const methods = Object.getOwnPropertyNames(LevelRepository.prototype).filter((name) => name !== "constructor");

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
