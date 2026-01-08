import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { FlashcardEntity } from "@/entities/gamification/flashcard/FlashcardEntity";

describe("FlashcardEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(FlashcardEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(FlashcardEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new FlashcardEntity();
    expect(entity).toBeInstanceOf(FlashcardEntity);
  });
});
