import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { FolderSavedEntity } from "@/entities/folder/FolderSavedEntity";

describe("FolderSavedEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(FolderSavedEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(FolderSavedEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new FolderSavedEntity();
    expect(entity).toBeInstanceOf(FolderSavedEntity);
  });
});
