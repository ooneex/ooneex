import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { McqQuestionLikedEntity } from "@/entities/gamification/mcq/McqQuestionLikedEntity";

describe("McqQuestionLikedEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(McqQuestionLikedEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(McqQuestionLikedEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new McqQuestionLikedEntity();
    expect(entity).toBeInstanceOf(McqQuestionLikedEntity);
  });
});
