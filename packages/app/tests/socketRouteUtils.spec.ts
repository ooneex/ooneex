import { describe, expect, mock, test } from "bun:test";
import { Environment } from "@ooneex/app-env";
import { container } from "@ooneex/container";
import { Exception } from "@ooneex/exception";
import { HttpResponse, type IResponse } from "@ooneex/http-response";
import { HttpStatus } from "@ooneex/http-status";
import type { PermissionClassType } from "@ooneex/permission";
import { ERole } from "@ooneex/role";
import type { RouteConfigType } from "@ooneex/routing";
import type { ContextType } from "@ooneex/socket";
import { formatSocketRoutes, socketRouteHandler } from "@/socketRouteUtils";

class DefaultSocketController {
  index(context: ContextType): IResponse {
    context.response.done = true;
    return context.response.json({ message: "success" });
  }
}
container.add(DefaultSocketController);

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

const createMockSocketContext = (overrides: Record<string, unknown> = {}): ContextType => {
  const response = new HttpResponse();
  return {
    logger: createMockLogger() as unknown as ContextType["logger"],
    analytics: {} as ContextType["analytics"],
    cache: {} as ContextType["cache"],
    storage: {} as ContextType["storage"],
    mailer: {} as ContextType["mailer"],
    database: {} as ContextType["database"],
    route: {
      name: "api.socket.test",
      path: "/socket" as const,
      method: "GET" as const,
      version: 1,
      description: "Test socket route",
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
    lang: {} as ContextType["lang"],
    user: null,
    channel: {
      send: mock(() => Promise.resolve()),
      close: mock(() => {}),
      subscribe: mock(() => Promise.resolve()),
      isSubscribed: mock(() => false),
      unsubscribe: mock(() => Promise.resolve()),
      publish: mock(() => Promise.resolve()),
    },
    ...overrides,
  } as ContextType;
};

const createMockSocketRoute = (overrides: Record<string, unknown> = {}): RouteConfigType => {
  const base = {
    name: "api.socket.list" as const,
    path: "/socket" as const,
    method: "GET" as const,
    version: 1,
    controller: DefaultSocketController,
    description: "Socket route",
    isSocket: true,
  };
  return { ...base, ...overrides } as unknown as RouteConfigType;
};

const createMockWs = (id: string, sendMock: ReturnType<typeof mock>) => ({
  data: { id },
  send: sendMock,
  close: mock(() => {}),
  subscribe: mock(() => {}),
  isSubscribed: mock(() => false),
  unsubscribe: mock(() => {}),
});

const createMockServer = () => ({
  publish: mock(() => {}),
});

describe("socketRouteUtils", () => {
  describe("formatSocketRoutes", () => {
    test("returns empty object for empty routes map", () => {
      const socketRoutes = new Map<string, RouteConfigType>();

      const result = formatSocketRoutes(socketRoutes);

      expect(result).toEqual({});
    });

    test("creates handler for each socket path with version prefix", () => {
      const socketRoutes = new Map<string, RouteConfigType>();
      socketRoutes.set("/ws/chat", createMockSocketRoute({ path: "/ws/chat", name: "api.chat.list" }));

      const result = formatSocketRoutes(socketRoutes);

      expect(result["/v1/ws/chat"]).toBeDefined();
      expect(typeof result["/v1/ws/chat"]).toBe("function");
    });

    test("creates handlers for multiple socket paths with version prefix", () => {
      const socketRoutes = new Map<string, RouteConfigType>();
      socketRoutes.set("/ws/chat", createMockSocketRoute({ path: "/ws/chat", name: "api.chat.list" }));
      socketRoutes.set(
        "/ws/notifications",
        createMockSocketRoute({ path: "/ws/notifications", name: "api.notifications.list" }),
      );

      const result = formatSocketRoutes(socketRoutes);

      expect(result["/v1/ws/chat"]).toBeDefined();
      expect(result["/v1/ws/notifications"]).toBeDefined();
      expect(typeof result["/v1/ws/chat"]).toBe("function");
      expect(typeof result["/v1/ws/notifications"]).toBe("function");
    });

    test("prepends prefix to versioned path", () => {
      const socketRoutes = new Map<string, RouteConfigType>();
      socketRoutes.set("/ws/chat", createMockSocketRoute({ path: "/ws/chat", name: "api.chat.list" }));

      const result = formatSocketRoutes(socketRoutes, "api");

      expect(result["/api/v1/ws/chat"]).toBeDefined();
      expect(typeof result["/api/v1/ws/chat"]).toBe("function");
    });

    test("works without prefix", () => {
      const socketRoutes = new Map<string, RouteConfigType>();
      socketRoutes.set("/ws/chat", createMockSocketRoute({ path: "/ws/chat", name: "api.chat.list" }));

      const result = formatSocketRoutes(socketRoutes);

      expect(result["/v1/ws/chat"]).toBeDefined();
      expect(typeof result["/v1/ws/chat"]).toBe("function");
    });
  });

  describe("socketRouteHandler", () => {
    test("sends successful response when controller executes successfully", async () => {
      const wsSendMock = mock(() => {});
      const context = createMockSocketContext();

      class SuccessSocketController {
        index(ctx: ContextType): IResponse {
          ctx.response.done = true;
          return ctx.response.json({ message: "socket success" });
        }
      }
      container.add(SuccessSocketController);
      const route = createMockSocketRoute({ controller: SuccessSocketController });

      const wsId = `test-ws-id-success-${Date.now()}`;
      container.addConstant(wsId, { context, route });

      const mockWs = createMockWs(wsId, wsSendMock);
      const mockServer = createMockServer();

      const message = JSON.stringify({
        payload: { test: "data" },
        queries: { page: "1" },
        lang: { locale: "en" },
      });

      await socketRouteHandler({
        message,
        ws: mockWs as unknown as import("bun").ServerWebSocket<{ id: string }>,
        server: mockServer as unknown as import("bun").Server<{ id: string }>,
      });

      expect(wsSendMock).toHaveBeenCalled();
    });

    test("sends exception when middleware throws Exception", async () => {
      const wsSendMock = mock(() => {});
      const context = createMockSocketContext();
      const route = createMockSocketRoute();

      const wsId = `test-ws-id-middleware-exception-${Date.now()}`;
      container.addConstant(wsId, { context, route });

      const mockWs = createMockWs(wsId, wsSendMock);
      const mockServer = createMockServer();

      class ThrowingMiddleware {
        handler(): Promise<ContextType> {
          throw new Exception("Middleware error", { status: HttpStatus.Code.Unauthorized });
        }
      }
      container.add(ThrowingMiddleware);

      const message = JSON.stringify({
        payload: {},
        queries: {},
        lang: {},
      });

      await socketRouteHandler({
        message,
        ws: mockWs as unknown as import("bun").ServerWebSocket<{ id: string }>,
        server: mockServer as unknown as import("bun").Server<{ id: string }>,
        middlewares: [ThrowingMiddleware as unknown as import("@ooneex/middleware").SocketMiddlewareClassType],
      });

      expect(wsSendMock).toHaveBeenCalled();
      const sentData = JSON.parse(String((wsSendMock.mock.calls as unknown[][])?.[0]?.[0]));
      expect(sentData.status).toBe(HttpStatus.Code.Unauthorized);
    });

    test("sends exception when middleware throws regular Error", async () => {
      const wsSendMock = mock(() => {});
      const context = createMockSocketContext();
      const route = createMockSocketRoute();

      const wsId = `test-ws-id-middleware-error-${Date.now()}`;
      container.addConstant(wsId, { context, route });

      const mockWs = createMockWs(wsId, wsSendMock);
      const mockServer = createMockServer();

      class ErrorMiddleware {
        handler(): Promise<ContextType> {
          throw new Error("Unexpected middleware error");
        }
      }
      container.add(ErrorMiddleware);

      const message = JSON.stringify({
        payload: {},
        queries: {},
        lang: {},
      });

      await socketRouteHandler({
        message,
        ws: mockWs as unknown as import("bun").ServerWebSocket<{ id: string }>,
        server: mockServer as unknown as import("bun").Server<{ id: string }>,
        middlewares: [ErrorMiddleware as unknown as import("@ooneex/middleware").SocketMiddlewareClassType],
      });

      expect(wsSendMock).toHaveBeenCalled();
      const sentData = JSON.parse(String((wsSendMock.mock.calls as unknown[][])?.[0]?.[0]));
      expect(sentData.status).toBe(HttpStatus.Code.InternalServerError);
    });

    test("sends exception when route validation fails", async () => {
      const wsSendMock = mock(() => {});
      const context = createMockSocketContext();

      const route = createMockSocketRoute({
        env: [Environment.PRODUCTION],
      });

      const wsId = `test-ws-id-validation-fail-${Date.now()}`;
      container.addConstant(wsId, { context, route });

      const mockWs = createMockWs(wsId, wsSendMock);
      const mockServer = createMockServer();

      const message = JSON.stringify({
        payload: {},
        queries: {},
        lang: {},
      });

      await socketRouteHandler({
        message,
        ws: mockWs as unknown as import("bun").ServerWebSocket<{ id: string }>,
        server: mockServer as unknown as import("bun").Server<{ id: string }>,
      });

      expect(wsSendMock).toHaveBeenCalled();
      const sentData = JSON.parse(String((wsSendMock.mock.calls as unknown[][])?.[0]?.[0]));
      expect(sentData.status).toBe(HttpStatus.Code.NotAcceptable);
      expect(sentData.key).toBe("ROUTE_ENV_NOT_ALLOWED");
    });

    test("sends exception when controller throws Exception", async () => {
      const wsSendMock = mock(() => {});
      const context = createMockSocketContext();

      class ThrowingSocketController {
        index(): IResponse {
          throw new Exception("Controller exception", { status: HttpStatus.Code.BadRequest });
        }
      }
      container.add(ThrowingSocketController);

      const route = createMockSocketRoute({ controller: ThrowingSocketController });

      const wsId = `test-ws-id-controller-exception-${Date.now()}`;
      container.addConstant(wsId, { context, route });

      const mockWs = createMockWs(wsId, wsSendMock);
      const mockServer = createMockServer();

      const message = JSON.stringify({
        payload: {},
        queries: {},
        lang: {},
      });

      await socketRouteHandler({
        message,
        ws: mockWs as unknown as import("bun").ServerWebSocket<{ id: string }>,
        server: mockServer as unknown as import("bun").Server<{ id: string }>,
      });

      expect(wsSendMock).toHaveBeenCalled();
      const sentData = JSON.parse(String((wsSendMock.mock.calls as unknown[][])?.[0]?.[0]));
      expect(sentData.status).toBe(HttpStatus.Code.BadRequest);
      expect(sentData.message).toBe("Controller exception");
    });

    test("sends exception when controller throws regular Error", async () => {
      const wsSendMock = mock(() => {});
      const context = createMockSocketContext();

      class ErrorSocketController {
        index(): IResponse {
          throw new Error("Controller error");
        }
      }
      container.add(ErrorSocketController);

      const route = createMockSocketRoute({ controller: ErrorSocketController });

      const wsId = `test-ws-id-controller-error-${Date.now()}`;
      container.addConstant(wsId, { context, route });

      const mockWs = createMockWs(wsId, wsSendMock);
      const mockServer = createMockServer();

      const message = JSON.stringify({
        payload: {},
        queries: {},
        lang: {},
      });

      await socketRouteHandler({
        message,
        ws: mockWs as unknown as import("bun").ServerWebSocket<{ id: string }>,
        server: mockServer as unknown as import("bun").Server<{ id: string }>,
      });

      expect(wsSendMock).toHaveBeenCalled();
      const sentData = JSON.parse(String((wsSendMock.mock.calls as unknown[][])?.[0]?.[0]));
      expect(sentData.status).toBe(HttpStatus.Code.InternalServerError);
      expect(sentData.message).toBe("Controller error");
    });

    test("sends exception when controller throws unknown error", async () => {
      const wsSendMock = mock(() => {});
      const context = createMockSocketContext();

      class UnknownErrorSocketController {
        index(): IResponse {
          throw "string error";
        }
      }
      container.add(UnknownErrorSocketController);

      const route = createMockSocketRoute({ controller: UnknownErrorSocketController });

      const wsId = `test-ws-id-controller-unknown-${Date.now()}`;
      container.addConstant(wsId, { context, route });

      const mockWs = createMockWs(wsId, wsSendMock);
      const mockServer = createMockServer();

      const message = JSON.stringify({
        payload: {},
        queries: {},
        lang: {},
      });

      await socketRouteHandler({
        message,
        ws: mockWs as unknown as import("bun").ServerWebSocket<{ id: string }>,
        server: mockServer as unknown as import("bun").Server<{ id: string }>,
      });

      expect(wsSendMock).toHaveBeenCalled();
      const sentData = JSON.parse(String((wsSendMock.mock.calls as unknown[][])?.[0]?.[0]));
      expect(sentData.status).toBe(HttpStatus.Code.InternalServerError);
      expect(sentData.message).toBe("An unknown error occurred");
    });

    test("parses message and sets context properties", async () => {
      const wsSendMock = mock(() => {});
      const context = createMockSocketContext();

      let capturedContext: ContextType | null = null;

      class CaptureContextController {
        index(ctx: ContextType): IResponse {
          capturedContext = ctx;
          ctx.response.done = true;
          return ctx.response.json({ captured: true });
        }
      }
      container.add(CaptureContextController);

      const route = createMockSocketRoute({ controller: CaptureContextController });

      const wsId = `test-ws-id-parse-message-${Date.now()}`;
      container.addConstant(wsId, { context, route });

      const mockWs = createMockWs(wsId, wsSendMock);
      const mockServer = createMockServer();

      const message = JSON.stringify({
        payload: { userId: 123, action: "test" },
        queries: { page: "2", limit: "10" },
        lang: { locale: "fr", region: "FR" },
      });

      await socketRouteHandler({
        message,
        ws: mockWs as unknown as import("bun").ServerWebSocket<{ id: string }>,
        server: mockServer as unknown as import("bun").Server<{ id: string }>,
      });

      expect(capturedContext).not.toBeNull();
      const ctx = capturedContext as unknown as ContextType;
      expect(ctx.payload).toEqual({ userId: 123, action: "test" });
      expect(ctx.queries).toEqual({ page: "2", limit: "10" } as unknown as ContextType["queries"]);
      expect((ctx.lang as Record<string, unknown>).locale).toBe("fr");
      expect((ctx.lang as Record<string, unknown>).region).toBe("FR");
    });

    test("uses PRODUCTION environment as default when app.env.env is undefined", async () => {
      const wsSendMock = mock(() => {});
      const context = createMockSocketContext({
        env: { env: undefined } as unknown as ContextType["env"],
      });

      class EnvTestController {
        index(ctx: ContextType): IResponse {
          ctx.response.done = true;
          return ctx.response.json({ ok: true });
        }
      }
      container.add(EnvTestController);

      const route = createMockSocketRoute({ controller: EnvTestController });

      const wsId = `test-ws-id-env-default-${Date.now()}`;
      container.addConstant(wsId, { context, route });

      const mockWs = createMockWs(wsId, wsSendMock);
      const mockServer = createMockServer();

      const message = JSON.stringify({
        payload: {},
        queries: {},
        lang: {},
      });

      await socketRouteHandler({
        message,
        ws: mockWs as unknown as import("bun").ServerWebSocket<{ id: string }>,
        server: mockServer as unknown as import("bun").Server<{ id: string }>,
      });

      expect(wsSendMock).toHaveBeenCalled();
    });

    test("channel methods work correctly", async () => {
      const wsSendMock = mock(() => {});
      const context = createMockSocketContext();

      class ChannelTestController {
        async index(ctx: ContextType): Promise<IResponse> {
          await ctx.channel.subscribe();
          const isSubscribed = ctx.channel.isSubscribed();
          await ctx.channel.publish(ctx.response.json({ published: true }));
          await ctx.channel.unsubscribe();
          ctx.channel.close(1000, "test close");
          ctx.response.done = true;
          return ctx.response.json({ isSubscribed });
        }
      }
      container.add(ChannelTestController);

      const route = createMockSocketRoute({ controller: ChannelTestController });

      const wsId = `test-ws-id-channel-${Date.now()}`;
      container.addConstant(wsId, { context, route });

      const subscribeMock = mock(() => {});
      const isSubscribedMock = mock(() => true);
      const unsubscribeMock = mock(() => {});
      const closeMock = mock(() => {});

      const mockWs = {
        data: { id: wsId },
        send: wsSendMock,
        close: closeMock,
        subscribe: subscribeMock,
        isSubscribed: isSubscribedMock,
        unsubscribe: unsubscribeMock,
      };

      const publishMock = mock(() => {});
      const mockServer = {
        publish: publishMock,
      };

      const message = JSON.stringify({
        payload: {},
        queries: {},
        lang: {},
      });

      await socketRouteHandler({
        message,
        ws: mockWs as unknown as import("bun").ServerWebSocket<{ id: string }>,
        server: mockServer as unknown as import("bun").Server<{ id: string }>,
      });

      expect(subscribeMock).toHaveBeenCalledWith(route.name);
      expect(isSubscribedMock).toHaveBeenCalledWith(route.name);
      expect(unsubscribeMock).toHaveBeenCalledWith(route.name);
      expect(closeMock).toHaveBeenCalledWith(1000, "test close");
      expect(publishMock).toHaveBeenCalled();
    });

    test("builds permission and sets context.permission when route has permission", async () => {
      const allowMock = mock(() => mockPermission);
      const setUserPermissionsMock = mock(() => mockPermission);
      const buildMock = mock(() => mockPermission);

      const mockPermission = {
        allow: allowMock,
        setUserPermissions: setUserPermissionsMock,
        build: buildMock,
      };

      class SocketPermission {
        allow = allowMock;
        setUserPermissions = setUserPermissionsMock;
        build = buildMock;
      }
      container.add(SocketPermission);

      const wsSendMock = mock(() => {});
      const context = createMockSocketContext();

      class PermSocketController {
        index(ctx: ContextType): IResponse {
          ctx.response.done = true;
          return ctx.response.json({ ok: true });
        }
      }
      container.add(PermSocketController);

      const route = createMockSocketRoute({
        controller: PermSocketController,
        permission: SocketPermission as unknown as PermissionClassType,
      });

      const wsId = `test-ws-id-permission-${Date.now()}`;
      container.addConstant(wsId, { context, route });

      const mockWs = createMockWs(wsId, wsSendMock);
      const mockServer = createMockServer();

      const message = JSON.stringify({
        payload: {},
        queries: {},
        lang: {},
      });

      await socketRouteHandler({
        message,
        ws: mockWs as unknown as import("bun").ServerWebSocket<{ id: string }>,
        server: mockServer as unknown as import("bun").Server<{ id: string }>,
      });

      expect(wsSendMock).toHaveBeenCalled();
      expect(allowMock).toHaveBeenCalled();
      expect(setUserPermissionsMock).toHaveBeenCalled();
      expect(buildMock).toHaveBeenCalled();
    });

    test("does not set permission when route has no permission", async () => {
      const wsSendMock = mock(() => {});
      const context = createMockSocketContext();

      class NoPermSocketController {
        index(ctx: ContextType): IResponse {
          ctx.response.done = true;
          return ctx.response.json({ ok: true });
        }
      }
      container.add(NoPermSocketController);

      const route = createMockSocketRoute({ controller: NoPermSocketController });

      const wsId = `test-ws-id-no-permission-${Date.now()}`;
      container.addConstant(wsId, { context, route });

      const mockWs = createMockWs(wsId, wsSendMock);
      const mockServer = createMockServer();

      const message = JSON.stringify({
        payload: {},
        queries: {},
        lang: {},
      });

      await socketRouteHandler({
        message,
        ws: mockWs as unknown as import("bun").ServerWebSocket<{ id: string }>,
        server: mockServer as unknown as import("bun").Server<{ id: string }>,
      });

      expect(wsSendMock).toHaveBeenCalled();
    });

    test("runs multiple middlewares in sequence", async () => {
      const executionOrder: string[] = [];
      const wsSendMock = mock(() => {});
      const context = createMockSocketContext();

      class FirstMiddleware {
        async handler(ctx: ContextType): Promise<ContextType> {
          executionOrder.push("first");
          return ctx;
        }
      }

      class SecondMiddleware {
        async handler(ctx: ContextType): Promise<ContextType> {
          executionOrder.push("second");
          return ctx;
        }
      }

      class SequenceController {
        index(ctx: ContextType): IResponse {
          executionOrder.push("controller");
          ctx.response.done = true;
          return ctx.response.json({ order: executionOrder });
        }
      }

      container.add(FirstMiddleware);
      container.add(SecondMiddleware);
      container.add(SequenceController);

      const route = createMockSocketRoute({ controller: SequenceController });

      const wsId = `test-ws-id-middleware-sequence-${Date.now()}`;
      container.addConstant(wsId, { context, route });

      const mockWs = createMockWs(wsId, wsSendMock);
      const mockServer = createMockServer();

      const message = JSON.stringify({
        payload: {},
        queries: {},
        lang: {},
      });

      await socketRouteHandler({
        message,
        ws: mockWs as unknown as import("bun").ServerWebSocket<{ id: string }>,
        server: mockServer as unknown as import("bun").Server<{ id: string }>,
        middlewares: [
          FirstMiddleware as unknown as import("@ooneex/middleware").SocketMiddlewareClassType,
          SecondMiddleware as unknown as import("@ooneex/middleware").SocketMiddlewareClassType,
        ],
      });

      expect(executionOrder).toEqual(["first", "second", "controller"]);
    });

    test("sends cached response on cache hit", async () => {
      const wsSendMock = mock(() => {});
      const cachedData = '{"data":{"message":"cached"},"status":200}';
      const cacheGetMock = mock(() => Promise.resolve(cachedData));
      const cacheSetMock = mock(() => Promise.resolve());

      const context = createMockSocketContext({
        cache: {
          get: cacheGetMock,
          set: cacheSetMock,
          has: mock(() => Promise.resolve(true)),
          delete: mock(() => Promise.resolve(true)),
        },
      });

      class CacheHitSocketController {
        index(ctx: ContextType): IResponse {
          ctx.response.done = true;
          return ctx.response.json({ message: "not cached" });
        }
      }
      container.add(CacheHitSocketController);

      const route = createMockSocketRoute({
        controller: CacheHitSocketController,
        cache: true,
      });

      const wsId = `test-ws-cache-hit-${Date.now()}`;
      container.addConstant(wsId, { context, route });

      const mockWs = createMockWs(wsId, wsSendMock);
      const mockServer = createMockServer();

      const message = JSON.stringify({
        payload: {},
        queries: {},
        lang: {},
      });

      await socketRouteHandler({
        message,
        ws: mockWs as unknown as import("bun").ServerWebSocket<{ id: string }>,
        server: mockServer as unknown as import("bun").Server<{ id: string }>,
      });

      expect(cacheGetMock).toHaveBeenCalled();
      expect(cacheSetMock).not.toHaveBeenCalled();
      expect(wsSendMock).toHaveBeenCalledWith(cachedData);
    });

    test("caches and sends response on cache miss", async () => {
      const wsSendMock = mock(() => {});
      const cacheGetMock = mock(() => Promise.resolve(undefined));
      const cacheSetMock = mock(() => Promise.resolve());

      const context = createMockSocketContext({
        cache: {
          get: cacheGetMock,
          set: cacheSetMock,
          has: mock(() => Promise.resolve(false)),
          delete: mock(() => Promise.resolve(false)),
        },
      });

      class CacheMissSocketController {
        index(ctx: ContextType): IResponse {
          ctx.response.done = true;
          return ctx.response.json({ message: "fresh" });
        }
      }
      container.add(CacheMissSocketController);

      const route = createMockSocketRoute({
        controller: CacheMissSocketController,
        cache: true,
      });

      const wsId = `test-ws-cache-miss-${Date.now()}`;
      container.addConstant(wsId, { context, route });

      const mockWs = createMockWs(wsId, wsSendMock);
      const mockServer = createMockServer();

      const message = JSON.stringify({
        payload: {},
        queries: {},
        lang: {},
      });

      await socketRouteHandler({
        message,
        ws: mockWs as unknown as import("bun").ServerWebSocket<{ id: string }>,
        server: mockServer as unknown as import("bun").Server<{ id: string }>,
      });

      expect(cacheGetMock).toHaveBeenCalled();
      expect(cacheSetMock).toHaveBeenCalled();
      expect((cacheSetMock.mock.calls as unknown[][])[0]![2]).toBe(300);
      expect(wsSendMock).toHaveBeenCalled();
    });

    test("does not use cache when route.cache is false", async () => {
      const wsSendMock = mock(() => {});
      const cacheGetMock = mock(() => Promise.resolve('{"data":"cached"}'));

      const context = createMockSocketContext({
        cache: {
          get: cacheGetMock,
          set: mock(() => Promise.resolve()),
          has: mock(() => Promise.resolve(true)),
          delete: mock(() => Promise.resolve(true)),
        },
      });

      class NoCacheFlagController {
        index(ctx: ContextType): IResponse {
          ctx.response.done = true;
          return ctx.response.json({ message: "no cache" });
        }
      }
      container.add(NoCacheFlagController);

      const route = createMockSocketRoute({
        controller: NoCacheFlagController,
        cache: false,
      });

      const wsId = `test-ws-no-cache-flag-${Date.now()}`;
      container.addConstant(wsId, { context, route });

      const mockWs = createMockWs(wsId, wsSendMock);
      const mockServer = createMockServer();

      const message = JSON.stringify({
        payload: {},
        queries: {},
        lang: {},
      });

      await socketRouteHandler({
        message,
        ws: mockWs as unknown as import("bun").ServerWebSocket<{ id: string }>,
        server: mockServer as unknown as import("bun").Server<{ id: string }>,
      });

      expect(cacheGetMock).not.toHaveBeenCalled();
      expect(wsSendMock).toHaveBeenCalled();
    });

    test("does not use cache when context.cache is undefined", async () => {
      const wsSendMock = mock(() => {});

      const context = createMockSocketContext({
        cache: undefined,
      });

      class NoCacheCtxController {
        index(ctx: ContextType): IResponse {
          ctx.response.done = true;
          return ctx.response.json({ message: "no cache ctx" });
        }
      }
      container.add(NoCacheCtxController);

      const route = createMockSocketRoute({
        controller: NoCacheCtxController,
        cache: true,
      });

      const wsId = `test-ws-no-cache-ctx-${Date.now()}`;
      container.addConstant(wsId, { context, route });

      const mockWs = createMockWs(wsId, wsSendMock);
      const mockServer = createMockServer();

      const message = JSON.stringify({
        payload: {},
        queries: {},
        lang: {},
      });

      await socketRouteHandler({
        message,
        ws: mockWs as unknown as import("bun").ServerWebSocket<{ id: string }>,
        server: mockServer as unknown as import("bun").Server<{ id: string }>,
      });

      expect(wsSendMock).toHaveBeenCalled();
    });

    test("uses correct cache key with params, queries, and payload", async () => {
      const wsSendMock = mock(() => {});
      const cacheGetMock = mock(() => Promise.resolve(undefined));
      const cacheSetMock = mock(() => Promise.resolve());

      const context = createMockSocketContext({
        cache: {
          get: cacheGetMock,
          set: cacheSetMock,
          has: mock(() => Promise.resolve(false)),
          delete: mock(() => Promise.resolve(false)),
        },
        params: { id: "42" },
      });

      class CacheKeyController {
        index(ctx: ContextType): IResponse {
          ctx.response.done = true;
          return ctx.response.json({ ok: true });
        }
      }
      container.add(CacheKeyController);

      const route = createMockSocketRoute({
        controller: CacheKeyController,
        cache: true,
        name: "api.socket.cachekey",
      });

      const wsId = `test-ws-cache-key-${Date.now()}`;
      container.addConstant(wsId, { context, route });

      const mockWs = createMockWs(wsId, wsSendMock);
      const mockServer = createMockServer();

      const message = JSON.stringify({
        payload: { action: "test" },
        queries: { page: "2" },
        lang: {},
      });

      await socketRouteHandler({
        message,
        ws: mockWs as unknown as import("bun").ServerWebSocket<{ id: string }>,
        server: mockServer as unknown as import("bun").Server<{ id: string }>,
      });

      const expectedKey = `ws:api.socket.cachekey:${JSON.stringify({ id: "42" })}:${JSON.stringify({ page: "2" })}:${JSON.stringify({ action: "test" })}`;
      expect(cacheGetMock).toHaveBeenCalledWith(expectedKey);
    });

    test("sends Forbidden when user is not in allowed users list", async () => {
      const wsSendMock = mock(() => {});
      const context = createMockSocketContext({
        env: {
          APP_ENV: "staging",
          STAGING_ALLOWED_USERS: ["allowed@test.com"],
        } as unknown as ContextType["env"],
        user: { email: "notallowed@test.com", roles: [] },
      });

      class AllowedUsersController {
        index(ctx: ContextType): IResponse {
          ctx.response.done = true;
          return ctx.response.json({ ok: true });
        }
      }
      container.add(AllowedUsersController);

      const route = createMockSocketRoute({ controller: AllowedUsersController });

      const wsId = `test-ws-id-allowed-users-denied-${Date.now()}`;
      container.addConstant(wsId, { context, route });

      const mockWs = createMockWs(wsId, wsSendMock);
      const mockServer = createMockServer();

      const message = JSON.stringify({
        payload: {},
        queries: {},
        lang: {},
      });

      await socketRouteHandler({
        message,
        ws: mockWs as unknown as import("bun").ServerWebSocket<{ id: string }>,
        server: mockServer as unknown as import("bun").Server<{ id: string }>,
      });

      expect(wsSendMock).toHaveBeenCalled();
      const sentData = JSON.parse(String((wsSendMock.mock.calls as unknown[][])?.[0]?.[0]));
      expect(sentData.status).toBe(HttpStatus.Code.Forbidden);
      expect(sentData.key).toBe("USER_NOT_ALLOWED");
    });

    test("allows user when email is in allowed users list", async () => {
      const wsSendMock = mock(() => {});
      const context = createMockSocketContext({
        env: {
          APP_ENV: "staging",
          STAGING_ALLOWED_USERS: ["allowed@test.com"],
        } as unknown as ContextType["env"],
        user: { email: "allowed@test.com", roles: [] },
      });

      class AllowedUsersPassController {
        index(ctx: ContextType): IResponse {
          ctx.response.done = true;
          return ctx.response.json({ ok: true });
        }
      }
      container.add(AllowedUsersPassController);

      const route = createMockSocketRoute({ controller: AllowedUsersPassController });

      const wsId = `test-ws-id-allowed-users-pass-${Date.now()}`;
      container.addConstant(wsId, { context, route });

      const mockWs = createMockWs(wsId, wsSendMock);
      const mockServer = createMockServer();

      const message = JSON.stringify({
        payload: {},
        queries: {},
        lang: {},
      });

      await socketRouteHandler({
        message,
        ws: mockWs as unknown as import("bun").ServerWebSocket<{ id: string }>,
        server: mockServer as unknown as import("bun").Server<{ id: string }>,
      });

      expect(wsSendMock).toHaveBeenCalled();
      const sentData = JSON.parse(String((wsSendMock.mock.calls as unknown[][])?.[0]?.[0]));
      expect(sentData.status).toBe(HttpStatus.Code.OK);
    });

    test("skips allowed users check when no user is present", async () => {
      const wsSendMock = mock(() => {});
      const context = createMockSocketContext({
        env: {
          APP_ENV: "staging",
          STAGING_ALLOWED_USERS: ["allowed@test.com"],
        } as unknown as ContextType["env"],
        user: null,
      });

      class NoUserController {
        index(ctx: ContextType): IResponse {
          ctx.response.done = true;
          return ctx.response.json({ ok: true });
        }
      }
      container.add(NoUserController);

      const route = createMockSocketRoute({ controller: NoUserController });

      const wsId = `test-ws-id-no-user-${Date.now()}`;
      container.addConstant(wsId, { context, route });

      const mockWs = createMockWs(wsId, wsSendMock);
      const mockServer = createMockServer();

      const message = JSON.stringify({
        payload: {},
        queries: {},
        lang: {},
      });

      await socketRouteHandler({
        message,
        ws: mockWs as unknown as import("bun").ServerWebSocket<{ id: string }>,
        server: mockServer as unknown as import("bun").Server<{ id: string }>,
      });

      expect(wsSendMock).toHaveBeenCalled();
      const sentData = JSON.parse(String((wsSendMock.mock.calls as unknown[][])?.[0]?.[0]));
      expect(sentData.status).toBe(HttpStatus.Code.OK);
    });

    test("skips allowed users check when allowed users list is empty", async () => {
      const wsSendMock = mock(() => {});
      const context = createMockSocketContext({
        env: {
          APP_ENV: "staging",
          STAGING_ALLOWED_USERS: [],
        } as unknown as ContextType["env"],
        user: { email: "anyone@test.com", roles: [] },
      });

      class EmptyListController {
        index(ctx: ContextType): IResponse {
          ctx.response.done = true;
          return ctx.response.json({ ok: true });
        }
      }
      container.add(EmptyListController);

      const route = createMockSocketRoute({ controller: EmptyListController });

      const wsId = `test-ws-id-empty-list-${Date.now()}`;
      container.addConstant(wsId, { context, route });

      const mockWs = createMockWs(wsId, wsSendMock);
      const mockServer = createMockServer();

      const message = JSON.stringify({
        payload: {},
        queries: {},
        lang: {},
      });

      await socketRouteHandler({
        message,
        ws: mockWs as unknown as import("bun").ServerWebSocket<{ id: string }>,
        server: mockServer as unknown as import("bun").Server<{ id: string }>,
      });

      expect(wsSendMock).toHaveBeenCalled();
      const sentData = JSON.parse(String((wsSendMock.mock.calls as unknown[][])?.[0]?.[0]));
      expect(sentData.status).toBe(HttpStatus.Code.OK);
    });

    test("adds SYSTEM role when user is in SYSTEM_USERS", async () => {
      const wsSendMock = mock(() => {});
      const context = createMockSocketContext({
        env: {
          APP_ENV: "production",
          SYSTEM_USERS: ["system@test.com"],
        } as unknown as ContextType["env"],
        user: { email: "system@test.com", roles: [] },
      });

      class SystemUserController {
        index(ctx: ContextType): IResponse {
          ctx.response.done = true;
          return ctx.response.json({ ok: true });
        }
      }
      container.add(SystemUserController);

      const route = createMockSocketRoute({ controller: SystemUserController });

      const wsId = `test-ws-id-system-user-${Date.now()}`;
      container.addConstant(wsId, { context, route });

      const mockWs = createMockWs(wsId, wsSendMock);
      const mockServer = createMockServer();

      const message = JSON.stringify({
        payload: {},
        queries: {},
        lang: {},
      });

      await socketRouteHandler({
        message,
        ws: mockWs as unknown as import("bun").ServerWebSocket<{ id: string }>,
        server: mockServer as unknown as import("bun").Server<{ id: string }>,
      });

      expect(context.user?.roles).toContain(ERole.SYSTEM);
    });

    test("adds SUPER_ADMIN role when user is in SUPER_ADMIN_USERS", async () => {
      const wsSendMock = mock(() => {});
      const context = createMockSocketContext({
        env: {
          APP_ENV: "production",
          SUPER_ADMIN_USERS: ["superadmin@test.com"],
        } as unknown as ContextType["env"],
        user: { email: "superadmin@test.com", roles: [] },
      });

      class SuperAdminUserController {
        index(ctx: ContextType): IResponse {
          ctx.response.done = true;
          return ctx.response.json({ ok: true });
        }
      }
      container.add(SuperAdminUserController);

      const route = createMockSocketRoute({ controller: SuperAdminUserController });

      const wsId = `test-ws-id-super-admin-user-${Date.now()}`;
      container.addConstant(wsId, { context, route });

      const mockWs = createMockWs(wsId, wsSendMock);
      const mockServer = createMockServer();

      const message = JSON.stringify({
        payload: {},
        queries: {},
        lang: {},
      });

      await socketRouteHandler({
        message,
        ws: mockWs as unknown as import("bun").ServerWebSocket<{ id: string }>,
        server: mockServer as unknown as import("bun").Server<{ id: string }>,
      });

      expect(context.user?.roles).toContain(ERole.SUPER_ADMIN);
    });

    test("adds ADMIN role when user is in ADMIN_USERS", async () => {
      const wsSendMock = mock(() => {});
      const context = createMockSocketContext({
        env: {
          APP_ENV: "production",
          ADMIN_USERS: ["admin@test.com"],
        } as unknown as ContextType["env"],
        user: { email: "admin@test.com", roles: [] },
      });

      class AdminUserController {
        index(ctx: ContextType): IResponse {
          ctx.response.done = true;
          return ctx.response.json({ ok: true });
        }
      }
      container.add(AdminUserController);

      const route = createMockSocketRoute({ controller: AdminUserController });

      const wsId = `test-ws-id-admin-user-${Date.now()}`;
      container.addConstant(wsId, { context, route });

      const mockWs = createMockWs(wsId, wsSendMock);
      const mockServer = createMockServer();

      const message = JSON.stringify({
        payload: {},
        queries: {},
        lang: {},
      });

      await socketRouteHandler({
        message,
        ws: mockWs as unknown as import("bun").ServerWebSocket<{ id: string }>,
        server: mockServer as unknown as import("bun").Server<{ id: string }>,
      });

      expect(context.user?.roles).toContain(ERole.ADMIN);
    });

    test("adds all roles when user is in SYSTEM_USERS, SUPER_ADMIN_USERS, and ADMIN_USERS", async () => {
      const wsSendMock = mock(() => {});
      const context = createMockSocketContext({
        env: {
          APP_ENV: "production",
          SYSTEM_USERS: ["multi@test.com"],
          SUPER_ADMIN_USERS: ["multi@test.com"],
          ADMIN_USERS: ["multi@test.com"],
        } as unknown as ContextType["env"],
        user: { email: "multi@test.com", roles: [] },
      });

      class MultiRoleUserController {
        index(ctx: ContextType): IResponse {
          ctx.response.done = true;
          return ctx.response.json({ ok: true });
        }
      }
      container.add(MultiRoleUserController);

      const route = createMockSocketRoute({ controller: MultiRoleUserController });

      const wsId = `test-ws-id-multi-role-user-${Date.now()}`;
      container.addConstant(wsId, { context, route });

      const mockWs = createMockWs(wsId, wsSendMock);
      const mockServer = createMockServer();

      const message = JSON.stringify({
        payload: {},
        queries: {},
        lang: {},
      });

      await socketRouteHandler({
        message,
        ws: mockWs as unknown as import("bun").ServerWebSocket<{ id: string }>,
        server: mockServer as unknown as import("bun").Server<{ id: string }>,
      });

      expect(context.user?.roles).toContain(ERole.SYSTEM);
      expect(context.user?.roles).toContain(ERole.SUPER_ADMIN);
      expect(context.user?.roles).toContain(ERole.ADMIN);
    });
  });
});
