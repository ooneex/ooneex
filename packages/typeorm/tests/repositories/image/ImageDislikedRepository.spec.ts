import { describe, expect, test } from "bun:test";
import { ImageDislikedRepository } from "@/repositories/image/ImageDislikedRepository";

describe("ImageDislikedRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(ImageDislikedRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof ImageDislikedRepository).toBe("function");
    expect(ImageDislikedRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(ImageDislikedRepository.prototype.open).toBeDefined();
      expect(typeof ImageDislikedRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(ImageDislikedRepository.prototype.close).toBeDefined();
      expect(typeof ImageDislikedRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(ImageDislikedRepository.prototype.find).toBeDefined();
      expect(typeof ImageDislikedRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(ImageDislikedRepository.prototype.findOne).toBeDefined();
      expect(typeof ImageDislikedRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(ImageDislikedRepository.prototype.findOneBy).toBeDefined();
      expect(typeof ImageDislikedRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(ImageDislikedRepository.prototype.create).toBeDefined();
      expect(typeof ImageDislikedRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(ImageDislikedRepository.prototype.createMany).toBeDefined();
      expect(typeof ImageDislikedRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(ImageDislikedRepository.prototype.update).toBeDefined();
      expect(typeof ImageDislikedRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(ImageDislikedRepository.prototype.updateMany).toBeDefined();
      expect(typeof ImageDislikedRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(ImageDislikedRepository.prototype.delete).toBeDefined();
      expect(typeof ImageDislikedRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(ImageDislikedRepository.prototype.count).toBeDefined();
      expect(typeof ImageDislikedRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(ImageDislikedRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof ImageDislikedRepository.prototype[name as keyof typeof ImageDislikedRepository.prototype] ===
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

      const methods = Object.getOwnPropertyNames(ImageDislikedRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
