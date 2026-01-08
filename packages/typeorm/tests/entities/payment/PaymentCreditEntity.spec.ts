import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { PaymentCreditEntity } from "@/entities/payment/PaymentCreditEntity";

describe("PaymentCreditEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(PaymentCreditEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(PaymentCreditEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new PaymentCreditEntity();
    expect(entity).toBeInstanceOf(PaymentCreditEntity);
  });
});
