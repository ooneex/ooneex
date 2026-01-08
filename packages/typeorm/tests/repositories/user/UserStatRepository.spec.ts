import { describe, expect, test } from "bun:test";
import { UserStatRepository } from "@/repositories/user/UserStatRepository";

describe("UserStatRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(UserStatRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof UserStatRepository).toBe("function");
    expect(UserStatRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(UserStatRepository.prototype.open).toBeDefined();
      expect(typeof UserStatRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(UserStatRepository.prototype.close).toBeDefined();
      expect(typeof UserStatRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(UserStatRepository.prototype.find).toBeDefined();
      expect(typeof UserStatRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(UserStatRepository.prototype.findOne).toBeDefined();
      expect(typeof UserStatRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(UserStatRepository.prototype.findOneBy).toBeDefined();
      expect(typeof UserStatRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(UserStatRepository.prototype.create).toBeDefined();
      expect(typeof UserStatRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(UserStatRepository.prototype.createMany).toBeDefined();
      expect(typeof UserStatRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(UserStatRepository.prototype.update).toBeDefined();
      expect(typeof UserStatRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(UserStatRepository.prototype.updateMany).toBeDefined();
      expect(typeof UserStatRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(UserStatRepository.prototype.delete).toBeDefined();
      expect(typeof UserStatRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(UserStatRepository.prototype.count).toBeDefined();
      expect(typeof UserStatRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(UserStatRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof UserStatRepository.prototype[name as keyof typeof UserStatRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(UserStatRepository.prototype).filter((name) => name !== "constructor");

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
