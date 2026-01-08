import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { McqQuestionViewedEntity } from "@/entities/gamification/mcq/McqQuestionViewedEntity";

describe("McqQuestionViewedEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(McqQuestionViewedEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(McqQuestionViewedEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new McqQuestionViewedEntity();
    expect(entity).toBeInstanceOf(McqQuestionViewedEntity);
  });
});
