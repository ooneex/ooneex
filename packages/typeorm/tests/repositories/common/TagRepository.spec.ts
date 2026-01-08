import { describe, expect, test } from "bun:test";
import { TagRepository } from "@/repositories/common/TagRepository";

describe("TagRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(TagRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof TagRepository).toBe("function");
    expect(TagRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(TagRepository.prototype.open).toBeDefined();
      expect(typeof TagRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(TagRepository.prototype.close).toBeDefined();
      expect(typeof TagRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(TagRepository.prototype.find).toBeDefined();
      expect(typeof TagRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(TagRepository.prototype.findOne).toBeDefined();
      expect(typeof TagRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(TagRepository.prototype.findOneBy).toBeDefined();
      expect(typeof TagRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(TagRepository.prototype.create).toBeDefined();
      expect(typeof TagRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(TagRepository.prototype.createMany).toBeDefined();
      expect(typeof TagRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(TagRepository.prototype.update).toBeDefined();
      expect(typeof TagRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(TagRepository.prototype.updateMany).toBeDefined();
      expect(typeof TagRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(TagRepository.prototype.delete).toBeDefined();
      expect(typeof TagRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(TagRepository.prototype.count).toBeDefined();
      expect(typeof TagRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(TagRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof TagRepository.prototype[name as keyof typeof TagRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(TagRepository.prototype).filter((name) => name !== "constructor");

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
