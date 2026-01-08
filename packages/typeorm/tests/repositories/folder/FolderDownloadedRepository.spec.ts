import { describe, expect, test } from "bun:test";
import { FolderDownloadedRepository } from "@/repositories/folder/FolderDownloadedRepository";

describe("FolderDownloadedRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(FolderDownloadedRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof FolderDownloadedRepository).toBe("function");
    expect(FolderDownloadedRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(FolderDownloadedRepository.prototype.open).toBeDefined();
      expect(typeof FolderDownloadedRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(FolderDownloadedRepository.prototype.close).toBeDefined();
      expect(typeof FolderDownloadedRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(FolderDownloadedRepository.prototype.find).toBeDefined();
      expect(typeof FolderDownloadedRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(FolderDownloadedRepository.prototype.findOne).toBeDefined();
      expect(typeof FolderDownloadedRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(FolderDownloadedRepository.prototype.findOneBy).toBeDefined();
      expect(typeof FolderDownloadedRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(FolderDownloadedRepository.prototype.create).toBeDefined();
      expect(typeof FolderDownloadedRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(FolderDownloadedRepository.prototype.createMany).toBeDefined();
      expect(typeof FolderDownloadedRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(FolderDownloadedRepository.prototype.update).toBeDefined();
      expect(typeof FolderDownloadedRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(FolderDownloadedRepository.prototype.updateMany).toBeDefined();
      expect(typeof FolderDownloadedRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(FolderDownloadedRepository.prototype.delete).toBeDefined();
      expect(typeof FolderDownloadedRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(FolderDownloadedRepository.prototype.count).toBeDefined();
      expect(typeof FolderDownloadedRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(FolderDownloadedRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof FolderDownloadedRepository.prototype[name as keyof typeof FolderDownloadedRepository.prototype] ===
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

      const methods = Object.getOwnPropertyNames(FolderDownloadedRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
