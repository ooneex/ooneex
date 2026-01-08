import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { McqSessionQuestionEntity } from "@/entities/gamification/mcq/McqSessionQuestionEntity";

describe("McqSessionQuestionEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(McqSessionQuestionEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(McqSessionQuestionEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new McqSessionQuestionEntity();
    expect(entity).toBeInstanceOf(McqSessionQuestionEntity);
  });
});
