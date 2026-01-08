import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { VideoStatEntity } from "@/entities/video/VideoStatEntity";

describe("VideoStatEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(VideoStatEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(VideoStatEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new VideoStatEntity();
    expect(entity).toBeInstanceOf(VideoStatEntity);
  });
});
