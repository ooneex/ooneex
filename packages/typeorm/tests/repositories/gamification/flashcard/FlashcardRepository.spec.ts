import { describe, expect, test } from "bun:test";
import { FlashcardRepository } from "@/repositories/gamification/flashcard/FlashcardRepository";

describe("FlashcardRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(FlashcardRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof FlashcardRepository).toBe("function");
    expect(FlashcardRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(FlashcardRepository.prototype.open).toBeDefined();
      expect(typeof FlashcardRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(FlashcardRepository.prototype.close).toBeDefined();
      expect(typeof FlashcardRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(FlashcardRepository.prototype.find).toBeDefined();
      expect(typeof FlashcardRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(FlashcardRepository.prototype.findOne).toBeDefined();
      expect(typeof FlashcardRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(FlashcardRepository.prototype.findOneBy).toBeDefined();
      expect(typeof FlashcardRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(FlashcardRepository.prototype.create).toBeDefined();
      expect(typeof FlashcardRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(FlashcardRepository.prototype.createMany).toBeDefined();
      expect(typeof FlashcardRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(FlashcardRepository.prototype.update).toBeDefined();
      expect(typeof FlashcardRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(FlashcardRepository.prototype.updateMany).toBeDefined();
      expect(typeof FlashcardRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(FlashcardRepository.prototype.delete).toBeDefined();
      expect(typeof FlashcardRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(FlashcardRepository.prototype.count).toBeDefined();
      expect(typeof FlashcardRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(FlashcardRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof FlashcardRepository.prototype[name as keyof typeof FlashcardRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(FlashcardRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
