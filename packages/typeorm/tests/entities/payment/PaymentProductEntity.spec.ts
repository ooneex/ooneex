import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { PaymentProductEntity } from "@/entities/payment/PaymentProductEntity";

describe("PaymentProductEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(PaymentProductEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(PaymentProductEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new PaymentProductEntity();
    expect(entity).toBeInstanceOf(PaymentProductEntity);
  });
});
