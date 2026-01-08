import { describe, expect, test } from "bun:test";
import { McqSessionRepository } from "@/repositories/gamification/mcq/McqSessionRepository";

describe("McqSessionRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(McqSessionRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof McqSessionRepository).toBe("function");
    expect(McqSessionRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(McqSessionRepository.prototype.open).toBeDefined();
      expect(typeof McqSessionRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(McqSessionRepository.prototype.close).toBeDefined();
      expect(typeof McqSessionRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(McqSessionRepository.prototype.find).toBeDefined();
      expect(typeof McqSessionRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(McqSessionRepository.prototype.findOne).toBeDefined();
      expect(typeof McqSessionRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(McqSessionRepository.prototype.findOneBy).toBeDefined();
      expect(typeof McqSessionRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(McqSessionRepository.prototype.create).toBeDefined();
      expect(typeof McqSessionRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(McqSessionRepository.prototype.createMany).toBeDefined();
      expect(typeof McqSessionRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(McqSessionRepository.prototype.update).toBeDefined();
      expect(typeof McqSessionRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(McqSessionRepository.prototype.updateMany).toBeDefined();
      expect(typeof McqSessionRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(McqSessionRepository.prototype.delete).toBeDefined();
      expect(typeof McqSessionRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(McqSessionRepository.prototype.count).toBeDefined();
      expect(typeof McqSessionRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(McqSessionRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof McqSessionRepository.prototype[name as keyof typeof McqSessionRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(McqSessionRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
