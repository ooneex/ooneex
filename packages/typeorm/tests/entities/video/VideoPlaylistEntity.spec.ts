import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { VideoPlaylistEntity } from "@/entities/video/VideoPlaylistEntity";

describe("VideoPlaylistEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(VideoPlaylistEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(VideoPlaylistEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new VideoPlaylistEntity();
    expect(entity).toBeInstanceOf(VideoPlaylistEntity);
  });
});
