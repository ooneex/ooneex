import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { FlashcardScheduleEntity } from "@/entities/gamification/flashcard/FlashcardScheduleEntity";

describe("FlashcardScheduleEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(FlashcardScheduleEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(FlashcardScheduleEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new FlashcardScheduleEntity();
    expect(entity).toBeInstanceOf(FlashcardScheduleEntity);
  });
});
