import { describe, expect, mock, test } from "bun:test";
import { Environment } from "@ooneex/app-env";
import { container } from "@ooneex/container";
import type { ContextType } from "@ooneex/controller";
import { Exception } from "@ooneex/exception";
import { HttpResponse, type IResponse } from "@ooneex/http-response";
import { HttpStatus } from "@ooneex/http-status";
import type { MiddlewareClassType } from "@ooneex/middleware";
import type { PermissionClassType } from "@ooneex/permission";
import type { IRateLimiter, RateLimitResultType } from "@ooneex/rate-limit";
import { ERole } from "@ooneex/role";
import type { RouteConfigType } from "@ooneex/routing";
import { type AssertType, type IAssert, type } from "@ooneex/validation";
import type { BunRequest, Server } from "bun";
import {
  checkAllowedUsers,
  formatHttpRoutes,
  httpRouteHandler,
  runMiddlewares,
  validateConstraint,
  validateResponse,
  validateRouteAccess,
} from "@/httpRouteUtils";

const createMockHeader = () => ({
  get: mock(() => null),
  getReferer: mock(() => null),
});

const createMockLogger = () => ({
  success: mock(() => {}),
  info: mock(() => {}),
  warn: mock(() => {}),
  error: mock(() => {}),
});

const createMockContext = (overrides: { [K in keyof ContextType]?: ContextType[K] | undefined } = {}): ContextType => {
  const response = new HttpResponse();
  return {
    logger: createMockLogger() as unknown as ContextType["logger"],
    analytics: {} as ContextType["analytics"],
    cache: {} as ContextType["cache"],
    storage: {} as ContextType["storage"],
    mailer: {} as ContextType["mailer"],
    database: {} as ContextType["database"],
    route: {
      name: "api.test.list",
      path: "/test" as const,
      method: "GET" as const,
      version: "v1" as const,
      description: "Test route",
    },
    env: { APP_ENV: Environment.DEVELOPMENT } as unknown as ContextType["env"],
    response,
    request: {} as ContextType["request"],
    params: {},
    payload: {},
    queries: {},
    method: "GET",
    header: createMockHeader() as unknown as ContextType["header"],
    files: {},
    ip: "127.0.0.1",
    host: "localhost",
    lang: {} as ContextType["lang"],
    user: null,
    ...overrides,
  } as ContextType;
};

class DefaultTestController {
  index(): IResponse {
    return new HttpResponse().json({});
  }
}

const createMockRoute = (overrides: Record<string, unknown> = {}): RouteConfigType => {
  const base: RouteConfigType = {
    name: "api.test.list",
    path: "/test",
    method: "GET",
    version: 1,
    controller: DefaultTestController,
    description: "Test route",
    isSocket: false,
  };
  return { ...base, ...overrides } as RouteConfigType;
};

