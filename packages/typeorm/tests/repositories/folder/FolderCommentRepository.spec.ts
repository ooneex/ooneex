import { describe, expect, test } from "bun:test";
import { FolderCommentRepository } from "@/repositories/folder/FolderCommentRepository";

describe("FolderCommentRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(FolderCommentRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof FolderCommentRepository).toBe("function");
    expect(FolderCommentRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(FolderCommentRepository.prototype.open).toBeDefined();
      expect(typeof FolderCommentRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(FolderCommentRepository.prototype.close).toBeDefined();
      expect(typeof FolderCommentRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(FolderCommentRepository.prototype.find).toBeDefined();
      expect(typeof FolderCommentRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(FolderCommentRepository.prototype.findOne).toBeDefined();
      expect(typeof FolderCommentRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(FolderCommentRepository.prototype.findOneBy).toBeDefined();
      expect(typeof FolderCommentRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(FolderCommentRepository.prototype.create).toBeDefined();
      expect(typeof FolderCommentRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(FolderCommentRepository.prototype.createMany).toBeDefined();
      expect(typeof FolderCommentRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(FolderCommentRepository.prototype.update).toBeDefined();
      expect(typeof FolderCommentRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(FolderCommentRepository.prototype.updateMany).toBeDefined();
      expect(typeof FolderCommentRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(FolderCommentRepository.prototype.delete).toBeDefined();
      expect(typeof FolderCommentRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(FolderCommentRepository.prototype.count).toBeDefined();
      expect(typeof FolderCommentRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(FolderCommentRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof FolderCommentRepository.prototype[name as keyof typeof FolderCommentRepository.prototype] ===
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

      const methods = Object.getOwnPropertyNames(FolderCommentRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
