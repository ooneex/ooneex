import { describe, expect, test } from "bun:test";
import { FlashcardSessionRepository } from "@/repositories/gamification/flashcard/FlashcardSessionRepository";

describe("FlashcardSessionRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(FlashcardSessionRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof FlashcardSessionRepository).toBe("function");
    expect(FlashcardSessionRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(FlashcardSessionRepository.prototype.open).toBeDefined();
      expect(typeof FlashcardSessionRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(FlashcardSessionRepository.prototype.close).toBeDefined();
      expect(typeof FlashcardSessionRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(FlashcardSessionRepository.prototype.find).toBeDefined();
      expect(typeof FlashcardSessionRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(FlashcardSessionRepository.prototype.findOne).toBeDefined();
      expect(typeof FlashcardSessionRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(FlashcardSessionRepository.prototype.findOneBy).toBeDefined();
      expect(typeof FlashcardSessionRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(FlashcardSessionRepository.prototype.create).toBeDefined();
      expect(typeof FlashcardSessionRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(FlashcardSessionRepository.prototype.createMany).toBeDefined();
      expect(typeof FlashcardSessionRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(FlashcardSessionRepository.prototype.update).toBeDefined();
      expect(typeof FlashcardSessionRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(FlashcardSessionRepository.prototype.updateMany).toBeDefined();
      expect(typeof FlashcardSessionRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(FlashcardSessionRepository.prototype.delete).toBeDefined();
      expect(typeof FlashcardSessionRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(FlashcardSessionRepository.prototype.count).toBeDefined();
      expect(typeof FlashcardSessionRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(FlashcardSessionRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof FlashcardSessionRepository.prototype[name as keyof typeof FlashcardSessionRepository.prototype] ===
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

      const methods = Object.getOwnPropertyNames(FlashcardSessionRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
