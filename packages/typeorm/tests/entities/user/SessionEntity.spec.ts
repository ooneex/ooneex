import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { SessionEntity } from "@/entities/user/SessionEntity";

describe("SessionEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(SessionEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(SessionEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new SessionEntity();
    expect(entity).toBeInstanceOf(SessionEntity);
  });
});
