import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { ImageReportEntity } from "@/entities/image/ImageReportEntity";

describe("ImageReportEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(ImageReportEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(ImageReportEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new ImageReportEntity();
    expect(entity).toBeInstanceOf(ImageReportEntity);
  });
});
