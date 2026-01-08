import { describe, expect, test } from "bun:test";
import { BookStatEntity } from "@/entities/book/BookStatEntity";
import { BaseEntity } from "@/entities/common/BaseEntity";

describe("BookStatEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(BookStatEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(BookStatEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new BookStatEntity();
    expect(entity).toBeInstanceOf(BookStatEntity);
  });
});
