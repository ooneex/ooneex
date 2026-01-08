import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { CategoryEntity } from "@/entities/common/CategoryEntity";
import { ColorEntity } from "@/entities/common/ColorEntity";

describe("CategoryEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(CategoryEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(CategoryEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new CategoryEntity();
    expect(entity).toBeInstanceOf(CategoryEntity);
  });

  describe("inherited BaseEntity fields", () => {
    test("should have id field with auto-generated nanoid", () => {
      const entity = new CategoryEntity();
      expect(entity.id).toBeDefined();
      expect(typeof entity.id).toBe("string");
      expect(entity.id.length).toBe(25);
    });

    test("should have unique ids for different instances", () => {
      const entity1 = new CategoryEntity();
      const entity2 = new CategoryEntity();
      expect(entity1.id).not.toBe(entity2.id);
    });

    test("should allow setting isLocked field", () => {
      const entity = new CategoryEntity();
      expect(entity.isLocked).toBeUndefined();

      entity.isLocked = true;
      expect(entity.isLocked).toBe(true);

      entity.isLocked = false;
      expect(entity.isLocked).toBe(false);
    });

    test("should allow setting lockedAt field", () => {
      const entity = new CategoryEntity();
      expect(entity.lockedAt).toBeUndefined();

      const date = new Date();
      entity.lockedAt = date;
      expect(entity.lockedAt).toBe(date);
    });

    test("should allow setting isBlocked field", () => {
      const entity = new CategoryEntity();
      expect(entity.isBlocked).toBeUndefined();

      entity.isBlocked = true;
      expect(entity.isBlocked).toBe(true);

      entity.isBlocked = false;
      expect(entity.isBlocked).toBe(false);
    });

    test("should allow setting blockedAt field", () => {
      const entity = new CategoryEntity();
      expect(entity.blockedAt).toBeUndefined();

      const date = new Date();
      entity.blockedAt = date;
      expect(entity.blockedAt).toBe(date);
    });

    test("should allow setting blockReason field", () => {
      const entity = new CategoryEntity();
      expect(entity.blockReason).toBeUndefined();

      entity.blockReason = "Violated terms of service";
      expect(entity.blockReason).toBe("Violated terms of service");
    });

    test("should allow setting isPublic field", () => {
      const entity = new CategoryEntity();
      expect(entity.isPublic).toBeUndefined();

      entity.isPublic = true;
      expect(entity.isPublic).toBe(true);

      entity.isPublic = false;
      expect(entity.isPublic).toBe(false);
    });

    test("should allow setting language field", () => {
      const entity = new CategoryEntity();
      expect(entity.language).toBeUndefined();

      entity.language = "en";
      expect(entity.language).toBe("en");

      entity.language = "fr";
      expect(entity.language).toBe("fr");
    });

    test("should allow setting createdAt field", () => {
      const entity = new CategoryEntity();
      const date = new Date();
      entity.createdAt = date;
      expect(entity.createdAt).toBe(date);
    });

    test("should allow setting updatedAt field", () => {
      const entity = new CategoryEntity();
      const date = new Date();
      entity.updatedAt = date;
      expect(entity.updatedAt).toBe(date);
    });

    test("should allow setting deletedAt field", () => {
      const entity = new CategoryEntity();
      expect(entity.deletedAt).toBeUndefined();

      const date = new Date();
      entity.deletedAt = date;
      expect(entity.deletedAt).toBe(date);
    });
  });

  describe("name field", () => {
    test("should allow setting name field", () => {
      const entity = new CategoryEntity();
      entity.name = "Technology";
      expect(entity.name).toBe("Technology");
    });

    test("should allow updating name field", () => {
      const entity = new CategoryEntity();
      entity.name = "Initial Name";
      expect(entity.name).toBe("Initial Name");

      entity.name = "Updated Name";
      expect(entity.name).toBe("Updated Name");
    });

    test("should handle empty string name", () => {
      const entity = new CategoryEntity();
      entity.name = "";
      expect(entity.name).toBe("");
    });

    test("should handle long name strings", () => {
      const entity = new CategoryEntity();
      const longName = "A".repeat(100);
      entity.name = longName;
      expect(entity.name).toBe(longName);
      expect(entity.name.length).toBe(100);
    });
  });

  describe("color field", () => {
    test("should have undefined color by default", () => {
      const entity = new CategoryEntity();
      expect(entity.color).toBeUndefined();
    });

    test("should allow setting color relation", () => {
      const entity = new CategoryEntity();
      const color = new ColorEntity();
      color.hex = "#FF5733";
      color.red = 255;
      color.green = 87;
      color.blue = 51;

      entity.color = color;
      expect(entity.color).toBe(color);
      expect(entity.color.hex).toBe("#FF5733");
    });

    test("should allow setting color to undefined", () => {
      const entity = new CategoryEntity();
      const color = new ColorEntity();
      entity.color = color;
      expect(entity.color).toBe(color);

      delete entity.color;
      expect(entity.color).toBeUndefined();
    });
  });

  describe("description field", () => {
    test("should have undefined description by default", () => {
      const entity = new CategoryEntity();
      expect(entity.description).toBeUndefined();
    });

    test("should allow setting description field", () => {
      const entity = new CategoryEntity();
      entity.description = "A category for technology-related items";
      expect(entity.description).toBe("A category for technology-related items");
    });

    test("should allow setting description to empty string", () => {
      const entity = new CategoryEntity();
      entity.description = "";
      expect(entity.description).toBe("");
    });

    test("should handle multiline description", () => {
      const entity = new CategoryEntity();
      const multilineDesc = "Line 1\nLine 2\nLine 3";
      entity.description = multilineDesc;
      expect(entity.description).toBe(multilineDesc);
    });

    test("should allow setting description to undefined", () => {
      const entity = new CategoryEntity();
      entity.description = "Some description";
      delete entity.description;
      expect(entity.description).toBeUndefined();
    });
  });

  describe("parent field", () => {
    test("should have undefined parent by default", () => {
      const entity = new CategoryEntity();
      expect(entity.parent).toBeUndefined();
    });

    test("should allow setting parent relation", () => {
      const parentCategory = new CategoryEntity();
      parentCategory.name = "Parent Category";

      const childCategory = new CategoryEntity();
      childCategory.name = "Child Category";
      childCategory.parent = parentCategory;

      expect(childCategory.parent).toBe(parentCategory);
      expect(childCategory.parent.name).toBe("Parent Category");
    });

    test("should allow setting parent to undefined", () => {
      const parentCategory = new CategoryEntity();
      parentCategory.name = "Parent";

      const childCategory = new CategoryEntity();
      childCategory.parent = parentCategory;
      expect(childCategory.parent).toBe(parentCategory);

      delete childCategory.parent;
      expect(childCategory.parent).toBeUndefined();
    });

    test("should allow nested parent hierarchy", () => {
      const grandparent = new CategoryEntity();
      grandparent.name = "Grandparent";

      const parent = new CategoryEntity();
      parent.name = "Parent";
      parent.parent = grandparent;

      const child = new CategoryEntity();
      child.name = "Child";
      child.parent = parent;

      expect(child.parent).toBe(parent);
      expect(child.parent.parent).toBe(grandparent);
      expect(child.parent.parent?.name).toBe("Grandparent");
    });
  });

  describe("children field", () => {
    test("should have undefined children by default", () => {
      const entity = new CategoryEntity();
      expect(entity.children).toBeUndefined();
    });

    test("should allow setting children array", () => {
      const parent = new CategoryEntity();
      parent.name = "Parent Category";

      const child1 = new CategoryEntity();
      child1.name = "Child 1";

      const child2 = new CategoryEntity();
      child2.name = "Child 2";

      parent.children = [child1, child2];

      expect(parent.children).toBeDefined();
      expect(parent.children?.length).toBe(2);
      expect(parent.children?.[0]?.name).toBe("Child 1");
      expect(parent.children?.[1]?.name).toBe("Child 2");
    });

    test("should allow setting empty children array", () => {
      const entity = new CategoryEntity();
      entity.children = [];
      expect(entity.children).toEqual([]);
      expect(entity.children?.length).toBe(0);
    });

    test("should allow setting children to undefined", () => {
      const parent = new CategoryEntity();
      const child = new CategoryEntity();
      parent.children = [child];
      expect(parent.children?.length).toBe(1);

      delete parent.children;
      expect(parent.children).toBeUndefined();
    });
  });

  describe("complete entity", () => {
    test("should allow setting all fields together", () => {
      const color = new ColorEntity();
      color.hex = "#00FF00";

      const parentCategory = new CategoryEntity();
      parentCategory.name = "Parent";

      const childCategory = new CategoryEntity();
      childCategory.name = "Child";

      const entity = new CategoryEntity();
      entity.name = "Test Category";
      entity.description = "A test category description";
      entity.color = color;
      entity.parent = parentCategory;
      entity.children = [childCategory];
      entity.isPublic = true;
      entity.isLocked = false;
      entity.isBlocked = false;
      entity.language = "en";

      expect(entity.id).toBeDefined();
      expect(entity.name).toBe("Test Category");
      expect(entity.description).toBe("A test category description");
      expect(entity.color).toBe(color);
      expect(entity.parent).toBe(parentCategory);
      expect(entity.children?.length).toBe(1);
      expect(entity.isPublic).toBe(true);
      expect(entity.isLocked).toBe(false);
      expect(entity.isBlocked).toBe(false);
      expect(entity.language).toBe("en");
    });
  });
});
