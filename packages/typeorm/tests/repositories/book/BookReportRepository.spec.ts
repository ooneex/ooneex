import { describe, expect, test } from "bun:test";
import { BookReportRepository } from "@/repositories/book/BookReportRepository";

describe("BookReportRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(BookReportRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof BookReportRepository).toBe("function");
    expect(BookReportRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(BookReportRepository.prototype.open).toBeDefined();
      expect(typeof BookReportRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(BookReportRepository.prototype.close).toBeDefined();
      expect(typeof BookReportRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(BookReportRepository.prototype.find).toBeDefined();
      expect(typeof BookReportRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(BookReportRepository.prototype.findOne).toBeDefined();
      expect(typeof BookReportRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(BookReportRepository.prototype.findOneBy).toBeDefined();
      expect(typeof BookReportRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(BookReportRepository.prototype.create).toBeDefined();
      expect(typeof BookReportRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(BookReportRepository.prototype.createMany).toBeDefined();
      expect(typeof BookReportRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(BookReportRepository.prototype.update).toBeDefined();
      expect(typeof BookReportRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(BookReportRepository.prototype.updateMany).toBeDefined();
      expect(typeof BookReportRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(BookReportRepository.prototype.delete).toBeDefined();
      expect(typeof BookReportRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(BookReportRepository.prototype.count).toBeDefined();
      expect(typeof BookReportRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(BookReportRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof BookReportRepository.prototype[name as keyof typeof BookReportRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(BookReportRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
