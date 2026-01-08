import { describe, expect, test } from "bun:test";
import { BookLikedRepository } from "@/repositories/book/BookLikedRepository";

describe("BookLikedRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(BookLikedRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof BookLikedRepository).toBe("function");
    expect(BookLikedRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(BookLikedRepository.prototype.open).toBeDefined();
      expect(typeof BookLikedRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(BookLikedRepository.prototype.close).toBeDefined();
      expect(typeof BookLikedRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(BookLikedRepository.prototype.find).toBeDefined();
      expect(typeof BookLikedRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(BookLikedRepository.prototype.findOne).toBeDefined();
      expect(typeof BookLikedRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(BookLikedRepository.prototype.findOneBy).toBeDefined();
      expect(typeof BookLikedRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(BookLikedRepository.prototype.create).toBeDefined();
      expect(typeof BookLikedRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(BookLikedRepository.prototype.createMany).toBeDefined();
      expect(typeof BookLikedRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(BookLikedRepository.prototype.update).toBeDefined();
      expect(typeof BookLikedRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(BookLikedRepository.prototype.updateMany).toBeDefined();
      expect(typeof BookLikedRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(BookLikedRepository.prototype.delete).toBeDefined();
      expect(typeof BookLikedRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(BookLikedRepository.prototype.count).toBeDefined();
      expect(typeof BookLikedRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(BookLikedRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof BookLikedRepository.prototype[name as keyof typeof BookLikedRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(BookLikedRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
