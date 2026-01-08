import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { McqQuestionCommentEntity } from "@/entities/gamification/mcq/McqQuestionCommentEntity";

describe("McqQuestionCommentEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(McqQuestionCommentEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(McqQuestionCommentEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new McqQuestionCommentEntity();
    expect(entity).toBeInstanceOf(McqQuestionCommentEntity);
  });
});
