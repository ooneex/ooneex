import { describe, expect, test } from "bun:test";
import { PaymentCreditRepository } from "@/repositories/payment/PaymentCreditRepository";

describe("PaymentCreditRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(PaymentCreditRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof PaymentCreditRepository).toBe("function");
    expect(PaymentCreditRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(PaymentCreditRepository.prototype.open).toBeDefined();
      expect(typeof PaymentCreditRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(PaymentCreditRepository.prototype.close).toBeDefined();
      expect(typeof PaymentCreditRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(PaymentCreditRepository.prototype.find).toBeDefined();
      expect(typeof PaymentCreditRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(PaymentCreditRepository.prototype.findOne).toBeDefined();
      expect(typeof PaymentCreditRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(PaymentCreditRepository.prototype.findOneBy).toBeDefined();
      expect(typeof PaymentCreditRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(PaymentCreditRepository.prototype.create).toBeDefined();
      expect(typeof PaymentCreditRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(PaymentCreditRepository.prototype.createMany).toBeDefined();
      expect(typeof PaymentCreditRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(PaymentCreditRepository.prototype.update).toBeDefined();
      expect(typeof PaymentCreditRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(PaymentCreditRepository.prototype.updateMany).toBeDefined();
      expect(typeof PaymentCreditRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(PaymentCreditRepository.prototype.delete).toBeDefined();
      expect(typeof PaymentCreditRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(PaymentCreditRepository.prototype.count).toBeDefined();
      expect(typeof PaymentCreditRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(PaymentCreditRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof PaymentCreditRepository.prototype[name as keyof typeof PaymentCreditRepository.prototype] ===
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

      const methods = Object.getOwnPropertyNames(PaymentCreditRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
