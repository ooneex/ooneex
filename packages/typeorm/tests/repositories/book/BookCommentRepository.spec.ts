import { describe, expect, test } from "bun:test";
import { BookCommentRepository } from "@/repositories/book/BookCommentRepository";

describe("BookCommentRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(BookCommentRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof BookCommentRepository).toBe("function");
    expect(BookCommentRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(BookCommentRepository.prototype.open).toBeDefined();
      expect(typeof BookCommentRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(BookCommentRepository.prototype.close).toBeDefined();
      expect(typeof BookCommentRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(BookCommentRepository.prototype.find).toBeDefined();
      expect(typeof BookCommentRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(BookCommentRepository.prototype.findOne).toBeDefined();
      expect(typeof BookCommentRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(BookCommentRepository.prototype.findOneBy).toBeDefined();
      expect(typeof BookCommentRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(BookCommentRepository.prototype.create).toBeDefined();
      expect(typeof BookCommentRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(BookCommentRepository.prototype.createMany).toBeDefined();
      expect(typeof BookCommentRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(BookCommentRepository.prototype.update).toBeDefined();
      expect(typeof BookCommentRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(BookCommentRepository.prototype.updateMany).toBeDefined();
      expect(typeof BookCommentRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(BookCommentRepository.prototype.delete).toBeDefined();
      expect(typeof BookCommentRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(BookCommentRepository.prototype.count).toBeDefined();
      expect(typeof BookCommentRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(BookCommentRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof BookCommentRepository.prototype[name as keyof typeof BookCommentRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(BookCommentRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
