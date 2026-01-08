import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { VideoSavedEntity } from "@/entities/video/VideoSavedEntity";

describe("VideoSavedEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(VideoSavedEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(VideoSavedEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new VideoSavedEntity();
    expect(entity).toBeInstanceOf(VideoSavedEntity);
  });
});
