import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { ImageStatEntity } from "@/entities/image/ImageStatEntity";

describe("ImageStatEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(ImageStatEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(ImageStatEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new ImageStatEntity();
    expect(entity).toBeInstanceOf(ImageStatEntity);
  });
});
