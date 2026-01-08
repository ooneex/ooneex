import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { FlashcardSessionEntity } from "@/entities/gamification/flashcard/FlashcardSessionEntity";

describe("FlashcardSessionEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(FlashcardSessionEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(FlashcardSessionEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new FlashcardSessionEntity();
    expect(entity).toBeInstanceOf(FlashcardSessionEntity);
  });
});
