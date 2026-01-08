import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { VideoEntity } from "@/entities/video/VideoEntity";

describe("VideoEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(VideoEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(VideoEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new VideoEntity();
    expect(entity).toBeInstanceOf(VideoEntity);
  });
});
