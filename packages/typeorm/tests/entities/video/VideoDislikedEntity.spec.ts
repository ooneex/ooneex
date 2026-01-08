import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { VideoDislikedEntity } from "@/entities/video/VideoDislikedEntity";

describe("VideoDislikedEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(VideoDislikedEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(VideoDislikedEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new VideoDislikedEntity();
    expect(entity).toBeInstanceOf(VideoDislikedEntity);
  });
});
