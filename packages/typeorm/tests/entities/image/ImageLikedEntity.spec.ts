import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { ImageLikedEntity } from "@/entities/image/ImageLikedEntity";

describe("ImageLikedEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(ImageLikedEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(ImageLikedEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new ImageLikedEntity();
    expect(entity).toBeInstanceOf(ImageLikedEntity);
  });
});
