import { describe, expect, test } from "bun:test";
import { StatusRepository } from "@/repositories/common/StatusRepository";

describe("StatusRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(StatusRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof StatusRepository).toBe("function");
    expect(StatusRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(StatusRepository.prototype.open).toBeDefined();
      expect(typeof StatusRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(StatusRepository.prototype.close).toBeDefined();
      expect(typeof StatusRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(StatusRepository.prototype.find).toBeDefined();
      expect(typeof StatusRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(StatusRepository.prototype.findOne).toBeDefined();
      expect(typeof StatusRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(StatusRepository.prototype.findOneBy).toBeDefined();
      expect(typeof StatusRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(StatusRepository.prototype.create).toBeDefined();
      expect(typeof StatusRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(StatusRepository.prototype.createMany).toBeDefined();
      expect(typeof StatusRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(StatusRepository.prototype.update).toBeDefined();
      expect(typeof StatusRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(StatusRepository.prototype.updateMany).toBeDefined();
      expect(typeof StatusRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(StatusRepository.prototype.delete).toBeDefined();
      expect(typeof StatusRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(StatusRepository.prototype.count).toBeDefined();
      expect(typeof StatusRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(StatusRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof StatusRepository.prototype[name as keyof typeof StatusRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(StatusRepository.prototype).filter((name) => name !== "constructor");

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
