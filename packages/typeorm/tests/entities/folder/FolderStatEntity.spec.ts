import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { FolderStatEntity } from "@/entities/folder/FolderStatEntity";

describe("FolderStatEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(FolderStatEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(FolderStatEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new FolderStatEntity();
    expect(entity).toBeInstanceOf(FolderStatEntity);
  });
});
