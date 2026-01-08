import { describe, expect, test } from "bun:test";
import { FolderReportRepository } from "@/repositories/folder/FolderReportRepository";

describe("FolderReportRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(FolderReportRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof FolderReportRepository).toBe("function");
    expect(FolderReportRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(FolderReportRepository.prototype.open).toBeDefined();
      expect(typeof FolderReportRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(FolderReportRepository.prototype.close).toBeDefined();
      expect(typeof FolderReportRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(FolderReportRepository.prototype.find).toBeDefined();
      expect(typeof FolderReportRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(FolderReportRepository.prototype.findOne).toBeDefined();
      expect(typeof FolderReportRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(FolderReportRepository.prototype.findOneBy).toBeDefined();
      expect(typeof FolderReportRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(FolderReportRepository.prototype.create).toBeDefined();
      expect(typeof FolderReportRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(FolderReportRepository.prototype.createMany).toBeDefined();
      expect(typeof FolderReportRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(FolderReportRepository.prototype.update).toBeDefined();
      expect(typeof FolderReportRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(FolderReportRepository.prototype.updateMany).toBeDefined();
      expect(typeof FolderReportRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(FolderReportRepository.prototype.delete).toBeDefined();
      expect(typeof FolderReportRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(FolderReportRepository.prototype.count).toBeDefined();
      expect(typeof FolderReportRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(FolderReportRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof FolderReportRepository.prototype[name as keyof typeof FolderReportRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(FolderReportRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
