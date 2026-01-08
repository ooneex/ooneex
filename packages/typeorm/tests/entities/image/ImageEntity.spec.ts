import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { ImageEntity } from "@/entities/image/ImageEntity";

describe("ImageEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(ImageEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(ImageEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new ImageEntity();
    expect(entity).toBeInstanceOf(ImageEntity);
  });
});
