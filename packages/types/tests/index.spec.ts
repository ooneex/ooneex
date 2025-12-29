import { describe, expect, test } from "bun:test";
import { type FilterResultType, HTTP_METHODS, type IBase, type IStat } from "../src/index";

describe("@ooneex/types - HTTP_METHODS", () => {
  test("should expose standard HTTP methods", () => {
    expect(HTTP_METHODS).toBeDefined();
    expect(Array.isArray(HTTP_METHODS)).toBe(true);
    expect(HTTP_METHODS.length).toBeGreaterThan(0);

    const expected = ["GET", "POST", "PUT", "DELETE", "PATCH", "OPTIONS", "HEAD"] as const;
    expect(HTTP_METHODS).toEqual(expected);
  });

  test("should contain only unique, upper‑case strings", () => {
    const unique = new Set(HTTP_METHODS);
    expect(unique.size).toBe(HTTP_METHODS.length);

    for (const method of HTTP_METHODS) {
      expect(typeof method).toBe("string");
      // Check uppercase format without widening the literal type
      expect(method.toUpperCase()).toMatch(/^[A-Z]+$/);
    }
  });
});

describe("@ooneex/types - IBase", () => {
  test("should allow minimal IBase implementation", () => {
    const base: IBase = {
      id: "1",
    };

    expect(base.id).toBe("1");
    // Optional flags should be undefined by default
    expect(base.isLocked).toBeUndefined();
    expect(base.createdAt).toBeUndefined();
  });

  test("should support typical audit fields", () => {
    const now = new Date();
    const base: IBase = {
      id: "2",
      createdAt: now,
      updatedAt: now,
      isBlocked: true,
      blockReason: "violation",
    };

    expect(base.createdAt).toBe(now);
    expect(base.updatedAt).toBe(now);
    expect(base.isBlocked).toBe(true);
    expect(base.blockReason).toBe("violation");
  });
});

describe("@ooneex/types - IStat", () => {
  test("should create a fully populated stats object", () => {
    const stat: IStat = {
      id: "stat-1",
      commentsCount: 1,
      likesCount: 2,
      dislikesCount: 3,
      sharesCount: 4,
      viewsCount: 5,
      downloadsCount: 6,
      savesCount: 7,
      bookmarksCount: 8,
      repostsCount: 9,
      impressionsCount: 10,
      clicksCount: 11,
      engagementRate: 0.5,
      reach: 100,
      followersCount: 0,
      followingCount: 0,
      blockedCount: 0,
      reportsCount: 0,
    };

    expect(stat.commentsCount).toBe(1);
    expect(stat.likesCount).toBe(2);
    expect(stat.dislikesCount).toBe(3);
    expect(stat.sharesCount).toBe(4);
    expect(stat.viewsCount).toBe(5);
    expect(stat.downloadsCount).toBe(6);
    expect(stat.savesCount).toBe(7);
    expect(stat.bookmarksCount).toBe(8);
    expect(stat.repostsCount).toBe(9);
    expect(stat.impressionsCount).toBe(10);
    expect(stat.clicksCount).toBe(11);
    expect(stat.engagementRate).toBe(0.5);
    expect(stat.reach).toBe(100);
  });
});

describe("@ooneex/types - FilterResultType", () => {
  function buildResult<T>(resources: T[], page = 1, limit = 10): FilterResultType<T> {
    const total = resources.length;
    const totalPages = Math.max(1, Math.ceil(total / limit));

    return {
      resources,
      total,
      totalPages,
      page,
      limit,
    };
  }

  test("should build a valid filter result for generic resources", () => {
    const resources = [
      { id: "1", name: "a" },
      { id: "2", name: "b" },
    ];

    const result = buildResult(resources, 1, 2);

    expect(result.resources).toEqual(resources);
    expect(result.total).toBe(2);
    expect(result.totalPages).toBe(1);
    expect(result.page).toBe(1);
    expect(result.limit).toBe(2);
  });

  test("should compute totalPages correctly for partial last page", () => {
    const resources = Array.from({ length: 5 }, (_, i) => ({ id: `${i}`, value: i }));

    const result = buildResult(resources, 1, 2);

    expect(result.total).toBe(5);
    expect(result.totalPages).toBe(3);
  });
});
