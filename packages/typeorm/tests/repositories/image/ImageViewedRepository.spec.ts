import { describe, expect, test } from "bun:test";
import { ImageViewedRepository } from "@/repositories/image/ImageViewedRepository";

describe("ImageViewedRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(ImageViewedRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof ImageViewedRepository).toBe("function");
    expect(ImageViewedRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(ImageViewedRepository.prototype.open).toBeDefined();
      expect(typeof ImageViewedRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(ImageViewedRepository.prototype.close).toBeDefined();
      expect(typeof ImageViewedRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(ImageViewedRepository.prototype.find).toBeDefined();
      expect(typeof ImageViewedRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(ImageViewedRepository.prototype.findOne).toBeDefined();
      expect(typeof ImageViewedRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(ImageViewedRepository.prototype.findOneBy).toBeDefined();
      expect(typeof ImageViewedRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(ImageViewedRepository.prototype.create).toBeDefined();
      expect(typeof ImageViewedRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(ImageViewedRepository.prototype.createMany).toBeDefined();
      expect(typeof ImageViewedRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(ImageViewedRepository.prototype.update).toBeDefined();
      expect(typeof ImageViewedRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(ImageViewedRepository.prototype.updateMany).toBeDefined();
      expect(typeof ImageViewedRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(ImageViewedRepository.prototype.delete).toBeDefined();
      expect(typeof ImageViewedRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(ImageViewedRepository.prototype.count).toBeDefined();
      expect(typeof ImageViewedRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(ImageViewedRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof ImageViewedRepository.prototype[name as keyof typeof ImageViewedRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(ImageViewedRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
