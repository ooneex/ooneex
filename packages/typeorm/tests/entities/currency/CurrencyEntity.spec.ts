import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { CurrencyEntity } from "@/entities/currency/CurrencyEntity";

describe("CurrencyEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(CurrencyEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(CurrencyEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new CurrencyEntity();
    expect(entity).toBeInstanceOf(CurrencyEntity);
  });
});
