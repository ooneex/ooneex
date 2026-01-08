import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { VerificationEntity } from "@/entities/user/VerificationEntity";

describe("VerificationEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(VerificationEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(VerificationEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new VerificationEntity();
    expect(entity).toBeInstanceOf(VerificationEntity);
  });
});
