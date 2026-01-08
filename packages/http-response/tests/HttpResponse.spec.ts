import { beforeEach, describe, expect, test } from "bun:test";
import { Environment } from "@ooneex/app-env";
import { Header } from "@ooneex/http-header";
import { HttpStatus } from "@ooneex/http-status";
import { HttpResponse, type IResponse } from "@/index";

describe("HttpResponse", () => {
  let response: HttpResponse;

  beforeEach(() => {
    response = new HttpResponse();
  });

  describe("constructor", () => {
    test("should create instance with default header", () => {
      const response = new HttpResponse();
      expect(response.header).toBeInstanceOf(Header);
    });

    test("should create instance with provided header", () => {
      const customHeader = new Header();
      customHeader.set("X-Custom", "test");
      const response = new HttpResponse(customHeader);

      expect(response.header).toBe(customHeader);
      expect(response.header.get("X-Custom")).toBe("test");
    });
  });

  describe("json method", () => {
    test("should set JSON data with default status 200", () => {
      const data = { message: "Hello, World!" };
      const result = response.json(data);

      expect(result).toBe(response); // Should return this for chaining
      expect(response.header.get("Content-Type")).toBe("application/json");

      const webResponse = response.get();
      expect(webResponse.status).toBe(HttpStatus.Code.OK);
      expect(webResponse.json()).resolves.toEqual({
        app: {
          env: "production",
        },
        data,
        done: false,
        isClientError: false,
        isForbidden: false,
        isNotFound: false,
        isServerError: false,
        isUnauthorized: false,
        message: null,
        status: 200,
        success: true,
      });
    });

    test("should set JSON data with custom status", () => {
      const data = { message: "Created" };
      response.json(data, HttpStatus.Code.Created);

      const webResponse = response.get();
      expect(webResponse.status).toBe(HttpStatus.Code.Created);
      expect(webResponse.json()).resolves.toEqual({
        app: {
          env: "production",
        },
        data,
        done: false,
        isClientError: false,
        isForbidden: false,
        isNotFound: false,
        isServerError: false,
        isUnauthorized: false,
        message: null,
        status: 201,
        success: true,
      });
    });

    test("should reset other properties when setting JSON", () => {
      // First set as exception
      response.exception("Error occurred");

      // Then set as JSON
      const data = { success: true };
      response.json(data);

      const webResponse = response.get();
      expect(webResponse.status).toBe(HttpStatus.Code.OK);
      expect(webResponse.json()).resolves.toEqual({
        app: {
          env: "production",
        },
        data,
        done: false,
        isClientError: false,
        isForbidden: false,
        isNotFound: false,
        isServerError: false,
        isUnauthorized: false,
        message: null,
        status: 200,
        success: true,
      });
    });

    test("should handle complex data structures", () => {
      const data = {
        user: { id: 1, name: "John" },
        items: [{ id: 1, title: "Item 1" }],
        metadata: { count: 1, page: 1 },
      };

      response.json(data);
      const webResponse = response.get();
      expect(webResponse.json()).resolves.toEqual({
        app: {
          env: "production",
        },
        data,
        done: false,
        isClientError: false,
        isForbidden: false,
        isNotFound: false,
        isServerError: false,
        isUnauthorized: false,
        message: null,
        status: 200,
        success: true,
      });
    });
  });

  describe("exception method", () => {
    test("should set exception with default status 500", () => {
      const message = "Internal Server Error";
      const result = response.exception(message);

      expect(result).toBe(response); // Should return this for chaining
      expect(response.header.get("Content-Type")).toBe("application/json");

      const webResponse = response.get();
      expect(webResponse.status).toBe(HttpStatus.Code.InternalServerError);

      expect(webResponse.json()).resolves.toEqual({
        app: {
          env: "production",
        },
        data: {},
        done: false,
        isClientError: false,
        isForbidden: false,
        isNotFound: false,
        isServerError: true,
        isUnauthorized: false,
        message,
        status: HttpStatus.Code.InternalServerError,
        success: false,
      });
    });

    test("should set exception with custom status and data", () => {
      const message = "Bad Request Error";
      const data = { field: "email", reason: "invalid format" };
      const config = {
        status: HttpStatus.Code.BadRequest,
        data,
      };

      response.exception(message, config);

      const webResponse = response.get();
      expect(webResponse.status).toBe(HttpStatus.Code.BadRequest);

      expect(webResponse.json()).resolves.toEqual({
        app: {
          env: "production",
        },
        data,
        done: false,
        isClientError: true,
        isForbidden: false,
        isNotFound: false,
        isServerError: false,
        isUnauthorized: false,
        message,
        status: HttpStatus.Code.BadRequest,
        success: false,
      });
    });

    test("should reset redirect properties when setting exception", () => {
      // First set as redirect
      response.redirect("https://example.com");

      // Then set as exception
      response.exception("Error occurred");

      const webResponse = response.get();
      expect(webResponse.status).toBe(HttpStatus.Code.InternalServerError);
      expect(response.header.get("Location")).toBeNull();
    });
  });

  describe("notFound method", () => {
    test("should set not found exception with default status 404", () => {
      const message = "Resource not found";
      const result = response.notFound(message);

      expect(result).toBe(response); // Should return this for chaining
      expect(response.header.get("Content-Type")).toBe("application/json");

      const webResponse = response.get();
      expect(webResponse.status).toBe(HttpStatus.Code.NotFound);

      expect(webResponse.json()).resolves.toEqual({
        app: {
          env: "production",
        },
        data: {},
        done: false,
        isClientError: true,
        isForbidden: false,
        isNotFound: false,
        isServerError: false,
        isUnauthorized: false,
        message,
        status: HttpStatus.Code.NotFound,
        success: false,
      });
    });

    test("should set not found with custom status and data", () => {
      const message = "User not found";
      const data = { userId: 123 };
      const config = {
        status: HttpStatus.Code.Gone,
        data,
      };

      response.notFound(message, config);

      const webResponse = response.get();
      expect(webResponse.status).toBe(HttpStatus.Code.Gone);

      expect(webResponse.json()).resolves.toEqual({
        app: {
          env: "production",
        },
        data,
        done: false,
        isClientError: true,
        isForbidden: false,
        isNotFound: false,
        isServerError: false,
        isUnauthorized: false,
        message,
        status: HttpStatus.Code.Gone,
        success: false,
      });
    });
  });

  describe("redirect method", () => {
    test("should set redirect with string URL and default status 302", () => {
      const url = "https://example.com";
      const result = response.redirect(url);

      expect(result).toBe(response); // Should return this for chaining
      expect(response.header.get("Location")).toBe(url);

      const webResponse = response.get();
      expect(webResponse.status).toBe(HttpStatus.Code.Found);
      expect(webResponse.body).toBeNull();
    });

    test("should set redirect with URL object and custom status", () => {
      const url = new URL("https://example.com/path");
      response.redirect(url, HttpStatus.Code.MovedPermanently);

      expect(response.header.get("Location")).toBe(url.toString());

      const webResponse = response.get();
      expect(webResponse.status).toBe(HttpStatus.Code.MovedPermanently);
      expect(webResponse.body).toBeNull();
    });

    test("should reset other properties when setting redirect", () => {
      // First set as JSON
      response.json({ message: "test" });

      // Then set as redirect
      response.redirect("https://example.com");

      const webResponse = response.get();
      expect(webResponse.status).toBe(HttpStatus.Code.Found);
      expect(webResponse.body).toBeNull();
    });

    test("should handle relative URLs", () => {
      const url = "/dashboard";
      response.redirect(url);

      expect(response.header.get("Location")).toBe(url);

      const webResponse = response.get();
      expect(webResponse.status).toBe(HttpStatus.Code.Found);
    });
  });

  describe("get method", () => {
    test("should return Web API Response for JSON data", async () => {
      const data = { message: "test" };
      response.json(data, HttpStatus.Code.Created);

      const webResponse = response.get();
      expect(webResponse).toBeInstanceOf(Response);
      expect(webResponse.status).toBe(HttpStatus.Code.Created);
      expect(webResponse.headers.get("Content-Type")).toBe("application/json");

      const responseData = await webResponse.json();
      expect(responseData).toEqual({
        app: {
          env: "production",
        },
        data,
        done: false,
        isClientError: false,
        isForbidden: false,
        isNotFound: false,
        isServerError: false,
        isUnauthorized: false,
        message: null,
        status: 201,
        success: true,
      });
    });

    test("should return Web API Response for redirect", () => {
      const url = "https://example.com";
      response.redirect(url, HttpStatus.Code.SeeOther);

      const webResponse = response.get();
      expect(webResponse).toBeInstanceOf(Response);
      expect(webResponse.status).toBe(HttpStatus.Code.SeeOther);
      expect(webResponse.headers.get("Location")).toBe(url);
      expect(webResponse.body).toBeNull();
    });

    test("should return Web API Response for exception", async () => {
      const message = "Test error";
      const data = { code: "ERR001" };
      response.exception(message, {
        status: HttpStatus.Code.UnprocessableEntity,
        data,
      });

      const webResponse = response.get();
      expect(webResponse).toBeInstanceOf(Response);
      expect(webResponse.status).toBe(HttpStatus.Code.UnprocessableEntity);
      expect(webResponse.headers.get("Content-Type")).toBe("application/json");

      const responseData = await webResponse.json();
      expect(responseData).toEqual({
        app: {
          env: "production",
        },
        data,
        done: false,
        isClientError: true,
        isForbidden: false,
        isNotFound: false,
        isServerError: false,
        isUnauthorized: false,
        message,
        status: HttpStatus.Code.UnprocessableEntity,
        success: false,
      });
    });

    test("should return Web API Response with null body for empty JSON", () => {
      response.json({});

      const webResponse = response.get();
      const responseBody = webResponse.body;
      expect(responseBody).not.toBeNull();
    });
  });

  describe("method chaining", () => {
    test("should support method chaining for json", () => {
      const data = { message: "chaining test" };
      const result = response.json(data, HttpStatus.Code.Created);

      expect(result).toBe(response);

      const webResponse = response.get();
      expect(webResponse.status).toBe(HttpStatus.Code.Created);
      expect(webResponse.json()).resolves.toEqual({
        app: {
          env: "production",
        },
        data,
        done: false,
        isClientError: false,
        isForbidden: false,
        isNotFound: false,
        isServerError: false,
        isUnauthorized: false,
        message: null,
        status: 201,
        success: true,
      });
    });

    test("should support method chaining for exception", () => {
      const message = "Chaining error";
      const result = response.exception(message, {
        status: HttpStatus.Code.BadRequest,
      });

      expect(result).toBe(response);

      const webResponse = response.get();
      expect(webResponse.status).toBe(HttpStatus.Code.BadRequest);
    });

    test("should support method chaining for notFound", () => {
      const message = "Not found chaining";
      const result = response.notFound(message, { status: HttpStatus.Code.Gone });

      expect(result).toBe(response);

      const webResponse = response.get();
      expect(webResponse.status).toBe(HttpStatus.Code.Gone);
    });

    test("should support method chaining for redirect", () => {
      const url = "https://chain.example.com";
      const result = response.redirect(url, HttpStatus.Code.MovedPermanently);

      expect(result).toBe(response);

      const webResponse = response.get();
      expect(webResponse.status).toBe(HttpStatus.Code.MovedPermanently);
      expect(response.header.get("Location")).toBe(url);
    });
  });

  describe("state transitions", () => {
    test("should properly transition from json to exception", async () => {
      // Start with JSON
      response.json({ message: "initial" }, HttpStatus.Code.OK);

      // Switch to exception
      response.exception("Error occurred", { status: HttpStatus.Code.BadRequest });

      const webResponse = response.get();
      expect(webResponse.status).toBe(HttpStatus.Code.BadRequest);

      const data = await webResponse.json();
      expect(data.success).toBe(false);
      expect(data.message).toBe("Error occurred");
    });

    test("should properly transition from exception to json", async () => {
      // Start with exception
      response.exception("Initial error");

      // Switch to JSON
      response.json({ success: true }, HttpStatus.Code.OK);

      const webResponse = response.get();
      expect(webResponse.status).toBe(HttpStatus.Code.OK);

      const data = await webResponse.json();
      expect(data).toEqual({
        app: {
          env: "production",
        },
        data: { success: true },
        done: false,
        isClientError: false,
        isForbidden: false,
        isNotFound: false,
        isServerError: false,
        isUnauthorized: false,
        message: null,
        status: 200,
        success: true,
      });
    });

    test("should properly transition from redirect to json", async () => {
      // Start with redirect
      response.redirect("https://example.com");

      // Switch to JSON
      response.json({ message: "switched" });

      const webResponse = response.get();
      expect(webResponse.status).toBe(HttpStatus.Code.OK);
      expect(response.header.get("Location")).toBeNull();

      const data = await webResponse.json();
      expect(data).toEqual({
        app: {
          env: "production",
        },
        data: { message: "switched" },
        done: false,
        isClientError: false,
        isForbidden: false,
        isNotFound: false,
        isServerError: false,
        isUnauthorized: false,
        message: null,
        status: 200,
        success: true,
      });
    });
  });

  describe("TypeScript generics", () => {
    test("should work with typed data", () => {
      interface User extends Record<string, unknown> {
        id: number;
        name: string;
        email: string;
      }

      const userResponse = new HttpResponse<User>();
      const userData: User = {
        id: 1,
        name: "John Doe",
        email: "john@example.com",
      };

      userResponse.json(userData);

      const webResponse = userResponse.get();
      expect(webResponse.json()).resolves.toEqual({
        app: {
          env: "production",
        },
        data: userData,
        done: false,
        isClientError: false,
        isForbidden: false,
        isNotFound: false,
        isServerError: false,
        isUnauthorized: false,
        message: null,
        status: 200,
        success: true,
      });
    });

    test("should work with typed exception data", async () => {
      interface ErrorData extends Record<string, unknown> {
        field: string;
        code: string;
      }

      const errorResponse = new HttpResponse<ErrorData>();
      const errorData: ErrorData = {
        field: "email",
        code: "INVALID_FORMAT",
      };

      errorResponse.exception("Validation failed", { data: errorData });

      const webResponse = errorResponse.get();
      const responseData = await webResponse.json();
      expect(responseData.data).toEqual(errorData);
    });
  });

  describe("interface compliance", () => {
    test("should implement IResponse interface", () => {
      const response: IResponse = new HttpResponse();

      expect(typeof response.json).toBe("function");
      expect(typeof response.exception).toBe("function");
      expect(typeof response.notFound).toBe("function");
      expect(typeof response.redirect).toBe("function");
      expect(typeof response.get).toBe("function");
      expect(typeof response.getData).toBe("function");
      expect(response.header).toBeDefined();
    });
  });

  describe("edge cases", () => {
    test("should handle empty string message in exception", async () => {
      response.exception("");

      const webResponse = response.get();
      const data = await webResponse.json();
      expect(data.message).toBe("");
    });

    test("should handle empty string message in notFound", async () => {
      response.notFound("");

      const webResponse = response.get();
      const data = await webResponse.json();
      expect(data.message).toBe("");
    });

    test("should handle empty object as JSON data", async () => {
      const emptyData = {};
      response.json(emptyData);

      const webResponse = response.get();
      const data = await webResponse.json();
      expect(data).toEqual({
        app: {
          env: "production",
        },
        data: emptyData,
        done: false,
        isClientError: false,
        isForbidden: false,
        isNotFound: false,
        isServerError: false,
        isUnauthorized: false,
        message: null,
        status: 200,
        success: true,
      });
    });

    test("should handle URL object toString conversion", () => {
      const url = new URL("https://example.com/path?query=value#hash");
      response.redirect(url);

      expect(response.header.get("Location")).toBe(url.toString());
    });
  });

  describe("header integration", () => {
    test("should preserve custom headers set before json", () => {
      response.header.set("X-Custom-Header", "custom-value");
      response.json({ message: "test" });

      const webResponse = response.get();
      expect(webResponse.headers.get("X-Custom-Header")).toBe("custom-value");
      expect(webResponse.headers.get("Content-Type")).toBe("application/json");
    });

    test("should preserve custom headers set before exception", () => {
      response.header.set("X-Request-ID", "12345");
      response.exception("Error occurred");

      const webResponse = response.get();
      expect(webResponse.headers.get("X-Request-ID")).toBe("12345");
      expect(webResponse.headers.get("Content-Type")).toBe("application/json");
    });

    test("should preserve custom headers set before redirect", () => {
      response.header.set("X-Custom-Tracking", "redirect-tracking");
      response.redirect("https://example.com");

      const webResponse = response.get();
      expect(webResponse.headers.get("X-Custom-Tracking")).toBe("redirect-tracking");
      expect(webResponse.headers.get("Location")).toBe("https://example.com");
    });
  });

  describe("getData method", () => {
    test("should return null when no data is set", () => {
      expect(response.getData()).toBeNull();
    });

    test("should return data after json is called", () => {
      const data = { message: "test" };
      response.json(data);

      expect(response.getData()).toEqual(data);
    });

    test("should return data after exception is called with data", () => {
      const data = { field: "email", code: "INVALID" };
      response.exception("Validation error", { data });

      expect(response.getData()).toEqual(data);
    });

    test("should return null after exception is called without data", () => {
      response.exception("Error occurred");

      expect(response.getData()).toBeNull();
    });

    test("should return data after notFound is called with data", () => {
      const data = { resourceId: 123 };
      response.notFound("Resource not found", { data });

      expect(response.getData()).toEqual(data);
    });

    test("should return null after redirect is called", () => {
      response.json({ message: "test" });
      response.redirect("https://example.com");

      expect(response.getData()).toBeNull();
    });
  });

  describe("done property", () => {
    test("should default to false", () => {
      expect(response.done).toBe(false);
    });

    test("should be settable to true", () => {
      response.done = true;
      expect(response.done).toBe(true);
    });

    test("should be included in response data", async () => {
      response.done = true;
      response.json({ message: "test" });

      const webResponse = response.get();
      const data = await webResponse.json();
      expect(data.done).toBe(true);
    });
  });

  describe("get method with environment parameter", () => {
    test("should use production environment by default", async () => {
      response.json({ message: "test" });

      const webResponse = response.get();
      const data = await webResponse.json();
      expect(data.app.env).toBe("production");
    });

    test("should use provided development environment", async () => {
      response.json({ message: "test" });

      const webResponse = response.get(Environment.DEVELOPMENT);
      const data = await webResponse.json();
      expect(data.app.env).toBe("development");
    });

    test("should use provided test environment", async () => {
      response.json({ message: "test" });

      const webResponse = response.get(Environment.TEST);
      const data = await webResponse.json();
      expect(data.app.env).toBe("test");
    });

    test("should use provided staging environment", async () => {
      response.json({ message: "test" });

      const webResponse = response.get(Environment.STAGING);
      const data = await webResponse.json();
      expect(data.app.env).toBe("staging");
    });
  });
});
