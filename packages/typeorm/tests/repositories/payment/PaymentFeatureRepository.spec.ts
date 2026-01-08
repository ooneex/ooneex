import { describe, expect, test } from "bun:test";
import { PaymentFeatureRepository } from "@/repositories/payment/PaymentFeatureRepository";

describe("PaymentFeatureRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(PaymentFeatureRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof PaymentFeatureRepository).toBe("function");
    expect(PaymentFeatureRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(PaymentFeatureRepository.prototype.open).toBeDefined();
      expect(typeof PaymentFeatureRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(PaymentFeatureRepository.prototype.close).toBeDefined();
      expect(typeof PaymentFeatureRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(PaymentFeatureRepository.prototype.find).toBeDefined();
      expect(typeof PaymentFeatureRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(PaymentFeatureRepository.prototype.findOne).toBeDefined();
      expect(typeof PaymentFeatureRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(PaymentFeatureRepository.prototype.findOneBy).toBeDefined();
      expect(typeof PaymentFeatureRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(PaymentFeatureRepository.prototype.create).toBeDefined();
      expect(typeof PaymentFeatureRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(PaymentFeatureRepository.prototype.createMany).toBeDefined();
      expect(typeof PaymentFeatureRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(PaymentFeatureRepository.prototype.update).toBeDefined();
      expect(typeof PaymentFeatureRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(PaymentFeatureRepository.prototype.updateMany).toBeDefined();
      expect(typeof PaymentFeatureRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(PaymentFeatureRepository.prototype.delete).toBeDefined();
      expect(typeof PaymentFeatureRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(PaymentFeatureRepository.prototype.count).toBeDefined();
      expect(typeof PaymentFeatureRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(PaymentFeatureRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof PaymentFeatureRepository.prototype[name as keyof typeof PaymentFeatureRepository.prototype] ===
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

      const methods = Object.getOwnPropertyNames(PaymentFeatureRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
