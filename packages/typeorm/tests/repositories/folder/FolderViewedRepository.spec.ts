import { describe, expect, test } from "bun:test";
import { FolderViewedRepository } from "@/repositories/folder/FolderViewedRepository";

describe("FolderViewedRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(FolderViewedRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof FolderViewedRepository).toBe("function");
    expect(FolderViewedRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(FolderViewedRepository.prototype.open).toBeDefined();
      expect(typeof FolderViewedRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(FolderViewedRepository.prototype.close).toBeDefined();
      expect(typeof FolderViewedRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(FolderViewedRepository.prototype.find).toBeDefined();
      expect(typeof FolderViewedRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(FolderViewedRepository.prototype.findOne).toBeDefined();
      expect(typeof FolderViewedRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(FolderViewedRepository.prototype.findOneBy).toBeDefined();
      expect(typeof FolderViewedRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(FolderViewedRepository.prototype.create).toBeDefined();
      expect(typeof FolderViewedRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(FolderViewedRepository.prototype.createMany).toBeDefined();
      expect(typeof FolderViewedRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(FolderViewedRepository.prototype.update).toBeDefined();
      expect(typeof FolderViewedRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(FolderViewedRepository.prototype.updateMany).toBeDefined();
      expect(typeof FolderViewedRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(FolderViewedRepository.prototype.delete).toBeDefined();
      expect(typeof FolderViewedRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(FolderViewedRepository.prototype.count).toBeDefined();
      expect(typeof FolderViewedRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(FolderViewedRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof FolderViewedRepository.prototype[name as keyof typeof FolderViewedRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(FolderViewedRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
