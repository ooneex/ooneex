import { describe, expect, test } from "bun:test";
import { BookLikedEntity } from "@/entities/book/BookLikedEntity";
import { BaseEntity } from "@/entities/common/BaseEntity";

describe("BookLikedEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(BookLikedEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(BookLikedEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new BookLikedEntity();
    expect(entity).toBeInstanceOf(BookLikedEntity);
  });
});
