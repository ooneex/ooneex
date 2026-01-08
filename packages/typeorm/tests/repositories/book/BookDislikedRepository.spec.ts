import { describe, expect, test } from "bun:test";
import { BookDislikedRepository } from "@/repositories/book/BookDislikedRepository";

describe("BookDislikedRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(BookDislikedRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof BookDislikedRepository).toBe("function");
    expect(BookDislikedRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(BookDislikedRepository.prototype.open).toBeDefined();
      expect(typeof BookDislikedRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(BookDislikedRepository.prototype.close).toBeDefined();
      expect(typeof BookDislikedRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(BookDislikedRepository.prototype.find).toBeDefined();
      expect(typeof BookDislikedRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(BookDislikedRepository.prototype.findOne).toBeDefined();
      expect(typeof BookDislikedRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(BookDislikedRepository.prototype.findOneBy).toBeDefined();
      expect(typeof BookDislikedRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(BookDislikedRepository.prototype.create).toBeDefined();
      expect(typeof BookDislikedRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(BookDislikedRepository.prototype.createMany).toBeDefined();
      expect(typeof BookDislikedRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(BookDislikedRepository.prototype.update).toBeDefined();
      expect(typeof BookDislikedRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(BookDislikedRepository.prototype.updateMany).toBeDefined();
      expect(typeof BookDislikedRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(BookDislikedRepository.prototype.delete).toBeDefined();
      expect(typeof BookDislikedRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(BookDislikedRepository.prototype.count).toBeDefined();
      expect(typeof BookDislikedRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(BookDislikedRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof BookDislikedRepository.prototype[name as keyof typeof BookDislikedRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(BookDislikedRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
