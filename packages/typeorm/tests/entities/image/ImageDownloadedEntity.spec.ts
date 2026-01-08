import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { ImageDownloadedEntity } from "@/entities/image/ImageDownloadedEntity";

describe("ImageDownloadedEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(ImageDownloadedEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(ImageDownloadedEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new ImageDownloadedEntity();
    expect(entity).toBeInstanceOf(ImageDownloadedEntity);
  });
});
