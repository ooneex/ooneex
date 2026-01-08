import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { McqQuestionStatEntity } from "@/entities/gamification/mcq/McqQuestionStatEntity";

describe("McqQuestionStatEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(McqQuestionStatEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(McqQuestionStatEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new McqQuestionStatEntity();
    expect(entity).toBeInstanceOf(McqQuestionStatEntity);
  });
});
