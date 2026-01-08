import { describe, expect, test } from "bun:test";
import { BookEntity } from "@/entities/book/BookEntity";
import { BaseEntity } from "@/entities/common/BaseEntity";

describe("BookEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(BookEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(BookEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new BookEntity();
    expect(entity).toBeInstanceOf(BookEntity);
  });
});
