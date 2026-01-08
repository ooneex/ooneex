import { describe, expect, test } from "bun:test";
import { BookAuthorRepository } from "@/repositories/book/BookAuthorRepository";

describe("BookAuthorRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(BookAuthorRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof BookAuthorRepository).toBe("function");
    expect(BookAuthorRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(BookAuthorRepository.prototype.open).toBeDefined();
      expect(typeof BookAuthorRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(BookAuthorRepository.prototype.close).toBeDefined();
      expect(typeof BookAuthorRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(BookAuthorRepository.prototype.find).toBeDefined();
      expect(typeof BookAuthorRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(BookAuthorRepository.prototype.findOne).toBeDefined();
      expect(typeof BookAuthorRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(BookAuthorRepository.prototype.findOneBy).toBeDefined();
      expect(typeof BookAuthorRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(BookAuthorRepository.prototype.create).toBeDefined();
      expect(typeof BookAuthorRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(BookAuthorRepository.prototype.createMany).toBeDefined();
      expect(typeof BookAuthorRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(BookAuthorRepository.prototype.update).toBeDefined();
      expect(typeof BookAuthorRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(BookAuthorRepository.prototype.updateMany).toBeDefined();
      expect(typeof BookAuthorRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(BookAuthorRepository.prototype.delete).toBeDefined();
      expect(typeof BookAuthorRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(BookAuthorRepository.prototype.count).toBeDefined();
      expect(typeof BookAuthorRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(BookAuthorRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof BookAuthorRepository.prototype[name as keyof typeof BookAuthorRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(BookAuthorRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
