import { describe, expect, test } from "bun:test";
import { BookRepository } from "@/repositories/book/BookRepository";

describe("BookRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(BookRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof BookRepository).toBe("function");
    expect(BookRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(BookRepository.prototype.open).toBeDefined();
      expect(typeof BookRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(BookRepository.prototype.close).toBeDefined();
      expect(typeof BookRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(BookRepository.prototype.find).toBeDefined();
      expect(typeof BookRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(BookRepository.prototype.findOne).toBeDefined();
      expect(typeof BookRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(BookRepository.prototype.findOneBy).toBeDefined();
      expect(typeof BookRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(BookRepository.prototype.create).toBeDefined();
      expect(typeof BookRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(BookRepository.prototype.createMany).toBeDefined();
      expect(typeof BookRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(BookRepository.prototype.update).toBeDefined();
      expect(typeof BookRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(BookRepository.prototype.updateMany).toBeDefined();
      expect(typeof BookRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(BookRepository.prototype.delete).toBeDefined();
      expect(typeof BookRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(BookRepository.prototype.count).toBeDefined();
      expect(typeof BookRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(BookRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof BookRepository.prototype[name as keyof typeof BookRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(BookRepository.prototype).filter((name) => name !== "constructor");

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
