import { describe, expect, test } from "bun:test";
import { McqSessionQuestionRepository } from "@/repositories/gamification/mcq/McqSessionQuestionRepository";

describe("McqSessionQuestionRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(McqSessionQuestionRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof McqSessionQuestionRepository).toBe("function");
    expect(McqSessionQuestionRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(McqSessionQuestionRepository.prototype.open).toBeDefined();
      expect(typeof McqSessionQuestionRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(McqSessionQuestionRepository.prototype.close).toBeDefined();
      expect(typeof McqSessionQuestionRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(McqSessionQuestionRepository.prototype.find).toBeDefined();
      expect(typeof McqSessionQuestionRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(McqSessionQuestionRepository.prototype.findOne).toBeDefined();
      expect(typeof McqSessionQuestionRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(McqSessionQuestionRepository.prototype.findOneBy).toBeDefined();
      expect(typeof McqSessionQuestionRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(McqSessionQuestionRepository.prototype.create).toBeDefined();
      expect(typeof McqSessionQuestionRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(McqSessionQuestionRepository.prototype.createMany).toBeDefined();
      expect(typeof McqSessionQuestionRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(McqSessionQuestionRepository.prototype.update).toBeDefined();
      expect(typeof McqSessionQuestionRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(McqSessionQuestionRepository.prototype.updateMany).toBeDefined();
      expect(typeof McqSessionQuestionRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(McqSessionQuestionRepository.prototype.delete).toBeDefined();
      expect(typeof McqSessionQuestionRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(McqSessionQuestionRepository.prototype.count).toBeDefined();
      expect(typeof McqSessionQuestionRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(McqSessionQuestionRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof McqSessionQuestionRepository.prototype[name as keyof typeof McqSessionQuestionRepository.prototype] ===
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

      const methods = Object.getOwnPropertyNames(McqSessionQuestionRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
