import { describe, expect, test } from "bun:test";
import { MedecineFieldRepository } from "@/repositories/medecine/MedecineFieldRepository";

describe("MedecineFieldRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(MedecineFieldRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof MedecineFieldRepository).toBe("function");
    expect(MedecineFieldRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(MedecineFieldRepository.prototype.open).toBeDefined();
      expect(typeof MedecineFieldRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(MedecineFieldRepository.prototype.close).toBeDefined();
      expect(typeof MedecineFieldRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(MedecineFieldRepository.prototype.find).toBeDefined();
      expect(typeof MedecineFieldRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(MedecineFieldRepository.prototype.findOne).toBeDefined();
      expect(typeof MedecineFieldRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(MedecineFieldRepository.prototype.findOneBy).toBeDefined();
      expect(typeof MedecineFieldRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(MedecineFieldRepository.prototype.create).toBeDefined();
      expect(typeof MedecineFieldRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(MedecineFieldRepository.prototype.createMany).toBeDefined();
      expect(typeof MedecineFieldRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(MedecineFieldRepository.prototype.update).toBeDefined();
      expect(typeof MedecineFieldRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(MedecineFieldRepository.prototype.updateMany).toBeDefined();
      expect(typeof MedecineFieldRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(MedecineFieldRepository.prototype.delete).toBeDefined();
      expect(typeof MedecineFieldRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(MedecineFieldRepository.prototype.count).toBeDefined();
      expect(typeof MedecineFieldRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(MedecineFieldRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof MedecineFieldRepository.prototype[name as keyof typeof MedecineFieldRepository.prototype] ===
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

      const methods = Object.getOwnPropertyNames(MedecineFieldRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
