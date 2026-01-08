import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { ImageViewedEntity } from "@/entities/image/ImageViewedEntity";

describe("ImageViewedEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(ImageViewedEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(ImageViewedEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new ImageViewedEntity();
    expect(entity).toBeInstanceOf(ImageViewedEntity);
  });
});
