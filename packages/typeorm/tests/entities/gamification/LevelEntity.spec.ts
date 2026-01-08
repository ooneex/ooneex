import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { LevelEntity } from "@/entities/gamification/LevelEntity";

describe("LevelEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(LevelEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(LevelEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new LevelEntity();
    expect(entity).toBeInstanceOf(LevelEntity);
  });
});
