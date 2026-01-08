import { describe, expect, test } from "bun:test";
import { VideoSharedRepository } from "@/repositories/video/VideoSharedRepository";

describe("VideoSharedRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(VideoSharedRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof VideoSharedRepository).toBe("function");
    expect(VideoSharedRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(VideoSharedRepository.prototype.open).toBeDefined();
      expect(typeof VideoSharedRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(VideoSharedRepository.prototype.close).toBeDefined();
      expect(typeof VideoSharedRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(VideoSharedRepository.prototype.find).toBeDefined();
      expect(typeof VideoSharedRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(VideoSharedRepository.prototype.findOne).toBeDefined();
      expect(typeof VideoSharedRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(VideoSharedRepository.prototype.findOneBy).toBeDefined();
      expect(typeof VideoSharedRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(VideoSharedRepository.prototype.create).toBeDefined();
      expect(typeof VideoSharedRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(VideoSharedRepository.prototype.createMany).toBeDefined();
      expect(typeof VideoSharedRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(VideoSharedRepository.prototype.update).toBeDefined();
      expect(typeof VideoSharedRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(VideoSharedRepository.prototype.updateMany).toBeDefined();
      expect(typeof VideoSharedRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(VideoSharedRepository.prototype.delete).toBeDefined();
      expect(typeof VideoSharedRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(VideoSharedRepository.prototype.count).toBeDefined();
      expect(typeof VideoSharedRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(VideoSharedRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof VideoSharedRepository.prototype[name as keyof typeof VideoSharedRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(VideoSharedRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
