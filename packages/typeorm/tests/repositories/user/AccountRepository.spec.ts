import { describe, expect, test } from "bun:test";
import { AccountRepository } from "@/repositories/user/AccountRepository";

describe("AccountRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(AccountRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof AccountRepository).toBe("function");
    expect(AccountRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(AccountRepository.prototype.open).toBeDefined();
      expect(typeof AccountRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(AccountRepository.prototype.close).toBeDefined();
      expect(typeof AccountRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(AccountRepository.prototype.find).toBeDefined();
      expect(typeof AccountRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(AccountRepository.prototype.findOne).toBeDefined();
      expect(typeof AccountRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(AccountRepository.prototype.findOneBy).toBeDefined();
      expect(typeof AccountRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(AccountRepository.prototype.create).toBeDefined();
      expect(typeof AccountRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(AccountRepository.prototype.createMany).toBeDefined();
      expect(typeof AccountRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(AccountRepository.prototype.update).toBeDefined();
      expect(typeof AccountRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(AccountRepository.prototype.updateMany).toBeDefined();
      expect(typeof AccountRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(AccountRepository.prototype.delete).toBeDefined();
      expect(typeof AccountRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(AccountRepository.prototype.count).toBeDefined();
      expect(typeof AccountRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(AccountRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof AccountRepository.prototype[name as keyof typeof AccountRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(AccountRepository.prototype).filter((name) => name !== "constructor");

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
