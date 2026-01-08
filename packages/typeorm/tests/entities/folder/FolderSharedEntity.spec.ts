import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { FolderSharedEntity } from "@/entities/folder/FolderSharedEntity";

describe("FolderSharedEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(FolderSharedEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(FolderSharedEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new FolderSharedEntity();
    expect(entity).toBeInstanceOf(FolderSharedEntity);
  });
});
