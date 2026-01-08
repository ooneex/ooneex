import { describe, expect, test } from "bun:test";
import { BookCommentEntity } from "@/entities/book/BookCommentEntity";
import { BaseEntity } from "@/entities/common/BaseEntity";

describe("BookCommentEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(BookCommentEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(BookCommentEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new BookCommentEntity();
    expect(entity).toBeInstanceOf(BookCommentEntity);
  });
});
