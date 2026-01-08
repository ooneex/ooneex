import { describe, expect, test } from "bun:test";
import { VideoCommentRepository } from "@/repositories/video/VideoCommentRepository";

describe("VideoCommentRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(VideoCommentRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof VideoCommentRepository).toBe("function");
    expect(VideoCommentRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(VideoCommentRepository.prototype.open).toBeDefined();
      expect(typeof VideoCommentRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(VideoCommentRepository.prototype.close).toBeDefined();
      expect(typeof VideoCommentRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(VideoCommentRepository.prototype.find).toBeDefined();
      expect(typeof VideoCommentRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(VideoCommentRepository.prototype.findOne).toBeDefined();
      expect(typeof VideoCommentRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(VideoCommentRepository.prototype.findOneBy).toBeDefined();
      expect(typeof VideoCommentRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(VideoCommentRepository.prototype.create).toBeDefined();
      expect(typeof VideoCommentRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(VideoCommentRepository.prototype.createMany).toBeDefined();
      expect(typeof VideoCommentRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(VideoCommentRepository.prototype.update).toBeDefined();
      expect(typeof VideoCommentRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(VideoCommentRepository.prototype.updateMany).toBeDefined();
      expect(typeof VideoCommentRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(VideoCommentRepository.prototype.delete).toBeDefined();
      expect(typeof VideoCommentRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(VideoCommentRepository.prototype.count).toBeDefined();
      expect(typeof VideoCommentRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(VideoCommentRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof VideoCommentRepository.prototype[name as keyof typeof VideoCommentRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(VideoCommentRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
