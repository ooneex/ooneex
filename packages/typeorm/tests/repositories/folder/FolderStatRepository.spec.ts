import { describe, expect, test } from "bun:test";
import { FolderStatRepository } from "@/repositories/folder/FolderStatRepository";

describe("FolderStatRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(FolderStatRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof FolderStatRepository).toBe("function");
    expect(FolderStatRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(FolderStatRepository.prototype.open).toBeDefined();
      expect(typeof FolderStatRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(FolderStatRepository.prototype.close).toBeDefined();
      expect(typeof FolderStatRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(FolderStatRepository.prototype.find).toBeDefined();
      expect(typeof FolderStatRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(FolderStatRepository.prototype.findOne).toBeDefined();
      expect(typeof FolderStatRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(FolderStatRepository.prototype.findOneBy).toBeDefined();
      expect(typeof FolderStatRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(FolderStatRepository.prototype.create).toBeDefined();
      expect(typeof FolderStatRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(FolderStatRepository.prototype.createMany).toBeDefined();
      expect(typeof FolderStatRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(FolderStatRepository.prototype.update).toBeDefined();
      expect(typeof FolderStatRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(FolderStatRepository.prototype.updateMany).toBeDefined();
      expect(typeof FolderStatRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(FolderStatRepository.prototype.delete).toBeDefined();
      expect(typeof FolderStatRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(FolderStatRepository.prototype.count).toBeDefined();
      expect(typeof FolderStatRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(FolderStatRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof FolderStatRepository.prototype[name as keyof typeof FolderStatRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(FolderStatRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
