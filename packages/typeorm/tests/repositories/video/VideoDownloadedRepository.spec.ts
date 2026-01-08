import { describe, expect, test } from "bun:test";
import { VideoDownloadedRepository } from "@/repositories/video/VideoDownloadedRepository";

describe("VideoDownloadedRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(VideoDownloadedRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof VideoDownloadedRepository).toBe("function");
    expect(VideoDownloadedRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(VideoDownloadedRepository.prototype.open).toBeDefined();
      expect(typeof VideoDownloadedRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(VideoDownloadedRepository.prototype.close).toBeDefined();
      expect(typeof VideoDownloadedRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(VideoDownloadedRepository.prototype.find).toBeDefined();
      expect(typeof VideoDownloadedRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(VideoDownloadedRepository.prototype.findOne).toBeDefined();
      expect(typeof VideoDownloadedRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(VideoDownloadedRepository.prototype.findOneBy).toBeDefined();
      expect(typeof VideoDownloadedRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(VideoDownloadedRepository.prototype.create).toBeDefined();
      expect(typeof VideoDownloadedRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(VideoDownloadedRepository.prototype.createMany).toBeDefined();
      expect(typeof VideoDownloadedRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(VideoDownloadedRepository.prototype.update).toBeDefined();
      expect(typeof VideoDownloadedRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(VideoDownloadedRepository.prototype.updateMany).toBeDefined();
      expect(typeof VideoDownloadedRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(VideoDownloadedRepository.prototype.delete).toBeDefined();
      expect(typeof VideoDownloadedRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(VideoDownloadedRepository.prototype.count).toBeDefined();
      expect(typeof VideoDownloadedRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(VideoDownloadedRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof VideoDownloadedRepository.prototype[name as keyof typeof VideoDownloadedRepository.prototype] ===
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

      const methods = Object.getOwnPropertyNames(VideoDownloadedRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
