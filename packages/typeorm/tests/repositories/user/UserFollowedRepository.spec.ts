import { describe, expect, test } from "bun:test";
import { UserFollowedRepository } from "@/repositories/user/UserFollowedRepository";

describe("UserFollowedRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(UserFollowedRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof UserFollowedRepository).toBe("function");
    expect(UserFollowedRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(UserFollowedRepository.prototype.open).toBeDefined();
      expect(typeof UserFollowedRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(UserFollowedRepository.prototype.close).toBeDefined();
      expect(typeof UserFollowedRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(UserFollowedRepository.prototype.find).toBeDefined();
      expect(typeof UserFollowedRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(UserFollowedRepository.prototype.findOne).toBeDefined();
      expect(typeof UserFollowedRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(UserFollowedRepository.prototype.findOneBy).toBeDefined();
      expect(typeof UserFollowedRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(UserFollowedRepository.prototype.create).toBeDefined();
      expect(typeof UserFollowedRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(UserFollowedRepository.prototype.createMany).toBeDefined();
      expect(typeof UserFollowedRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(UserFollowedRepository.prototype.update).toBeDefined();
      expect(typeof UserFollowedRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(UserFollowedRepository.prototype.updateMany).toBeDefined();
      expect(typeof UserFollowedRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(UserFollowedRepository.prototype.delete).toBeDefined();
      expect(typeof UserFollowedRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(UserFollowedRepository.prototype.count).toBeDefined();
      expect(typeof UserFollowedRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(UserFollowedRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof UserFollowedRepository.prototype[name as keyof typeof UserFollowedRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(UserFollowedRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
