import { describe, expect, test } from "bun:test";
import { McqQuestionDislikedRepository } from "@/repositories/gamification/mcq/McqQuestionDislikedRepository";

describe("McqQuestionDislikedRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(McqQuestionDislikedRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof McqQuestionDislikedRepository).toBe("function");
    expect(McqQuestionDislikedRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(McqQuestionDislikedRepository.prototype.open).toBeDefined();
      expect(typeof McqQuestionDislikedRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(McqQuestionDislikedRepository.prototype.close).toBeDefined();
      expect(typeof McqQuestionDislikedRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(McqQuestionDislikedRepository.prototype.find).toBeDefined();
      expect(typeof McqQuestionDislikedRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(McqQuestionDislikedRepository.prototype.findOne).toBeDefined();
      expect(typeof McqQuestionDislikedRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(McqQuestionDislikedRepository.prototype.findOneBy).toBeDefined();
      expect(typeof McqQuestionDislikedRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(McqQuestionDislikedRepository.prototype.create).toBeDefined();
      expect(typeof McqQuestionDislikedRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(McqQuestionDislikedRepository.prototype.createMany).toBeDefined();
      expect(typeof McqQuestionDislikedRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(McqQuestionDislikedRepository.prototype.update).toBeDefined();
      expect(typeof McqQuestionDislikedRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(McqQuestionDislikedRepository.prototype.updateMany).toBeDefined();
      expect(typeof McqQuestionDislikedRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(McqQuestionDislikedRepository.prototype.delete).toBeDefined();
      expect(typeof McqQuestionDislikedRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(McqQuestionDislikedRepository.prototype.count).toBeDefined();
      expect(typeof McqQuestionDislikedRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(McqQuestionDislikedRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof McqQuestionDislikedRepository.prototype[
            name as keyof typeof McqQuestionDislikedRepository.prototype
          ] === "function",
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

      const methods = Object.getOwnPropertyNames(McqQuestionDislikedRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
