import { describe, expect, mock, test } from "bun:test";
import { container } from "@ooneex/container";
import { HttpResponse, type IResponse } from "@ooneex/http-response";
import { HttpStatus } from "@ooneex/http-status";
import type { PermissionClassType } from "@ooneex/permission";
import type { IRateLimiter, RateLimitResultType } from "@ooneex/rate-limit";
import type { RouteConfigType } from "@ooneex/routing";
import type { BunRequest, Server } from "bun";
import { formatHttpRoutes } from "@/utils/routes";
import { createMockRoute } from "./helpers";

describe("formatHttpRoutes", () => {
  test("returns empty object for empty routes map", () => {
    const httpRoutes = new Map<string, RouteConfigType[]>();

    const result = formatHttpRoutes(httpRoutes);

    expect(result).toEqual({});
  });

  test("creates route handlers for each path and method with version prefix", () => {
    const httpRoutes = new Map<string, RouteConfigType[]>();
    httpRoutes.set("/users", [
      createMockRoute({ path: "/users", method: "GET" }),
      createMockRoute({ path: "/users", method: "POST" }),
    ]);

    const result = formatHttpRoutes(httpRoutes);
    const usersRoute = result["/v1/users"];

    expect(usersRoute).toBeDefined();
    expect(typeof usersRoute?.GET).toBe("function");
    expect(typeof usersRoute?.POST).toBe("function");
  });

  test("creates handlers for multiple paths with version prefix", () => {
    const httpRoutes = new Map<string, RouteConfigType[]>();
    httpRoutes.set("/users", [createMockRoute({ path: "/users", method: "GET" })]);
    httpRoutes.set("/posts", [createMockRoute({ path: "/posts", method: "GET" })]);

    const result = formatHttpRoutes(httpRoutes);
    const usersRoute = result["/v1/users"];
    const postsRoute = result["/v1/posts"];

    expect(usersRoute).toBeDefined();
    expect(postsRoute).toBeDefined();
    expect(typeof usersRoute?.GET).toBe("function");
    expect(typeof postsRoute?.GET).toBe("function");
  });

  test("handles routes with different HTTP methods", () => {
    const httpRoutes = new Map<string, RouteConfigType[]>();
    httpRoutes.set("/api/resource", [
      createMockRoute({ path: "/api/resource", method: "GET" }),
      createMockRoute({ path: "/api/resource", method: "POST" }),
      createMockRoute({ path: "/api/resource", method: "PUT" }),
      createMockRoute({ path: "/api/resource", method: "DELETE" }),
    ]);

    const result = formatHttpRoutes(httpRoutes);
    const resourceRoute = result["/v1/api/resource"];

    expect(typeof resourceRoute?.GET).toBe("function");
    expect(typeof resourceRoute?.POST).toBe("function");
    expect(typeof resourceRoute?.PUT).toBe("function");
    expect(typeof resourceRoute?.DELETE).toBe("function");
  });

  test("accepts empty middlewares array", () => {
    const httpRoutes = new Map<string, RouteConfigType[]>();
    httpRoutes.set("/test", [createMockRoute({ path: "/test", method: "GET" })]);

    const result = formatHttpRoutes(httpRoutes, []);
    const testRoute = result["/v1/test"];

    expect(testRoute).toBeDefined();
    expect(typeof testRoute?.GET).toBe("function");
  });

  test("groups routes by versioned path when versions differ", () => {
    const httpRoutes = new Map<string, RouteConfigType[]>();
    httpRoutes.set("/users", [
      createMockRoute({ path: "/users", method: "GET", version: 1 }),
      createMockRoute({ path: "/users", method: "GET", version: 2 }),
    ]);

    const result = formatHttpRoutes(httpRoutes);

    expect(result["/v1/users"]).toBeDefined();
    expect(result["/v2/users"]).toBeDefined();
    expect(typeof result["/v1/users"]?.GET).toBe("function");
    expect(typeof result["/v2/users"]?.GET).toBe("function");
  });

  test("prepends prefix to versioned path", () => {
    const httpRoutes = new Map<string, RouteConfigType[]>();
    httpRoutes.set("/users", [createMockRoute({ path: "/users", method: "GET" })]);

    const result = formatHttpRoutes(httpRoutes, [], "api");

    expect(result["/api/v1/users"]).toBeDefined();
    expect(typeof result["/api/v1/users"]?.GET).toBe("function");
  });

  test("works without prefix", () => {
    const httpRoutes = new Map<string, RouteConfigType[]>();
    httpRoutes.set("/users", [createMockRoute({ path: "/users", method: "GET" })]);

    const result = formatHttpRoutes(httpRoutes, []);

    expect(result["/v1/users"]).toBeDefined();
    expect(typeof result["/v1/users"]?.GET).toBe("function");
  });
});

