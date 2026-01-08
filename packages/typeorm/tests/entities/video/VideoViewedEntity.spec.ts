import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { VideoViewedEntity } from "@/entities/video/VideoViewedEntity";

describe("VideoViewedEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(VideoViewedEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(VideoViewedEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new VideoViewedEntity();
    expect(entity).toBeInstanceOf(VideoViewedEntity);
  });
});
