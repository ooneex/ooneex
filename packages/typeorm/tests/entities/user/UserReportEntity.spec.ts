import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { UserReportEntity } from "@/entities/user/UserReportEntity";

describe("UserReportEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(UserReportEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(UserReportEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new UserReportEntity();
    expect(entity).toBeInstanceOf(UserReportEntity);
  });
});
