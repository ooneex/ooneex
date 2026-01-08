import { describe, expect, test } from "bun:test";
import { UserReportRepository } from "@/repositories/user/UserReportRepository";

describe("UserReportRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(UserReportRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof UserReportRepository).toBe("function");
    expect(UserReportRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(UserReportRepository.prototype.open).toBeDefined();
      expect(typeof UserReportRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(UserReportRepository.prototype.close).toBeDefined();
      expect(typeof UserReportRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(UserReportRepository.prototype.find).toBeDefined();
      expect(typeof UserReportRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(UserReportRepository.prototype.findOne).toBeDefined();
      expect(typeof UserReportRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(UserReportRepository.prototype.findOneBy).toBeDefined();
      expect(typeof UserReportRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(UserReportRepository.prototype.create).toBeDefined();
      expect(typeof UserReportRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(UserReportRepository.prototype.createMany).toBeDefined();
      expect(typeof UserReportRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(UserReportRepository.prototype.update).toBeDefined();
      expect(typeof UserReportRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(UserReportRepository.prototype.updateMany).toBeDefined();
      expect(typeof UserReportRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(UserReportRepository.prototype.delete).toBeDefined();
      expect(typeof UserReportRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(UserReportRepository.prototype.count).toBeDefined();
      expect(typeof UserReportRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(UserReportRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof UserReportRepository.prototype[name as keyof typeof UserReportRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(UserReportRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
