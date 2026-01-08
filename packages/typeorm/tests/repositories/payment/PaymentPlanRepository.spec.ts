import { describe, expect, test } from "bun:test";
import { PaymentPlanRepository } from "@/repositories/payment/PaymentPlanRepository";

describe("PaymentPlanRepository", () => {
  test("should have class name ending with 'Repository'", () => {
    expect(PaymentPlanRepository.name.endsWith("Repository")).toBe(true);
  });

  test("should be a class", () => {
    expect(typeof PaymentPlanRepository).toBe("function");
    expect(PaymentPlanRepository.prototype).toBeDefined();
  });

  describe("method signatures", () => {
    test("should have open method", () => {
      expect(PaymentPlanRepository.prototype.open).toBeDefined();
      expect(typeof PaymentPlanRepository.prototype.open).toBe("function");
    });

    test("should have close method", () => {
      expect(PaymentPlanRepository.prototype.close).toBeDefined();
      expect(typeof PaymentPlanRepository.prototype.close).toBe("function");
    });

    test("should have find method", () => {
      expect(PaymentPlanRepository.prototype.find).toBeDefined();
      expect(typeof PaymentPlanRepository.prototype.find).toBe("function");
    });

    test("should have findOne method", () => {
      expect(PaymentPlanRepository.prototype.findOne).toBeDefined();
      expect(typeof PaymentPlanRepository.prototype.findOne).toBe("function");
    });

    test("should have findOneBy method", () => {
      expect(PaymentPlanRepository.prototype.findOneBy).toBeDefined();
      expect(typeof PaymentPlanRepository.prototype.findOneBy).toBe("function");
    });

    test("should have create method", () => {
      expect(PaymentPlanRepository.prototype.create).toBeDefined();
      expect(typeof PaymentPlanRepository.prototype.create).toBe("function");
    });

    test("should have createMany method", () => {
      expect(PaymentPlanRepository.prototype.createMany).toBeDefined();
      expect(typeof PaymentPlanRepository.prototype.createMany).toBe("function");
    });

    test("should have update method", () => {
      expect(PaymentPlanRepository.prototype.update).toBeDefined();
      expect(typeof PaymentPlanRepository.prototype.update).toBe("function");
    });

    test("should have updateMany method", () => {
      expect(PaymentPlanRepository.prototype.updateMany).toBeDefined();
      expect(typeof PaymentPlanRepository.prototype.updateMany).toBe("function");
    });

    test("should have delete method", () => {
      expect(PaymentPlanRepository.prototype.delete).toBeDefined();
      expect(typeof PaymentPlanRepository.prototype.delete).toBe("function");
    });

    test("should have count method", () => {
      expect(PaymentPlanRepository.prototype.count).toBeDefined();
      expect(typeof PaymentPlanRepository.prototype.count).toBe("function");
    });
  });

  describe("method count", () => {
    test("should have exactly 11 public methods", () => {
      const methods = Object.getOwnPropertyNames(PaymentPlanRepository.prototype).filter(
        (name) =>
          name !== "constructor" &&
          typeof PaymentPlanRepository.prototype[name as keyof typeof PaymentPlanRepository.prototype] === "function",
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

      const methods = Object.getOwnPropertyNames(PaymentPlanRepository.prototype).filter(
        (name) => name !== "constructor",
      );

      for (const method of requiredMethods) {
        expect(methods).toContain(method);
      }
    });
  });
});
