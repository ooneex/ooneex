import { describe, expect, test } from "bun:test";
import { BookViewedEntity } from "@/entities/book/BookViewedEntity";
import { BaseEntity } from "@/entities/common/BaseEntity";

describe("BookViewedEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(BookViewedEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(BookViewedEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new BookViewedEntity();
    expect(entity).toBeInstanceOf(BookViewedEntity);
  });
});
