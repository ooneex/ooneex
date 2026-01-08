import { describe, expect, test } from "bun:test";
import { BookPublisherRepository } from "@/repositories/book/BookPublisherRepository";

describe("BookPublisherRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(BookPublisherRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof BookPublisherRepository).toBe("function");
    expect(BookPublisherRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(BookPublisherRepository.prototype.open).toBeDefined();
      expect(typeof BookPublisherRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(BookPublisherRepository.prototype.close).toBeDefined();
      expect(typeof BookPublisherRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(BookPublisherRepository.prototype.find).toBeDefined();
      expect(typeof BookPublisherRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(BookPublisherRepository.prototype.findOne).toBeDefined();
      expect(typeof BookPublisherRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(BookPublisherRepository.prototype.findOneBy).toBeDefined();
      expect(typeof BookPublisherRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(BookPublisherRepository.prototype.create).toBeDefined();
      expect(typeof BookPublisherRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(BookPublisherRepository.prototype.createMany).toBeDefined();
      expect(typeof BookPublisherRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(BookPublisherRepository.prototype.update).toBeDefined();
      expect(typeof BookPublisherRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(BookPublisherRepository.prototype.updateMany).toBeDefined();
      expect(typeof BookPublisherRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(BookPublisherRepository.prototype.delete).toBeDefined();
      expect(typeof BookPublisherRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(BookPublisherRepository.prototype.count).toBeDefined();
      expect(typeof BookPublisherRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(BookPublisherRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof BookPublisherRepository.prototype[name as keyof typeof BookPublisherRepository.prototype] ===
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

      const methods = Object.getOwnPropertyNames(BookPublisherRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
