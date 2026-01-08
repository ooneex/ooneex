import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { MedecineYearEntity } from "@/entities/medecine/MedecineYearEntity";

describe("MedecineYearEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(MedecineYearEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(MedecineYearEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new MedecineYearEntity();
    expect(entity).toBeInstanceOf(MedecineYearEntity);
  });
});