describe("httpRouteUtils", () => {
  describe("validateConstraint", () => {
    test("returns null for valid IAssert constraint", () => {
      const constraint = {
        getConstraint: () => type("string"),
        getErrorMessage: () => null,
        validate: () => ({ isValid: true }),
      } satisfies IAssert;

      const result = validateConstraint(constraint, "test-value");

      expect(result).toBeNull();
    });

    test("returns error message for invalid IAssert constraint", () => {
      const constraint = {
        getConstraint: () => type("string"),
        getErrorMessage: () => "Custom error message",
        validate: () => ({ isValid: false, message: "Custom error message" }),
      } satisfies IAssert;

      const result = validateConstraint(constraint, "invalid-value");

      expect(result).toBe("Custom error message");
    });

    test("returns default message when IAssert validation fails without message", () => {
      const constraint = {
        getConstraint: () => type("string"),
        getErrorMessage: () => null,
        validate: () => ({ isValid: false }),
      } satisfies IAssert;

      const result = validateConstraint(constraint, "invalid-value");

      expect(result).toBe("Validation failed");
    });

    test("returns null for valid arktype constraint", () => {
      const constraint = type("string");

      const result = validateConstraint(constraint, "valid-string");

      expect(result).toBeNull();
    });

    test("returns error summary for invalid arktype constraint", () => {
      const constraint = type("number");

      const result = validateConstraint(constraint, "not-a-number");

      expect(result).not.toBeNull();
      expect(typeof result).toBe("string");
    });

    test("returns null when constraint is null", () => {
      const result = validateConstraint(null as unknown as AssertType | IAssert, "value");

      expect(result).toBeNull();
    });

    test("returns null for non-function non-object constraint", () => {
      const result = validateConstraint("invalid-constraint" as unknown as AssertType | IAssert, "value");

      expect(result).toBeNull();
    });
  });

  describe("validateRouteAccess", () => {
    test("returns null when route has no restrictions", async () => {
      const context = createMockContext();
      const route = createMockRoute();

      const result = await validateRouteAccess(context, route, Environment.DEVELOPMENT);

      expect(result).toBeNull();
    });

    describe("params validation", () => {
      test("returns null when params are valid", async () => {
        const context = createMockContext({ params: { id: "123" } });
        const route = createMockRoute({
          params: {
            id: type("string"),
          },
        });

        const result = await validateRouteAccess(context, route, Environment.DEVELOPMENT);

        expect(result).toBeNull();
      });

      test("returns error when params are invalid", async () => {
        const context = createMockContext({ params: { id: 123 } });
        const route = createMockRoute({
          params: {
            id: type("string"),
          },
        });

        const result = await validateRouteAccess(context, route, Environment.DEVELOPMENT);

        expect(result).not.toBeNull();
        expect(result?.status).toBe(HttpStatus.Code.BadRequest);
        expect(result?.message).toContain('Invalid parameter "id"');
        expect(result?.key).toBe("INVALID_PARAMETER");
      });
    });

    describe("queries validation", () => {
      test("returns null when queries are valid", async () => {
        const context = createMockContext({ queries: { page: "1" } as unknown as ContextType["queries"] });
        const route = createMockRoute({
          queries: type({ page: "string" }),
        });

        const result = await validateRouteAccess(context, route, Environment.DEVELOPMENT);

        expect(result).toBeNull();
      });

      test("returns error when queries are invalid", async () => {
        const context = createMockContext({ queries: { page: 123 } });
        const route = createMockRoute({
          queries: type({ page: "string" }),
        });

        const result = await validateRouteAccess(context, route, Environment.DEVELOPMENT);

        expect(result).not.toBeNull();
        expect(result?.status).toBe(HttpStatus.Code.BadRequest);
        expect(result?.message).toContain("Invalid query parameters");
        expect(result?.key).toBe("INVALID_QUERY");
      });
    });

    describe("payload validation", () => {
      test("returns null when payload is valid", async () => {
        const context = createMockContext({ payload: { name: "test" } });
        const route = createMockRoute({
          payload: type({ name: "string" }),
        });

        const result = await validateRouteAccess(context, route, Environment.DEVELOPMENT);

        expect(result).toBeNull();
      });

      test("returns error when payload is invalid", async () => {
        const context = createMockContext({ payload: { name: 123 } });
        const route = createMockRoute({
          payload: type({ name: "string" }),
        });

        const result = await validateRouteAccess(context, route, Environment.DEVELOPMENT);

        expect(result).not.toBeNull();
        expect(result?.status).toBe(HttpStatus.Code.BadRequest);
        expect(result?.message).toContain("Invalid payload");
        expect(result?.key).toBe("INVALID_PAYLOAD");
      });
    });

    describe("environment validation", () => {
      test("returns null when env is allowed", async () => {
        const context = createMockContext();
        const route = createMockRoute({
          env: [Environment.DEVELOPMENT, Environment.TESTING],
        });

        const result = await validateRouteAccess(context, route, Environment.DEVELOPMENT);

        expect(result).toBeNull();
      });

      test("returns error when env is not allowed", async () => {
        const context = createMockContext();
        const route = createMockRoute({
          name: "api.test.list",
          env: [Environment.PRODUCTION],
        });

        const result = await validateRouteAccess(context, route, Environment.DEVELOPMENT);

        expect(result).not.toBeNull();
        expect(result?.status).toBe(HttpStatus.Code.NotAcceptable);
        expect(result?.message).toContain('Route "api.test.list" is not available in "development" environment');
        expect(result?.key).toBe("ROUTE_ENV_NOT_ALLOWED");
      });

      test("returns null when env array is empty", async () => {
        const context = createMockContext();
        const route = createMockRoute({ env: [] });

        const result = await validateRouteAccess(context, route, Environment.DEVELOPMENT);

        expect(result).toBeNull();
      });
    });

    describe("IP validation", () => {
      test("returns null when IP is allowed", async () => {
        const context = createMockContext({ ip: "192.168.1.1" });
        const route = createMockRoute({
          ip: ["192.168.1.1", "10.0.0.1"],
        });

        const result = await validateRouteAccess(context, route, Environment.DEVELOPMENT);

        expect(result).toBeNull();
      });

      test("returns error when IP is not allowed", async () => {
        const context = createMockContext({ ip: "192.168.1.100" });
        const route = createMockRoute({
          name: "api.test.list",
          ip: ["192.168.1.1", "10.0.0.1"],
        });

        const result = await validateRouteAccess(context, route, Environment.DEVELOPMENT);

        expect(result).not.toBeNull();
        expect(result?.status).toBe(HttpStatus.Code.NotAcceptable);
        expect(result?.message).toContain('Route "api.test.list" is not available for IP "192.168.1.100"');
        expect(result?.key).toBe("ROUTE_IP_NOT_ALLOWED");
      });

      test("returns error when context IP is null", async () => {
        const context = createMockContext({ ip: null });
        const route = createMockRoute({
          name: "api.test.list",
          ip: ["192.168.1.1"],
        });

        const result = await validateRouteAccess(context, route, Environment.DEVELOPMENT);

        expect(result).not.toBeNull();
        expect(result?.status).toBe(HttpStatus.Code.NotAcceptable);
        expect(result?.key).toBe("ROUTE_IP_NOT_ALLOWED");
      });

      test("returns null when IP array is empty", async () => {
        const context = createMockContext({ ip: "192.168.1.100" });
        const route = createMockRoute({ ip: [] });

        const result = await validateRouteAccess(context, route, Environment.DEVELOPMENT);

        expect(result).toBeNull();
      });
    });

    describe("host validation", () => {
      test("returns null when host is allowed", async () => {
        const context = createMockContext({ host: "example.com" });
        const route = createMockRoute({
          host: ["example.com", "api.example.com"],
        });

        const result = await validateRouteAccess(context, route, Environment.DEVELOPMENT);

        expect(result).toBeNull();
      });

      test("returns error when host is not allowed", async () => {
        const context = createMockContext({ host: "evil.com" });
        const route = createMockRoute({
          name: "api.test.list",
          host: ["example.com", "api.example.com"],
        });

        const result = await validateRouteAccess(context, route, Environment.DEVELOPMENT);

        expect(result).not.toBeNull();
        expect(result?.status).toBe(HttpStatus.Code.NotAcceptable);
        expect(result?.message).toContain('Route "api.test.list" is not available for host "evil.com"');
        expect(result?.key).toBe("ROUTE_HOST_NOT_ALLOWED");
      });

      test("returns null when host array is empty", async () => {
        const context = createMockContext({ host: "any.com" });
        const route = createMockRoute({ host: [] });

        const result = await validateRouteAccess(context, route, Environment.DEVELOPMENT);

        expect(result).toBeNull();
      });
    });

    describe("roles validation", () => {
      test("returns error when user is null and roles required", async () => {
        const context = createMockContext({ user: null });
        const route = createMockRoute({
          name: "api.test.list",
          roles: [ERole.USER],
        });

        const result = await validateRouteAccess(context, route, Environment.DEVELOPMENT);

        expect(result).not.toBeNull();
        expect(result?.status).toBe(HttpStatus.Code.Forbidden);
        expect(result?.message).toContain('Route "api.test.list" requires authentication');
        expect(result?.key).toBe("AUTHENTICATION_REQUIRED");
      });

      test("returns error when user has no roles", async () => {
        const context = createMockContext({
          user: { id: "1", email: "test@test.com", roles: [] } as unknown as ContextType["user"],
        });
        const route = createMockRoute({
          name: "api.test.list",
          roles: [ERole.USER],
        });

        const result = await validateRouteAccess(context, route, Environment.DEVELOPMENT);

        expect(result).not.toBeNull();
        expect(result?.status).toBe(HttpStatus.Code.Forbidden);
        expect(result?.message).toContain('Route "api.test.list" requires authentication');
        expect(result?.key).toBe("AUTHENTICATION_REQUIRED");
      });

      test("returns null when user has required role", async () => {
        const context = createMockContext({
          user: { id: "1", email: "test@test.com", roles: [ERole.ADMIN] } as unknown as ContextType["user"],
        });
        const route = createMockRoute({
          roles: [ERole.ADMIN],
        });

        const result = await validateRouteAccess(context, route, Environment.DEVELOPMENT);

        expect(result).toBeNull();
      });

      test("returns error when user lacks required role", async () => {
        const context = createMockContext({
          user: { id: "1", email: "test@test.com", roles: [ERole.GUEST] } as unknown as ContextType["user"],
        });
        const route = createMockRoute({
          name: "api.test.list",
          roles: [ERole.ADMIN],
        });

        const result = await validateRouteAccess(context, route, Environment.DEVELOPMENT);

        expect(result).not.toBeNull();
        expect(result?.status).toBe(HttpStatus.Code.NotAcceptable);
        expect(result?.message).toContain('Route "api.test.list" is not accessible for user roles');
        expect(result?.key).toBe("ROLE_NOT_ALLOWED");
      });

      test("returns null when roles array is empty", async () => {
        const context = createMockContext({ user: null });
        const route = createMockRoute({ roles: [] });

        const result = await validateRouteAccess(context, route, Environment.DEVELOPMENT);

        expect(result).toBeNull();
      });

      test("passes roles to context route", () => {
        const roles = [ERole.ADMIN, ERole.USER];
        const context = createMockContext({
          route: {
            name: "api.test.list",
            path: "/test",
            method: "GET",
            version: 1,
            description: "Test route",
            roles,
          },
        });

        expect(context.route?.roles).toEqual([ERole.ADMIN, ERole.USER]);
      });

      test("context route has no roles when not provided", () => {
        const context = createMockContext();

        expect(context.route?.roles).toBeUndefined();
      });
    });
  });

  describe("validateResponse", () => {
    test("returns null when no response constraint defined", () => {
      const route = createMockRoute();

      const result = validateResponse(route, { data: "test" });

      expect(result).toBeNull();
    });

    test("returns null when response data is valid", () => {
      const route = createMockRoute({
        response: type({ id: "number", name: "string" }),
      } as Partial<RouteConfigType>);

      const result = validateResponse(route, { id: 1, name: "test" });

      expect(result).toBeNull();
    });

    test("returns error when response data is invalid", () => {
      const route = createMockRoute({
        response: type({ id: "number", name: "string" }),
      } as Partial<RouteConfigType>);

      const result = validateResponse(route, { id: "not-a-number", name: "test" });

      expect(result).not.toBeNull();
      expect(result?.status).toBe(HttpStatus.Code.NotAcceptable);
      expect(result?.message).toContain("Invalid response");
      expect(result?.key).toBe("INVALID_RESPONSE");
    });

    test("returns error for missing required fields", () => {
      const route = createMockRoute({
        response: type({ id: "number", name: "string" }),
      } as Partial<RouteConfigType>);

      const result = validateResponse(route, { id: 1 });

      expect(result).not.toBeNull();
      expect(result?.status).toBe(HttpStatus.Code.NotAcceptable);
      expect(result?.key).toBe("INVALID_RESPONSE");
    });

    test("works with IAssert constraint", () => {
      const route = createMockRoute({
        response: {
          getConstraint: () => type("unknown"),
          getErrorMessage: () => null,
          validate: () => ({ isValid: true }),
        } satisfies IAssert,
      } as Partial<RouteConfigType>);

      const result = validateResponse(route, { anything: "works" });

      expect(result).toBeNull();
    });

    test("returns error with IAssert constraint that fails", () => {
      const route = createMockRoute({
        response: {
          getConstraint: () => type("unknown"),
          getErrorMessage: () => "Response validation failed",
          validate: () => ({ isValid: false, message: "Response validation failed" }),
        } satisfies IAssert,
      } as Partial<RouteConfigType>);

      const result = validateResponse(route, { invalid: "data" });

      expect(result).not.toBeNull();
      expect(result?.message).toContain("Response validation failed");
      expect(result?.key).toBe("INVALID_RESPONSE");
    });
  });

  describe("httpRouteHandler", () => {
    test("returns successful response when controller executes successfully", async () => {
      class SuccessController {
        index(): IResponse {
          return new HttpResponse().json({ message: "success" });
        }
      }
      container.add(SuccessController);

      const context = createMockContext();
      const route = createMockRoute({
        controller: SuccessController,
      } as Partial<RouteConfigType>);

      const response = await httpRouteHandler({ context, route });

      expect(response.status).toBe(HttpStatus.Code.OK);
      const body = await response.json();
      expect(body.data.message).toBe("success");
    });

    test("returns error response when route validation fails", async () => {
      class TestController {
        index(): IResponse {
          return new HttpResponse().json({ message: "success" });
        }
      }
      container.add(TestController);

      const context = createMockContext();
      const route = createMockRoute({
        controller: TestController,
        env: [Environment.PRODUCTION],
      } as Partial<RouteConfigType>);

      const response = await httpRouteHandler({ context, route });

      expect(response.status).toBe(HttpStatus.Code.NotAcceptable);
    });

    test("returns error response when controller throws Exception", async () => {
      class ThrowingController {
        index(): IResponse {
          throw new Exception("Controller error", { status: HttpStatus.Code.BadRequest });
        }
      }
      container.add(ThrowingController);

      const context = createMockContext();
      const route = createMockRoute({
        controller: ThrowingController,
      } as Partial<RouteConfigType>);

      const response = await httpRouteHandler({ context, route });

      expect(response.status).toBe(HttpStatus.Code.BadRequest);
      const body = await response.json();
      expect(body.message).toBe("Controller error");
    });

    test("propagates exception key when controller throws Exception with key", async () => {
      class ThrowingWithKeyController {
        index(): IResponse {
          throw new Exception("Controller error", { key: "controller.error.key", status: HttpStatus.Code.BadRequest });
        }
      }
      container.add(ThrowingWithKeyController);

      const context = createMockContext();
      const route = createMockRoute({
        controller: ThrowingWithKeyController,
      } as Partial<RouteConfigType>);

      const response = await httpRouteHandler({ context, route });

      expect(response.status).toBe(HttpStatus.Code.BadRequest);
      const body = await response.json();
      expect(body.message).toBe("Controller error");
      expect(body.key).toBe("controller.error.key");
    });

    test("does not include key when controller throws Exception without key", async () => {
      class ThrowingNoKeyController {
        index(): IResponse {
          throw new Exception("No key error", { status: HttpStatus.Code.BadRequest });
        }
      }
      container.add(ThrowingNoKeyController);

      const context = createMockContext();
      const route = createMockRoute({
        controller: ThrowingNoKeyController,
      } as Partial<RouteConfigType>);

      const response = await httpRouteHandler({ context, route });

      expect(response.status).toBe(HttpStatus.Code.BadRequest);
      const body = await response.json();
      expect(body.message).toBe("No key error");
      expect(body.key).toBeNull();
    });

    test("returns InternalServerError when controller throws regular Error", async () => {
      class ErrorController {
        index(): IResponse {
          throw new Error("Unexpected error");
        }
      }
      container.add(ErrorController);

      const context = createMockContext();
      const route = createMockRoute({
        controller: ErrorController,
      } as Partial<RouteConfigType>);

      const response = await httpRouteHandler({ context, route });

      expect(response.status).toBe(HttpStatus.Code.InternalServerError);
      const body = await response.json();
      expect(body.message).toBe("Unexpected error");
      expect(body.key).toBe("INTERNAL_ERROR");
    });

    test("returns InternalServerError when controller throws unknown error", async () => {
      class UnknownErrorController {
        index(): IResponse {
          throw "string error";
        }
      }
      container.add(UnknownErrorController);

      const context = createMockContext();
      const route = createMockRoute({
        controller: UnknownErrorController,
      } as Partial<RouteConfigType>);

      const response = await httpRouteHandler({ context, route });

      expect(response.status).toBe(HttpStatus.Code.InternalServerError);
      const body = await response.json();
      expect(body.message).toBe("An unknown error occurred");
      expect(body.key).toBe("UNKNOWN_ERROR");
    });

    test("returns error when response validation fails", async () => {
      class InvalidResponseController {
        index(): IResponse {
          return new HttpResponse().json({ id: "not-a-number" });
        }
      }
      container.add(InvalidResponseController);

      const context = createMockContext();
      const route = createMockRoute({
        controller: InvalidResponseController,
        response: type({ id: "number" }),
      } as Partial<RouteConfigType>);

      const response = await httpRouteHandler({ context, route });

      expect(response.status).toBe(HttpStatus.Code.NotAcceptable);
      const body = await response.json();
      expect(body.message).toContain("Invalid response");
      expect(body.key).toBe("INVALID_RESPONSE");
    });

    test("uses PRODUCTION environment as default when APP_ENV is undefined", async () => {
      class TestEnvController {
        index(): IResponse {
          return new HttpResponse().json({ ok: true });
        }
      }
      container.add(TestEnvController);

      const context = createMockContext({
        env: { APP_ENV: undefined } as unknown as ContextType["env"],
      });
      const route = createMockRoute({
        controller: TestEnvController,
      } as Partial<RouteConfigType>);

      const response = await httpRouteHandler({ context, route });

      expect(response.status).toBe(HttpStatus.Code.OK);
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

  describe("checkAllowedUsers", () => {
    test("returns null when no user is present", () => {
      const context = createMockContext({ user: null });

      const result = checkAllowedUsers(context);

      expect(result).toBeNull();
    });

    test("returns Forbidden when user is not in allowed users list", () => {
      const context = createMockContext({
        env: {
          APP_ENV: "staging",
          STAGING_ALLOWED_USERS: ["allowed@test.com"],
        } as unknown as ContextType["env"],
        user: { email: "notallowed@test.com", roles: [] } as unknown as ContextType["user"],
      });

      const result = checkAllowedUsers(context);

      expect(result).not.toBeNull();
      expect(result?.status).toBe(HttpStatus.Code.Forbidden);
      expect(result?.message).toContain("notallowed@test.com");
      expect(result?.message).toContain("staging");
      expect(result?.key).toBe("USER_NOT_ALLOWED");
    });

    test("returns null when user is in allowed users list", () => {
      const context = createMockContext({
        env: {
          APP_ENV: "staging",
          STAGING_ALLOWED_USERS: ["allowed@test.com"],
        } as unknown as ContextType["env"],
        user: { email: "allowed@test.com", roles: [] } as unknown as ContextType["user"],
      });

      const result = checkAllowedUsers(context);

      expect(result).toBeNull();
    });

    test("returns null when allowed users list is empty", () => {
      const context = createMockContext({
        env: {
          APP_ENV: "staging",
          STAGING_ALLOWED_USERS: [],
        } as unknown as ContextType["env"],
        user: { email: "anyone@test.com", roles: [] } as unknown as ContextType["user"],
      });

      const result = checkAllowedUsers(context);

      expect(result).toBeNull();
    });

    test("returns null when allowed users property is undefined", () => {
      const context = createMockContext({
        env: {
          APP_ENV: "production",
        } as unknown as ContextType["env"],
        user: { email: "anyone@test.com", roles: [] } as unknown as ContextType["user"],
      });

      const result = checkAllowedUsers(context);

      expect(result).toBeNull();
    });

    test("checks correct env-specific allowed users list", () => {
      const context = createMockContext({
        env: {
          APP_ENV: "development",
          DEVELOPMENT_ALLOWED_USERS: ["dev@test.com"],
          STAGING_ALLOWED_USERS: ["staging@test.com"],
        } as unknown as ContextType["env"],
        user: { email: "staging@test.com", roles: [] } as unknown as ContextType["user"],
      });

      const result = checkAllowedUsers(context);

      expect(result).not.toBeNull();
      expect(result?.status).toBe(HttpStatus.Code.Forbidden);
      expect(result?.key).toBe("USER_NOT_ALLOWED");
    });

    test("adds SYSTEM role when user is in SYSTEM_USERS", () => {
      const context = createMockContext({
        env: {
          APP_ENV: "production",
          SYSTEM_USERS: ["system@test.com"],
        } as unknown as ContextType["env"],
        user: { email: "system@test.com", roles: [] } as unknown as ContextType["user"],
      });

      checkAllowedUsers(context);

      expect(context.user?.roles).toContain(ERole.SYSTEM);
    });

    test("does not duplicate SYSTEM role if already present", () => {
      const context = createMockContext({
        env: {
          APP_ENV: "production",
          SYSTEM_USERS: ["system@test.com"],
        } as unknown as ContextType["env"],
        user: { email: "system@test.com", roles: [ERole.SYSTEM] } as unknown as ContextType["user"],
      });

      checkAllowedUsers(context);

      expect(context.user?.roles.filter((r) => r === ERole.SYSTEM)).toHaveLength(1);
    });

    test("does not add SYSTEM role when user is not in SYSTEM_USERS", () => {
      const context = createMockContext({
        env: {
          APP_ENV: "production",
          SYSTEM_USERS: ["other@test.com"],
        } as unknown as ContextType["env"],
        user: { email: "user@test.com", roles: [] } as unknown as ContextType["user"],
      });

      checkAllowedUsers(context);

      expect(context.user?.roles).not.toContain(ERole.SYSTEM);
    });

    test("adds SUPER_ADMIN role when user is in SUPER_ADMIN_USERS", () => {
      const context = createMockContext({
        env: {
          APP_ENV: "production",
          SUPER_ADMIN_USERS: ["superadmin@test.com"],
        } as unknown as ContextType["env"],
        user: { email: "superadmin@test.com", roles: [] } as unknown as ContextType["user"],
      });

      checkAllowedUsers(context);

      expect(context.user?.roles).toContain(ERole.SUPER_ADMIN);
    });

    test("does not duplicate SUPER_ADMIN role if already present", () => {
      const context = createMockContext({
        env: {
          APP_ENV: "production",
          SUPER_ADMIN_USERS: ["superadmin@test.com"],
        } as unknown as ContextType["env"],
        user: { email: "superadmin@test.com", roles: [ERole.SUPER_ADMIN] } as unknown as ContextType["user"],
      });

      checkAllowedUsers(context);

      expect(context.user?.roles.filter((r) => r === ERole.SUPER_ADMIN)).toHaveLength(1);
    });

    test("does not add SUPER_ADMIN role when user is not in SUPER_ADMIN_USERS", () => {
      const context = createMockContext({
        env: {
          APP_ENV: "production",
          SUPER_ADMIN_USERS: ["other@test.com"],
        } as unknown as ContextType["env"],
        user: { email: "user@test.com", roles: [] } as unknown as ContextType["user"],
      });

      checkAllowedUsers(context);

      expect(context.user?.roles).not.toContain(ERole.SUPER_ADMIN);
    });

    test("adds ADMIN role when user is in ADMIN_USERS", () => {
      const context = createMockContext({
        env: {
          APP_ENV: "production",
          ADMIN_USERS: ["admin@test.com"],
        } as unknown as ContextType["env"],
        user: { email: "admin@test.com", roles: [] } as unknown as ContextType["user"],
      });

      checkAllowedUsers(context);

      expect(context.user?.roles).toContain(ERole.ADMIN);
    });

    test("does not duplicate ADMIN role if already present", () => {
      const context = createMockContext({
        env: {
          APP_ENV: "production",
          ADMIN_USERS: ["admin@test.com"],
        } as unknown as ContextType["env"],
        user: { email: "admin@test.com", roles: [ERole.ADMIN] } as unknown as ContextType["user"],
      });

      checkAllowedUsers(context);

      expect(context.user?.roles.filter((r) => r === ERole.ADMIN)).toHaveLength(1);
    });

    test("does not add ADMIN role when user is not in ADMIN_USERS", () => {
      const context = createMockContext({
        env: {
          APP_ENV: "production",
          ADMIN_USERS: ["other@test.com"],
        } as unknown as ContextType["env"],
        user: { email: "user@test.com", roles: [] } as unknown as ContextType["user"],
      });

      checkAllowedUsers(context);

      expect(context.user?.roles).not.toContain(ERole.ADMIN);
    });

    test("adds all roles when user is in SYSTEM_USERS, SUPER_ADMIN_USERS, and ADMIN_USERS", () => {
      const context = createMockContext({
        env: {
          APP_ENV: "production",
          SYSTEM_USERS: ["multi@test.com"],
          SUPER_ADMIN_USERS: ["multi@test.com"],
          ADMIN_USERS: ["multi@test.com"],
        } as unknown as ContextType["env"],
        user: { email: "multi@test.com", roles: [] } as unknown as ContextType["user"],
      });

      checkAllowedUsers(context);

      expect(context.user?.roles).toContain(ERole.SYSTEM);
      expect(context.user?.roles).toContain(ERole.SUPER_ADMIN);
      expect(context.user?.roles).toContain(ERole.ADMIN);
    });
  });

  describe("formatHttpRoutes cache", () => {
    test("returns response and delegates caching to formatHttpRoutes", async () => {
      class CacheController {
        index(): IResponse {
          return new HttpResponse().json({ message: "fresh" });
        }
      }
      container.add(CacheController);

      const context = createMockContext();
      const route = createMockRoute({
        controller: CacheController,
        cache: true,
      } as Partial<RouteConfigType>);

      // httpRouteHandler always returns the response; caching is handled by formatHttpRoutes
      const response = await httpRouteHandler({ context, route });
      expect(response.status).toBe(HttpStatus.Code.OK);

      const body = await response.json();
      expect(body.data.message).toBe("fresh");
    });

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
      expect(() => Bun.CSRF.generate(undefined as unknown as string, { encoding: "hex" })).toThrow(
        "Secret is required",
      );
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

    test("does not cache response when status is not successful", async () => {
      class ErrorCacheController {
        index(): IResponse {
          return new HttpResponse().json({ error: "not found" }, HttpStatus.Code.NotFound);
        }
      }
      container.add(ErrorCacheController);

      const context = createMockContext();
      const route = createMockRoute({
        controller: ErrorCacheController,
        cache: true,
      } as Partial<RouteConfigType>);

      const response = await httpRouteHandler({ context, route });
      expect(response.status).toBe(HttpStatus.Code.NotFound);
      expect(response.ok).toBe(false);
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

  describe("runMiddlewares", () => {
    test("returns context unchanged when no middlewares provided", async () => {
      const context = createMockContext();

      const result = await runMiddlewares(context, []);

      expect(result).toBe(context);
    });

    test("runs a single middleware and returns modified context", async () => {
      class TestMiddleware {
        handler = async (ctx: ContextType) => {
          ctx.response.header.set("X-Custom-Test", "value");
          return ctx;
        };
      }
      container.add(TestMiddleware);

      const context = createMockContext();

      const result = await runMiddlewares(context, [TestMiddleware as unknown as MiddlewareClassType]);

      expect(result.response.header.get("X-Custom-Test")).toBe("value");
    });

    test("runs multiple middlewares in order", async () => {
      const order: string[] = [];

      class FirstMiddleware {
        handler = async (ctx: ContextType) => {
          order.push("first");
          ctx.response.header.set("X-Custom-First", "1");
          return ctx;
        };
      }

      class SecondMiddleware {
        handler = async (ctx: ContextType) => {
          order.push("second");
          ctx.response.header.set("X-Custom-Second", "2");
          return ctx;
        };
      }

      container.add(FirstMiddleware);
      container.add(SecondMiddleware);

      const context = createMockContext();

      const result = await runMiddlewares(context, [
        FirstMiddleware as unknown as MiddlewareClassType,
        SecondMiddleware as unknown as MiddlewareClassType,
      ]);

      expect(order).toEqual(["first", "second"]);
      expect(result.response.header.get("X-Custom-First")).toBe("1");
      expect(result.response.header.get("X-Custom-Second")).toBe("2");
    });

    test("runs CORS middleware that sets Access-Control headers", async () => {
      class MockCorsMiddleware {
        handler = async (ctx: ContextType) => {
          ctx.response.header.setAccessControlAllowOrigin("http://localhost:3000");
          ctx.response.header.setAccessControlAllowMethods(["GET", "POST"]);
          ctx.response.header.setAccessControlAllowHeaders(["Content-Type", "Authorization"]);
          return ctx;
        };
      }
      container.add(MockCorsMiddleware);

      const context = createMockContext();

      const result = await runMiddlewares(context, [MockCorsMiddleware as unknown as MiddlewareClassType]);

      expect(result.response.header.get("Access-Control-Allow-Origin")).toBe("http://localhost:3000");
      expect(result.response.header.get("Access-Control-Allow-Methods")).toContain("GET");
      expect(result.response.header.get("Access-Control-Allow-Headers")).toContain("Content-Type");
    });

    test("runs app middlewares followed by CORS middleware", async () => {
      const order: string[] = [];

      class AuthMiddleware {
        handler = async (ctx: ContextType) => {
          order.push("auth");
          return ctx;
        };
      }

      class CorsMiddleware {
        handler = async (ctx: ContextType) => {
          order.push("cors");
          ctx.response.header.setAccessControlAllowOrigin("*");
          return ctx;
        };
      }

      container.add(AuthMiddleware);
      container.add(CorsMiddleware);

      const context = createMockContext();

      const allMiddlewares = [
        AuthMiddleware as unknown as MiddlewareClassType,
        CorsMiddleware as unknown as MiddlewareClassType,
      ];

      const result = await runMiddlewares(context, allMiddlewares);

      expect(order).toEqual(["auth", "cors"]);
      expect(result.response.header.get("Access-Control-Allow-Origin")).toBe("*");
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
});
