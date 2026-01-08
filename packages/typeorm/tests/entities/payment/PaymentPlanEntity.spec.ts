import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { PaymentPlanEntity } from "@/entities/payment/PaymentPlanEntity";

describe("PaymentPlanEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(PaymentPlanEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(PaymentPlanEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new PaymentPlanEntity();
    expect(entity).toBeInstanceOf(PaymentPlanEntity);
  });
});
