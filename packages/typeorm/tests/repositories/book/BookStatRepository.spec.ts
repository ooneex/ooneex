import { describe, expect, test } from "bun:test";
import { BookStatRepository } from "@/repositories/book/BookStatRepository";

describe("BookStatRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(BookStatRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof BookStatRepository).toBe("function");
    expect(BookStatRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(BookStatRepository.prototype.open).toBeDefined();
      expect(typeof BookStatRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(BookStatRepository.prototype.close).toBeDefined();
      expect(typeof BookStatRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(BookStatRepository.prototype.find).toBeDefined();
      expect(typeof BookStatRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(BookStatRepository.prototype.findOne).toBeDefined();
      expect(typeof BookStatRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(BookStatRepository.prototype.findOneBy).toBeDefined();
      expect(typeof BookStatRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(BookStatRepository.prototype.create).toBeDefined();
      expect(typeof BookStatRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(BookStatRepository.prototype.createMany).toBeDefined();
      expect(typeof BookStatRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(BookStatRepository.prototype.update).toBeDefined();
      expect(typeof BookStatRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(BookStatRepository.prototype.updateMany).toBeDefined();
      expect(typeof BookStatRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(BookStatRepository.prototype.delete).toBeDefined();
      expect(typeof BookStatRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(BookStatRepository.prototype.count).toBeDefined();
      expect(typeof BookStatRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(BookStatRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof BookStatRepository.prototype[name as keyof typeof BookStatRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(BookStatRepository.prototype).filter((name) => name !== "constructor");

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
