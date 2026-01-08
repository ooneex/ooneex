import { describe, expect, test } from "bun:test";
import { VideoViewedRepository } from "@/repositories/video/VideoViewedRepository";

describe("VideoViewedRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(VideoViewedRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof VideoViewedRepository).toBe("function");
    expect(VideoViewedRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(VideoViewedRepository.prototype.open).toBeDefined();
      expect(typeof VideoViewedRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(VideoViewedRepository.prototype.close).toBeDefined();
      expect(typeof VideoViewedRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(VideoViewedRepository.prototype.find).toBeDefined();
      expect(typeof VideoViewedRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(VideoViewedRepository.prototype.findOne).toBeDefined();
      expect(typeof VideoViewedRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(VideoViewedRepository.prototype.findOneBy).toBeDefined();
      expect(typeof VideoViewedRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(VideoViewedRepository.prototype.create).toBeDefined();
      expect(typeof VideoViewedRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(VideoViewedRepository.prototype.createMany).toBeDefined();
      expect(typeof VideoViewedRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(VideoViewedRepository.prototype.update).toBeDefined();
      expect(typeof VideoViewedRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(VideoViewedRepository.prototype.updateMany).toBeDefined();
      expect(typeof VideoViewedRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(VideoViewedRepository.prototype.delete).toBeDefined();
      expect(typeof VideoViewedRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(VideoViewedRepository.prototype.count).toBeDefined();
      expect(typeof VideoViewedRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(VideoViewedRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof VideoViewedRepository.prototype[name as keyof typeof VideoViewedRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(VideoViewedRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
