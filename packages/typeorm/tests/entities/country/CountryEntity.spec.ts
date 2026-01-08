import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { CountryEntity } from "@/entities/country/CountryEntity";

describe("CountryEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(CountryEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(CountryEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new CountryEntity();
    expect(entity).toBeInstanceOf(CountryEntity);
  });
});
