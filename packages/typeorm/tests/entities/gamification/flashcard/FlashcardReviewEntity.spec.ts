import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { FlashcardReviewEntity } from "@/entities/gamification/flashcard/FlashcardReviewEntity";

describe("FlashcardReviewEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(FlashcardReviewEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(FlashcardReviewEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new FlashcardReviewEntity();
    expect(entity).toBeInstanceOf(FlashcardReviewEntity);
  });
});
