import { describe, expect, test } from "bun:test";
import { VideoDislikedRepository } from "@/repositories/video/VideoDislikedRepository";

describe("VideoDislikedRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(VideoDislikedRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof VideoDislikedRepository).toBe("function");
    expect(VideoDislikedRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(VideoDislikedRepository.prototype.open).toBeDefined();
      expect(typeof VideoDislikedRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(VideoDislikedRepository.prototype.close).toBeDefined();
      expect(typeof VideoDislikedRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(VideoDislikedRepository.prototype.find).toBeDefined();
      expect(typeof VideoDislikedRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(VideoDislikedRepository.prototype.findOne).toBeDefined();
      expect(typeof VideoDislikedRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(VideoDislikedRepository.prototype.findOneBy).toBeDefined();
      expect(typeof VideoDislikedRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(VideoDislikedRepository.prototype.create).toBeDefined();
      expect(typeof VideoDislikedRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(VideoDislikedRepository.prototype.createMany).toBeDefined();
      expect(typeof VideoDislikedRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(VideoDislikedRepository.prototype.update).toBeDefined();
      expect(typeof VideoDislikedRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(VideoDislikedRepository.prototype.updateMany).toBeDefined();
      expect(typeof VideoDislikedRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(VideoDislikedRepository.prototype.delete).toBeDefined();
      expect(typeof VideoDislikedRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(VideoDislikedRepository.prototype.count).toBeDefined();
      expect(typeof VideoDislikedRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(VideoDislikedRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof VideoDislikedRepository.prototype[name as keyof typeof VideoDislikedRepository.prototype] ===
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

      const methods = Object.getOwnPropertyNames(VideoDislikedRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
