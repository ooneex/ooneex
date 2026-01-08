import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { ImageDislikedEntity } from "@/entities/image/ImageDislikedEntity";

describe("ImageDislikedEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(ImageDislikedEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(ImageDislikedEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new ImageDislikedEntity();
    expect(entity).toBeInstanceOf(ImageDislikedEntity);
  });
});
