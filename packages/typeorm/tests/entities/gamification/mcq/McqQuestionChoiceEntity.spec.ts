import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { McqQuestionChoiceEntity } from "@/entities/gamification/mcq/McqQuestionChoiceEntity";

describe("McqQuestionChoiceEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(McqQuestionChoiceEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(McqQuestionChoiceEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new McqQuestionChoiceEntity();
    expect(entity).toBeInstanceOf(McqQuestionChoiceEntity);
  });
});
