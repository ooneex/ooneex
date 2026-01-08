import { describe, expect, test } from "bun:test";
import { BookDownloadedRepository } from "@/repositories/book/BookDownloadedRepository";

describe("BookDownloadedRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(BookDownloadedRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof BookDownloadedRepository).toBe("function");
    expect(BookDownloadedRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(BookDownloadedRepository.prototype.open).toBeDefined();
      expect(typeof BookDownloadedRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(BookDownloadedRepository.prototype.close).toBeDefined();
      expect(typeof BookDownloadedRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(BookDownloadedRepository.prototype.find).toBeDefined();
      expect(typeof BookDownloadedRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(BookDownloadedRepository.prototype.findOne).toBeDefined();
      expect(typeof BookDownloadedRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(BookDownloadedRepository.prototype.findOneBy).toBeDefined();
      expect(typeof BookDownloadedRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(BookDownloadedRepository.prototype.create).toBeDefined();
      expect(typeof BookDownloadedRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(BookDownloadedRepository.prototype.createMany).toBeDefined();
      expect(typeof BookDownloadedRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(BookDownloadedRepository.prototype.update).toBeDefined();
      expect(typeof BookDownloadedRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(BookDownloadedRepository.prototype.updateMany).toBeDefined();
      expect(typeof BookDownloadedRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(BookDownloadedRepository.prototype.delete).toBeDefined();
      expect(typeof BookDownloadedRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(BookDownloadedRepository.prototype.count).toBeDefined();
      expect(typeof BookDownloadedRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(BookDownloadedRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof BookDownloadedRepository.prototype[name as keyof typeof BookDownloadedRepository.prototype] ===
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

      const methods = Object.getOwnPropertyNames(BookDownloadedRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
