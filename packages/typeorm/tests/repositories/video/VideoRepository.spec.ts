import { describe, expect, test } from "bun:test";
import { VideoRepository } from "@/repositories/video/VideoRepository";

describe("VideoRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(VideoRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof VideoRepository).toBe("function");
    expect(VideoRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(VideoRepository.prototype.open).toBeDefined();
      expect(typeof VideoRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(VideoRepository.prototype.close).toBeDefined();
      expect(typeof VideoRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(VideoRepository.prototype.find).toBeDefined();
      expect(typeof VideoRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(VideoRepository.prototype.findOne).toBeDefined();
      expect(typeof VideoRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(VideoRepository.prototype.findOneBy).toBeDefined();
      expect(typeof VideoRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(VideoRepository.prototype.create).toBeDefined();
      expect(typeof VideoRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(VideoRepository.prototype.createMany).toBeDefined();
      expect(typeof VideoRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(VideoRepository.prototype.update).toBeDefined();
      expect(typeof VideoRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(VideoRepository.prototype.updateMany).toBeDefined();
      expect(typeof VideoRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(VideoRepository.prototype.delete).toBeDefined();
      expect(typeof VideoRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(VideoRepository.prototype.count).toBeDefined();
      expect(typeof VideoRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(VideoRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof VideoRepository.prototype[name as keyof typeof VideoRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(VideoRepository.prototype).filter((name) => name !== "constructor");

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