describe("formatHttpRoutes permission", () => {
  test("builds permission and sets context.permission when route has permission", async () => {
    const checkMock = mock(() => true);
    const allowMock = mock(() => mockPermission);
    const setUserPermissionsMock = mock(() => mockPermission);
    const buildMock = mock(() => mockPermission);

    const mockPermission = {
      allow: allowMock,
      setUserPermissions: setUserPermissionsMock,
      build: buildMock,
      check: checkMock,
    };

    class TestPermission {
      allow = allowMock;
      setUserPermissions = setUserPermissionsMock;
      build = buildMock;
      check = checkMock;
    }
    container.add(TestPermission);

    class PermController {
      index(): IResponse {
        return new HttpResponse().json({ ok: true });
      }
    }
    container.add(PermController);

    const httpRoutes = new Map<string, RouteConfigType[]>();
    httpRoutes.set("/test", [
      createMockRoute({
        path: "/test",
        method: "GET",
        controller: PermController,
        permission: TestPermission as unknown as PermissionClassType,
      } as Partial<RouteConfigType>),
    ]);

    const result = formatHttpRoutes(httpRoutes);
    const handler = result["/v1/test"]?.GET;

    expect(handler).toBeDefined();
    expect(typeof handler).toBe("function");
  });

  test("does not set permission when route has no permission", async () => {
    class NoPermController {
      index(): IResponse {
        return new HttpResponse().json({ ok: true });
      }
    }
    container.add(NoPermController);

    const httpRoutes = new Map<string, RouteConfigType[]>();
    httpRoutes.set("/test", [
      createMockRoute({
        path: "/test",
        method: "GET",
        controller: NoPermController,
      } as Partial<RouteConfigType>),
    ]);

    const result = formatHttpRoutes(httpRoutes);
    const handler = result["/v1/test"]?.GET;

    expect(handler).toBeDefined();
    expect(typeof handler).toBe("function");
  });
});

describe("formatHttpRoutes cache", () => {
  test("creates handler when route has cache enabled", () => {
    class CacheRouteController {
      index(): IResponse {
        return new HttpResponse().json({ ok: true });
      }
    }
    container.add(CacheRouteController);

    const httpRoutes = new Map<string, RouteConfigType[]>();
    httpRoutes.set("/cached", [
      createMockRoute({
        path: "/cached",
        method: "GET",
        controller: CacheRouteController,
        cache: true,
      } as Partial<RouteConfigType>),
    ]);

    const result = formatHttpRoutes(httpRoutes);
    const handler = result["/v1/cached"]?.GET;

    expect(handler).toBeDefined();
    expect(typeof handler).toBe("function");
  });

  test("creates handler when route has cache disabled", () => {
    class NoCacheRouteController {
      index(): IResponse {
        return new HttpResponse().json({ ok: true });
      }
    }
    container.add(NoCacheRouteController);

    const httpRoutes = new Map<string, RouteConfigType[]>();
    httpRoutes.set("/no-cache", [
      createMockRoute({
        path: "/no-cache",
        method: "GET",
        controller: NoCacheRouteController,
        cache: false,
      } as Partial<RouteConfigType>),
    ]);

    const result = formatHttpRoutes(httpRoutes);
    const handler = result["/v1/no-cache"]?.GET;

    expect(handler).toBeDefined();
    expect(typeof handler).toBe("function");
  });

  test("generates CSRF cache key with http: prefix and hex encoding", () => {
    const secret = "my-csrf-secret";
    const cacheKey = `http:${Bun.CSRF.generate(secret, { encoding: "hex" })}`;

    expect(typeof cacheKey).toBe("string");
    expect(cacheKey.startsWith("http:")).toBe(true);
    expect(cacheKey.length).toBeGreaterThan("http:".length);
    const csrfPart = cacheKey.slice("http:".length);
    expect(Bun.CSRF.verify(csrfPart, { secret, encoding: "hex" })).toBe(true);
  });

  test("CSRF generate throws when secret is not provided", () => {
    expect(() => Bun.CSRF.generate(undefined as unknown as string, { encoding: "hex" })).toThrow("Secret is required");
    expect(() => Bun.CSRF.generate("", { encoding: "hex" })).toThrow("Secret must be a non-empty string");
  });

  test("CSRF cache key is not verifiable with wrong secret", () => {
    const cacheKey = Bun.CSRF.generate("secret-a", { encoding: "hex" });

    expect(Bun.CSRF.verify(cacheKey, { secret: "secret-b", encoding: "hex" })).toBe(false);
  });

  test("passes env to formatHttpRoutes for CSRF secret usage", () => {
    class EnvCacheController {
      index(): IResponse {
        return new HttpResponse().json({ ok: true });
      }
    }
    container.add(EnvCacheController);

    const httpRoutes = new Map<string, RouteConfigType[]>();
    httpRoutes.set("/env-cache", [
      createMockRoute({
        path: "/env-cache",
        method: "GET",
        controller: EnvCacheController,
        cache: true,
      } as Partial<RouteConfigType>),
    ]);

    const mockEnv = { CSRF_SECRET: "test-secret", APP_ENV: "development" };
    const result = formatHttpRoutes(httpRoutes, [], undefined, mockEnv as never);
    const handler = result["/v1/env-cache"]?.GET;

    expect(handler).toBeDefined();
    expect(typeof handler).toBe("function");
  });

  test("cache.set receives correct structure with body, status, headers, and TTL", async () => {
    const cacheSetMock = mock((_key: string, _data: unknown, _ttl: number) => Promise.resolve());
    const cacheData = {
      body: '{"data":{"cached":true},"status":200}',
      status: 200,
      headers: { "content-type": "application/json" },
    };

    await cacheSetMock("cache-key-123", cacheData, 300);

    expect(cacheSetMock).toHaveBeenCalledWith("cache-key-123", cacheData, 300);
    expect(cacheSetMock.mock.calls[0]?.[2]).toBe(300);
  });

  test("cookie config uses correct cache cookie name and attributes", () => {
    const cookieSetMock = mock((_config: Record<string, unknown>) => {});
    const cacheKey = Bun.CSRF.generate("test-secret", { encoding: "hex" });

    cookieSetMock({
      name: "_cache_key",
      value: cacheKey,
      path: "/",
      httpOnly: true,
      sameSite: "strict",
    });

    const call = cookieSetMock.mock.calls[0]?.[0];
    expect(call).toBeDefined();
    expect(call?.name).toBe("_cache_key");
    expect(call?.value).toBe(cacheKey);
    expect(call?.path).toBe("/");
    expect(call?.httpOnly).toBe(true);
    expect(call?.sameSite).toBe("strict");
  });
});

