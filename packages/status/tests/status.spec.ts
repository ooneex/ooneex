import { describe, expect, test } from "bun:test";
import { EStatus, type IStatus } from "../src/index";

describe("@ooneex/status - EStatus", () => {
  test("should expose expected lifecycle values", () => {
    expect(String(EStatus.DRAFT)).toBe("draft");
    expect(String(EStatus.PENDING)).toBe("pending");
    expect(String(EStatus.APPROVED)).toBe("approved");
    expect(String(EStatus.REJECTED)).toBe("rejected");
    expect(String(EStatus.DELETED)).toBe("deleted");
  });

  test("should contain only unique string values", () => {
    const values = Object.values(EStatus);
    const unique = new Set(values);

    expect(values.length).toBe(unique.size);
    for (const value of values) {
      expect(typeof value).toBe("string");
      expect(value.length).toBeGreaterThan(0);
    }
  });
});

describe("@ooneex/status - IStatus", () => {
  test("should allow minimal status object", () => {
    const status: IStatus = {
      id: "1",
      status: EStatus.DRAFT,
    };

    expect(status.id).toBe("1");
    expect(status.status).toBe(EStatus.DRAFT);
    expect(status.description).toBeUndefined();
    expect(status.reason).toBeUndefined();
  });

  test("should allow optional color and metadata fields", () => {
    const status: IStatus = {
      id: "2",
      status: EStatus.APPROVED,
      // we don't depend on @ooneex/color runtime shape here
      color: { id: "c1" } as unknown as NonNullable<IStatus["color"]>,
      description: "Approved by moderator",
      reason: "All checks passed",
    };

    expect(status.status).toBe(EStatus.APPROVED);
    expect(status.color).toBeDefined();
    expect(status.description).toContain("Approved");
    expect(status.reason).toContain("checks");
  });
});
