import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { McqQuestionDislikedEntity } from "@/entities/gamification/mcq/McqQuestionDislikedEntity";

describe("McqQuestionDislikedEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(McqQuestionDislikedEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(McqQuestionDislikedEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new McqQuestionDislikedEntity();
    expect(entity).toBeInstanceOf(McqQuestionDislikedEntity);
  });
});
