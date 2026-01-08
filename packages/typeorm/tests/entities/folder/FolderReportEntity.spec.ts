import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { FolderReportEntity } from "@/entities/folder/FolderReportEntity";

describe("FolderReportEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(FolderReportEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(FolderReportEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new FolderReportEntity();
    expect(entity).toBeInstanceOf(FolderReportEntity);
  });
});
