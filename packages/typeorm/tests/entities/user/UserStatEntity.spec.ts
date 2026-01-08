import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { UserStatEntity } from "@/entities/user/UserStatEntity";

describe("UserStatEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(UserStatEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(UserStatEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new UserStatEntity();
    expect(entity).toBeInstanceOf(UserStatEntity);
  });
});
