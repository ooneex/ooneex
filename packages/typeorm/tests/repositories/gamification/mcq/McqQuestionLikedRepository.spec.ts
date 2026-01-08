import { describe, expect, test } from "bun:test";
import { McqQuestionLikedRepository } from "@/repositories/gamification/mcq/McqQuestionLikedRepository";

describe("McqQuestionLikedRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(McqQuestionLikedRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof McqQuestionLikedRepository).toBe("function");
    expect(McqQuestionLikedRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(McqQuestionLikedRepository.prototype.open).toBeDefined();
      expect(typeof McqQuestionLikedRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(McqQuestionLikedRepository.prototype.close).toBeDefined();
      expect(typeof McqQuestionLikedRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(McqQuestionLikedRepository.prototype.find).toBeDefined();
      expect(typeof McqQuestionLikedRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(McqQuestionLikedRepository.prototype.findOne).toBeDefined();
      expect(typeof McqQuestionLikedRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(McqQuestionLikedRepository.prototype.findOneBy).toBeDefined();
      expect(typeof McqQuestionLikedRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(McqQuestionLikedRepository.prototype.create).toBeDefined();
      expect(typeof McqQuestionLikedRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(McqQuestionLikedRepository.prototype.createMany).toBeDefined();
      expect(typeof McqQuestionLikedRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(McqQuestionLikedRepository.prototype.update).toBeDefined();
      expect(typeof McqQuestionLikedRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(McqQuestionLikedRepository.prototype.updateMany).toBeDefined();
      expect(typeof McqQuestionLikedRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(McqQuestionLikedRepository.prototype.delete).toBeDefined();
      expect(typeof McqQuestionLikedRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(McqQuestionLikedRepository.prototype.count).toBeDefined();
      expect(typeof McqQuestionLikedRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(McqQuestionLikedRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof McqQuestionLikedRepository.prototype[name as keyof typeof McqQuestionLikedRepository.prototype] ===
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

      const methods = Object.getOwnPropertyNames(McqQuestionLikedRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
