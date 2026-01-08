import { describe, expect, test } from "bun:test";
import { McqQuestionStatRepository } from "@/repositories/gamification/mcq/McqQuestionStatRepository";

describe("McqQuestionStatRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(McqQuestionStatRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof McqQuestionStatRepository).toBe("function");
    expect(McqQuestionStatRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(McqQuestionStatRepository.prototype.open).toBeDefined();
      expect(typeof McqQuestionStatRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(McqQuestionStatRepository.prototype.close).toBeDefined();
      expect(typeof McqQuestionStatRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(McqQuestionStatRepository.prototype.find).toBeDefined();
      expect(typeof McqQuestionStatRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(McqQuestionStatRepository.prototype.findOne).toBeDefined();
      expect(typeof McqQuestionStatRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(McqQuestionStatRepository.prototype.findOneBy).toBeDefined();
      expect(typeof McqQuestionStatRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(McqQuestionStatRepository.prototype.create).toBeDefined();
      expect(typeof McqQuestionStatRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(McqQuestionStatRepository.prototype.createMany).toBeDefined();
      expect(typeof McqQuestionStatRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(McqQuestionStatRepository.prototype.update).toBeDefined();
      expect(typeof McqQuestionStatRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(McqQuestionStatRepository.prototype.updateMany).toBeDefined();
      expect(typeof McqQuestionStatRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(McqQuestionStatRepository.prototype.delete).toBeDefined();
      expect(typeof McqQuestionStatRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(McqQuestionStatRepository.prototype.count).toBeDefined();
      expect(typeof McqQuestionStatRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(McqQuestionStatRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof McqQuestionStatRepository.prototype[name as keyof typeof McqQuestionStatRepository.prototype] ===
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

      const methods = Object.getOwnPropertyNames(McqQuestionStatRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
