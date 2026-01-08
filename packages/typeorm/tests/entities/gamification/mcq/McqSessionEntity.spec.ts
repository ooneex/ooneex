import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { McqSessionEntity } from "@/entities/gamification/mcq/McqSessionEntity";

describe("McqSessionEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(McqSessionEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(McqSessionEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new McqSessionEntity();
    expect(entity).toBeInstanceOf(McqSessionEntity);
  });
});