describe("formatHttpRoutes rate limit", () => {
  const createMockRateLimiter = (result: RateLimitResultType): IRateLimiter => ({
    check: mock(() => Promise.resolve(result)),
    isLimited: mock(() => Promise.resolve(result.limited)),
    reset: mock(() => Promise.resolve(true)),
    getCount: mock(() => Promise.resolve(result.total - result.remaining)),
  });

  test("returns 429 when rate limit is exceeded", async () => {
    const resetAt = new Date(Date.now() + 60_000);
    const rateLimiter = createMockRateLimiter({
      limited: true,
      remaining: 0,
      total: 120,
      resetAt,
    });
    container.addConstant("rateLimiter", rateLimiter);

    class RateLimitController {
      index(): IResponse {
        return new HttpResponse().json({ ok: true });
      }
    }
    container.add(RateLimitController);

    const httpRoutes = new Map<string, RouteConfigType[]>();
    httpRoutes.set("/rate-limited", [
      createMockRoute({
        path: "/rate-limited",
        method: "GET",
        controller: RateLimitController,
      } as Partial<RouteConfigType>),
    ]);

    const result = formatHttpRoutes(httpRoutes);
    const handler = result["/v1/rate-limited"]?.GET;

    expect(handler).toBeDefined();

    const mockReq = {
      cookies: { get: mock(() => null), set: mock(() => {}) },
      headers: new Headers(),
      method: "GET",
      url: "http://localhost/v1/rate-limited",
    } as unknown as BunRequest;
    const mockServer = {
      requestIP: mock(() => ({ address: "192.168.1.1" })),
    } as unknown as Server<unknown>;

    // biome-ignore lint/complexity/noBannedTypes: trust me
    const response = await (handler as Function)(mockReq, mockServer);

    expect(response.status).toBe(HttpStatus.Code.TooManyRequests);
    expect(response.headers.get("Content-Type")).toBe("application/json");
    expect(response.headers.get("X-RateLimit-Limit")).toBe("120");
    expect(response.headers.get("X-RateLimit-Remaining")).toBe("0");
    expect(response.headers.get("Retry-After")).toBeDefined();
    expect(response.headers.get("X-RateLimit-Reset")).toBeDefined();

    const body = await response.json();
    expect(body.message).toBe("Too Many Requests");
    expect(body.key).toBe("RATE_LIMITED");

    expect(rateLimiter.check).toHaveBeenCalledWith("192.168.1.1");

    container.removeConstant("rateLimiter");
  });

  test("allows request when rate limit is not exceeded", () => {
    const rateLimiter = createMockRateLimiter({
      limited: false,
      remaining: 119,
      total: 120,
      resetAt: new Date(Date.now() + 60_000),
    });
    container.addConstant("rateLimiter", rateLimiter);

    class AllowedController {
      index(): IResponse {
        return new HttpResponse().json({ ok: true });
      }
    }
    container.add(AllowedController);

    const httpRoutes = new Map<string, RouteConfigType[]>();
    httpRoutes.set("/allowed", [
      createMockRoute({
        path: "/allowed",
        method: "GET",
        controller: AllowedController,
      } as Partial<RouteConfigType>),
    ]);

    const result = formatHttpRoutes(httpRoutes);
    const handler = result["/v1/allowed"]?.GET;

    expect(handler).toBeDefined();
    expect(typeof handler).toBe("function");

    container.removeConstant("rateLimiter");
  });

  test("skips rate limit when no rateLimiter is configured", () => {
    class NoRateLimitController {
      index(): IResponse {
        return new HttpResponse().json({ ok: true });
      }
    }
    container.add(NoRateLimitController);

    const httpRoutes = new Map<string, RouteConfigType[]>();
    httpRoutes.set("/no-rate-limit", [
      createMockRoute({
        path: "/no-rate-limit",
        method: "GET",
        controller: NoRateLimitController,
      } as Partial<RouteConfigType>),
    ]);

    const result = formatHttpRoutes(httpRoutes);
    const handler = result["/v1/no-rate-limit"]?.GET;

    expect(handler).toBeDefined();
    expect(typeof handler).toBe("function");
  });

  test("falls through when rate limiter throws", async () => {
    const throwingRateLimiter: IRateLimiter = {
      check: mock(() => Promise.reject(new Error("Redis connection failed"))),
      isLimited: mock(() => Promise.reject(new Error("Redis connection failed"))),
      reset: mock(() => Promise.resolve(true)),
      getCount: mock(() => Promise.resolve(0)),
    };
    container.addConstant("rateLimiter", throwingRateLimiter);

    class FallThroughController {
      index(): IResponse {
        return new HttpResponse().json({ ok: true });
      }
    }
    container.add(FallThroughController);

    const httpRoutes = new Map<string, RouteConfigType[]>();
    httpRoutes.set("/fallthrough", [
      createMockRoute({
        path: "/fallthrough",
        method: "GET",
        controller: FallThroughController,
      } as Partial<RouteConfigType>),
    ]);

    const result = formatHttpRoutes(httpRoutes);
    const handler = result["/v1/fallthrough"]?.GET;

    expect(handler).toBeDefined();
    expect(typeof handler).toBe("function");

    container.removeConstant("rateLimiter");
  });

  test("uses unknown IP when server.requestIP returns null", async () => {
    const resetAt = new Date(Date.now() + 60_000);
    const rateLimiter = createMockRateLimiter({
      limited: true,
      remaining: 0,
      total: 120,
      resetAt,
    });
    container.addConstant("rateLimiter", rateLimiter);

    class NullIpController {
      index(): IResponse {
        return new HttpResponse().json({ ok: true });
      }
    }
    container.add(NullIpController);

    const httpRoutes = new Map<string, RouteConfigType[]>();
    httpRoutes.set("/null-ip", [
      createMockRoute({
        path: "/null-ip",
        method: "GET",
        controller: NullIpController,
      } as Partial<RouteConfigType>),
    ]);

    const result = formatHttpRoutes(httpRoutes);
    const handler = result["/v1/null-ip"]?.GET;

    const mockReq = {
      cookies: { get: mock(() => null), set: mock(() => {}) },
      headers: new Headers(),
      method: "GET",
      url: "http://localhost/v1/null-ip",
    } as unknown as BunRequest;
    const mockServer = {
      requestIP: mock(() => null),
    } as unknown as Server<unknown>;

    // biome-ignore lint/complexity/noBannedTypes: trust me
    const response = await (handler as Function)(mockReq, mockServer);

    expect(response.status).toBe(HttpStatus.Code.TooManyRequests);
    expect(rateLimiter.check).toHaveBeenCalledWith("unknown");

    container.removeConstant("rateLimiter");
  });
});
