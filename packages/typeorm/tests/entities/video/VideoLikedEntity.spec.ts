import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { VideoLikedEntity } from "@/entities/video/VideoLikedEntity";

describe("VideoLikedEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(VideoLikedEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(VideoLikedEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new VideoLikedEntity();
    expect(entity).toBeInstanceOf(VideoLikedEntity);
  });
});
