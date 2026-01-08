import { describe, expect, test } from "bun:test";
import { BookViewedRepository } from "@/repositories/book/BookViewedRepository";

describe("BookViewedRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(BookViewedRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof BookViewedRepository).toBe("function");
    expect(BookViewedRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(BookViewedRepository.prototype.open).toBeDefined();
      expect(typeof BookViewedRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(BookViewedRepository.prototype.close).toBeDefined();
      expect(typeof BookViewedRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(BookViewedRepository.prototype.find).toBeDefined();
      expect(typeof BookViewedRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(BookViewedRepository.prototype.findOne).toBeDefined();
      expect(typeof BookViewedRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(BookViewedRepository.prototype.findOneBy).toBeDefined();
      expect(typeof BookViewedRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(BookViewedRepository.prototype.create).toBeDefined();
      expect(typeof BookViewedRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(BookViewedRepository.prototype.createMany).toBeDefined();
      expect(typeof BookViewedRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(BookViewedRepository.prototype.update).toBeDefined();
      expect(typeof BookViewedRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(BookViewedRepository.prototype.updateMany).toBeDefined();
      expect(typeof BookViewedRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(BookViewedRepository.prototype.delete).toBeDefined();
      expect(typeof BookViewedRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(BookViewedRepository.prototype.count).toBeDefined();
      expect(typeof BookViewedRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(BookViewedRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof BookViewedRepository.prototype[name as keyof typeof BookViewedRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(BookViewedRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
