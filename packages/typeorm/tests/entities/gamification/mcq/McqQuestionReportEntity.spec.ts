import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { McqQuestionReportEntity } from "@/entities/gamification/mcq/McqQuestionReportEntity";

describe("McqQuestionReportEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(McqQuestionReportEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(McqQuestionReportEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new McqQuestionReportEntity();
    expect(entity).toBeInstanceOf(McqQuestionReportEntity);
  });
});
