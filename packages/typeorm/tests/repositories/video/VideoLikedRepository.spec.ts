import { describe, expect, test } from "bun:test";
import { VideoLikedRepository } from "@/repositories/video/VideoLikedRepository";

describe("VideoLikedRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(VideoLikedRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof VideoLikedRepository).toBe("function");
    expect(VideoLikedRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(VideoLikedRepository.prototype.open).toBeDefined();
      expect(typeof VideoLikedRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(VideoLikedRepository.prototype.close).toBeDefined();
      expect(typeof VideoLikedRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(VideoLikedRepository.prototype.find).toBeDefined();
      expect(typeof VideoLikedRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(VideoLikedRepository.prototype.findOne).toBeDefined();
      expect(typeof VideoLikedRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(VideoLikedRepository.prototype.findOneBy).toBeDefined();
      expect(typeof VideoLikedRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(VideoLikedRepository.prototype.create).toBeDefined();
      expect(typeof VideoLikedRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(VideoLikedRepository.prototype.createMany).toBeDefined();
      expect(typeof VideoLikedRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(VideoLikedRepository.prototype.update).toBeDefined();
      expect(typeof VideoLikedRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(VideoLikedRepository.prototype.updateMany).toBeDefined();
      expect(typeof VideoLikedRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(VideoLikedRepository.prototype.delete).toBeDefined();
      expect(typeof VideoLikedRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(VideoLikedRepository.prototype.count).toBeDefined();
      expect(typeof VideoLikedRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(VideoLikedRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof VideoLikedRepository.prototype[name as keyof typeof VideoLikedRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(VideoLikedRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
