import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { VideoCommentEntity } from "@/entities/video/VideoCommentEntity";

describe("VideoCommentEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(VideoCommentEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(VideoCommentEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new VideoCommentEntity();
    expect(entity).toBeInstanceOf(VideoCommentEntity);
  });
});
