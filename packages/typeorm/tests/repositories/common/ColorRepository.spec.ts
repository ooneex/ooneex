import { describe, expect, test } from "bun:test";
import { ColorRepository } from "@/repositories/common/ColorRepository";

describe("ColorRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(ColorRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof ColorRepository).toBe("function");
    expect(ColorRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(ColorRepository.prototype.open).toBeDefined();
      expect(typeof ColorRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(ColorRepository.prototype.close).toBeDefined();
      expect(typeof ColorRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(ColorRepository.prototype.find).toBeDefined();
      expect(typeof ColorRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(ColorRepository.prototype.findOne).toBeDefined();
      expect(typeof ColorRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(ColorRepository.prototype.findOneBy).toBeDefined();
      expect(typeof ColorRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(ColorRepository.prototype.create).toBeDefined();
      expect(typeof ColorRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(ColorRepository.prototype.createMany).toBeDefined();
      expect(typeof ColorRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(ColorRepository.prototype.update).toBeDefined();
      expect(typeof ColorRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(ColorRepository.prototype.updateMany).toBeDefined();
      expect(typeof ColorRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(ColorRepository.prototype.delete).toBeDefined();
      expect(typeof ColorRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(ColorRepository.prototype.count).toBeDefined();
      expect(typeof ColorRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(ColorRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof ColorRepository.prototype[name as keyof typeof ColorRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(ColorRepository.prototype).filter((name) => name !== "constructor");

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
