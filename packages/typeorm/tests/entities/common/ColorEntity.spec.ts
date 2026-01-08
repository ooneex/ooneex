import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { ColorEntity } from "@/entities/common/ColorEntity";

describe("ColorEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(ColorEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(ColorEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new ColorEntity();
    expect(entity).toBeInstanceOf(ColorEntity);
  });

  describe("inherited BaseEntity fields", () => {
    test("should have id field auto-generated with 25 characters", () => {
      const entity = new ColorEntity();
      expect(entity.id).toBeDefined();
      expect(typeof entity.id).toBe("string");
      expect(entity.id.length).toBe(25);
    });

    test("should allow setting isLocked field", () => {
      const entity = new ColorEntity();
      entity.isLocked = true;
      expect(entity.isLocked).toBe(true);

      entity.isLocked = false;
      expect(entity.isLocked).toBe(false);
    });

    test("should allow setting lockedAt field", () => {
      const entity = new ColorEntity();
      const date = new Date("2024-01-15T10:30:00Z");
      entity.lockedAt = date;
      expect(entity.lockedAt).toEqual(date);
    });

    test("should allow setting isBlocked field", () => {
      const entity = new ColorEntity();
      entity.isBlocked = true;
      expect(entity.isBlocked).toBe(true);

      entity.isBlocked = false;
      expect(entity.isBlocked).toBe(false);
    });

    test("should allow setting blockedAt field", () => {
      const entity = new ColorEntity();
      const date = new Date("2024-02-20T14:45:00Z");
      entity.blockedAt = date;
      expect(entity.blockedAt).toEqual(date);
    });

    test("should allow setting blockReason field", () => {
      const entity = new ColorEntity();
      entity.blockReason = "Violation of terms";
      expect(entity.blockReason).toBe("Violation of terms");
    });

    test("should allow setting isPublic field", () => {
      const entity = new ColorEntity();
      entity.isPublic = true;
      expect(entity.isPublic).toBe(true);

      entity.isPublic = false;
      expect(entity.isPublic).toBe(false);
    });

    test("should allow setting language field", () => {
      const entity = new ColorEntity();
      entity.language = "en";
      expect(entity.language).toBe("en");

      entity.language = "fr";
      expect(entity.language).toBe("fr");
    });

    test("should allow setting createdAt field", () => {
      const entity = new ColorEntity();
      const date = new Date("2024-01-01T00:00:00Z");
      entity.createdAt = date;
      expect(entity.createdAt).toEqual(date);
    });

    test("should allow setting updatedAt field", () => {
      const entity = new ColorEntity();
      const date = new Date("2024-03-15T12:00:00Z");
      entity.updatedAt = date;
      expect(entity.updatedAt).toEqual(date);
    });

    test("should allow setting deletedAt field", () => {
      const entity = new ColorEntity();
      const date = new Date("2024-06-30T23:59:59Z");
      entity.deletedAt = date;
      expect(entity.deletedAt).toEqual(date);
    });
  });

  describe("ColorEntity specific fields", () => {
    test("should allow setting hex field", () => {
      const entity = new ColorEntity();
      entity.hex = "#FF5733";
      expect(entity.hex).toBe("#FF5733");
    });

    test("should allow setting hex field with lowercase", () => {
      const entity = new ColorEntity();
      entity.hex = "#ff5733";
      expect(entity.hex).toBe("#ff5733");
    });

    test("should allow setting rgb field", () => {
      const entity = new ColorEntity();
      entity.rgb = "rgb(255, 87, 51)";
      expect(entity.rgb).toBe("rgb(255, 87, 51)");
    });

    test("should allow setting rgba field", () => {
      const entity = new ColorEntity();
      entity.rgba = "rgba(255, 87, 51, 0.5)";
      expect(entity.rgba).toBe("rgba(255, 87, 51, 0.5)");
    });

    test("should allow setting hsl field", () => {
      const entity = new ColorEntity();
      entity.hsl = "hsl(11, 100%, 60%)";
      expect(entity.hsl).toBe("hsl(11, 100%, 60%)");
    });

    test("should allow setting hsla field", () => {
      const entity = new ColorEntity();
      entity.hsla = "hsla(11, 100%, 60%, 0.8)";
      expect(entity.hsla).toBe("hsla(11, 100%, 60%, 0.8)");
    });

    test("should allow setting alpha field", () => {
      const entity = new ColorEntity();
      entity.alpha = 0.75;
      expect(entity.alpha).toBe(0.75);
    });

    test("should allow setting alpha field to 0", () => {
      const entity = new ColorEntity();
      entity.alpha = 0;
      expect(entity.alpha).toBe(0);
    });

    test("should allow setting alpha field to 1", () => {
      const entity = new ColorEntity();
      entity.alpha = 1;
      expect(entity.alpha).toBe(1);
    });

    test("should allow setting red field", () => {
      const entity = new ColorEntity();
      entity.red = 255;
      expect(entity.red).toBe(255);
    });

    test("should allow setting red field to 0", () => {
      const entity = new ColorEntity();
      entity.red = 0;
      expect(entity.red).toBe(0);
    });

    test("should allow setting green field", () => {
      const entity = new ColorEntity();
      entity.green = 128;
      expect(entity.green).toBe(128);
    });

    test("should allow setting green field to 0", () => {
      const entity = new ColorEntity();
      entity.green = 0;
      expect(entity.green).toBe(0);
    });

    test("should allow setting blue field", () => {
      const entity = new ColorEntity();
      entity.blue = 64;
      expect(entity.blue).toBe(64);
    });

    test("should allow setting blue field to 0", () => {
      const entity = new ColorEntity();
      entity.blue = 0;
      expect(entity.blue).toBe(0);
    });

    test("should allow setting hue field", () => {
      const entity = new ColorEntity();
      entity.hue = 180;
      expect(entity.hue).toBe(180);
    });

    test("should allow setting hue field to 0", () => {
      const entity = new ColorEntity();
      entity.hue = 0;
      expect(entity.hue).toBe(0);
    });

    test("should allow setting hue field to 359", () => {
      const entity = new ColorEntity();
      entity.hue = 359;
      expect(entity.hue).toBe(359);
    });

    test("should allow setting saturation field", () => {
      const entity = new ColorEntity();
      entity.saturation = 75;
      expect(entity.saturation).toBe(75);
    });

    test("should allow setting saturation field to 0", () => {
      const entity = new ColorEntity();
      entity.saturation = 0;
      expect(entity.saturation).toBe(0);
    });

    test("should allow setting saturation field to 100", () => {
      const entity = new ColorEntity();
      entity.saturation = 100;
      expect(entity.saturation).toBe(100);
    });

    test("should allow setting lightness field", () => {
      const entity = new ColorEntity();
      entity.lightness = 50;
      expect(entity.lightness).toBe(50);
    });

    test("should allow setting lightness field to 0", () => {
      const entity = new ColorEntity();
      entity.lightness = 0;
      expect(entity.lightness).toBe(0);
    });

    test("should allow setting lightness field to 100", () => {
      const entity = new ColorEntity();
      entity.lightness = 100;
      expect(entity.lightness).toBe(100);
    });
  });

  describe("ColorEntity with all fields set", () => {
    test("should allow setting all color fields together", () => {
      const entity = new ColorEntity();

      entity.hex = "#FF5733";
      entity.rgb = "rgb(255, 87, 51)";
      entity.rgba = "rgba(255, 87, 51, 1)";
      entity.hsl = "hsl(11, 100%, 60%)";
      entity.hsla = "hsla(11, 100%, 60%, 1)";
      entity.alpha = 1;
      entity.red = 255;
      entity.green = 87;
      entity.blue = 51;
      entity.hue = 11;
      entity.saturation = 100;
      entity.lightness = 60;

      expect(entity.hex).toBe("#FF5733");
      expect(entity.rgb).toBe("rgb(255, 87, 51)");
      expect(entity.rgba).toBe("rgba(255, 87, 51, 1)");
      expect(entity.hsl).toBe("hsl(11, 100%, 60%)");
      expect(entity.hsla).toBe("hsla(11, 100%, 60%, 1)");
      expect(entity.alpha).toBe(1);
      expect(entity.red).toBe(255);
      expect(entity.green).toBe(87);
      expect(entity.blue).toBe(51);
      expect(entity.hue).toBe(11);
      expect(entity.saturation).toBe(100);
      expect(entity.lightness).toBe(60);
    });

    test("should have undefined optional fields by default", () => {
      const entity = new ColorEntity();

      expect(entity.hex).toBeUndefined();
      expect(entity.rgb).toBeUndefined();
      expect(entity.rgba).toBeUndefined();
      expect(entity.hsl).toBeUndefined();
      expect(entity.hsla).toBeUndefined();
      expect(entity.alpha).toBeUndefined();
      expect(entity.red).toBeUndefined();
      expect(entity.green).toBeUndefined();
      expect(entity.blue).toBeUndefined();
      expect(entity.hue).toBeUndefined();
      expect(entity.saturation).toBeUndefined();
      expect(entity.lightness).toBeUndefined();
    });

    test("should generate unique ids for different instances", () => {
      const entity1 = new ColorEntity();
      const entity2 = new ColorEntity();

      expect(entity1.id).not.toBe(entity2.id);
    });
  });
});
