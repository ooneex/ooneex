import { describe, expect, test } from "bun:test";
import { ImageRepository } from "@/repositories/image/ImageRepository";

describe("ImageRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(ImageRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof ImageRepository).toBe("function");
    expect(ImageRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(ImageRepository.prototype.open).toBeDefined();
      expect(typeof ImageRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(ImageRepository.prototype.close).toBeDefined();
      expect(typeof ImageRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(ImageRepository.prototype.find).toBeDefined();
      expect(typeof ImageRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(ImageRepository.prototype.findOne).toBeDefined();
      expect(typeof ImageRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(ImageRepository.prototype.findOneBy).toBeDefined();
      expect(typeof ImageRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(ImageRepository.prototype.create).toBeDefined();
      expect(typeof ImageRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(ImageRepository.prototype.createMany).toBeDefined();
      expect(typeof ImageRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(ImageRepository.prototype.update).toBeDefined();
      expect(typeof ImageRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(ImageRepository.prototype.updateMany).toBeDefined();
      expect(typeof ImageRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(ImageRepository.prototype.delete).toBeDefined();
      expect(typeof ImageRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(ImageRepository.prototype.count).toBeDefined();
      expect(typeof ImageRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(ImageRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof ImageRepository.prototype[name as keyof typeof ImageRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(ImageRepository.prototype).filter((name) => name !== "constructor");

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
