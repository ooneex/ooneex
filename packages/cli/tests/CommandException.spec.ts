import { describe, expect, test } from "bun:test";
import { Exception } from "@ooneex/exception";
import { HttpStatus } from "@ooneex/http-status";
import { CommandException } from "@/CommandException";

describe("CommandException", () => {
  test("should have correct exception name", () => {
    const exception = new CommandException("Test message");
    expect(exception.name).toBe("CommandException");
  });

  test("should create CommandException with message only", () => {
    const message = "Command execution failed";
    const exception = new CommandException(message);

    expect(exception).toBeInstanceOf(CommandException);
    expect(exception).toBeInstanceOf(Exception);
    expect(exception).toBeInstanceOf(Error);
    expect(exception.message).toBe(message);
    expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
    expect(exception.data).toEqual({});
  });

  test("should create CommandException with message and data", () => {
    const message = "Command not found";
    const data = { command: "deploy", exitCode: 1 };
    const exception = new CommandException(message, data);

    expect(exception.message).toBe(message);
    expect(exception.status).toBe(HttpStatus.Code.InternalServerError);
    expect(exception.data).toEqual(data);
  });

  test("should have immutable data property", () => {
    const data = { key: "value" };
    const exception = new CommandException("Test message", data);

    expect(Object.isFrozen(exception.data)).toBe(true);
    expect(() => {
      exception.data.key = "modified";
    }).toThrow();
  });

  test("should inherit all properties from Exception", () => {
    const message = "Command error";
    const data = { command: "build" };
    const exception = new CommandException(message, data);

    expect(exception.date).toBeInstanceOf(Date);
    expect(exception.status).toBe(500);
    expect(exception.data).toEqual(data);
    expect(exception.stack).toBeDefined();
  });

  test("should maintain proper stack trace", () => {
    function throwCommandException() {
      throw new CommandException("Stack trace test");
    }

    try {
      throwCommandException();
      // biome-ignore lint/suspicious/noExplicitAny: trust me
    } catch (error: any) {
      expect(error).toBeInstanceOf(CommandException);
      expect(error.stack).toContain("throwCommandException");
    }
  });
});
