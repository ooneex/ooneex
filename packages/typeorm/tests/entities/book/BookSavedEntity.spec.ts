import { describe, expect, test } from "bun:test";
import { BookSavedEntity } from "@/entities/book/BookSavedEntity";
import { BaseEntity } from "@/entities/common/BaseEntity";

describe("BookSavedEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(BookSavedEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(BookSavedEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new BookSavedEntity();
    expect(entity).toBeInstanceOf(BookSavedEntity);
  });
});
