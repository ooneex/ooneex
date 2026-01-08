import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { FolderDislikedEntity } from "@/entities/folder/FolderDislikedEntity";

describe("FolderDislikedEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(FolderDislikedEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(FolderDislikedEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new FolderDislikedEntity();
    expect(entity).toBeInstanceOf(FolderDislikedEntity);
  });
});
