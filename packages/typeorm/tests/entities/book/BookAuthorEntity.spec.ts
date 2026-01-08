import { describe, expect, test } from "bun:test";
import { BookAuthorEntity } from "@/entities/book/BookAuthorEntity";
import { BaseEntity } from "@/entities/common/BaseEntity";

describe("BookAuthorEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(BookAuthorEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(BookAuthorEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new BookAuthorEntity();
    expect(entity).toBeInstanceOf(BookAuthorEntity);
  });
});
