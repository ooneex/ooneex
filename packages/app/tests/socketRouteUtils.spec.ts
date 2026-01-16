import { describe, expect, mock, test } from "bun:test";
import { Environment } from "@ooneex/app-env";
import { container } from "@ooneex/container";
import { Exception } from "@ooneex/exception";
import { HttpResponse, type IResponse } from "@ooneex/http-response";
import { HttpStatus } from "@ooneex/http-status";
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
      description: "Test socket route",
    },
    app: {
      env: { env: Environment.DEVELOPMENT } as ContextType["app"]["env"],
    },
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

    test("creates handler for each socket path", () => {
      const socketRoutes = new Map<string, RouteConfigType>();
      socketRoutes.set("/ws/chat", createMockSocketRoute({ path: "/ws/chat", name: "api.chat.list" }));

      const result = formatSocketRoutes(socketRoutes);

      expect(result["/ws/chat"]).toBeDefined();
      expect(typeof result["/ws/chat"]).toBe("function");
    });

    test("creates handlers for multiple socket paths", () => {
      const socketRoutes = new Map<string, RouteConfigType>();
      socketRoutes.set("/ws/chat", createMockSocketRoute({ path: "/ws/chat", name: "api.chat.list" }));
      socketRoutes.set(
        "/ws/notifications",
        createMockSocketRoute({ path: "/ws/notifications", name: "api.notifications.list" }),
      );

      const result = formatSocketRoutes(socketRoutes);

      expect(result["/ws/chat"]).toBeDefined();
      expect(result["/ws/notifications"]).toBeDefined();
      expect(typeof result["/ws/chat"]).toBe("function");
      expect(typeof result["/ws/notifications"]).toBe("function");
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
        language: { locale: "en" },
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
        language: {},
      });

      await socketRouteHandler({
        message,
        ws: mockWs as unknown as import("bun").ServerWebSocket<{ id: string }>,
        server: mockServer as unknown as import("bun").Server<{ id: string }>,
        middlewares: [ThrowingMiddleware as unknown as import("@ooneex/middleware").SocketMiddlewareClassType],
      });

      expect(wsSendMock).toHaveBeenCalled();
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
        language: {},
      });

      await socketRouteHandler({
        message,
        ws: mockWs as unknown as import("bun").ServerWebSocket<{ id: string }>,
        server: mockServer as unknown as import("bun").Server<{ id: string }>,
        middlewares: [ErrorMiddleware as unknown as import("@ooneex/middleware").SocketMiddlewareClassType],
      });

      expect(wsSendMock).toHaveBeenCalled();
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
        language: {},
      });

      await socketRouteHandler({
        message,
        ws: mockWs as unknown as import("bun").ServerWebSocket<{ id: string }>,
        server: mockServer as unknown as import("bun").Server<{ id: string }>,
      });

      expect(wsSendMock).toHaveBeenCalled();
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
        language: {},
      });

      await socketRouteHandler({
        message,
        ws: mockWs as unknown as import("bun").ServerWebSocket<{ id: string }>,
        server: mockServer as unknown as import("bun").Server<{ id: string }>,
      });

      expect(wsSendMock).toHaveBeenCalled();
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
        language: {},
      });

      await socketRouteHandler({
        message,
        ws: mockWs as unknown as import("bun").ServerWebSocket<{ id: string }>,
        server: mockServer as unknown as import("bun").Server<{ id: string }>,
      });

      expect(wsSendMock).toHaveBeenCalled();
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
        language: {},
      });

      await socketRouteHandler({
        message,
        ws: mockWs as unknown as import("bun").ServerWebSocket<{ id: string }>,
        server: mockServer as unknown as import("bun").Server<{ id: string }>,
      });

      expect(wsSendMock).toHaveBeenCalled();
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
        language: { locale: "fr", region: "FR" },
      });

      await socketRouteHandler({
        message,
        ws: mockWs as unknown as import("bun").ServerWebSocket<{ id: string }>,
        server: mockServer as unknown as import("bun").Server<{ id: string }>,
      });

      expect(capturedContext).not.toBeNull();
      const ctx = capturedContext as unknown as ContextType;
      expect(ctx.payload).toEqual({ userId: 123, action: "test" });
      expect(ctx.queries).toEqual({ page: "2", limit: "10" });
      expect((ctx.language as Record<string, unknown>).locale).toBe("fr");
      expect((ctx.language as Record<string, unknown>).region).toBe("FR");
    });

    test("uses PRODUCTION environment as default when app.env.env is undefined", async () => {
      const wsSendMock = mock(() => {});
      const context = createMockSocketContext({
        app: { env: { env: undefined } as unknown as ContextType["app"]["env"] },
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
        language: {},
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
        language: {},
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
        language: {},
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
  });
});
