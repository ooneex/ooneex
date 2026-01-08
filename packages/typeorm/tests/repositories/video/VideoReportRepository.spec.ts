import { describe, expect, test } from "bun:test";
import { VideoReportRepository } from "@/repositories/video/VideoReportRepository";

describe("VideoReportRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(VideoReportRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof VideoReportRepository).toBe("function");
    expect(VideoReportRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(VideoReportRepository.prototype.open).toBeDefined();
      expect(typeof VideoReportRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(VideoReportRepository.prototype.close).toBeDefined();
      expect(typeof VideoReportRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(VideoReportRepository.prototype.find).toBeDefined();
      expect(typeof VideoReportRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(VideoReportRepository.prototype.findOne).toBeDefined();
      expect(typeof VideoReportRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(VideoReportRepository.prototype.findOneBy).toBeDefined();
      expect(typeof VideoReportRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(VideoReportRepository.prototype.create).toBeDefined();
      expect(typeof VideoReportRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(VideoReportRepository.prototype.createMany).toBeDefined();
      expect(typeof VideoReportRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(VideoReportRepository.prototype.update).toBeDefined();
      expect(typeof VideoReportRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(VideoReportRepository.prototype.updateMany).toBeDefined();
      expect(typeof VideoReportRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(VideoReportRepository.prototype.delete).toBeDefined();
      expect(typeof VideoReportRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(VideoReportRepository.prototype.count).toBeDefined();
      expect(typeof VideoReportRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(VideoReportRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof VideoReportRepository.prototype[name as keyof typeof VideoReportRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(VideoReportRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
