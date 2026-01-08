import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { FlashcardDeckEntity } from "@/entities/gamification/flashcard/FlashcardDeckEntity";

describe("FlashcardDeckEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(FlashcardDeckEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(FlashcardDeckEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new FlashcardDeckEntity();
    expect(entity).toBeInstanceOf(FlashcardDeckEntity);
  });
});
