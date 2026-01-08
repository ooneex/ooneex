import { describe, expect, test } from "bun:test";
import { CurrencyRepository } from "@/repositories/currency/CurrencyRepository";

describe("CurrencyRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(CurrencyRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof CurrencyRepository).toBe("function");
    expect(CurrencyRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(CurrencyRepository.prototype.open).toBeDefined();
      expect(typeof CurrencyRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(CurrencyRepository.prototype.close).toBeDefined();
      expect(typeof CurrencyRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(CurrencyRepository.prototype.find).toBeDefined();
      expect(typeof CurrencyRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(CurrencyRepository.prototype.findOne).toBeDefined();
      expect(typeof CurrencyRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(CurrencyRepository.prototype.findOneBy).toBeDefined();
      expect(typeof CurrencyRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(CurrencyRepository.prototype.create).toBeDefined();
      expect(typeof CurrencyRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(CurrencyRepository.prototype.createMany).toBeDefined();
      expect(typeof CurrencyRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(CurrencyRepository.prototype.update).toBeDefined();
      expect(typeof CurrencyRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(CurrencyRepository.prototype.updateMany).toBeDefined();
      expect(typeof CurrencyRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(CurrencyRepository.prototype.delete).toBeDefined();
      expect(typeof CurrencyRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(CurrencyRepository.prototype.count).toBeDefined();
      expect(typeof CurrencyRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(CurrencyRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof CurrencyRepository.prototype[name as keyof typeof CurrencyRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(CurrencyRepository.prototype).filter((name) => name !== "constructor");

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
