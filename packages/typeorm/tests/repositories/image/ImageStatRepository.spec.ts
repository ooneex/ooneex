import { describe, expect, test } from "bun:test";
import { ImageStatRepository } from "@/repositories/image/ImageStatRepository";

describe("ImageStatRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(ImageStatRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof ImageStatRepository).toBe("function");
    expect(ImageStatRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(ImageStatRepository.prototype.open).toBeDefined();
      expect(typeof ImageStatRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(ImageStatRepository.prototype.close).toBeDefined();
      expect(typeof ImageStatRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(ImageStatRepository.prototype.find).toBeDefined();
      expect(typeof ImageStatRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(ImageStatRepository.prototype.findOne).toBeDefined();
      expect(typeof ImageStatRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(ImageStatRepository.prototype.findOneBy).toBeDefined();
      expect(typeof ImageStatRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(ImageStatRepository.prototype.create).toBeDefined();
      expect(typeof ImageStatRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(ImageStatRepository.prototype.createMany).toBeDefined();
      expect(typeof ImageStatRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(ImageStatRepository.prototype.update).toBeDefined();
      expect(typeof ImageStatRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(ImageStatRepository.prototype.updateMany).toBeDefined();
      expect(typeof ImageStatRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(ImageStatRepository.prototype.delete).toBeDefined();
      expect(typeof ImageStatRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(ImageStatRepository.prototype.count).toBeDefined();
      expect(typeof ImageStatRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(ImageStatRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof ImageStatRepository.prototype[name as keyof typeof ImageStatRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(ImageStatRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
