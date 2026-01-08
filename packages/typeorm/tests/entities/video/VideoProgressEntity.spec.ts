import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { VideoProgressEntity } from "@/entities/video/VideoProgressEntity";

describe("VideoProgressEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(VideoProgressEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(VideoProgressEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new VideoProgressEntity();
    expect(entity).toBeInstanceOf(VideoProgressEntity);
  });
});
