import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { McqQuestionSavedEntity } from "@/entities/gamification/mcq/McqQuestionSavedEntity";

describe("McqQuestionSavedEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(McqQuestionSavedEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(McqQuestionSavedEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new McqQuestionSavedEntity();
    expect(entity).toBeInstanceOf(McqQuestionSavedEntity);
  });
});
