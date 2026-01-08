import { describe, expect, test } from "bun:test";
import { FlashcardScheduleRepository } from "@/repositories/gamification/flashcard/FlashcardScheduleRepository";

describe("FlashcardScheduleRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(FlashcardScheduleRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof FlashcardScheduleRepository).toBe("function");
    expect(FlashcardScheduleRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(FlashcardScheduleRepository.prototype.open).toBeDefined();
      expect(typeof FlashcardScheduleRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(FlashcardScheduleRepository.prototype.close).toBeDefined();
      expect(typeof FlashcardScheduleRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(FlashcardScheduleRepository.prototype.find).toBeDefined();
      expect(typeof FlashcardScheduleRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(FlashcardScheduleRepository.prototype.findOne).toBeDefined();
      expect(typeof FlashcardScheduleRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(FlashcardScheduleRepository.prototype.findOneBy).toBeDefined();
      expect(typeof FlashcardScheduleRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(FlashcardScheduleRepository.prototype.create).toBeDefined();
      expect(typeof FlashcardScheduleRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(FlashcardScheduleRepository.prototype.createMany).toBeDefined();
      expect(typeof FlashcardScheduleRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(FlashcardScheduleRepository.prototype.update).toBeDefined();
      expect(typeof FlashcardScheduleRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(FlashcardScheduleRepository.prototype.updateMany).toBeDefined();
      expect(typeof FlashcardScheduleRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(FlashcardScheduleRepository.prototype.delete).toBeDefined();
      expect(typeof FlashcardScheduleRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(FlashcardScheduleRepository.prototype.count).toBeDefined();
      expect(typeof FlashcardScheduleRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(FlashcardScheduleRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof FlashcardScheduleRepository.prototype[name as keyof typeof FlashcardScheduleRepository.prototype] ===
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

      const methods = Object.getOwnPropertyNames(FlashcardScheduleRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
