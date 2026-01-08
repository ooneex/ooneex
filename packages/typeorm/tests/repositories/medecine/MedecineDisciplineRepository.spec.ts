import { describe, expect, test } from "bun:test";
import { MedecineDisciplineRepository } from "@/repositories/medecine/MedecineDisciplineRepository";

describe("MedecineDisciplineRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(MedecineDisciplineRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof MedecineDisciplineRepository).toBe("function");
    expect(MedecineDisciplineRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(MedecineDisciplineRepository.prototype.open).toBeDefined();
      expect(typeof MedecineDisciplineRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(MedecineDisciplineRepository.prototype.close).toBeDefined();
      expect(typeof MedecineDisciplineRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(MedecineDisciplineRepository.prototype.find).toBeDefined();
      expect(typeof MedecineDisciplineRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(MedecineDisciplineRepository.prototype.findOne).toBeDefined();
      expect(typeof MedecineDisciplineRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(MedecineDisciplineRepository.prototype.findOneBy).toBeDefined();
      expect(typeof MedecineDisciplineRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(MedecineDisciplineRepository.prototype.create).toBeDefined();
      expect(typeof MedecineDisciplineRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(MedecineDisciplineRepository.prototype.createMany).toBeDefined();
      expect(typeof MedecineDisciplineRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(MedecineDisciplineRepository.prototype.update).toBeDefined();
      expect(typeof MedecineDisciplineRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(MedecineDisciplineRepository.prototype.updateMany).toBeDefined();
      expect(typeof MedecineDisciplineRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(MedecineDisciplineRepository.prototype.delete).toBeDefined();
      expect(typeof MedecineDisciplineRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(MedecineDisciplineRepository.prototype.count).toBeDefined();
      expect(typeof MedecineDisciplineRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(MedecineDisciplineRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof MedecineDisciplineRepository.prototype[name as keyof typeof MedecineDisciplineRepository.prototype] ===
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

      const methods = Object.getOwnPropertyNames(MedecineDisciplineRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
