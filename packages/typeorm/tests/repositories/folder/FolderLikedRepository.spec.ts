import { describe, expect, test } from "bun:test";
import { FolderLikedRepository } from "@/repositories/folder/FolderLikedRepository";

describe("FolderLikedRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(FolderLikedRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof FolderLikedRepository).toBe("function");
    expect(FolderLikedRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(FolderLikedRepository.prototype.open).toBeDefined();
      expect(typeof FolderLikedRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(FolderLikedRepository.prototype.close).toBeDefined();
      expect(typeof FolderLikedRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(FolderLikedRepository.prototype.find).toBeDefined();
      expect(typeof FolderLikedRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(FolderLikedRepository.prototype.findOne).toBeDefined();
      expect(typeof FolderLikedRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(FolderLikedRepository.prototype.findOneBy).toBeDefined();
      expect(typeof FolderLikedRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(FolderLikedRepository.prototype.create).toBeDefined();
      expect(typeof FolderLikedRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(FolderLikedRepository.prototype.createMany).toBeDefined();
      expect(typeof FolderLikedRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(FolderLikedRepository.prototype.update).toBeDefined();
      expect(typeof FolderLikedRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(FolderLikedRepository.prototype.updateMany).toBeDefined();
      expect(typeof FolderLikedRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(FolderLikedRepository.prototype.delete).toBeDefined();
      expect(typeof FolderLikedRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(FolderLikedRepository.prototype.count).toBeDefined();
      expect(typeof FolderLikedRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(FolderLikedRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof FolderLikedRepository.prototype[name as keyof typeof FolderLikedRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(FolderLikedRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
