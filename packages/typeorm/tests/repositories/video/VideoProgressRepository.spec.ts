import { describe, expect, test } from "bun:test";
import { VideoProgressRepository } from "@/repositories/video/VideoProgressRepository";

describe("VideoProgressRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(VideoProgressRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof VideoProgressRepository).toBe("function");
    expect(VideoProgressRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(VideoProgressRepository.prototype.open).toBeDefined();
      expect(typeof VideoProgressRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(VideoProgressRepository.prototype.close).toBeDefined();
      expect(typeof VideoProgressRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(VideoProgressRepository.prototype.find).toBeDefined();
      expect(typeof VideoProgressRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(VideoProgressRepository.prototype.findOne).toBeDefined();
      expect(typeof VideoProgressRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(VideoProgressRepository.prototype.findOneBy).toBeDefined();
      expect(typeof VideoProgressRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(VideoProgressRepository.prototype.create).toBeDefined();
      expect(typeof VideoProgressRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(VideoProgressRepository.prototype.createMany).toBeDefined();
      expect(typeof VideoProgressRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(VideoProgressRepository.prototype.update).toBeDefined();
      expect(typeof VideoProgressRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(VideoProgressRepository.prototype.updateMany).toBeDefined();
      expect(typeof VideoProgressRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(VideoProgressRepository.prototype.delete).toBeDefined();
      expect(typeof VideoProgressRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(VideoProgressRepository.prototype.count).toBeDefined();
      expect(typeof VideoProgressRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(VideoProgressRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof VideoProgressRepository.prototype[name as keyof typeof VideoProgressRepository.prototype] ===
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

      const methods = Object.getOwnPropertyNames(VideoProgressRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
