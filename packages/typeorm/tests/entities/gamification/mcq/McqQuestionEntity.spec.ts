import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { McqQuestionEntity } from "@/entities/gamification/mcq/McqQuestionEntity";

describe("McqQuestionEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(McqQuestionEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(McqQuestionEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new McqQuestionEntity();
    expect(entity).toBeInstanceOf(McqQuestionEntity);
  });
});
