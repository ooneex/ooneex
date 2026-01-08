import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { FlashcardStatsEntity } from "@/entities/gamification/flashcard/FlashcardStatsEntity";

describe("FlashcardStatsEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(FlashcardStatsEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(FlashcardStatsEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new FlashcardStatsEntity();
    expect(entity).toBeInstanceOf(FlashcardStatsEntity);
  });
});
