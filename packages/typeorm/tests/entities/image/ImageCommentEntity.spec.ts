import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { ImageCommentEntity } from "@/entities/image/ImageCommentEntity";

describe("ImageCommentEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(ImageCommentEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(ImageCommentEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new ImageCommentEntity();
    expect(entity).toBeInstanceOf(ImageCommentEntity);
  });
});
