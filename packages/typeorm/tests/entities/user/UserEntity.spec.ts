import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { UserEntity } from "@/entities/user/UserEntity";

describe("UserEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(UserEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(UserEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new UserEntity();
    expect(entity).toBeInstanceOf(UserEntity);
  });
});
