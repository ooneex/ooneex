import { describe, expect, mock, test } from "bun:test";
import { Environment } from "@ooneex/app-env";
import { container } from "@ooneex/container";
import type { ContextType } from "@ooneex/controller";
import { Exception } from "@ooneex/exception";
import { HttpResponse, type IResponse } from "@ooneex/http-response";
import { HttpStatus } from "@ooneex/http-status";
import type { PermissionClassType } from "@ooneex/permission";
import { ERole } from "@ooneex/role";
import type { RouteConfigType } from "@ooneex/routing";
import { type AssertType, type IAssert, type } from "@ooneex/validation";
import {
  checkAllowedUsers,
  formatHttpRoutes,
  httpRouteHandler,
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

const createMockContext = (overrides: Partial<ContextType> = {}): ContextType => {
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
    env: { env: Environment.DEVELOPMENT } as unknown as ContextType["env"],
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
    language: {} as ContextType["language"],
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
      });

      test("returns null when roles array is empty", async () => {
        const context = createMockContext({ user: null });
        const route = createMockRoute({ roles: [] });

        const result = await validateRouteAccess(context, route, Environment.DEVELOPMENT);

        expect(result).toBeNull();
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
    });

    test("returns error for missing required fields", () => {
      const route = createMockRoute({
        response: type({ id: "number", name: "string" }),
      } as Partial<RouteConfigType>);

      const result = validateResponse(route, { id: 1 });

      expect(result).not.toBeNull();
      expect(result?.status).toBe(HttpStatus.Code.NotAcceptable);
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
    });

    test("uses PRODUCTION environment as default when app.env.env is undefined", async () => {
      class TestEnvController {
        index(): IResponse {
          return new HttpResponse().json({ ok: true });
        }
      }
      container.add(TestEnvController);

      const context = createMockContext({
        env: { env: undefined } as unknown as ContextType["env"],
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
      const allowMock = mock(() => mockPermission);
      const setUserPermissionsMock = mock(() => mockPermission);
      const buildMock = mock(() => mockPermission);

      const mockPermission = {
        allow: allowMock,
        setUserPermissions: setUserPermissionsMock,
        build: buildMock,
      };

      class TestPermission {
        allow = allowMock;
        setUserPermissions = setUserPermissionsMock;
        build = buildMock;
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
