import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { PaymentCouponEntity } from "@/entities/payment/PaymentCouponEntity";

describe("PaymentCouponEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(PaymentCouponEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(PaymentCouponEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new PaymentCouponEntity();
    expect(entity).toBeInstanceOf(PaymentCouponEntity);
  });
});
