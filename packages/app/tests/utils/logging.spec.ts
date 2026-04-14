import { describe, expect, mock, test } from "bun:test";
import type { ContextType } from "@ooneex/controller";
import { HttpStatus } from "@ooneex/http-status";
import type { LogsEntity } from "@ooneex/logger";
import { logRequest } from "@/utils/logging";
import { createMockContext, createMockLogger } from "./helpers";

describe("logRequest", () => {
  test("calls logger.success for 2xx status", () => {
    const logger = createMockLogger();
    const context = createMockContext({
      logger: logger as unknown as ContextType["logger"],
      method: "GET",
    });
    context.response.json({}, HttpStatus.Code.OK);

    logRequest(context);

    expect(logger.success).toHaveBeenCalled();
    expect(logger.info).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
  });

  test("calls logger.info for 3xx status", () => {
    const logger = createMockLogger();
    const context = createMockContext({
      logger: logger as unknown as ContextType["logger"],
    });
    context.response.redirect("/other", HttpStatus.Code.MovedPermanently);

    logRequest(context);

    expect(logger.info).toHaveBeenCalled();
    expect(logger.success).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
  });

  test("calls logger.warn for 4xx status", () => {
    const logger = createMockLogger();
    const context = createMockContext({
      logger: logger as unknown as ContextType["logger"],
    });
    context.response.exception("Not found", { status: HttpStatus.Code.NotFound });

    logRequest(context);

    expect(logger.warn).toHaveBeenCalled();
    expect(logger.success).not.toHaveBeenCalled();
    expect(logger.info).not.toHaveBeenCalled();
    expect(logger.error).not.toHaveBeenCalled();
  });

  test("calls logger.error for 5xx status", () => {
    const logger = createMockLogger();
    const context = createMockContext({
      logger: logger as unknown as ContextType["logger"],
    });
    context.response.exception("Server error", { status: HttpStatus.Code.InternalServerError });

    logRequest(context);

    expect(logger.error).toHaveBeenCalled();
    expect(logger.success).not.toHaveBeenCalled();
    expect(logger.info).not.toHaveBeenCalled();
    expect(logger.warn).not.toHaveBeenCalled();
  });

  test("uses statusOverride when provided", () => {
    const logger = createMockLogger();
    const context = createMockContext({
      logger: logger as unknown as ContextType["logger"],
    });
    context.response.json({}, HttpStatus.Code.OK);

    logRequest(context, HttpStatus.Code.InternalServerError);

    expect(logger.error).toHaveBeenCalled();
    expect(logger.success).not.toHaveBeenCalled();
  });

  test("includes method and path in log message", () => {
    const logger = createMockLogger();
    const context = createMockContext({
      logger: logger as unknown as ContextType["logger"],
      method: "POST",
      route: {
        name: "api.users.create",
        path: "/users" as const,
        method: "POST" as const,
        version: 1,
        description: "Create user",
      },
    });
    context.response.json({}, HttpStatus.Code.Created);

    logRequest(context);

    const callArgs = logger.success.mock.calls[0];
    expect(callArgs?.[0]).toBe("POST /users");
  });

  test("returns early when logger is null", () => {
    const context = createMockContext({
      logger: null as unknown as ContextType["logger"],
    });

    expect(() => logRequest(context)).not.toThrow();
  });

  test("includes user info when user is present", () => {
    const logger = createMockLogger();
    const context = createMockContext({
      logger: logger as unknown as ContextType["logger"],
      user: {
        id: "user-123",
        email: "test@example.com",
        firstName: "John",
        lastName: "Doe",
        roles: [],
      } as unknown as ContextType["user"],
    });
    context.response.json({}, HttpStatus.Code.OK);

    logRequest(context);

    expect(logger.success).toHaveBeenCalled();
    const logData = logger.success.mock.calls[0]?.[1] as LogsEntity;
    expect(logData.userId).toBe("user-123");
    expect(logData.email).toBe("test@example.com");
    expect(logData.firstName).toBe("John");
    expect(logData.lastName).toBe("Doe");
  });

  test("includes client info when available", () => {
    const logger = createMockLogger();
    const header = {
      get: mock((name: string) => {
        if (name === "User-Agent") return "Mozilla/5.0";
        return null;
      }),
      getReferer: mock(() => "https://example.com"),
    };
    const context = createMockContext({
      logger: logger as unknown as ContextType["logger"],
      header: header as unknown as ContextType["header"],
      ip: "10.0.0.1",
    });
    context.response.json({}, HttpStatus.Code.OK);

    logRequest(context);

    const logData = logger.success.mock.calls[0]?.[1] as LogsEntity;
    expect(logData.ip).toBe("10.0.0.1");
    expect(logData.userAgent).toBe("Mozilla/5.0");
    expect(logData.referer).toBe("https://example.com");
  });

  test("includes route version when present", () => {
    const logger = createMockLogger();
    const context = createMockContext({
      logger: logger as unknown as ContextType["logger"],
      route: {
        name: "api.test.list",
        path: "/test" as const,
        method: "GET" as const,
        version: 2,
        description: "Test route",
      },
    });
    context.response.json({}, HttpStatus.Code.OK);

    logRequest(context);

    const logData = logger.success.mock.calls[0]?.[1] as LogsEntity;
    expect(logData.version).toBe(2);
  });

  test("uses empty path when route is null", () => {
    const logger = createMockLogger();
    const context = createMockContext({
      logger: logger as unknown as ContextType["logger"],
      route: null,
    });

    logRequest(context);

    const callArgs = logger.success.mock.calls[0];
    expect(callArgs?.[0]).toBe("GET ");
  });

  test("includes params, payload, and queries in log data", () => {
    const logger = createMockLogger();
    const context = createMockContext({
      logger: logger as unknown as ContextType["logger"],
      params: { id: "42" },
      payload: { name: "test" },
      queries: { page: "1" } as unknown as ContextType["queries"],
    });
    context.response.json({}, HttpStatus.Code.OK);

    logRequest(context);

    const logData = logger.success.mock.calls[0]?.[1] as LogsEntity;
    expect(logData.params).toEqual({ id: "42" });
    expect(logData.payload).toEqual({ name: "test" });
    expect(logData.queries).toEqual({ page: "1" });
  });
});
