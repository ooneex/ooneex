import { describe, expect, test } from "bun:test";
import { CategoryRepository } from "@/repositories/common/CategoryRepository";

describe("CategoryRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(CategoryRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof CategoryRepository).toBe("function");
    expect(CategoryRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(CategoryRepository.prototype.open).toBeDefined();
      expect(typeof CategoryRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(CategoryRepository.prototype.close).toBeDefined();
      expect(typeof CategoryRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(CategoryRepository.prototype.find).toBeDefined();
      expect(typeof CategoryRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(CategoryRepository.prototype.findOne).toBeDefined();
      expect(typeof CategoryRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(CategoryRepository.prototype.findOneBy).toBeDefined();
      expect(typeof CategoryRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(CategoryRepository.prototype.create).toBeDefined();
      expect(typeof CategoryRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(CategoryRepository.prototype.createMany).toBeDefined();
      expect(typeof CategoryRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(CategoryRepository.prototype.update).toBeDefined();
      expect(typeof CategoryRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(CategoryRepository.prototype.updateMany).toBeDefined();
      expect(typeof CategoryRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(CategoryRepository.prototype.delete).toBeDefined();
      expect(typeof CategoryRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(CategoryRepository.prototype.count).toBeDefined();
      expect(typeof CategoryRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(CategoryRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof CategoryRepository.prototype[name as keyof typeof CategoryRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(CategoryRepository.prototype).filter((name) => name !== "constructor");

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
