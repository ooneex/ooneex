import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { ImageSavedEntity } from "@/entities/image/ImageSavedEntity";

describe("ImageSavedEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(ImageSavedEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(ImageSavedEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new ImageSavedEntity();
    expect(entity).toBeInstanceOf(ImageSavedEntity);
  });
});
