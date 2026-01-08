import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { VideoSharedEntity } from "@/entities/video/VideoSharedEntity";

describe("VideoSharedEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(VideoSharedEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(VideoSharedEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new VideoSharedEntity();
    expect(entity).toBeInstanceOf(VideoSharedEntity);
  });
});
