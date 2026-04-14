import { describe, expect, test } from "bun:test";
import { Environment } from "@ooneex/app-env";
import { container } from "@ooneex/container";
import type { ContextType } from "@ooneex/controller";
import { Exception } from "@ooneex/exception";
import { HttpResponse, type IResponse } from "@ooneex/http-response";
import { HttpStatus } from "@ooneex/http-status";
import type { RouteConfigType } from "@ooneex/routing";
import { type } from "@ooneex/validation";
import { buildExceptionResponse, httpRouteHandler } from "@/utils/controller";
import { createMockContext, createMockRoute } from "./helpers";

describe("buildExceptionResponse", () => {
  test("returns a Response with exception details", () => {
    const context = createMockContext();

    const response = buildExceptionResponse(
      context,
      "Something went wrong",
      HttpStatus.Code.BadRequest,
      Environment.DEVELOPMENT,
    );

    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(HttpStatus.Code.BadRequest);
  });

  test("includes key in exception response when provided", () => {
    const context = createMockContext();

    const response = buildExceptionResponse(
      context,
      "Forbidden",
      HttpStatus.Code.Forbidden,
      Environment.DEVELOPMENT,
      "ACCESS_DENIED",
    );

    expect(response.status).toBe(HttpStatus.Code.Forbidden);
  });

  test("works without key parameter", () => {
    const context = createMockContext();

    const response = buildExceptionResponse(context, "Not found", HttpStatus.Code.NotFound, Environment.PRODUCTION);

    expect(response).toBeInstanceOf(Response);
    expect(response.status).toBe(HttpStatus.Code.NotFound);
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
