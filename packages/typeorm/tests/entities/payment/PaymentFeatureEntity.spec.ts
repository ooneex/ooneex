import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { PaymentFeatureEntity } from "@/entities/payment/PaymentFeatureEntity";

describe("PaymentFeatureEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(PaymentFeatureEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(PaymentFeatureEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new PaymentFeatureEntity();
    expect(entity).toBeInstanceOf(PaymentFeatureEntity);
  });
});
