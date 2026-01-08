import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { FolderCommentEntity } from "@/entities/folder/FolderCommentEntity";

describe("FolderCommentEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(FolderCommentEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(FolderCommentEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new FolderCommentEntity();
    expect(entity).toBeInstanceOf(FolderCommentEntity);
  });
});
