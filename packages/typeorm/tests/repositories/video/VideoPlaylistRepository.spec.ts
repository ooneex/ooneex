import { describe, expect, test } from "bun:test";
import { VideoPlaylistRepository } from "@/repositories/video/VideoPlaylistRepository";

describe("VideoPlaylistRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(VideoPlaylistRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof VideoPlaylistRepository).toBe("function");
    expect(VideoPlaylistRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(VideoPlaylistRepository.prototype.open).toBeDefined();
      expect(typeof VideoPlaylistRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(VideoPlaylistRepository.prototype.close).toBeDefined();
      expect(typeof VideoPlaylistRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(VideoPlaylistRepository.prototype.find).toBeDefined();
      expect(typeof VideoPlaylistRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(VideoPlaylistRepository.prototype.findOne).toBeDefined();
      expect(typeof VideoPlaylistRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(VideoPlaylistRepository.prototype.findOneBy).toBeDefined();
      expect(typeof VideoPlaylistRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(VideoPlaylistRepository.prototype.create).toBeDefined();
      expect(typeof VideoPlaylistRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(VideoPlaylistRepository.prototype.createMany).toBeDefined();
      expect(typeof VideoPlaylistRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(VideoPlaylistRepository.prototype.update).toBeDefined();
      expect(typeof VideoPlaylistRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(VideoPlaylistRepository.prototype.updateMany).toBeDefined();
      expect(typeof VideoPlaylistRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(VideoPlaylistRepository.prototype.delete).toBeDefined();
      expect(typeof VideoPlaylistRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(VideoPlaylistRepository.prototype.count).toBeDefined();
      expect(typeof VideoPlaylistRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(VideoPlaylistRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof VideoPlaylistRepository.prototype[name as keyof typeof VideoPlaylistRepository.prototype] ===
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

      const methods = Object.getOwnPropertyNames(VideoPlaylistRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
