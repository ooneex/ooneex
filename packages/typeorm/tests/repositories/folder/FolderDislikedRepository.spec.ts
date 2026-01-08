import { describe, expect, test } from "bun:test";
import { FolderDislikedRepository } from "@/repositories/folder/FolderDislikedRepository";

describe("FolderDislikedRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(FolderDislikedRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof FolderDislikedRepository).toBe("function");
    expect(FolderDislikedRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(FolderDislikedRepository.prototype.open).toBeDefined();
      expect(typeof FolderDislikedRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(FolderDislikedRepository.prototype.close).toBeDefined();
      expect(typeof FolderDislikedRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(FolderDislikedRepository.prototype.find).toBeDefined();
      expect(typeof FolderDislikedRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(FolderDislikedRepository.prototype.findOne).toBeDefined();
      expect(typeof FolderDislikedRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(FolderDislikedRepository.prototype.findOneBy).toBeDefined();
      expect(typeof FolderDislikedRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(FolderDislikedRepository.prototype.create).toBeDefined();
      expect(typeof FolderDislikedRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(FolderDislikedRepository.prototype.createMany).toBeDefined();
      expect(typeof FolderDislikedRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(FolderDislikedRepository.prototype.update).toBeDefined();
      expect(typeof FolderDislikedRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(FolderDislikedRepository.prototype.updateMany).toBeDefined();
      expect(typeof FolderDislikedRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(FolderDislikedRepository.prototype.delete).toBeDefined();
      expect(typeof FolderDislikedRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(FolderDislikedRepository.prototype.count).toBeDefined();
      expect(typeof FolderDislikedRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(FolderDislikedRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof FolderDislikedRepository.prototype[name as keyof typeof FolderDislikedRepository.prototype] ===
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

      const methods = Object.getOwnPropertyNames(FolderDislikedRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
