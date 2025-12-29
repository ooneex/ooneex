import { describe, expect, test } from "bun:test";
import type { ITag } from "@/index";

describe("@ooneex/tag - ITag", () => {
  test("should allow minimal tag with name", () => {
    const tag: ITag = {
      id: "tag-1",
      name: "typescript",
    };

    expect(tag.id).toBe("tag-1");
    expect(tag.name).toBe("typescript");
    expect(tag.color).toBeUndefined();
  });

  test("should allow optional color", () => {
    const tag: ITag = {
      id: "tag-2",
      name: "bun",
      color: { id: "color-1" } as unknown as NonNullable<ITag["color"]>,
    };

    expect(tag.color).toBeDefined();
  });
});
