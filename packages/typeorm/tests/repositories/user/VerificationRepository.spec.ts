import { describe, expect, test } from "bun:test";
import { VerificationRepository } from "@/repositories/user/VerificationRepository";

describe("VerificationRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(VerificationRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof VerificationRepository).toBe("function");
    expect(VerificationRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(VerificationRepository.prototype.open).toBeDefined();
      expect(typeof VerificationRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(VerificationRepository.prototype.close).toBeDefined();
      expect(typeof VerificationRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(VerificationRepository.prototype.find).toBeDefined();
      expect(typeof VerificationRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(VerificationRepository.prototype.findOne).toBeDefined();
      expect(typeof VerificationRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(VerificationRepository.prototype.findOneBy).toBeDefined();
      expect(typeof VerificationRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(VerificationRepository.prototype.create).toBeDefined();
      expect(typeof VerificationRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(VerificationRepository.prototype.createMany).toBeDefined();
      expect(typeof VerificationRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(VerificationRepository.prototype.update).toBeDefined();
      expect(typeof VerificationRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(VerificationRepository.prototype.updateMany).toBeDefined();
      expect(typeof VerificationRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(VerificationRepository.prototype.delete).toBeDefined();
      expect(typeof VerificationRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(VerificationRepository.prototype.count).toBeDefined();
      expect(typeof VerificationRepository.prototype.count).toBe("function");
    });

    test("should have findByToken method", () => {
      expect(VerificationRepository.prototype.findByToken).toBeDefined();
      expect(typeof VerificationRepository.prototype.findByToken).toBe("function");
    });

    test("should have findByCode method", () => {
      expect(VerificationRepository.prototype.findByCode).toBeDefined();
      expect(typeof VerificationRepository.prototype.findByCode).toBe("function");
    });

    test("should have markAsUsed method", () => {
      expect(VerificationRepository.prototype.markAsUsed).toBeDefined();
      expect(typeof VerificationRepository.prototype.markAsUsed).toBe("function");
    });

    test("should have incrementAttempts method", () => {
      expect(VerificationRepository.prototype.incrementAttempts).toBeDefined();
      expect(typeof VerificationRepository.prototype.incrementAttempts).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 15 public methods", () => {
      const methods = Object.getOwnPropertyNames(VerificationRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof VerificationRepository.prototype[name as keyof typeof VerificationRepository.prototype] === "function",
      );
      expect(methods.length).toBe(15);
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
        "findByToken",
        "findByCode",
        "markAsUsed",
        "incrementAttempts",
      ];

      const methods = Object.getOwnPropertyNames(VerificationRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
