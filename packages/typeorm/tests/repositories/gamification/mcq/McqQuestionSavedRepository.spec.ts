import { describe, expect, test } from "bun:test";
import { McqQuestionSavedRepository } from "@/repositories/gamification/mcq/McqQuestionSavedRepository";

describe("McqQuestionSavedRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(McqQuestionSavedRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof McqQuestionSavedRepository).toBe("function");
    expect(McqQuestionSavedRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(McqQuestionSavedRepository.prototype.open).toBeDefined();
      expect(typeof McqQuestionSavedRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(McqQuestionSavedRepository.prototype.close).toBeDefined();
      expect(typeof McqQuestionSavedRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(McqQuestionSavedRepository.prototype.find).toBeDefined();
      expect(typeof McqQuestionSavedRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(McqQuestionSavedRepository.prototype.findOne).toBeDefined();
      expect(typeof McqQuestionSavedRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(McqQuestionSavedRepository.prototype.findOneBy).toBeDefined();
      expect(typeof McqQuestionSavedRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(McqQuestionSavedRepository.prototype.create).toBeDefined();
      expect(typeof McqQuestionSavedRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(McqQuestionSavedRepository.prototype.createMany).toBeDefined();
      expect(typeof McqQuestionSavedRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(McqQuestionSavedRepository.prototype.update).toBeDefined();
      expect(typeof McqQuestionSavedRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(McqQuestionSavedRepository.prototype.updateMany).toBeDefined();
      expect(typeof McqQuestionSavedRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(McqQuestionSavedRepository.prototype.delete).toBeDefined();
      expect(typeof McqQuestionSavedRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(McqQuestionSavedRepository.prototype.count).toBeDefined();
      expect(typeof McqQuestionSavedRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(McqQuestionSavedRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof McqQuestionSavedRepository.prototype[name as keyof typeof McqQuestionSavedRepository.prototype] ===
            "function",
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

      const methods = Object.getOwnPropertyNames(McqQuestionSavedRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
