import { describe, expect, test } from "bun:test";
import type { ICategory } from "@/index";

describe("@ooneex/category - ICategory", () => {
  test("should allow minimal category with name", () => {
    const category: ICategory = {
      id: "cat-1",
      name: "Root",
    };

    expect(category.id).toBe("cat-1");
    expect(category.name).toBe("Root");
    expect(category.color).toBeUndefined();
    expect(category.parent).toBeUndefined();
    expect(category.children).toBeUndefined();
  });

  test("should support nested categories and optional color", () => {
    const child: ICategory = {
      id: "cat-child",
      name: "Child",
    };

    const root: ICategory = {
      id: "cat-root",
      name: "Root",
      color: { id: "color-1" } as unknown as NonNullable<ICategory["color"]>,
      children: [child],
    };

    child.parent = root;

    expect(root.children).toHaveLength(1);
    expect(root.children?.[0]?.name).toBe("Child");
    expect(child.parent?.id).toBe("cat-root");
  });
});
