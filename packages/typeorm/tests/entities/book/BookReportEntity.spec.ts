import { describe, expect, test } from "bun:test";
import { BookReportEntity } from "@/entities/book/BookReportEntity";
import { BaseEntity } from "@/entities/common/BaseEntity";

describe("BookReportEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(BookReportEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(BookReportEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new BookReportEntity();
    expect(entity).toBeInstanceOf(BookReportEntity);
  });
});
