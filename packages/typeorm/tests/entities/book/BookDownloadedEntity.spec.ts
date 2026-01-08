import { describe, expect, test } from "bun:test";
import { BookDownloadedEntity } from "@/entities/book/BookDownloadedEntity";
import { BaseEntity } from "@/entities/common/BaseEntity";

describe("BookDownloadedEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(BookDownloadedEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(BookDownloadedEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new BookDownloadedEntity();
    expect(entity).toBeInstanceOf(BookDownloadedEntity);
  });
});
