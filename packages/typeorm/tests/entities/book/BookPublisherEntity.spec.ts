import { describe, expect, test } from "bun:test";
import { BookPublisherEntity } from "@/entities/book/BookPublisherEntity";
import { BaseEntity } from "@/entities/common/BaseEntity";

describe("BookPublisherEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(BookPublisherEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(BookPublisherEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new BookPublisherEntity();
    expect(entity).toBeInstanceOf(BookPublisherEntity);
  });
});
