import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { FolderEntity } from "@/entities/folder/FolderEntity";

describe("FolderEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(FolderEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(FolderEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new FolderEntity();
    expect(entity).toBeInstanceOf(FolderEntity);
  });
});
