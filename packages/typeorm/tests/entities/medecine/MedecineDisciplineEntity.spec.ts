import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { MedecineDisciplineEntity } from "@/entities/medecine/MedecineDisciplineEntity";

describe("MedecineDisciplineEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(MedecineDisciplineEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(MedecineDisciplineEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new MedecineDisciplineEntity();
    expect(entity).toBeInstanceOf(MedecineDisciplineEntity);
  });
});
