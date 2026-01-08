import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { FolderDownloadedEntity } from "@/entities/folder/FolderDownloadedEntity";

describe("FolderDownloadedEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(FolderDownloadedEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(FolderDownloadedEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new FolderDownloadedEntity();
    expect(entity).toBeInstanceOf(FolderDownloadedEntity);
  });
});
