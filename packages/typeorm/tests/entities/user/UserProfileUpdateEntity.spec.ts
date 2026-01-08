import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { UserProfileUpdateEntity } from "@/entities/user/UserProfileUpdateEntity";

describe("UserProfileUpdateEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(UserProfileUpdateEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(UserProfileUpdateEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new UserProfileUpdateEntity();
    expect(entity).toBeInstanceOf(UserProfileUpdateEntity);
  });
});
