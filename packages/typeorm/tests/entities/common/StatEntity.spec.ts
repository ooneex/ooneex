import { describe, expect, test } from "bun:test";
import { BaseEntity } from "@/entities/common/BaseEntity";
import { StatEntity } from "@/entities/common/StatEntity";

describe("StatEntity", () => {
  test("should have class name ending with 'Entity'", () => {
    expect(StatEntity.name.endsWith("Entity")).toBe(true);
  });

  test("should extend BaseEntity", () => {
    expect(StatEntity.prototype instanceof BaseEntity).toBe(true);
  });

  test("should be instantiable", () => {
    const entity = new StatEntity();
    expect(entity).toBeInstanceOf(StatEntity);
  });

  describe("inherited BaseEntity fields", () => {
    test("should have 'id' field with auto-generated nanoid", () => {
      const entity = new StatEntity();
      expect(entity.id).toBeDefined();
      expect(typeof entity.id).toBe("string");
      expect(entity.id.length).toBe(25);
    });

    test("should generate unique 'id' for each instance", () => {
      const entity1 = new StatEntity();
      const entity2 = new StatEntity();
      expect(entity1.id).not.toBe(entity2.id);
    });

    test("should have 'isLocked' field", () => {
      const entity = new StatEntity();
      expect(entity.isLocked).toBeUndefined();
      entity.isLocked = true;
      expect(entity.isLocked).toBe(true);
      entity.isLocked = false;
      expect(entity.isLocked).toBe(false);
    });

    test("should have 'lockedAt' field", () => {
      const entity = new StatEntity();
      expect(entity.lockedAt).toBeUndefined();
      const date = new Date();
      entity.lockedAt = date;
      expect(entity.lockedAt).toBe(date);
    });

    test("should have 'isBlocked' field", () => {
      const entity = new StatEntity();
      expect(entity.isBlocked).toBeUndefined();
      entity.isBlocked = true;
      expect(entity.isBlocked).toBe(true);
      entity.isBlocked = false;
      expect(entity.isBlocked).toBe(false);
    });

    test("should have 'blockedAt' field", () => {
      const entity = new StatEntity();
      expect(entity.blockedAt).toBeUndefined();
      const date = new Date();
      entity.blockedAt = date;
      expect(entity.blockedAt).toBe(date);
    });

    test("should have 'blockReason' field", () => {
      const entity = new StatEntity();
      expect(entity.blockReason).toBeUndefined();
      entity.blockReason = "Spam activity detected";
      expect(entity.blockReason).toBe("Spam activity detected");
    });

    test("should have 'isPublic' field", () => {
      const entity = new StatEntity();
      expect(entity.isPublic).toBeUndefined();
      entity.isPublic = true;
      expect(entity.isPublic).toBe(true);
      entity.isPublic = false;
      expect(entity.isPublic).toBe(false);
    });

    test("should have 'language' field", () => {
      const entity = new StatEntity();
      expect(entity.language).toBeUndefined();
      entity.language = "en";
      expect(entity.language).toBe("en");
    });

    test("should have 'createdAt' field", () => {
      const entity = new StatEntity();
      expect(entity.createdAt).toBeUndefined();
      const date = new Date();
      entity.createdAt = date;
      expect(entity.createdAt).toBe(date);
    });

    test("should have 'updatedAt' field", () => {
      const entity = new StatEntity();
      expect(entity.updatedAt).toBeUndefined();
      const date = new Date();
      entity.updatedAt = date;
      expect(entity.updatedAt).toBe(date);
    });

    test("should have 'deletedAt' field", () => {
      const entity = new StatEntity();
      expect(entity.deletedAt).toBeUndefined();
      const date = new Date();
      entity.deletedAt = date;
      expect(entity.deletedAt).toBe(date);
    });
  });

  describe("StatEntity specific fields", () => {
    test("should have 'commentsCount' field with default value 0", () => {
      const entity = new StatEntity();
      expect(entity.commentsCount).toBe(0);
      entity.commentsCount = 150;
      expect(entity.commentsCount).toBe(150);
    });

    test("should have 'likesCount' field with default value 0", () => {
      const entity = new StatEntity();
      expect(entity.likesCount).toBe(0);
      entity.likesCount = 1000;
      expect(entity.likesCount).toBe(1000);
    });

    test("should have 'dislikesCount' field with default value 0", () => {
      const entity = new StatEntity();
      expect(entity.dislikesCount).toBe(0);
      entity.dislikesCount = 50;
      expect(entity.dislikesCount).toBe(50);
    });

    test("should have 'sharesCount' field with default value 0", () => {
      const entity = new StatEntity();
      expect(entity.sharesCount).toBe(0);
      entity.sharesCount = 200;
      expect(entity.sharesCount).toBe(200);
    });

    test("should have 'viewsCount' field with default value 0", () => {
      const entity = new StatEntity();
      expect(entity.viewsCount).toBe(0);
      entity.viewsCount = 10000;
      expect(entity.viewsCount).toBe(10000);
    });

    test("should have 'downloadsCount' field with default value 0", () => {
      const entity = new StatEntity();
      expect(entity.downloadsCount).toBe(0);
      entity.downloadsCount = 500;
      expect(entity.downloadsCount).toBe(500);
    });

    test("should have 'savesCount' field with default value 0", () => {
      const entity = new StatEntity();
      expect(entity.savesCount).toBe(0);
      entity.savesCount = 300;
      expect(entity.savesCount).toBe(300);
    });

    test("should have 'bookmarksCount' field with default value 0", () => {
      const entity = new StatEntity();
      expect(entity.bookmarksCount).toBe(0);
      entity.bookmarksCount = 75;
      expect(entity.bookmarksCount).toBe(75);
    });

    test("should have 'repostsCount' field with default value 0", () => {
      const entity = new StatEntity();
      expect(entity.repostsCount).toBe(0);
      entity.repostsCount = 120;
      expect(entity.repostsCount).toBe(120);
    });

    test("should have 'impressionsCount' field with default value 0", () => {
      const entity = new StatEntity();
      expect(entity.impressionsCount).toBe(0);
      entity.impressionsCount = 50000;
      expect(entity.impressionsCount).toBe(50000);
    });

    test("should have 'clicksCount' field with default value 0", () => {
      const entity = new StatEntity();
      expect(entity.clicksCount).toBe(0);
      entity.clicksCount = 2500;
      expect(entity.clicksCount).toBe(2500);
    });

    test("should have 'engagementRate' field with default value 0", () => {
      const entity = new StatEntity();
      expect(entity.engagementRate).toBe(0);
      entity.engagementRate = 0.0523;
      expect(entity.engagementRate).toBe(0.0523);
    });

    test("should have 'reach' field with default value 0", () => {
      const entity = new StatEntity();
      expect(entity.reach).toBe(0);
      entity.reach = 25000;
      expect(entity.reach).toBe(25000);
    });

    test("should have 'followersCount' field with default value 0", () => {
      const entity = new StatEntity();
      expect(entity.followersCount).toBe(0);
      entity.followersCount = 5000;
      expect(entity.followersCount).toBe(5000);
    });

    test("should have 'followingCount' field with default value 0", () => {
      const entity = new StatEntity();
      expect(entity.followingCount).toBe(0);
      entity.followingCount = 250;
      expect(entity.followingCount).toBe(250);
    });

    test("should have 'blockedCount' field with default value 0", () => {
      const entity = new StatEntity();
      expect(entity.blockedCount).toBe(0);
      entity.blockedCount = 10;
      expect(entity.blockedCount).toBe(10);
    });

    test("should have 'reportsCount' field with default value 0", () => {
      const entity = new StatEntity();
      expect(entity.reportsCount).toBe(0);
      entity.reportsCount = 3;
      expect(entity.reportsCount).toBe(3);
    });
  });

  describe("field assignments", () => {
    test("should allow setting all stat fields at once", () => {
      const entity = new StatEntity();
      entity.commentsCount = 100;
      entity.likesCount = 500;
      entity.dislikesCount = 25;
      entity.sharesCount = 80;
      entity.viewsCount = 5000;
      entity.downloadsCount = 200;
      entity.savesCount = 150;
      entity.bookmarksCount = 60;
      entity.repostsCount = 40;
      entity.impressionsCount = 20000;
      entity.clicksCount = 1000;
      entity.engagementRate = 0.0456;
      entity.reach = 15000;
      entity.followersCount = 3000;
      entity.followingCount = 100;
      entity.blockedCount = 5;
      entity.reportsCount = 2;

      expect(entity.commentsCount).toBe(100);
      expect(entity.likesCount).toBe(500);
      expect(entity.dislikesCount).toBe(25);
      expect(entity.sharesCount).toBe(80);
      expect(entity.viewsCount).toBe(5000);
      expect(entity.downloadsCount).toBe(200);
      expect(entity.savesCount).toBe(150);
      expect(entity.bookmarksCount).toBe(60);
      expect(entity.repostsCount).toBe(40);
      expect(entity.impressionsCount).toBe(20000);
      expect(entity.clicksCount).toBe(1000);
      expect(entity.engagementRate).toBe(0.0456);
      expect(entity.reach).toBe(15000);
      expect(entity.followersCount).toBe(3000);
      expect(entity.followingCount).toBe(100);
      expect(entity.blockedCount).toBe(5);
      expect(entity.reportsCount).toBe(2);
    });

    test("should handle large integer values", () => {
      const entity = new StatEntity();
      entity.viewsCount = 1000000000;
      entity.impressionsCount = 2147483647;
      expect(entity.viewsCount).toBe(1000000000);
      expect(entity.impressionsCount).toBe(2147483647);
    });

    test("should handle decimal engagement rate values", () => {
      const entity = new StatEntity();
      entity.engagementRate = 0.9999;
      expect(entity.engagementRate).toBe(0.9999);
      entity.engagementRate = 0.0001;
      expect(entity.engagementRate).toBe(0.0001);
    });
  });
});
