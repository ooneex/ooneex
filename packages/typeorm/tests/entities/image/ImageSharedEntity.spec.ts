import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { ImageSharedEntity } from "@/entities/image/ImageSharedEntity";

describe("ImageSharedEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(ImageSharedEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(ImageSharedEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new ImageSharedEntity();
    expect(entity).toBeInstanceOf(ImageSharedEntity);
  });
});
