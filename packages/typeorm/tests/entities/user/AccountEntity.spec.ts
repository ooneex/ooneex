import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { AccountEntity } from "@/entities/user/AccountEntity";

describe("AccountEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(AccountEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(AccountEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new AccountEntity();
    expect(entity).toBeInstanceOf(AccountEntity);
  });
});
