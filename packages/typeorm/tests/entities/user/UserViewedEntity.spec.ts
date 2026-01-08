import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { UserViewedEntity } from "@/entities/user/UserViewedEntity";

describe("UserViewedEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(UserViewedEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(UserViewedEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new UserViewedEntity();
    expect(entity).toBeInstanceOf(UserViewedEntity);
  });
});
