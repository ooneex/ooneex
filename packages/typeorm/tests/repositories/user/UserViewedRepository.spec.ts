import { describe, expect, test } from "bun:test";
import { UserViewedRepository } from "@/repositories/user/UserViewedRepository";

describe("UserViewedRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(UserViewedRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof UserViewedRepository).toBe("function");
    expect(UserViewedRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(UserViewedRepository.prototype.open).toBeDefined();
      expect(typeof UserViewedRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(UserViewedRepository.prototype.close).toBeDefined();
      expect(typeof UserViewedRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(UserViewedRepository.prototype.find).toBeDefined();
      expect(typeof UserViewedRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(UserViewedRepository.prototype.findOne).toBeDefined();
      expect(typeof UserViewedRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(UserViewedRepository.prototype.findOneBy).toBeDefined();
      expect(typeof UserViewedRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(UserViewedRepository.prototype.create).toBeDefined();
      expect(typeof UserViewedRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(UserViewedRepository.prototype.createMany).toBeDefined();
      expect(typeof UserViewedRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(UserViewedRepository.prototype.update).toBeDefined();
      expect(typeof UserViewedRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(UserViewedRepository.prototype.updateMany).toBeDefined();
      expect(typeof UserViewedRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(UserViewedRepository.prototype.delete).toBeDefined();
      expect(typeof UserViewedRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(UserViewedRepository.prototype.count).toBeDefined();
      expect(typeof UserViewedRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(UserViewedRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof UserViewedRepository.prototype[name as keyof typeof UserViewedRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(UserViewedRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
