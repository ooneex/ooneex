import { describe, expect, test } from "bun:test";
import { PaymentProductRepository } from "@/repositories/payment/PaymentProductRepository";

describe("PaymentProductRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(PaymentProductRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof PaymentProductRepository).toBe("function");
    expect(PaymentProductRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(PaymentProductRepository.prototype.open).toBeDefined();
      expect(typeof PaymentProductRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(PaymentProductRepository.prototype.close).toBeDefined();
      expect(typeof PaymentProductRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(PaymentProductRepository.prototype.find).toBeDefined();
      expect(typeof PaymentProductRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(PaymentProductRepository.prototype.findOne).toBeDefined();
      expect(typeof PaymentProductRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(PaymentProductRepository.prototype.findOneBy).toBeDefined();
      expect(typeof PaymentProductRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(PaymentProductRepository.prototype.create).toBeDefined();
      expect(typeof PaymentProductRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(PaymentProductRepository.prototype.createMany).toBeDefined();
      expect(typeof PaymentProductRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(PaymentProductRepository.prototype.update).toBeDefined();
      expect(typeof PaymentProductRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(PaymentProductRepository.prototype.updateMany).toBeDefined();
      expect(typeof PaymentProductRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(PaymentProductRepository.prototype.delete).toBeDefined();
      expect(typeof PaymentProductRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(PaymentProductRepository.prototype.count).toBeDefined();
      expect(typeof PaymentProductRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(PaymentProductRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof PaymentProductRepository.prototype[name as keyof typeof PaymentProductRepository.prototype] ===
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

      const methods = Object.getOwnPropertyNames(PaymentProductRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
