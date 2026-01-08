import { describe, expect, test } from "bun:test";
import { ImageDownloadedRepository } from "@/repositories/image/ImageDownloadedRepository";

describe("ImageDownloadedRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(ImageDownloadedRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof ImageDownloadedRepository).toBe("function");
    expect(ImageDownloadedRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(ImageDownloadedRepository.prototype.open).toBeDefined();
      expect(typeof ImageDownloadedRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(ImageDownloadedRepository.prototype.close).toBeDefined();
      expect(typeof ImageDownloadedRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(ImageDownloadedRepository.prototype.find).toBeDefined();
      expect(typeof ImageDownloadedRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(ImageDownloadedRepository.prototype.findOne).toBeDefined();
      expect(typeof ImageDownloadedRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(ImageDownloadedRepository.prototype.findOneBy).toBeDefined();
      expect(typeof ImageDownloadedRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(ImageDownloadedRepository.prototype.create).toBeDefined();
      expect(typeof ImageDownloadedRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(ImageDownloadedRepository.prototype.createMany).toBeDefined();
      expect(typeof ImageDownloadedRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(ImageDownloadedRepository.prototype.update).toBeDefined();
      expect(typeof ImageDownloadedRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(ImageDownloadedRepository.prototype.updateMany).toBeDefined();
      expect(typeof ImageDownloadedRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(ImageDownloadedRepository.prototype.delete).toBeDefined();
      expect(typeof ImageDownloadedRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(ImageDownloadedRepository.prototype.count).toBeDefined();
      expect(typeof ImageDownloadedRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(ImageDownloadedRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof ImageDownloadedRepository.prototype[name as keyof typeof ImageDownloadedRepository.prototype] ===
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

      const methods = Object.getOwnPropertyNames(ImageDownloadedRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
