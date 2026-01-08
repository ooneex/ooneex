import { describe, expect, test } from "bun:test";
import { ImageCommentRepository } from "@/repositories/image/ImageCommentRepository";

describe("ImageCommentRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(ImageCommentRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof ImageCommentRepository).toBe("function");
    expect(ImageCommentRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(ImageCommentRepository.prototype.open).toBeDefined();
      expect(typeof ImageCommentRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(ImageCommentRepository.prototype.close).toBeDefined();
      expect(typeof ImageCommentRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(ImageCommentRepository.prototype.find).toBeDefined();
      expect(typeof ImageCommentRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(ImageCommentRepository.prototype.findOne).toBeDefined();
      expect(typeof ImageCommentRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(ImageCommentRepository.prototype.findOneBy).toBeDefined();
      expect(typeof ImageCommentRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(ImageCommentRepository.prototype.create).toBeDefined();
      expect(typeof ImageCommentRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(ImageCommentRepository.prototype.createMany).toBeDefined();
      expect(typeof ImageCommentRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(ImageCommentRepository.prototype.update).toBeDefined();
      expect(typeof ImageCommentRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(ImageCommentRepository.prototype.updateMany).toBeDefined();
      expect(typeof ImageCommentRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(ImageCommentRepository.prototype.delete).toBeDefined();
      expect(typeof ImageCommentRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(ImageCommentRepository.prototype.count).toBeDefined();
      expect(typeof ImageCommentRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(ImageCommentRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof ImageCommentRepository.prototype[name as keyof typeof ImageCommentRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(ImageCommentRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
