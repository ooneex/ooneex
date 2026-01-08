import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { FlashcardPresetEntity } from "@/entities/gamification/flashcard/FlashcardPresetEntity";

describe("FlashcardPresetEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(FlashcardPresetEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(FlashcardPresetEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new FlashcardPresetEntity();
    expect(entity).toBeInstanceOf(FlashcardPresetEntity);
  });
});
