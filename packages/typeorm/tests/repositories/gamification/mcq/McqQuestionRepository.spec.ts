import { describe, expect, test } from "bun:test";
import { McqQuestionRepository } from "@/repositories/gamification/mcq/McqQuestionRepository";

describe("McqQuestionRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(McqQuestionRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof McqQuestionRepository).toBe("function");
    expect(McqQuestionRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(McqQuestionRepository.prototype.open).toBeDefined();
      expect(typeof McqQuestionRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(McqQuestionRepository.prototype.close).toBeDefined();
      expect(typeof McqQuestionRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(McqQuestionRepository.prototype.find).toBeDefined();
      expect(typeof McqQuestionRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(McqQuestionRepository.prototype.findOne).toBeDefined();
      expect(typeof McqQuestionRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(McqQuestionRepository.prototype.findOneBy).toBeDefined();
      expect(typeof McqQuestionRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(McqQuestionRepository.prototype.create).toBeDefined();
      expect(typeof McqQuestionRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(McqQuestionRepository.prototype.createMany).toBeDefined();
      expect(typeof McqQuestionRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(McqQuestionRepository.prototype.update).toBeDefined();
      expect(typeof McqQuestionRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(McqQuestionRepository.prototype.updateMany).toBeDefined();
      expect(typeof McqQuestionRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(McqQuestionRepository.prototype.delete).toBeDefined();
      expect(typeof McqQuestionRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(McqQuestionRepository.prototype.count).toBeDefined();
      expect(typeof McqQuestionRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(McqQuestionRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof McqQuestionRepository.prototype[name as keyof typeof McqQuestionRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(McqQuestionRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
