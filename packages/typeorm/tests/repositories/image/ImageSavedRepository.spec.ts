import { describe, expect, test } from "bun:test";
import { ImageSavedRepository } from "@/repositories/image/ImageSavedRepository";

describe("ImageSavedRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(ImageSavedRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof ImageSavedRepository).toBe("function");
    expect(ImageSavedRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(ImageSavedRepository.prototype.open).toBeDefined();
      expect(typeof ImageSavedRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(ImageSavedRepository.prototype.close).toBeDefined();
      expect(typeof ImageSavedRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(ImageSavedRepository.prototype.find).toBeDefined();
      expect(typeof ImageSavedRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(ImageSavedRepository.prototype.findOne).toBeDefined();
      expect(typeof ImageSavedRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(ImageSavedRepository.prototype.findOneBy).toBeDefined();
      expect(typeof ImageSavedRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(ImageSavedRepository.prototype.create).toBeDefined();
      expect(typeof ImageSavedRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(ImageSavedRepository.prototype.createMany).toBeDefined();
      expect(typeof ImageSavedRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(ImageSavedRepository.prototype.update).toBeDefined();
      expect(typeof ImageSavedRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(ImageSavedRepository.prototype.updateMany).toBeDefined();
      expect(typeof ImageSavedRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(ImageSavedRepository.prototype.delete).toBeDefined();
      expect(typeof ImageSavedRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(ImageSavedRepository.prototype.count).toBeDefined();
      expect(typeof ImageSavedRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(ImageSavedRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof ImageSavedRepository.prototype[name as keyof typeof ImageSavedRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(ImageSavedRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
