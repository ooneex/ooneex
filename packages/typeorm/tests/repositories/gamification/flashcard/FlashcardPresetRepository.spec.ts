import { describe, expect, test } from "bun:test";
import { FlashcardPresetRepository } from "@/repositories/gamification/flashcard/FlashcardPresetRepository";

describe("FlashcardPresetRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(FlashcardPresetRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof FlashcardPresetRepository).toBe("function");
    expect(FlashcardPresetRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(FlashcardPresetRepository.prototype.open).toBeDefined();
      expect(typeof FlashcardPresetRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(FlashcardPresetRepository.prototype.close).toBeDefined();
      expect(typeof FlashcardPresetRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(FlashcardPresetRepository.prototype.find).toBeDefined();
      expect(typeof FlashcardPresetRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(FlashcardPresetRepository.prototype.findOne).toBeDefined();
      expect(typeof FlashcardPresetRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(FlashcardPresetRepository.prototype.findOneBy).toBeDefined();
      expect(typeof FlashcardPresetRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(FlashcardPresetRepository.prototype.create).toBeDefined();
      expect(typeof FlashcardPresetRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(FlashcardPresetRepository.prototype.createMany).toBeDefined();
      expect(typeof FlashcardPresetRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(FlashcardPresetRepository.prototype.update).toBeDefined();
      expect(typeof FlashcardPresetRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(FlashcardPresetRepository.prototype.updateMany).toBeDefined();
      expect(typeof FlashcardPresetRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(FlashcardPresetRepository.prototype.delete).toBeDefined();
      expect(typeof FlashcardPresetRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(FlashcardPresetRepository.prototype.count).toBeDefined();
      expect(typeof FlashcardPresetRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(FlashcardPresetRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof FlashcardPresetRepository.prototype[name as keyof typeof FlashcardPresetRepository.prototype] ===
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

      const methods = Object.getOwnPropertyNames(FlashcardPresetRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
