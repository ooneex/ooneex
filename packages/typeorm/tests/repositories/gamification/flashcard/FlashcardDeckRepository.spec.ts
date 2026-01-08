import { describe, expect, test } from "bun:test";
import { FlashcardDeckRepository } from "@/repositories/gamification/flashcard/FlashcardDeckRepository";

describe("FlashcardDeckRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(FlashcardDeckRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof FlashcardDeckRepository).toBe("function");
    expect(FlashcardDeckRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(FlashcardDeckRepository.prototype.open).toBeDefined();
      expect(typeof FlashcardDeckRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(FlashcardDeckRepository.prototype.close).toBeDefined();
      expect(typeof FlashcardDeckRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(FlashcardDeckRepository.prototype.find).toBeDefined();
      expect(typeof FlashcardDeckRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(FlashcardDeckRepository.prototype.findOne).toBeDefined();
      expect(typeof FlashcardDeckRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(FlashcardDeckRepository.prototype.findOneBy).toBeDefined();
      expect(typeof FlashcardDeckRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(FlashcardDeckRepository.prototype.create).toBeDefined();
      expect(typeof FlashcardDeckRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(FlashcardDeckRepository.prototype.createMany).toBeDefined();
      expect(typeof FlashcardDeckRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(FlashcardDeckRepository.prototype.update).toBeDefined();
      expect(typeof FlashcardDeckRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(FlashcardDeckRepository.prototype.updateMany).toBeDefined();
      expect(typeof FlashcardDeckRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(FlashcardDeckRepository.prototype.delete).toBeDefined();
      expect(typeof FlashcardDeckRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(FlashcardDeckRepository.prototype.count).toBeDefined();
      expect(typeof FlashcardDeckRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(FlashcardDeckRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof FlashcardDeckRepository.prototype[name as keyof typeof FlashcardDeckRepository.prototype] ===
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

      const methods = Object.getOwnPropertyNames(FlashcardDeckRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
