import { describe, expect, test } from "bun:test";
import { BookSavedRepository } from "@/repositories/book/BookSavedRepository";

describe("BookSavedRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(BookSavedRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof BookSavedRepository).toBe("function");
    expect(BookSavedRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(BookSavedRepository.prototype.open).toBeDefined();
      expect(typeof BookSavedRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(BookSavedRepository.prototype.close).toBeDefined();
      expect(typeof BookSavedRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(BookSavedRepository.prototype.find).toBeDefined();
      expect(typeof BookSavedRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(BookSavedRepository.prototype.findOne).toBeDefined();
      expect(typeof BookSavedRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(BookSavedRepository.prototype.findOneBy).toBeDefined();
      expect(typeof BookSavedRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(BookSavedRepository.prototype.create).toBeDefined();
      expect(typeof BookSavedRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(BookSavedRepository.prototype.createMany).toBeDefined();
      expect(typeof BookSavedRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(BookSavedRepository.prototype.update).toBeDefined();
      expect(typeof BookSavedRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(BookSavedRepository.prototype.updateMany).toBeDefined();
      expect(typeof BookSavedRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(BookSavedRepository.prototype.delete).toBeDefined();
      expect(typeof BookSavedRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(BookSavedRepository.prototype.count).toBeDefined();
      expect(typeof BookSavedRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(BookSavedRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof BookSavedRepository.prototype[name as keyof typeof BookSavedRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(BookSavedRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
