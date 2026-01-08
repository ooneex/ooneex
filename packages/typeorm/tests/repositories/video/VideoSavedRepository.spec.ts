import { describe, expect, test } from "bun:test";
import { VideoSavedRepository } from "@/repositories/video/VideoSavedRepository";

describe("VideoSavedRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(VideoSavedRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof VideoSavedRepository).toBe("function");
    expect(VideoSavedRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(VideoSavedRepository.prototype.open).toBeDefined();
      expect(typeof VideoSavedRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(VideoSavedRepository.prototype.close).toBeDefined();
      expect(typeof VideoSavedRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(VideoSavedRepository.prototype.find).toBeDefined();
      expect(typeof VideoSavedRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(VideoSavedRepository.prototype.findOne).toBeDefined();
      expect(typeof VideoSavedRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(VideoSavedRepository.prototype.findOneBy).toBeDefined();
      expect(typeof VideoSavedRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(VideoSavedRepository.prototype.create).toBeDefined();
      expect(typeof VideoSavedRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(VideoSavedRepository.prototype.createMany).toBeDefined();
      expect(typeof VideoSavedRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(VideoSavedRepository.prototype.update).toBeDefined();
      expect(typeof VideoSavedRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(VideoSavedRepository.prototype.updateMany).toBeDefined();
      expect(typeof VideoSavedRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(VideoSavedRepository.prototype.delete).toBeDefined();
      expect(typeof VideoSavedRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(VideoSavedRepository.prototype.count).toBeDefined();
      expect(typeof VideoSavedRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(VideoSavedRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof VideoSavedRepository.prototype[name as keyof typeof VideoSavedRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(VideoSavedRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
