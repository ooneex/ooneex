import { describe, expect, test } from "bun:test";
import { PaymentSubscriptionRepository } from "@/repositories/payment/PaymentSubscriptionRepository";

describe("PaymentSubscriptionRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(PaymentSubscriptionRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof PaymentSubscriptionRepository).toBe("function");
    expect(PaymentSubscriptionRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(PaymentSubscriptionRepository.prototype.open).toBeDefined();
      expect(typeof PaymentSubscriptionRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(PaymentSubscriptionRepository.prototype.close).toBeDefined();
      expect(typeof PaymentSubscriptionRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(PaymentSubscriptionRepository.prototype.find).toBeDefined();
      expect(typeof PaymentSubscriptionRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(PaymentSubscriptionRepository.prototype.findOne).toBeDefined();
      expect(typeof PaymentSubscriptionRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(PaymentSubscriptionRepository.prototype.findOneBy).toBeDefined();
      expect(typeof PaymentSubscriptionRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(PaymentSubscriptionRepository.prototype.create).toBeDefined();
      expect(typeof PaymentSubscriptionRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(PaymentSubscriptionRepository.prototype.createMany).toBeDefined();
      expect(typeof PaymentSubscriptionRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(PaymentSubscriptionRepository.prototype.update).toBeDefined();
      expect(typeof PaymentSubscriptionRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(PaymentSubscriptionRepository.prototype.updateMany).toBeDefined();
      expect(typeof PaymentSubscriptionRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(PaymentSubscriptionRepository.prototype.delete).toBeDefined();
      expect(typeof PaymentSubscriptionRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(PaymentSubscriptionRepository.prototype.count).toBeDefined();
      expect(typeof PaymentSubscriptionRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(PaymentSubscriptionRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof PaymentSubscriptionRepository.prototype[
            name as keyof typeof PaymentSubscriptionRepository.prototype
          ] === "function",
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

      const methods = Object.getOwnPropertyNames(PaymentSubscriptionRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
