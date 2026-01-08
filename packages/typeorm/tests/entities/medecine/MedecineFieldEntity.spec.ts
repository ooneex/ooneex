import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { MedecineFieldEntity } from "@/entities/medecine/MedecineFieldEntity";

describe("MedecineFieldEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(MedecineFieldEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(MedecineFieldEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new MedecineFieldEntity();
    expect(entity).toBeInstanceOf(MedecineFieldEntity);
  });
});
