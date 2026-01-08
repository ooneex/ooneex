import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { FolderLikedEntity } from "@/entities/folder/FolderLikedEntity";

describe("FolderLikedEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(FolderLikedEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(FolderLikedEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new FolderLikedEntity();
    expect(entity).toBeInstanceOf(FolderLikedEntity);
  });
});
