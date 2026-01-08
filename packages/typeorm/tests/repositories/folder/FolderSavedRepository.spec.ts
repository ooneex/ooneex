import { describe, expect, test } from "bun:test";
import { FolderSavedRepository } from "@/repositories/folder/FolderSavedRepository";

describe("FolderSavedRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(FolderSavedRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof FolderSavedRepository).toBe("function");
    expect(FolderSavedRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(FolderSavedRepository.prototype.open).toBeDefined();
      expect(typeof FolderSavedRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(FolderSavedRepository.prototype.close).toBeDefined();
      expect(typeof FolderSavedRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(FolderSavedRepository.prototype.find).toBeDefined();
      expect(typeof FolderSavedRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(FolderSavedRepository.prototype.findOne).toBeDefined();
      expect(typeof FolderSavedRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(FolderSavedRepository.prototype.findOneBy).toBeDefined();
      expect(typeof FolderSavedRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(FolderSavedRepository.prototype.create).toBeDefined();
      expect(typeof FolderSavedRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(FolderSavedRepository.prototype.createMany).toBeDefined();
      expect(typeof FolderSavedRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(FolderSavedRepository.prototype.update).toBeDefined();
      expect(typeof FolderSavedRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(FolderSavedRepository.prototype.updateMany).toBeDefined();
      expect(typeof FolderSavedRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(FolderSavedRepository.prototype.delete).toBeDefined();
      expect(typeof FolderSavedRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(FolderSavedRepository.prototype.count).toBeDefined();
      expect(typeof FolderSavedRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(FolderSavedRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof FolderSavedRepository.prototype[name as keyof typeof FolderSavedRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(FolderSavedRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
