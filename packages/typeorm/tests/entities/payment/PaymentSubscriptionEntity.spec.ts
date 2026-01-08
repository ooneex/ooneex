import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { PaymentSubscriptionEntity } from "@/entities/payment/PaymentSubscriptionEntity";

describe("PaymentSubscriptionEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(PaymentSubscriptionEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(PaymentSubscriptionEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new PaymentSubscriptionEntity();
    expect(entity).toBeInstanceOf(PaymentSubscriptionEntity);
  });
});
