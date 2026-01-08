import { describe, expect, test } from "bun:test";
import { EStatus } from "@ooneex/status";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { ColorEntity } from "@/entities/common/ColorEntity";
import { StatusEntity } from "@/entities/common/StatusEntity";

describe("StatusEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(StatusEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(StatusEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new StatusEntity();
    expect(entity).toBeInstanceOf(StatusEntity);
  });

  describe("id field (inherited from BaseEntity)", () => {
    test("should have id with default nanoid value", () => {
      const entity = new StatusEntity();
      expect(entity.id).toBeDefined();
      expect(typeof entity.id).toBe("string");
      expect(entity.id.length).toBe(25);
    });

    test("should allow setting custom id", () => {
      const entity = new StatusEntity();
      entity.id = "custom-id-12345678901234";
      expect(entity.id).toBe("custom-id-12345678901234");
    });
  });

  describe("status field", () => {
    test("should allow setting status to DRAFT", () => {
      const entity = new StatusEntity();
      entity.status = EStatus.DRAFT;
      expect(entity.status).toBe(EStatus.DRAFT);
    });

    test("should allow setting status to PENDING", () => {
      const entity = new StatusEntity();
      entity.status = EStatus.PENDING;
      expect(entity.status).toBe(EStatus.PENDING);
    });

    test("should allow setting status to APPROVED", () => {
      const entity = new StatusEntity();
      entity.status = EStatus.APPROVED;
      expect(entity.status).toBe(EStatus.APPROVED);
    });

    test("should allow setting status to REJECTED", () => {
      const entity = new StatusEntity();
      entity.status = EStatus.REJECTED;
      expect(entity.status).toBe(EStatus.REJECTED);
    });

    test("should allow setting status to ACTIVE", () => {
      const entity = new StatusEntity();
      entity.status = EStatus.ACTIVE;
      expect(entity.status).toBe(EStatus.ACTIVE);
    });

    test("should allow setting status to INACTIVE", () => {
      const entity = new StatusEntity();
      entity.status = EStatus.INACTIVE;
      expect(entity.status).toBe(EStatus.INACTIVE);
    });

    test("should allow setting status to COMPLETED", () => {
      const entity = new StatusEntity();
      entity.status = EStatus.COMPLETED;
      expect(entity.status).toBe(EStatus.COMPLETED);
    });

    test("should allow setting status to FAILED", () => {
      const entity = new StatusEntity();
      entity.status = EStatus.FAILED;
      expect(entity.status).toBe(EStatus.FAILED);
    });
  });

  describe("color field", () => {
    test("should be undefined by default", () => {
      const entity = new StatusEntity();
      expect(entity.color).toBeUndefined();
    });

    test("should allow setting color relation", () => {
      const entity = new StatusEntity();
      const color = new ColorEntity();
      color.hex = "#FF0000";
      entity.color = color;
      expect(entity.color).toBe(color);
      expect(entity.color.hex).toBe("#FF0000");
    });

    test("should allow setting color to undefined", () => {
      const entity = new StatusEntity();
      const color = new ColorEntity();
      entity.color = color;
      entity.color = undefined;
      expect(entity.color).toBeUndefined();
    });
  });

  describe("description field", () => {
    test("should be undefined by default", () => {
      const entity = new StatusEntity();
      expect(entity.description).toBeUndefined();
    });

    test("should allow setting description", () => {
      const entity = new StatusEntity();
      entity.description = "This is a status description";
      expect(entity.description).toBe("This is a status description");
    });

    test("should allow setting description to empty string", () => {
      const entity = new StatusEntity();
      entity.description = "";
      expect(entity.description).toBe("");
    });

    test("should allow setting long description", () => {
      const entity = new StatusEntity();
      const longDescription = "A".repeat(1000);
      entity.description = longDescription;
      expect(entity.description).toBe(longDescription);
      expect(entity.description.length).toBe(1000);
    });

    test("should allow setting description to undefined", () => {
      const entity = new StatusEntity();
      entity.description = "Some description";
      entity.description = undefined;
      expect(entity.description).toBeUndefined();
    });
  });

  describe("reason field", () => {
    test("should be undefined by default", () => {
      const entity = new StatusEntity();
      expect(entity.reason).toBeUndefined();
    });

    test("should allow setting reason", () => {
      const entity = new StatusEntity();
      entity.reason = "Content violates community guidelines";
      expect(entity.reason).toBe("Content violates community guidelines");
    });

    test("should allow setting reason to empty string", () => {
      const entity = new StatusEntity();
      entity.reason = "";
      expect(entity.reason).toBe("");
    });

    test("should allow setting long reason", () => {
      const entity = new StatusEntity();
      const longReason = "B".repeat(500);
      entity.reason = longReason;
      expect(entity.reason).toBe(longReason);
      expect(entity.reason.length).toBe(500);
    });

    test("should allow setting reason to undefined", () => {
      const entity = new StatusEntity();
      entity.reason = "Some reason";
      entity.reason = undefined;
      expect(entity.reason).toBeUndefined();
    });
  });

  describe("isLocked field (inherited from BaseEntity)", () => {
    test("should be undefined by default", () => {
      const entity = new StatusEntity();
      expect(entity.isLocked).toBeUndefined();
    });

    test("should allow setting isLocked to true", () => {
      const entity = new StatusEntity();
      entity.isLocked = true;
      expect(entity.isLocked).toBe(true);
    });

    test("should allow setting isLocked to false", () => {
      const entity = new StatusEntity();
      entity.isLocked = false;
      expect(entity.isLocked).toBe(false);
    });
  });

  describe("lockedAt field (inherited from BaseEntity)", () => {
    test("should be undefined by default", () => {
      const entity = new StatusEntity();
      expect(entity.lockedAt).toBeUndefined();
    });

    test("should allow setting lockedAt date", () => {
      const entity = new StatusEntity();
      const date = new Date("2024-01-15T10:30:00Z");
      entity.lockedAt = date;
      expect(entity.lockedAt).toBe(date);
    });
  });

  describe("isBlocked field (inherited from BaseEntity)", () => {
    test("should be undefined by default", () => {
      const entity = new StatusEntity();
      expect(entity.isBlocked).toBeUndefined();
    });

    test("should allow setting isBlocked to true", () => {
      const entity = new StatusEntity();
      entity.isBlocked = true;
      expect(entity.isBlocked).toBe(true);
    });

    test("should allow setting isBlocked to false", () => {
      const entity = new StatusEntity();
      entity.isBlocked = false;
      expect(entity.isBlocked).toBe(false);
    });
  });

  describe("blockedAt field (inherited from BaseEntity)", () => {
    test("should be undefined by default", () => {
      const entity = new StatusEntity();
      expect(entity.blockedAt).toBeUndefined();
    });

    test("should allow setting blockedAt date", () => {
      const entity = new StatusEntity();
      const date = new Date("2024-02-20T14:45:00Z");
      entity.blockedAt = date;
      expect(entity.blockedAt).toBe(date);
    });
  });

  describe("blockReason field (inherited from BaseEntity)", () => {
    test("should be undefined by default", () => {
      const entity = new StatusEntity();
      expect(entity.blockReason).toBeUndefined();
    });

    test("should allow setting blockReason", () => {
      const entity = new StatusEntity();
      entity.blockReason = "Suspicious activity detected";
      expect(entity.blockReason).toBe("Suspicious activity detected");
    });
  });

  describe("isPublic field (inherited from BaseEntity)", () => {
    test("should be undefined by default", () => {
      const entity = new StatusEntity();
      expect(entity.isPublic).toBeUndefined();
    });

    test("should allow setting isPublic to true", () => {
      const entity = new StatusEntity();
      entity.isPublic = true;
      expect(entity.isPublic).toBe(true);
    });

    test("should allow setting isPublic to false", () => {
      const entity = new StatusEntity();
      entity.isPublic = false;
      expect(entity.isPublic).toBe(false);
    });
  });

  describe("language field (inherited from BaseEntity)", () => {
    test("should be undefined by default", () => {
      const entity = new StatusEntity();
      expect(entity.language).toBeUndefined();
    });

    test("should allow setting language", () => {
      const entity = new StatusEntity();
      entity.language = "en";
      expect(entity.language).toBe("en");
    });

    test("should allow setting different language codes", () => {
      const entity = new StatusEntity();
      entity.language = "fr";
      expect(entity.language).toBe("fr");

      entity.language = "de";
      expect(entity.language).toBe("de");
    });
  });

  describe("createdAt field (inherited from BaseEntity)", () => {
    test("should be undefined by default", () => {
      const entity = new StatusEntity();
      expect(entity.createdAt).toBeUndefined();
    });

    test("should allow setting createdAt date", () => {
      const entity = new StatusEntity();
      const date = new Date("2024-01-01T00:00:00Z");
      entity.createdAt = date;
      expect(entity.createdAt).toBe(date);
    });
  });

  describe("updatedAt field (inherited from BaseEntity)", () => {
    test("should be undefined by default", () => {
      const entity = new StatusEntity();
      expect(entity.updatedAt).toBeUndefined();
    });

    test("should allow setting updatedAt date", () => {
      const entity = new StatusEntity();
      const date = new Date("2024-06-15T12:00:00Z");
      entity.updatedAt = date;
      expect(entity.updatedAt).toBe(date);
    });
  });

  describe("deletedAt field (inherited from BaseEntity)", () => {
    test("should be undefined by default", () => {
      const entity = new StatusEntity();
      expect(entity.deletedAt).toBeUndefined();
    });

    test("should allow setting deletedAt date for soft delete", () => {
      const entity = new StatusEntity();
      const date = new Date("2024-12-31T23:59:59Z");
      entity.deletedAt = date;
      expect(entity.deletedAt).toBe(date);
    });
  });

  describe("complete entity creation", () => {
    test("should allow creating entity with all fields populated", () => {
      const entity = new StatusEntity();
      const color = new ColorEntity();
      color.hex = "#00FF00";

      entity.status = EStatus.APPROVED;
      entity.color = color;
      entity.description = "Request has been approved";
      entity.reason = "All requirements met";
      entity.isLocked = false;
      entity.isBlocked = false;
      entity.isPublic = true;
      entity.language = "en";
      entity.createdAt = new Date("2024-01-01T00:00:00Z");
      entity.updatedAt = new Date("2024-01-02T00:00:00Z");

      expect(entity.id).toBeDefined();
      expect(entity.status).toBe(EStatus.APPROVED);
      expect(entity.color).toBe(color);
      expect(entity.description).toBe("Request has been approved");
      expect(entity.reason).toBe("All requirements met");
      expect(entity.isLocked).toBe(false);
      expect(entity.isBlocked).toBe(false);
      expect(entity.isPublic).toBe(true);
      expect(entity.language).toBe("en");
      expect(entity.createdAt).toEqual(new Date("2024-01-01T00:00:00Z"));
      expect(entity.updatedAt).toEqual(new Date("2024-01-02T00:00:00Z"));
    });

    test("should allow creating rejected status entity", () => {
      const entity = new StatusEntity();
      const color = new ColorEntity();
      color.hex = "#FF0000";

      entity.status = EStatus.REJECTED;
      entity.color = color;
      entity.description = "Request has been rejected";
      entity.reason = "Missing required documents";

      expect(entity.status).toBe(EStatus.REJECTED);
      expect(entity.description).toBe("Request has been rejected");
      expect(entity.reason).toBe("Missing required documents");
    });
  });
});
