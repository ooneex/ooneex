import { describe, expect, test } from "bun:test";
import { BookDislikedEntity } from "@/entities/book/BookDislikedEntity";
import { BaseEntity } from "@/entities/common/BaseEntity";

describe("BookDislikedEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(BookDislikedEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(BookDislikedEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new BookDislikedEntity();
    expect(entity).toBeInstanceOf(BookDislikedEntity);
  });
});
