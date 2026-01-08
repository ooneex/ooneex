import { describe, expect, test } from "bun:test";
import { ImageSharedRepository } from "@/repositories/image/ImageSharedRepository";

describe("ImageSharedRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(ImageSharedRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof ImageSharedRepository).toBe("function");
    expect(ImageSharedRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(ImageSharedRepository.prototype.open).toBeDefined();
      expect(typeof ImageSharedRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(ImageSharedRepository.prototype.close).toBeDefined();
      expect(typeof ImageSharedRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(ImageSharedRepository.prototype.find).toBeDefined();
      expect(typeof ImageSharedRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(ImageSharedRepository.prototype.findOne).toBeDefined();
      expect(typeof ImageSharedRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(ImageSharedRepository.prototype.findOneBy).toBeDefined();
      expect(typeof ImageSharedRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(ImageSharedRepository.prototype.create).toBeDefined();
      expect(typeof ImageSharedRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(ImageSharedRepository.prototype.createMany).toBeDefined();
      expect(typeof ImageSharedRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(ImageSharedRepository.prototype.update).toBeDefined();
      expect(typeof ImageSharedRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(ImageSharedRepository.prototype.updateMany).toBeDefined();
      expect(typeof ImageSharedRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(ImageSharedRepository.prototype.delete).toBeDefined();
      expect(typeof ImageSharedRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(ImageSharedRepository.prototype.count).toBeDefined();
      expect(typeof ImageSharedRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(ImageSharedRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof ImageSharedRepository.prototype[name as keyof typeof ImageSharedRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(ImageSharedRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
