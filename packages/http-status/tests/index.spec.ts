import { beforeEach, describe, expect, test } from "bun:test";
import { Status, type StatusCodeType } from "../src/index";

describe("Status", () => {
  let status: Status;

  beforeEach(() => {
    status = new Status();
  });

  describe("Static properties", () => {
    test("should have Code property with status codes", () => {
      expect(Status.Code).toBeDefined();
      expect(typeof Status.Code).toBe("object");
    });

    test("should have Text property with status texts", () => {
      expect(Status.Text).toBeDefined();
      expect(typeof Status.Text).toBe("object");
    });
  });

  describe("isInformational", () => {
    test("should return true for 1xx status codes", () => {
      expect(status.isInformational(Status.Code.Continue)).toBe(true);
      expect(status.isInformational(Status.Code.SwitchingProtocols)).toBe(true);
      expect(status.isInformational(Status.Code.Processing)).toBe(true);
      expect(status.isInformational(Status.Code.EarlyHints)).toBe(true);
    });

    test("should return false for non-1xx status codes", () => {
      expect(status.isInformational(Status.Code.OK)).toBe(false);
      expect(status.isInformational(Status.Code.NotFound)).toBe(false);
      expect(status.isInformational(Status.Code.InternalServerError)).toBe(false);
      expect(status.isInformational(Status.Code.MultipleChoices)).toBe(false);
    });

    test("should handle edge cases around boundaries", () => {
      expect(status.isInformational(99 as StatusCodeType)).toBe(false);
      expect(status.isInformational(100 as StatusCodeType)).toBe(true);
      expect(status.isInformational(199 as StatusCodeType)).toBe(true);
      expect(status.isInformational(200 as StatusCodeType)).toBe(false);
    });
  });

  describe("isSuccessful", () => {
    test("should return true for 2xx status codes", () => {
      expect(status.isSuccessful(Status.Code.OK)).toBe(true);
      expect(status.isSuccessful(Status.Code.Created)).toBe(true);
      expect(status.isSuccessful(Status.Code.Accepted)).toBe(true);
      expect(status.isSuccessful(Status.Code.NoContent)).toBe(true);
      expect(status.isSuccessful(Status.Code.ResetContent)).toBe(true);
      expect(status.isSuccessful(Status.Code.PartialContent)).toBe(true);
      expect(status.isSuccessful(Status.Code.MultiStatus)).toBe(true);
      expect(status.isSuccessful(Status.Code.AlreadyReported)).toBe(true);
      expect(status.isSuccessful(Status.Code.IMUsed)).toBe(true);
    });

    test("should return false for non-2xx status codes", () => {
      expect(status.isSuccessful(Status.Code.Continue)).toBe(false);
      expect(status.isSuccessful(Status.Code.MultipleChoices)).toBe(false);
      expect(status.isSuccessful(Status.Code.BadRequest)).toBe(false);
      expect(status.isSuccessful(Status.Code.InternalServerError)).toBe(false);
    });

    test("should handle edge cases around boundaries", () => {
      expect(status.isSuccessful(199 as StatusCodeType)).toBe(false);
      expect(status.isSuccessful(200 as StatusCodeType)).toBe(true);
      expect(status.isSuccessful(299 as StatusCodeType)).toBe(true);
      expect(status.isSuccessful(300 as StatusCodeType)).toBe(false);
    });
  });

  describe("isRedirect", () => {
    test("should return true for 3xx status codes", () => {
      expect(status.isRedirect(Status.Code.MultipleChoices)).toBe(true);
      expect(status.isRedirect(Status.Code.MovedPermanently)).toBe(true);
      expect(status.isRedirect(Status.Code.Found)).toBe(true);
      expect(status.isRedirect(Status.Code.SeeOther)).toBe(true);
      expect(status.isRedirect(Status.Code.NotModified)).toBe(true);
      expect(status.isRedirect(Status.Code.UseProxy)).toBe(true);
      expect(status.isRedirect(Status.Code.TemporaryRedirect)).toBe(true);
      expect(status.isRedirect(Status.Code.PermanentRedirect)).toBe(true);
    });

    test("should return false for non-3xx status codes", () => {
      expect(status.isRedirect(Status.Code.OK)).toBe(false);
      expect(status.isRedirect(Status.Code.Continue)).toBe(false);
      expect(status.isRedirect(Status.Code.BadRequest)).toBe(false);
      expect(status.isRedirect(Status.Code.InternalServerError)).toBe(false);
    });

    test("should handle edge cases around boundaries", () => {
      expect(status.isRedirect(299 as StatusCodeType)).toBe(false);
      expect(status.isRedirect(300 as StatusCodeType)).toBe(true);
      expect(status.isRedirect(399 as StatusCodeType)).toBe(true);
      expect(status.isRedirect(400 as StatusCodeType)).toBe(false);
    });
  });

  describe("isClientError", () => {
    test("should return true for 4xx status codes", () => {
      expect(status.isClientError(Status.Code.BadRequest)).toBe(true);
      expect(status.isClientError(Status.Code.Unauthorized)).toBe(true);
      expect(status.isClientError(Status.Code.PaymentRequired)).toBe(true);
      expect(status.isClientError(Status.Code.Forbidden)).toBe(true);
      expect(status.isClientError(Status.Code.NotFound)).toBe(true);
      expect(status.isClientError(Status.Code.MethodNotAllowed)).toBe(true);
      expect(status.isClientError(Status.Code.Conflict)).toBe(true);
      expect(status.isClientError(Status.Code.Gone)).toBe(true);
      expect(status.isClientError(Status.Code.Teapot)).toBe(true);
      expect(status.isClientError(Status.Code.UnprocessableEntity)).toBe(true);
      expect(status.isClientError(Status.Code.TooManyRequests)).toBe(true);
      expect(status.isClientError(Status.Code.UnavailableForLegalReasons)).toBe(true);
    });

    test("should return false for non-4xx status codes", () => {
      expect(status.isClientError(Status.Code.OK)).toBe(false);
      expect(status.isClientError(Status.Code.Continue)).toBe(false);
      expect(status.isClientError(Status.Code.MultipleChoices)).toBe(false);
      expect(status.isClientError(Status.Code.InternalServerError)).toBe(false);
    });

    test("should handle edge cases around boundaries", () => {
      expect(status.isClientError(399 as StatusCodeType)).toBe(false);
      expect(status.isClientError(400 as StatusCodeType)).toBe(true);
      expect(status.isClientError(499 as StatusCodeType)).toBe(true);
      expect(status.isClientError(500 as StatusCodeType)).toBe(false);
    });
  });

  describe("isServerError", () => {
    test("should return true for 5xx status codes", () => {
      expect(status.isServerError(Status.Code.InternalServerError)).toBe(true);
      expect(status.isServerError(Status.Code.NotImplemented)).toBe(true);
      expect(status.isServerError(Status.Code.BadGateway)).toBe(true);
      expect(status.isServerError(Status.Code.ServiceUnavailable)).toBe(true);
      expect(status.isServerError(Status.Code.GatewayTimeout)).toBe(true);
      expect(status.isServerError(Status.Code.HTTPVersionNotSupported)).toBe(true);
      expect(status.isServerError(Status.Code.VariantAlsoNegotiates)).toBe(true);
      expect(status.isServerError(Status.Code.InsufficientStorage)).toBe(true);
      expect(status.isServerError(Status.Code.LoopDetected)).toBe(true);
      expect(status.isServerError(Status.Code.NotExtended)).toBe(true);
      expect(status.isServerError(Status.Code.NetworkAuthenticationRequired)).toBe(true);
    });

    test("should return false for non-5xx status codes", () => {
      expect(status.isServerError(Status.Code.OK)).toBe(false);
      expect(status.isServerError(Status.Code.Continue)).toBe(false);
      expect(status.isServerError(Status.Code.MultipleChoices)).toBe(false);
      expect(status.isServerError(Status.Code.BadRequest)).toBe(false);
    });

    test("should handle edge cases around boundaries", () => {
      expect(status.isServerError(499 as StatusCodeType)).toBe(false);
      expect(status.isServerError(500 as StatusCodeType)).toBe(true);
      expect(status.isServerError(599 as StatusCodeType)).toBe(true);
      expect(status.isServerError(600 as StatusCodeType)).toBe(false);
    });
  });

  describe("isError", () => {
    test("should return true for 4xx status codes", () => {
      expect(status.isError(Status.Code.BadRequest)).toBe(true);
      expect(status.isError(Status.Code.Unauthorized)).toBe(true);
      expect(status.isError(Status.Code.NotFound)).toBe(true);
      expect(status.isError(Status.Code.TooManyRequests)).toBe(true);
    });

    test("should return true for 5xx status codes", () => {
      expect(status.isError(Status.Code.InternalServerError)).toBe(true);
      expect(status.isError(Status.Code.NotImplemented)).toBe(true);
      expect(status.isError(Status.Code.BadGateway)).toBe(true);
      expect(status.isError(Status.Code.ServiceUnavailable)).toBe(true);
    });

    test("should return false for non-error status codes", () => {
      expect(status.isError(Status.Code.Continue)).toBe(false);
      expect(status.isError(Status.Code.OK)).toBe(false);
      expect(status.isError(Status.Code.Created)).toBe(false);
      expect(status.isError(Status.Code.MultipleChoices)).toBe(false);
      expect(status.isError(Status.Code.MovedPermanently)).toBe(false);
    });

    test("should handle edge cases", () => {
      expect(status.isError(399 as StatusCodeType)).toBe(false);
      expect(status.isError(400 as StatusCodeType)).toBe(true);
      expect(status.isError(499 as StatusCodeType)).toBe(true);
      expect(status.isError(500 as StatusCodeType)).toBe(true);
      expect(status.isError(599 as StatusCodeType)).toBe(true);
      expect(status.isError(600 as StatusCodeType)).toBe(false);
    });
  });

  describe("STATUS_CODE constants", () => {
    test("should have correct values for informational codes", () => {
      expect(Status.Code.Continue).toBe(100);
      expect(Status.Code.SwitchingProtocols).toBe(101);
      expect(Status.Code.Processing).toBe(102);
      expect(Status.Code.EarlyHints).toBe(103);
    });

    test("should have correct values for success codes", () => {
      expect(Status.Code.OK).toBe(200);
      expect(Status.Code.Created).toBe(201);
      expect(Status.Code.Accepted).toBe(202);
      expect(Status.Code.NoContent).toBe(204);
    });

    test("should have correct values for redirect codes", () => {
      expect(Status.Code.MultipleChoices).toBe(300);
      expect(Status.Code.MovedPermanently).toBe(301);
      expect(Status.Code.Found).toBe(302);
      expect(Status.Code.NotModified).toBe(304);
    });

    test("should have correct values for client error codes", () => {
      expect(Status.Code.BadRequest).toBe(400);
      expect(Status.Code.Unauthorized).toBe(401);
      expect(Status.Code.Forbidden).toBe(403);
      expect(Status.Code.NotFound).toBe(404);
      expect(Status.Code.Teapot).toBe(418);
    });

    test("should have correct values for server error codes", () => {
      expect(Status.Code.InternalServerError).toBe(500);
      expect(Status.Code.NotImplemented).toBe(501);
      expect(Status.Code.BadGateway).toBe(502);
      expect(Status.Code.ServiceUnavailable).toBe(503);
    });
  });

  describe("STATUS_TEXT constants", () => {
    test("should have correct text for common status codes", () => {
      expect(Status.Text[Status.Code.OK]).toBe("OK");
      expect(Status.Text[Status.Code.Created]).toBe("Created");
      expect(Status.Text[Status.Code.BadRequest]).toBe("Bad Request");
      expect(Status.Text[Status.Code.Unauthorized]).toBe("Unauthorized");
      expect(Status.Text[Status.Code.Forbidden]).toBe("Forbidden");
      expect(Status.Text[Status.Code.NotFound]).toBe("Not Found");
      expect(Status.Text[Status.Code.InternalServerError]).toBe("Internal Server Error");
      expect(Status.Text[Status.Code.Teapot]).toBe("I'm a teapot");
    });

    test("should have text for all status codes", () => {
      // Test that every status code has corresponding text
      const codes = Object.values(Status.Code);
      for (const code of codes) {
        expect(Status.Text[code]).toBeDefined();
        expect(typeof Status.Text[code]).toBe("string");
        expect(Status.Text[code].length).toBeGreaterThan(0);
      }
    });

    test("should have correct number of status text entries", () => {
      const codeCount = Object.keys(Status.Code).length;
      const textCount = Object.keys(Status.Text).length;
      expect(textCount).toBe(codeCount);
    });
  });

  describe("Type safety", () => {
    test("should work with StatusCodeType", () => {
      const code: StatusCodeType = Status.Code.OK;
      expect(status.isSuccessful(code)).toBe(true);
      expect(status.isError(code)).toBe(false);
    });

    test("should work with direct numeric values", () => {
      expect(status.isSuccessful(200 as StatusCodeType)).toBe(true);
      expect(status.isError(404 as StatusCodeType)).toBe(true);
      expect(status.isRedirect(301 as StatusCodeType)).toBe(true);
    });
  });

  describe("Method consistency", () => {
    test("status categories should be mutually exclusive", () => {
      const testCodes = [
        Status.Code.Continue, // 1xx
        Status.Code.OK, // 2xx
        Status.Code.MovedPermanently, // 3xx
        Status.Code.BadRequest, // 4xx
        Status.Code.InternalServerError, // 5xx
      ];

      for (const code of testCodes) {
        const categories = [
          status.isInformational(code),
          status.isSuccessful(code),
          status.isRedirect(code),
          status.isClientError(code),
          status.isServerError(code),
        ];

        // Exactly one category should be true
        const trueCount = categories.filter(Boolean).length;
        expect(trueCount).toBe(1);
      }
    });

    test("isError should match isClientError || isServerError", () => {
      const testCodes = Object.values(Status.Code);

      for (const code of testCodes) {
        const isError = status.isError(code);
        const isClientOrServerError = status.isClientError(code) || status.isServerError(code);
        expect(isError).toBe(isClientOrServerError);
      }
    });
  });
});
