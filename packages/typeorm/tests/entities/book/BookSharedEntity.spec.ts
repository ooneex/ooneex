import { describe, expect, test } from "bun:test";
import { BookSharedEntity } from "@/entities/book/BookSharedEntity";
import { BaseEntity } from "@/entities/common/BaseEntity";

describe("BookSharedEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(BookSharedEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(BookSharedEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new BookSharedEntity();
    expect(entity).toBeInstanceOf(BookSharedEntity);
  });
});
