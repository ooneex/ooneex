import { afterEach, beforeEach, describe, expect, mock, spyOn, test } from "bun:test";
import { container } from "@ooneex/container";
import { Exception } from "@ooneex/exception";
import { COMMANDS_CONTAINER } from "@/container";
import type { ICommand } from "@/types";

let mockParseArgsResult: { values: Record<string, unknown>; positionals: string[] } = {
  values: {},
  positionals: [],
};

const originalUtil = await import("node:util");

mock.module("node:util", () => ({
  ...originalUtil,
  parseArgs: () => mockParseArgsResult,
}));

// Import run after mocking node:util
const { run } = await import("@/run");

describe("run", () => {
  let initialCommandsLength: number;
  let exitMock: ReturnType<typeof spyOn>;

  beforeEach(() => {
    initialCommandsLength = COMMANDS_CONTAINER.length;
    mockParseArgsResult = { values: {}, positionals: [] };
    exitMock = spyOn(process, "exit").mockImplementation(() => {
      throw new Error("process.exit called");
    });
  });

  afterEach(() => {
    while (COMMANDS_CONTAINER.length > initialCommandsLength) {
      const cmd = COMMANDS_CONTAINER.pop();
      if (cmd) {
        container.remove(cmd);
      }
    }
    exitMock.mockRestore();
  });

  describe("Basic Functionality", () => {
    test("should be defined", () => {
      expect(run).toBeDefined();
      expect(typeof run).toBe("function");
    });

    test("should execute a registered command", async () => {
      const runFn = mock(async () => {});

      class TestRunCommand implements ICommand {
        public run = runFn;
        public getName(): string {
          return "test-run";
        }
        public getDescription(): string {
          return "test run command";
        }
      }

      container.add(TestRunCommand);
      COMMANDS_CONTAINER.push(TestRunCommand);

      mockParseArgsResult = {
        values: {},
        positionals: ["bun", "script.ts", "test-run"],
      };

      await run();

      expect(runFn).toHaveBeenCalledTimes(1);
    });

    test("should pass parsed values to command.run", async () => {
      const runFn = mock(async () => {});

      class ValuesCommand implements ICommand {
        public run = runFn;
        public getName(): string {
          return "values-cmd";
        }
        public getDescription(): string {
          return "values command";
        }
      }

      container.add(ValuesCommand);
      COMMANDS_CONTAINER.push(ValuesCommand);

      mockParseArgsResult = {
        values: { name: "MyName", dir: "src", module: "auth" },
        positionals: ["bun", "script.ts", "values-cmd"],
      };

      await run();

      expect(runFn).toHaveBeenCalledTimes(1);
      const args = runFn.mock.calls[0] as unknown as [Record<string, unknown>];
      expect(args[0].name).toBe("MyName");
      expect(args[0].dir).toBe("src");
      expect(args[0].module).toBe("auth");
    });

    test("should convert module to kebab-case", async () => {
      const runFn = mock(async () => {});

      class ModuleKebabCommand implements ICommand {
        public run = runFn;
        public getName(): string {
          return "module-kebab-cmd";
        }
        public getDescription(): string {
          return "module kebab command";
        }
      }

      container.add(ModuleKebabCommand);
      COMMANDS_CONTAINER.push(ModuleKebabCommand);

      mockParseArgsResult = {
        values: { module: "UserProfile" },
        positionals: ["bun", "script.ts", "module-kebab-cmd"],
      };

      await run();

      expect(runFn).toHaveBeenCalledTimes(1);
      const args = runFn.mock.calls[0] as unknown as [Record<string, unknown>];
      expect(args[0].module).toBe("user-profile");
    });

    test("should pass route options correctly", async () => {
      const runFn = mock(async () => {});

      class RouteCommand implements ICommand {
        public run = runFn;
        public getName(): string {
          return "route-cmd";
        }
        public getDescription(): string {
          return "route command";
        }
      }

      container.add(RouteCommand);
      COMMANDS_CONTAINER.push(RouteCommand);

      mockParseArgsResult = {
        values: {
          "route-name": "home",
          "route-path": "/home",
          "route-method": "GET",
        },
        positionals: ["bun", "script.ts", "route-cmd"],
      };

      await run();

      const args = runFn.mock.calls[0] as unknown as [Record<string, unknown>];
      const route = args[0].route as Record<string, unknown>;
      expect(route.name).toBe("home");
      expect(route.path).toBe("/home");
      expect(route.method).toBe("GET");
    });

    test("should transform is-socket to isSocket", async () => {
      const runFn = mock(async () => {});

      class SocketCommand implements ICommand {
        public run = runFn;
        public getName(): string {
          return "socket-cmd";
        }
        public getDescription(): string {
          return "socket command";
        }
      }

      container.add(SocketCommand);
      COMMANDS_CONTAINER.push(SocketCommand);

      mockParseArgsResult = {
        values: { "is-socket": true },
        positionals: ["bun", "script.ts", "socket-cmd"],
      };

      await run();

      const args = runFn.mock.calls[0] as unknown as [Record<string, unknown>];
      expect(args[0].isSocket).toBe(true);
    });

    test("should transform table-name to tableName", async () => {
      const runFn = mock(async () => {});

      class TableCommand implements ICommand {
        public run = runFn;
        public getName(): string {
          return "table-cmd";
        }
        public getDescription(): string {
          return "table command";
        }
      }

      container.add(TableCommand);
      COMMANDS_CONTAINER.push(TableCommand);

      mockParseArgsResult = {
        values: { "table-name": "users" },
        positionals: ["bun", "script.ts", "table-cmd"],
      };

      await run();

      const args = runFn.mock.calls[0] as unknown as [Record<string, unknown>];
      expect(args[0].tableName).toBe("users");
    });

    test("should pass drop option", async () => {
      const runFn = mock(async () => {});

      class DropCommand implements ICommand {
        public run = runFn;
        public getName(): string {
          return "drop-cmd";
        }
        public getDescription(): string {
          return "drop command";
        }
      }

      container.add(DropCommand);
      COMMANDS_CONTAINER.push(DropCommand);

      mockParseArgsResult = {
        values: { drop: true },
        positionals: ["bun", "script.ts", "drop-cmd"],
      };

      await run();

      const args = runFn.mock.calls[0] as unknown as [Record<string, unknown>];
      expect(args[0].drop).toBe(true);
    });

    test("should pass target option", async () => {
      const runFn = mock(async () => {});

      class TargetCommand implements ICommand {
        public run = runFn;
        public getName(): string {
          return "target-cmd";
        }
        public getDescription(): string {
          return "target command";
        }
      }

      container.add(TargetCommand);
      COMMANDS_CONTAINER.push(TargetCommand);

      mockParseArgsResult = {
        values: { target: "UpdateStatusController" },
        positionals: ["bun", "script.ts", "target-cmd"],
      };

      await run();

      const args = runFn.mock.calls[0] as unknown as [Record<string, unknown>];
      expect(args[0].target).toBe("UpdateStatusController");
    });

    test("should pass channel and destination options", async () => {
      const runFn = mock(async () => {});

      class ChannelCommand implements ICommand {
        public run = runFn;
        public getName(): string {
          return "channel-cmd";
        }
        public getDescription(): string {
          return "channel command";
        }
      }

      container.add(ChannelCommand);
      COMMANDS_CONTAINER.push(ChannelCommand);

      mockParseArgsResult = {
        values: { channel: "email", destination: "output" },
        positionals: ["bun", "script.ts", "channel-cmd"],
      };

      await run();

      const args = runFn.mock.calls[0] as unknown as [Record<string, unknown>];
      expect(args[0].channel).toBe("email");
      expect(args[0].destination).toBe("output");
    });
  });

  describe("Default Help Command", () => {
    test("should default to help command when no command name is provided", async () => {
      const runFn = mock(async () => {});

      class HelpCommand implements ICommand {
        public run = runFn;
        public getName(): string {
          return "help";
        }
        public getDescription(): string {
          return "help command";
        }
      }

      container.add(HelpCommand);
      COMMANDS_CONTAINER.push(HelpCommand);

      mockParseArgsResult = {
        values: {},
        positionals: ["bun", "script.ts"],
      };

      await run();

      expect(runFn).toHaveBeenCalledTimes(1);
    });
  });

  describe("Error Handling", () => {
    test("should exit with code 1 when command is not found", async () => {
      mockParseArgsResult = {
        values: {},
        positionals: ["bun", "script.ts", "nonexistent-command"],
      };

      expect(run()).rejects.toThrow("process.exit called");
      expect(exitMock).toHaveBeenCalledWith(1);
    });

    test("should exit with code 1 when command.run throws an Error", async () => {
      class FailingCommand implements ICommand {
        public run(): void {
          throw new Error("command failed");
        }
        public getName(): string {
          return "failing-cmd";
        }
        public getDescription(): string {
          return "failing command";
        }
      }

      container.add(FailingCommand);
      COMMANDS_CONTAINER.push(FailingCommand);

      mockParseArgsResult = {
        values: {},
        positionals: ["bun", "script.ts", "failing-cmd"],
      };

      expect(run()).rejects.toThrow("process.exit called");
      expect(exitMock).toHaveBeenCalledWith(1);
    });

    test("should exit with code 1 when command.run throws an Exception", async () => {
      class ExceptionCommand implements ICommand {
        public run(): void {
          throw new Exception("ooneex exception");
        }
        public getName(): string {
          return "exception-cmd";
        }
        public getDescription(): string {
          return "exception command";
        }
      }

      container.add(ExceptionCommand);
      COMMANDS_CONTAINER.push(ExceptionCommand);

      mockParseArgsResult = {
        values: {},
        positionals: ["bun", "script.ts", "exception-cmd"],
      };

      expect(run()).rejects.toThrow("process.exit called");
      expect(exitMock).toHaveBeenCalledWith(1);
    });

    test("should exit with code 1 when command.run throws a string", async () => {
      class StringThrowCommand implements ICommand {
        public run(): void {
          throw "string error";
        }
        public getName(): string {
          return "string-throw-cmd";
        }
        public getDescription(): string {
          return "string throw command";
        }
      }

      container.add(StringThrowCommand);
      COMMANDS_CONTAINER.push(StringThrowCommand);

      mockParseArgsResult = {
        values: {},
        positionals: ["bun", "script.ts", "string-throw-cmd"],
      };

      expect(run()).rejects.toThrow("process.exit called");
      expect(exitMock).toHaveBeenCalledWith(1);
    });

    test("should exit with code 1 when async command.run rejects", async () => {
      class RejectingCommand implements ICommand {
        public async run(): Promise<void> {
          throw new Error("async rejection");
        }
        public getName(): string {
          return "rejecting-cmd";
        }
        public getDescription(): string {
          return "rejecting command";
        }
      }

      container.add(RejectingCommand);
      COMMANDS_CONTAINER.push(RejectingCommand);

      mockParseArgsResult = {
        values: {},
        positionals: ["bun", "script.ts", "rejecting-cmd"],
      };

      expect(run()).rejects.toThrow("process.exit called");
      expect(exitMock).toHaveBeenCalledWith(1);
    });
  });

  describe("Undefined Options", () => {
    test("should pass undefined for options not provided", async () => {
      const runFn = mock(async () => {});

      class MinimalCommand implements ICommand {
        public run = runFn;
        public getName(): string {
          return "minimal-cmd";
        }
        public getDescription(): string {
          return "minimal command";
        }
      }

      container.add(MinimalCommand);
      COMMANDS_CONTAINER.push(MinimalCommand);

      mockParseArgsResult = {
        values: {},
        positionals: ["bun", "script.ts", "minimal-cmd"],
      };

      await run();

      const args = runFn.mock.calls[0] as unknown as [Record<string, unknown>];
      expect(args[0].name).toBeUndefined();
      expect(args[0].dir).toBeUndefined();
      expect(args[0].channel).toBeUndefined();
      expect(args[0].isSocket).toBeUndefined();
      expect(args[0].tableName).toBeUndefined();
      expect(args[0].module).toBeUndefined();
      expect(args[0].destination).toBeUndefined();
      expect(args[0].drop).toBeUndefined();
      expect(args[0].target).toBeUndefined();

      const route = args[0].route as Record<string, unknown>;
      expect(route.name).toBeUndefined();
      expect(route.path).toBeUndefined();
      expect(route.method).toBeUndefined();
    });
  });
});
