import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { UserBlockedEntity } from "@/entities/user/UserBlockedEntity";

describe("UserBlockedEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(UserBlockedEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(UserBlockedEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new UserBlockedEntity();
    expect(entity).toBeInstanceOf(UserBlockedEntity);
  });
});
