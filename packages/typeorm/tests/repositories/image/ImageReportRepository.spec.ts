import { describe, expect, test } from "bun:test";
import { ImageReportRepository } from "@/repositories/image/ImageReportRepository";

describe("ImageReportRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(ImageReportRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof ImageReportRepository).toBe("function");
    expect(ImageReportRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(ImageReportRepository.prototype.open).toBeDefined();
      expect(typeof ImageReportRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(ImageReportRepository.prototype.close).toBeDefined();
      expect(typeof ImageReportRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(ImageReportRepository.prototype.find).toBeDefined();
      expect(typeof ImageReportRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(ImageReportRepository.prototype.findOne).toBeDefined();
      expect(typeof ImageReportRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(ImageReportRepository.prototype.findOneBy).toBeDefined();
      expect(typeof ImageReportRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(ImageReportRepository.prototype.create).toBeDefined();
      expect(typeof ImageReportRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(ImageReportRepository.prototype.createMany).toBeDefined();
      expect(typeof ImageReportRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(ImageReportRepository.prototype.update).toBeDefined();
      expect(typeof ImageReportRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(ImageReportRepository.prototype.updateMany).toBeDefined();
      expect(typeof ImageReportRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(ImageReportRepository.prototype.delete).toBeDefined();
      expect(typeof ImageReportRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(ImageReportRepository.prototype.count).toBeDefined();
      expect(typeof ImageReportRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(ImageReportRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof ImageReportRepository.prototype[name as keyof typeof ImageReportRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(ImageReportRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
