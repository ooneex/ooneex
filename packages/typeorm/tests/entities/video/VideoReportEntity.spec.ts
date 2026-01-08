import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { VideoReportEntity } from "@/entities/video/VideoReportEntity";

describe("VideoReportEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(VideoReportEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(VideoReportEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new VideoReportEntity();
    expect(entity).toBeInstanceOf(VideoReportEntity);
  });
});
