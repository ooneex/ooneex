import { describe, expect, test } from "bun:test";
import { FolderSharedRepository } from "@/repositories/folder/FolderSharedRepository";

describe("FolderSharedRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(FolderSharedRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof FolderSharedRepository).toBe("function");
    expect(FolderSharedRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(FolderSharedRepository.prototype.open).toBeDefined();
      expect(typeof FolderSharedRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(FolderSharedRepository.prototype.close).toBeDefined();
      expect(typeof FolderSharedRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(FolderSharedRepository.prototype.find).toBeDefined();
      expect(typeof FolderSharedRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(FolderSharedRepository.prototype.findOne).toBeDefined();
      expect(typeof FolderSharedRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(FolderSharedRepository.prototype.findOneBy).toBeDefined();
      expect(typeof FolderSharedRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(FolderSharedRepository.prototype.create).toBeDefined();
      expect(typeof FolderSharedRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(FolderSharedRepository.prototype.createMany).toBeDefined();
      expect(typeof FolderSharedRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(FolderSharedRepository.prototype.update).toBeDefined();
      expect(typeof FolderSharedRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(FolderSharedRepository.prototype.updateMany).toBeDefined();
      expect(typeof FolderSharedRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(FolderSharedRepository.prototype.delete).toBeDefined();
      expect(typeof FolderSharedRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(FolderSharedRepository.prototype.count).toBeDefined();
      expect(typeof FolderSharedRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(FolderSharedRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof FolderSharedRepository.prototype[name as keyof typeof FolderSharedRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(FolderSharedRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
