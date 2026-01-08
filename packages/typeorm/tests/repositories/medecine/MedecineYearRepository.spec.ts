import { describe, expect, test } from "bun:test";
import { MedecineYearRepository } from "@/repositories/medecine/MedecineYearRepository";

describe("MedecineYearRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(MedecineYearRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof MedecineYearRepository).toBe("function");
    expect(MedecineYearRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(MedecineYearRepository.prototype.open).toBeDefined();
      expect(typeof MedecineYearRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(MedecineYearRepository.prototype.close).toBeDefined();
      expect(typeof MedecineYearRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(MedecineYearRepository.prototype.find).toBeDefined();
      expect(typeof MedecineYearRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(MedecineYearRepository.prototype.findOne).toBeDefined();
      expect(typeof MedecineYearRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(MedecineYearRepository.prototype.findOneBy).toBeDefined();
      expect(typeof MedecineYearRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(MedecineYearRepository.prototype.create).toBeDefined();
      expect(typeof MedecineYearRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(MedecineYearRepository.prototype.createMany).toBeDefined();
      expect(typeof MedecineYearRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(MedecineYearRepository.prototype.update).toBeDefined();
      expect(typeof MedecineYearRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(MedecineYearRepository.prototype.updateMany).toBeDefined();
      expect(typeof MedecineYearRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(MedecineYearRepository.prototype.delete).toBeDefined();
      expect(typeof MedecineYearRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(MedecineYearRepository.prototype.count).toBeDefined();
      expect(typeof MedecineYearRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(MedecineYearRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof MedecineYearRepository.prototype[name as keyof typeof MedecineYearRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(MedecineYearRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
