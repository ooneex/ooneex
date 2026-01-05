import { describe, expect, test } from "bun:test";
import { FileException } from "@/index";

describe("FileException", () => {
  describe("constructor", () => {
    test("should create an instance with message only", () => {
      const exception = new FileException("File not found");
      expect(exception).toBeInstanceOf(FileException);
      expect(exception).toBeInstanceOf(Error);
    });

    test("should create an instance with message and data", () => {
      const data = { path: "/tmp/file.txt", operation: "read" };
      const exception = new FileException("Failed to read file", data);
      expect(exception).toBeInstanceOf(FileException);
    });
  });

  describe("name", () => {
    test("should have name set to FileException", () => {
      const exception = new FileException("Test error");
      expect(exception.name).toBe("FileException");
    });
  });

  describe("message", () => {
    test("should have correct message", () => {
      const exception = new FileException("Custom error message");
      expect(exception.message).toBe("Custom error message");
    });

    test("should handle empty message", () => {
      const exception = new FileException("");
      expect(exception.message).toBe("");
    });
  });

  describe("status", () => {
    test("should have default status 500 (Internal Server Error)", () => {
      const exception = new FileException("Test");
      expect(exception.status).toBe(500);
    });
  });

  describe("data", () => {
    test("should have empty data by default", () => {
      const exception = new FileException("Test");
      expect(exception.data).toEqual({});
    });

    test("should store provided data", () => {
      const data = { path: "/tmp/file.txt", error: "ENOENT" };
      const exception = new FileException("Test", data);
      expect(exception.data).toEqual(data);
    });

    test("should have immutable data property", () => {
      const data = { key: "value" };
      const exception = new FileException("Test", data);
      expect(Object.isFrozen(exception.data)).toBe(true);
    });

    test("should not allow data modification", () => {
      const exception = new FileException("Test", { key: "value" });
      expect(() => {
        (exception.data as Record<string, unknown>).key = "modified";
      }).toThrow();
    });
  });

  describe("date", () => {
    test("should have a date property", () => {
      const before = new Date();
      const exception = new FileException("Test");
      const after = new Date();

      expect(exception.date).toBeInstanceOf(Date);
      expect(exception.date.getTime()).toBeGreaterThanOrEqual(before.getTime());
      expect(exception.date.getTime()).toBeLessThanOrEqual(after.getTime());
    });
  });

  describe("stack", () => {
    test("should have a stack trace", () => {
      const exception = new FileException("Test");
      expect(exception.stack).toBeDefined();
      expect(typeof exception.stack).toBe("string");
    });
  });

  describe("stackToJson", () => {
    test("should convert stack to JSON array", () => {
      const exception = new FileException("Test");
      const stackJson = exception.stackToJson();

      expect(stackJson).toBeInstanceOf(Array);
      expect(stackJson?.length).toBeGreaterThan(0);
    });

    test("should have source property in each frame", () => {
      const exception = new FileException("Test");
      const stackJson = exception.stackToJson();

      for (const frame of stackJson ?? []) {
        expect(frame.source).toBeDefined();
        expect(typeof frame.source).toBe("string");
      }
    });
  });

  describe("inheritance", () => {
    test("should be throwable", () => {
      expect(() => {
        throw new FileException("Test error");
      }).toThrow(FileException);
    });

    test("should be catchable as Error", () => {
      try {
        throw new FileException("Test error");
      } catch (error) {
        expect(error).toBeInstanceOf(Error);
        expect(error).toBeInstanceOf(FileException);
      }
    });

    test("should work with try-catch pattern", () => {
      let caught = false;
      try {
        throw new FileException("Operation failed", { path: "/test" });
      } catch (error) {
        if (error instanceof FileException) {
          caught = true;
          expect(error.message).toBe("Operation failed");
          expect(error.data).toEqual({ path: "/test" });
        }
      }
      expect(caught).toBe(true);
    });
  });
});
