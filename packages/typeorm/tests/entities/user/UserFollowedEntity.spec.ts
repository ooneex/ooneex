import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { UserFollowedEntity } from "@/entities/user/UserFollowedEntity";

describe("UserFollowedEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(UserFollowedEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(UserFollowedEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new UserFollowedEntity();
    expect(entity).toBeInstanceOf(UserFollowedEntity);
  });
});
