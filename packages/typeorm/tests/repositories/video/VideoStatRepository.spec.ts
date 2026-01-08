import { describe, expect, test } from "bun:test";
import { VideoStatRepository } from "@/repositories/video/VideoStatRepository";

describe("VideoStatRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(VideoStatRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof VideoStatRepository).toBe("function");
    expect(VideoStatRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(VideoStatRepository.prototype.open).toBeDefined();
      expect(typeof VideoStatRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(VideoStatRepository.prototype.close).toBeDefined();
      expect(typeof VideoStatRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(VideoStatRepository.prototype.find).toBeDefined();
      expect(typeof VideoStatRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(VideoStatRepository.prototype.findOne).toBeDefined();
      expect(typeof VideoStatRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(VideoStatRepository.prototype.findOneBy).toBeDefined();
      expect(typeof VideoStatRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(VideoStatRepository.prototype.create).toBeDefined();
      expect(typeof VideoStatRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(VideoStatRepository.prototype.createMany).toBeDefined();
      expect(typeof VideoStatRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(VideoStatRepository.prototype.update).toBeDefined();
      expect(typeof VideoStatRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(VideoStatRepository.prototype.updateMany).toBeDefined();
      expect(typeof VideoStatRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(VideoStatRepository.prototype.delete).toBeDefined();
      expect(typeof VideoStatRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(VideoStatRepository.prototype.count).toBeDefined();
      expect(typeof VideoStatRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(VideoStatRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof VideoStatRepository.prototype[name as keyof typeof VideoStatRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(VideoStatRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
