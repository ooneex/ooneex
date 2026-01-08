import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { McqQuestionSharedEntity } from "@/entities/gamification/mcq/McqQuestionSharedEntity";

describe("McqQuestionSharedEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(McqQuestionSharedEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(McqQuestionSharedEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new McqQuestionSharedEntity();
    expect(entity).toBeInstanceOf(McqQuestionSharedEntity);
  });
});
