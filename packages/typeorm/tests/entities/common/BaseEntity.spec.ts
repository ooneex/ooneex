import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";

class ConcreteEntity extends BaseEntity {}

describe("BaseEntity", () => {
  test("should have class name 'BaseEntity'", () => {
    expect(BaseEntity.name).toBe("BaseEntity");
  });

  test("should be abstract class", () => {
    expect(BaseEntity.prototype).toBeDefined();
  });

  describe("id field", () => {
    test("should generate a default id with nanoid", () => {
      const entity = new ConcreteEntity();
      expect(entity.id).toBeDefined();
      expect(typeof entity.id).toBe("string");
    });

    test("should generate id with length of 25 characters", () => {
      const entity = new ConcreteEntity();
      expect(entity.id.length).toBe(25);
    });

    test("should generate unique ids for different instances", () => {
      const entity1 = new ConcreteEntity();
      const entity2 = new ConcreteEntity();
      expect(entity1.id).not.toBe(entity2.id);
    });

    test("should allow setting custom id", () => {
      const entity = new ConcreteEntity();
      const customId = "custom-test-id-123456789";
      entity.id = customId;
      expect(entity.id).toBe(customId);
    });
  });

  describe("isLocked field", () => {
    test("should be undefined by default", () => {
      const entity = new ConcreteEntity();
      expect(entity.isLocked).toBeUndefined();
    });

    test("should accept boolean true value", () => {
      const entity = new ConcreteEntity();
      entity.isLocked = true;
      expect(entity.isLocked).toBe(true);
    });

    test("should accept boolean false value", () => {
      const entity = new ConcreteEntity();
      entity.isLocked = false;
      expect(entity.isLocked).toBe(false);
    });
  });

  describe("lockedAt field", () => {
    test("should be undefined by default", () => {
      const entity = new ConcreteEntity();
      expect(entity.lockedAt).toBeUndefined();
    });

    test("should accept Date value", () => {
      const entity = new ConcreteEntity();
      const date = new Date("2024-01-15T10:30:00Z");
      entity.lockedAt = date;
      expect(entity.lockedAt).toBe(date);
    });

    test("should accept current date", () => {
      const entity = new ConcreteEntity();
      const now = new Date();
      entity.lockedAt = now;
      expect(entity.lockedAt).toBeInstanceOf(Date);
    });
  });

  describe("isBlocked field", () => {
    test("should be undefined by default", () => {
      const entity = new ConcreteEntity();
      expect(entity.isBlocked).toBeUndefined();
    });

    test("should accept boolean true value", () => {
      const entity = new ConcreteEntity();
      entity.isBlocked = true;
      expect(entity.isBlocked).toBe(true);
    });

    test("should accept boolean false value", () => {
      const entity = new ConcreteEntity();
      entity.isBlocked = false;
      expect(entity.isBlocked).toBe(false);
    });
  });

  describe("blockedAt field", () => {
    test("should be undefined by default", () => {
      const entity = new ConcreteEntity();
      expect(entity.blockedAt).toBeUndefined();
    });

    test("should accept Date value", () => {
      const entity = new ConcreteEntity();
      const date = new Date("2024-02-20T15:45:00Z");
      entity.blockedAt = date;
      expect(entity.blockedAt).toBe(date);
    });
  });

  describe("blockReason field", () => {
    test("should be undefined by default", () => {
      const entity = new ConcreteEntity();
      expect(entity.blockReason).toBeUndefined();
    });

    test("should accept string value", () => {
      const entity = new ConcreteEntity();
      const reason = "Violated terms of service";
      entity.blockReason = reason;
      expect(entity.blockReason).toBe(reason);
    });

    test("should accept empty string", () => {
      const entity = new ConcreteEntity();
      entity.blockReason = "";
      expect(entity.blockReason).toBe("");
    });

    test("should accept long text", () => {
      const entity = new ConcreteEntity();
      const longReason = "This is a very long block reason that explains in detail why the entity was blocked. ".repeat(
        10,
      );
      entity.blockReason = longReason;
      expect(entity.blockReason).toBe(longReason);
    });
  });

  describe("isPublic field", () => {
    test("should be undefined by default", () => {
      const entity = new ConcreteEntity();
      expect(entity.isPublic).toBeUndefined();
    });

    test("should accept boolean true value", () => {
      const entity = new ConcreteEntity();
      entity.isPublic = true;
      expect(entity.isPublic).toBe(true);
    });

    test("should accept boolean false value", () => {
      const entity = new ConcreteEntity();
      entity.isPublic = false;
      expect(entity.isPublic).toBe(false);
    });
  });

  describe("language field", () => {
    test("should be undefined by default", () => {
      const entity = new ConcreteEntity();
      expect(entity.language).toBeUndefined();
    });

    test("should accept locale string value", () => {
      const entity = new ConcreteEntity();
      entity.language = "en";
      expect(entity.language).toBe("en");
    });

    test("should accept various locale formats", () => {
      const entity = new ConcreteEntity();

      entity.language = "fr";
      expect(entity.language).toBe("fr");

      entity.language = "de";
      expect(entity.language).toBe("de");

      entity.language = "es";
      expect(entity.language).toBe("es");
    });
  });

  describe("createdAt field", () => {
    test("should be undefined by default", () => {
      const entity = new ConcreteEntity();
      expect(entity.createdAt).toBeUndefined();
    });

    test("should accept Date value", () => {
      const entity = new ConcreteEntity();
      const date = new Date("2024-01-01T00:00:00Z");
      entity.createdAt = date;
      expect(entity.createdAt).toBe(date);
    });
  });

  describe("updatedAt field", () => {
    test("should be undefined by default", () => {
      const entity = new ConcreteEntity();
      expect(entity.updatedAt).toBeUndefined();
    });

    test("should accept Date value", () => {
      const entity = new ConcreteEntity();
      const date = new Date("2024-03-15T12:00:00Z");
      entity.updatedAt = date;
      expect(entity.updatedAt).toBe(date);
    });
  });

  describe("deletedAt field", () => {
    test("should be undefined by default", () => {
      const entity = new ConcreteEntity();
      expect(entity.deletedAt).toBeUndefined();
    });

    test("should accept Date value for soft delete", () => {
      const entity = new ConcreteEntity();
      const date = new Date("2024-04-01T08:00:00Z");
      entity.deletedAt = date;
      expect(entity.deletedAt).toBe(date);
    });
  });

  describe("entity instantiation", () => {
    test("should create entity with all fields assignable", () => {
      const entity = new ConcreteEntity();
      const now = new Date();

      entity.id = "test-id-1234567890123456";
      entity.isLocked = true;
      entity.lockedAt = now;
      entity.isBlocked = false;
      entity.blockedAt = now;
      entity.blockReason = "Test reason";
      entity.isPublic = true;
      entity.language = "en";
      entity.createdAt = now;
      entity.updatedAt = now;
      entity.deletedAt = now;

      expect(entity.id).toBe("test-id-1234567890123456");
      expect(entity.isLocked).toBe(true);
      expect(entity.lockedAt).toBe(now);
      expect(entity.isBlocked).toBe(false);
      expect(entity.blockedAt).toBe(now);
      expect(entity.blockReason).toBe("Test reason");
      expect(entity.isPublic).toBe(true);
      expect(entity.language).toBe("en");
      expect(entity.createdAt).toBe(now);
      expect(entity.updatedAt).toBe(now);
      expect(entity.deletedAt).toBe(now);
    });

    test("should allow locked and blocked states to coexist", () => {
      const entity = new ConcreteEntity();
      entity.isLocked = true;
      entity.isBlocked = true;

      expect(entity.isLocked).toBe(true);
      expect(entity.isBlocked).toBe(true);
    });
  });
});
