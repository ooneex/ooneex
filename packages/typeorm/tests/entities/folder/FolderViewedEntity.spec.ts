import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { FolderViewedEntity } from "@/entities/folder/FolderViewedEntity";

describe("FolderViewedEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(FolderViewedEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(FolderViewedEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new FolderViewedEntity();
    expect(entity).toBeInstanceOf(FolderViewedEntity);
  });
});
