import { describe, expect, test } from "bun:test";
import { McqQuestionChoiceRepository } from "@/repositories/gamification/mcq/McqQuestionChoiceRepository";

describe("McqQuestionChoiceRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(McqQuestionChoiceRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof McqQuestionChoiceRepository).toBe("function");
    expect(McqQuestionChoiceRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(McqQuestionChoiceRepository.prototype.open).toBeDefined();
      expect(typeof McqQuestionChoiceRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(McqQuestionChoiceRepository.prototype.close).toBeDefined();
      expect(typeof McqQuestionChoiceRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(McqQuestionChoiceRepository.prototype.find).toBeDefined();
      expect(typeof McqQuestionChoiceRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(McqQuestionChoiceRepository.prototype.findOne).toBeDefined();
      expect(typeof McqQuestionChoiceRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(McqQuestionChoiceRepository.prototype.findOneBy).toBeDefined();
      expect(typeof McqQuestionChoiceRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(McqQuestionChoiceRepository.prototype.create).toBeDefined();
      expect(typeof McqQuestionChoiceRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(McqQuestionChoiceRepository.prototype.createMany).toBeDefined();
      expect(typeof McqQuestionChoiceRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(McqQuestionChoiceRepository.prototype.update).toBeDefined();
      expect(typeof McqQuestionChoiceRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(McqQuestionChoiceRepository.prototype.updateMany).toBeDefined();
      expect(typeof McqQuestionChoiceRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(McqQuestionChoiceRepository.prototype.delete).toBeDefined();
      expect(typeof McqQuestionChoiceRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(McqQuestionChoiceRepository.prototype.count).toBeDefined();
      expect(typeof McqQuestionChoiceRepository.prototype.count).toBe("function");
    });

    test("should have findByQuestion method", () => {
      expect(McqQuestionChoiceRepository.prototype.findByQuestion).toBeDefined();
      expect(typeof McqQuestionChoiceRepository.prototype.findByQuestion).toBe("function");
    });

    test("should have findCorrectChoicesByQuestion method", () => {
      expect(McqQuestionChoiceRepository.prototype.findCorrectChoicesByQuestion).toBeDefined();
      expect(typeof McqQuestionChoiceRepository.prototype.findCorrectChoicesByQuestion).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 13 public methods", () => {
      const methods = Object.getOwnPropertyNames(McqQuestionChoiceRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof McqQuestionChoiceRepository.prototype[name as keyof typeof McqQuestionChoiceRepository.prototype] ===
            "function",
      );
      expect(methods.length).toBe(13);
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
        "findByQuestion",
        "findCorrectChoicesByQuestion",
      ];

      const methods = Object.getOwnPropertyNames(McqQuestionChoiceRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
