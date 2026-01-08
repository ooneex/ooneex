import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { ColorEntity } from "@/entities/common/ColorEntity";
import { TagEntity } from "@/entities/common/TagEntity";

describe("TagEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(TagEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(TagEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new TagEntity();
    expect(entity).toBeInstanceOf(TagEntity);
  });

  describe("inherited fields from BaseEntity", () => {
    test("should have id field with default nanoid value", () => {
      const entity = new TagEntity();
      expect(entity.id).toBeDefined();
      expect(typeof entity.id).toBe("string");
      expect(entity.id.length).toBe(25);
    });

    test("should generate unique id for each instance", () => {
      const entity1 = new TagEntity();
      const entity2 = new TagEntity();
      expect(entity1.id).not.toBe(entity2.id);
    });

    test("should allow setting custom id", () => {
      const entity = new TagEntity();
      const customId = "custom-id-123456789012345";
      entity.id = customId;
      expect(entity.id).toBe(customId);
    });

    test("should have isLocked field defaulting to undefined", () => {
      const entity = new TagEntity();
      expect(entity.isLocked).toBeUndefined();
    });

    test("should allow setting isLocked to true", () => {
      const entity = new TagEntity();
      entity.isLocked = true;
      expect(entity.isLocked).toBe(true);
    });

    test("should allow setting isLocked to false", () => {
      const entity = new TagEntity();
      entity.isLocked = false;
      expect(entity.isLocked).toBe(false);
    });

    test("should have lockedAt field defaulting to undefined", () => {
      const entity = new TagEntity();
      expect(entity.lockedAt).toBeUndefined();
    });

    test("should allow setting lockedAt to a Date", () => {
      const entity = new TagEntity();
      const date = new Date("2024-01-15T10:30:00Z");
      entity.lockedAt = date;
      expect(entity.lockedAt).toBe(date);
    });

    test("should have isBlocked field defaulting to undefined", () => {
      const entity = new TagEntity();
      expect(entity.isBlocked).toBeUndefined();
    });

    test("should allow setting isBlocked to true", () => {
      const entity = new TagEntity();
      entity.isBlocked = true;
      expect(entity.isBlocked).toBe(true);
    });

    test("should allow setting isBlocked to false", () => {
      const entity = new TagEntity();
      entity.isBlocked = false;
      expect(entity.isBlocked).toBe(false);
    });

    test("should have blockedAt field defaulting to undefined", () => {
      const entity = new TagEntity();
      expect(entity.blockedAt).toBeUndefined();
    });

    test("should allow setting blockedAt to a Date", () => {
      const entity = new TagEntity();
      const date = new Date("2024-02-20T14:45:00Z");
      entity.blockedAt = date;
      expect(entity.blockedAt).toBe(date);
    });

    test("should have blockReason field defaulting to undefined", () => {
      const entity = new TagEntity();
      expect(entity.blockReason).toBeUndefined();
    });

    test("should allow setting blockReason", () => {
      const entity = new TagEntity();
      const reason = "Violation of community guidelines";
      entity.blockReason = reason;
      expect(entity.blockReason).toBe(reason);
    });

    test("should have isPublic field defaulting to undefined", () => {
      const entity = new TagEntity();
      expect(entity.isPublic).toBeUndefined();
    });

    test("should allow setting isPublic to true", () => {
      const entity = new TagEntity();
      entity.isPublic = true;
      expect(entity.isPublic).toBe(true);
    });

    test("should allow setting isPublic to false", () => {
      const entity = new TagEntity();
      entity.isPublic = false;
      expect(entity.isPublic).toBe(false);
    });

    test("should have language field defaulting to undefined", () => {
      const entity = new TagEntity();
      expect(entity.language).toBeUndefined();
    });

    test("should allow setting language", () => {
      const entity = new TagEntity();
      entity.language = "en";
      expect(entity.language).toBe("en");
    });

    test("should allow setting different language values", () => {
      const entity = new TagEntity();
      entity.language = "fr";
      expect(entity.language).toBe("fr");

      entity.language = "es";
      expect(entity.language).toBe("es");
    });

    test("should have createdAt field defaulting to undefined", () => {
      const entity = new TagEntity();
      expect(entity.createdAt).toBeUndefined();
    });

    test("should allow setting createdAt to a Date", () => {
      const entity = new TagEntity();
      const date = new Date("2024-01-01T00:00:00Z");
      entity.createdAt = date;
      expect(entity.createdAt).toBe(date);
    });

    test("should have updatedAt field defaulting to undefined", () => {
      const entity = new TagEntity();
      expect(entity.updatedAt).toBeUndefined();
    });

    test("should allow setting updatedAt to a Date", () => {
      const entity = new TagEntity();
      const date = new Date("2024-03-10T08:00:00Z");
      entity.updatedAt = date;
      expect(entity.updatedAt).toBe(date);
    });

    test("should have deletedAt field defaulting to undefined", () => {
      const entity = new TagEntity();
      expect(entity.deletedAt).toBeUndefined();
    });

    test("should allow setting deletedAt to a Date", () => {
      const entity = new TagEntity();
      const date = new Date("2024-04-05T16:30:00Z");
      entity.deletedAt = date;
      expect(entity.deletedAt).toBe(date);
    });
  });

  describe("name field", () => {
    test("should have name field initially undefined", () => {
      const entity = new TagEntity();
      expect(entity.name).toBeUndefined();
    });

    test("should allow setting name", () => {
      const entity = new TagEntity();
      entity.name = "JavaScript";
      expect(entity.name).toBe("JavaScript");
    });

    test("should allow setting different name values", () => {
      const entity = new TagEntity();
      entity.name = "TypeScript";
      expect(entity.name).toBe("TypeScript");

      entity.name = "React";
      expect(entity.name).toBe("React");
    });

    test("should allow setting empty string name", () => {
      const entity = new TagEntity();
      entity.name = "";
      expect(entity.name).toBe("");
    });

    test("should allow setting name with special characters", () => {
      const entity = new TagEntity();
      entity.name = "C++ & C#";
      expect(entity.name).toBe("C++ & C#");
    });

    test("should allow setting name with unicode characters", () => {
      const entity = new TagEntity();
      entity.name = "日本語タグ";
      expect(entity.name).toBe("日本語タグ");
    });

    test("should allow setting name up to max length", () => {
      const entity = new TagEntity();
      const maxLengthName = "a".repeat(100);
      entity.name = maxLengthName;
      expect(entity.name).toBe(maxLengthName);
      expect(entity.name.length).toBe(100);
    });
  });

  describe("color field", () => {
    test("should have color field initially undefined", () => {
      const entity = new TagEntity();
      expect(entity.color).toBeUndefined();
    });

    test("should allow setting color to a ColorEntity", () => {
      const entity = new TagEntity();
      const color = new ColorEntity();
      color.hex = "#FF5733";
      entity.color = color;
      expect(entity.color).toBe(color);
      expect(entity.color.hex).toBe("#FF5733");
    });

    test("should allow setting color with full color properties", () => {
      const entity = new TagEntity();
      const color = new ColorEntity();
      color.hex = "#3498DB";
      color.red = 52;
      color.green = 152;
      color.blue = 219;
      color.alpha = 1;
      entity.color = color;

      expect(entity.color).toBe(color);
      expect(entity.color.hex).toBe("#3498DB");
      expect(entity.color.red).toBe(52);
      expect(entity.color.green).toBe(152);
      expect(entity.color.blue).toBe(219);
      expect(entity.color.alpha).toBe(1);
    });

    test("should allow setting color to undefined", () => {
      const entity = new TagEntity();
      const color = new ColorEntity();
      entity.color = color;
      expect(entity.color).toBeDefined();

      entity.color = undefined;
      expect(entity.color).toBeUndefined();
    });

    test("should allow reassigning color", () => {
      const entity = new TagEntity();
      const color1 = new ColorEntity();
      color1.hex = "#FF0000";
      const color2 = new ColorEntity();
      color2.hex = "#00FF00";

      entity.color = color1;
      expect(entity.color.hex).toBe("#FF0000");

      entity.color = color2;
      expect(entity.color.hex).toBe("#00FF00");
    });
  });

  describe("entity initialization", () => {
    test("should create entity with all fields set", () => {
      const entity = new TagEntity();
      const color = new ColorEntity();
      color.hex = "#9B59B6";

      entity.name = "Backend";
      entity.color = color;
      entity.isLocked = false;
      entity.isBlocked = false;
      entity.isPublic = true;
      entity.language = "en";
      entity.createdAt = new Date("2024-01-01T00:00:00Z");
      entity.updatedAt = new Date("2024-01-02T00:00:00Z");

      expect(entity.id).toBeDefined();
      expect(entity.name).toBe("Backend");
      expect(entity.color?.hex).toBe("#9B59B6");
      expect(entity.isLocked).toBe(false);
      expect(entity.isBlocked).toBe(false);
      expect(entity.isPublic).toBe(true);
      expect(entity.language).toBe("en");
      expect(entity.createdAt).toEqual(new Date("2024-01-01T00:00:00Z"));
      expect(entity.updatedAt).toEqual(new Date("2024-01-02T00:00:00Z"));
    });

    test("should create multiple independent entities", () => {
      const entity1 = new TagEntity();
      entity1.name = "Frontend";

      const entity2 = new TagEntity();
      entity2.name = "DevOps";

      expect(entity1.name).toBe("Frontend");
      expect(entity2.name).toBe("DevOps");
      expect(entity1.id).not.toBe(entity2.id);
    });
  });
});
