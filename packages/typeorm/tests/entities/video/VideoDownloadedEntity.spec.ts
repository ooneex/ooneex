import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { VideoDownloadedEntity } from "@/entities/video/VideoDownloadedEntity";

describe("VideoDownloadedEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(VideoDownloadedEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(VideoDownloadedEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new VideoDownloadedEntity();
    expect(entity).toBeInstanceOf(VideoDownloadedEntity);
  });
});
