import { describe, expect, test } from "bun:test";
import { CountryRepository } from "@/repositories/country/CountryRepository";

describe("CountryRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(CountryRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof CountryRepository).toBe("function");
    expect(CountryRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(CountryRepository.prototype.open).toBeDefined();
      expect(typeof CountryRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(CountryRepository.prototype.close).toBeDefined();
      expect(typeof CountryRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(CountryRepository.prototype.find).toBeDefined();
      expect(typeof CountryRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(CountryRepository.prototype.findOne).toBeDefined();
      expect(typeof CountryRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(CountryRepository.prototype.findOneBy).toBeDefined();
      expect(typeof CountryRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(CountryRepository.prototype.create).toBeDefined();
      expect(typeof CountryRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(CountryRepository.prototype.createMany).toBeDefined();
      expect(typeof CountryRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(CountryRepository.prototype.update).toBeDefined();
      expect(typeof CountryRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(CountryRepository.prototype.updateMany).toBeDefined();
      expect(typeof CountryRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(CountryRepository.prototype.delete).toBeDefined();
      expect(typeof CountryRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(CountryRepository.prototype.count).toBeDefined();
      expect(typeof CountryRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(CountryRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof CountryRepository.prototype[name as keyof typeof CountryRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(CountryRepository.prototype).filter((name) => name !== "constructor");

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
