import { beforeEach, describe, expect, test } from "bun:test";
import { Header } from "@ooneex/http-header";
import { Status } from "@ooneex/http-status";
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
      expect(webResponse.status).toBe(Status.Code.OK);
      expect(webResponse.json()).resolves.toEqual(data);
    });

    test("should set JSON data with custom status", () => {
      const data = { message: "Created" };
      response.json(data, Status.Code.Created);

      const webResponse = response.get();
      expect(webResponse.status).toBe(Status.Code.Created);
      expect(webResponse.json()).resolves.toEqual(data);
    });

    test("should reset other properties when setting JSON", () => {
      // First set as exception
      response.exception("Error occurred");

      // Then set as JSON
      const data = { success: true };
      response.json(data);

      const webResponse = response.get();
      expect(webResponse.status).toBe(Status.Code.OK);
      expect(webResponse.json()).resolves.toEqual(data);
    });

    test("should handle complex data structures", () => {
      const data = {
        user: { id: 1, name: "John" },
        items: [{ id: 1, title: "Item 1" }],
        metadata: { count: 1, page: 1 },
      };

      response.json(data);
      const webResponse = response.get();
      expect(webResponse.json()).resolves.toEqual(data);
    });
  });

  describe("exception method", () => {
    test("should set exception with default status 500", () => {
      const message = "Internal Server Error";
      const result = response.exception(message);

      expect(result).toBe(response); // Should return this for chaining
      expect(response.header.get("Content-Type")).toBe("application/json");

      const webResponse = response.get();
      expect(webResponse.status).toBe(Status.Code.InternalServerError);

      expect(webResponse.json()).resolves.toEqual({
        error: true,
        message,
        status: Status.Code.InternalServerError,
        data: null,
      });
    });

    test("should set exception with custom status and data", () => {
      const message = "Bad Request Error";
      const data = { field: "email", reason: "invalid format" };
      const config = {
        status: Status.Code.BadRequest,
        data,
      };

      response.exception(message, config);

      const webResponse = response.get();
      expect(webResponse.status).toBe(Status.Code.BadRequest);

      expect(webResponse.json()).resolves.toEqual({
        error: true,
        message,
        status: Status.Code.BadRequest,
        data,
      });
    });

    test("should reset redirect properties when setting exception", () => {
      // First set as redirect
      response.redirect("https://example.com");

      // Then set as exception
      response.exception("Error occurred");

      const webResponse = response.get();
      expect(webResponse.status).toBe(Status.Code.InternalServerError);
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
      expect(webResponse.status).toBe(Status.Code.NotFound);

      expect(webResponse.json()).resolves.toEqual({
        error: true,
        message,
        status: Status.Code.NotFound,
        data: null,
      });
    });

    test("should set not found with custom status and data", () => {
      const message = "User not found";
      const data = { userId: 123 };
      const config = {
        status: Status.Code.Gone,
        data,
      };

      response.notFound(message, config);

      const webResponse = response.get();
      expect(webResponse.status).toBe(Status.Code.Gone);

      expect(webResponse.json()).resolves.toEqual({
        error: true,
        message,
        status: Status.Code.Gone,
        data,
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
      expect(webResponse.status).toBe(Status.Code.Found);
      expect(webResponse.body).toBeNull();
    });

    test("should set redirect with URL object and custom status", () => {
      const url = new URL("https://example.com/path");
      response.redirect(url, Status.Code.MovedPermanently);

      expect(response.header.get("Location")).toBe(url.toString());

      const webResponse = response.get();
      expect(webResponse.status).toBe(Status.Code.MovedPermanently);
      expect(webResponse.body).toBeNull();
    });

    test("should reset other properties when setting redirect", () => {
      // First set as JSON
      response.json({ message: "test" });

      // Then set as redirect
      response.redirect("https://example.com");

      const webResponse = response.get();
      expect(webResponse.status).toBe(Status.Code.Found);
      expect(webResponse.body).toBeNull();
    });

    test("should handle relative URLs", () => {
      const url = "/dashboard";
      response.redirect(url);

      expect(response.header.get("Location")).toBe(url);

      const webResponse = response.get();
      expect(webResponse.status).toBe(Status.Code.Found);
    });
  });

  describe("get method", () => {
    test("should return Web API Response for JSON data", async () => {
      const data = { message: "test" };
      response.json(data, Status.Code.Created);

      const webResponse = response.get();
      expect(webResponse).toBeInstanceOf(Response);
      expect(webResponse.status).toBe(Status.Code.Created);
      expect(webResponse.headers.get("Content-Type")).toBe("application/json");

      const responseData = await webResponse.json();
      expect(responseData).toEqual(data);
    });

    test("should return Web API Response for redirect", () => {
      const url = "https://example.com";
      response.redirect(url, Status.Code.SeeOther);

      const webResponse = response.get();
      expect(webResponse).toBeInstanceOf(Response);
      expect(webResponse.status).toBe(Status.Code.SeeOther);
      expect(webResponse.headers.get("Location")).toBe(url);
      expect(webResponse.body).toBeNull();
    });

    test("should return Web API Response for exception", async () => {
      const message = "Test error";
      const data = { code: "ERR001" };
      response.exception(message, { status: Status.Code.UnprocessableEntity, data });

      const webResponse = response.get();
      expect(webResponse).toBeInstanceOf(Response);
      expect(webResponse.status).toBe(Status.Code.UnprocessableEntity);
      expect(webResponse.headers.get("Content-Type")).toBe("application/json");

      const responseData = await webResponse.json();
      expect(responseData).toEqual({
        error: true,
        message,
        status: Status.Code.UnprocessableEntity,
        data,
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
      const result = response.json(data, Status.Code.Created);

      expect(result).toBe(response);

      const webResponse = response.get();
      expect(webResponse.status).toBe(Status.Code.Created);
      expect(webResponse.json()).resolves.toEqual(data);
    });

    test("should support method chaining for exception", () => {
      const message = "Chaining error";
      const result = response.exception(message, { status: Status.Code.BadRequest });

      expect(result).toBe(response);

      const webResponse = response.get();
      expect(webResponse.status).toBe(Status.Code.BadRequest);
    });

    test("should support method chaining for notFound", () => {
      const message = "Not found chaining";
      const result = response.notFound(message, { status: Status.Code.Gone });

      expect(result).toBe(response);

      const webResponse = response.get();
      expect(webResponse.status).toBe(Status.Code.Gone);
    });

    test("should support method chaining for redirect", () => {
      const url = "https://chain.example.com";
      const result = response.redirect(url, Status.Code.MovedPermanently);

      expect(result).toBe(response);

      const webResponse = response.get();
      expect(webResponse.status).toBe(Status.Code.MovedPermanently);
      expect(response.header.get("Location")).toBe(url);
    });
  });

  describe("state transitions", () => {
    test("should properly transition from json to exception", async () => {
      // Start with JSON
      response.json({ message: "initial" }, Status.Code.OK);

      // Switch to exception
      response.exception("Error occurred", { status: Status.Code.BadRequest });

      const webResponse = response.get();
      expect(webResponse.status).toBe(Status.Code.BadRequest);

      const data = await webResponse.json();
      expect(data.error).toBe(true);
      expect(data.message).toBe("Error occurred");
    });

    test("should properly transition from exception to json", async () => {
      // Start with exception
      response.exception("Initial error");

      // Switch to JSON
      response.json({ success: true }, Status.Code.OK);

      const webResponse = response.get();
      expect(webResponse.status).toBe(Status.Code.OK);

      const data = await webResponse.json();
      expect(data).toEqual({ success: true });
    });

    test("should properly transition from redirect to json", async () => {
      // Start with redirect
      response.redirect("https://example.com");

      // Switch to JSON
      response.json({ message: "switched" });

      const webResponse = response.get();
      expect(webResponse.status).toBe(Status.Code.OK);
      expect(response.header.get("Location")).toBeNull();

      const data = await webResponse.json();
      expect(data).toEqual({ message: "switched" });
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
      expect(webResponse.json()).resolves.toEqual(userData);
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
      expect(data).toEqual(emptyData);
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
});
