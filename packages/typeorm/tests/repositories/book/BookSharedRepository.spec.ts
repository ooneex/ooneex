import { describe, expect, test } from "bun:test";
import { BookSharedRepository } from "@/repositories/book/BookSharedRepository";

describe("BookSharedRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(BookSharedRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof BookSharedRepository).toBe("function");
    expect(BookSharedRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(BookSharedRepository.prototype.open).toBeDefined();
      expect(typeof BookSharedRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(BookSharedRepository.prototype.close).toBeDefined();
      expect(typeof BookSharedRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(BookSharedRepository.prototype.find).toBeDefined();
      expect(typeof BookSharedRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(BookSharedRepository.prototype.findOne).toBeDefined();
      expect(typeof BookSharedRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(BookSharedRepository.prototype.findOneBy).toBeDefined();
      expect(typeof BookSharedRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(BookSharedRepository.prototype.create).toBeDefined();
      expect(typeof BookSharedRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(BookSharedRepository.prototype.createMany).toBeDefined();
      expect(typeof BookSharedRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(BookSharedRepository.prototype.update).toBeDefined();
      expect(typeof BookSharedRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(BookSharedRepository.prototype.updateMany).toBeDefined();
      expect(typeof BookSharedRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(BookSharedRepository.prototype.delete).toBeDefined();
      expect(typeof BookSharedRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(BookSharedRepository.prototype.count).toBeDefined();
      expect(typeof BookSharedRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(BookSharedRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof BookSharedRepository.prototype[name as keyof typeof BookSharedRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(BookSharedRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
