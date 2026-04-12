import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { existsSync, rmSync } from "node:fs";
import { join } from "node:path";

let capturedOpts: Record<string, unknown> = {};

// Mock autocannon before importing command
mock.module("autocannon", () => {
  const fn = Object.assign(
    mock((opts: Record<string, unknown>) => {
      capturedOpts = opts;
      return Promise.resolve({
        requests: { total: 1000, average: 100 },
        latency: { average: 1.5, p99: 5 },
        throughput: { average: 1048576 },
        errors: 0,
        timeouts: 0,
        non2xx: 0,
      });
    }),
    {
      printResult: mock(() => "benchmark results table"),
    },
  );
  return { default: fn };
});

// Mock enquirer before importing commands
mock.module("enquirer", () => ({
  prompt: mock(() => Promise.resolve({ name: "Test" })),
}));

const { BenchmarkRunCommand } = await import("@/commands/BenchmarkRunCommand");

describe("BenchmarkRunCommand", () => {
  let command: InstanceType<typeof BenchmarkRunCommand>;
  let testDir: string;
  let originalCwd: string;
  let originalPort: string | undefined;

  const benchConfig = {
    name: "status.update",
    path: "/statuses/:id",
    method: "PATCH",
    description: "Update a status",
    params: { id: "abc-123" },
    payload: { name: "Active", lang: "en" },
    connections: 5,
    duration: 3,
  };

  const benchConfigGet = {
    name: "status.list",
    path: "/statuses",
    method: "GET",
    description: "List all statuses",
    queries: { page: 1, limit: 10, q: "active" },
    connections: 10,
    duration: 10,
  };

  beforeEach(() => {
    command = new BenchmarkRunCommand();
    originalCwd = process.cwd();
    originalPort = Bun.env.PORT;
    delete Bun.env.PORT;
    testDir = join(originalCwd, ".temp", `benchmark-run-${Date.now()}`);
    capturedOpts = {};
  });

  afterEach(() => {
    process.chdir(originalCwd);
    if (originalPort !== undefined) {
      Bun.env.PORT = originalPort;
    } else {
      delete Bun.env.PORT;
    }
    if (existsSync(testDir)) {
      rmSync(testDir, { recursive: true, force: true });
    }
  });

  describe("Command Metadata", () => {
    test("should return correct command name", () => {
      expect(command.getName()).toBe("benchmark:run");
    });

    test("should return correct description", () => {
      expect(command.getDescription()).toBe("Run a benchmark using autocannon");
    });
  });

  describe("buildUrl()", () => {
    test("should replace path params", () => {
      // biome-ignore lint/complexity/useLiteralKeys: accessing private method for testing
      const url = command["buildUrl"](benchConfig);
      expect(url).toBe("/statuses/abc-123");
    });

    test("should replace multiple path params", () => {
      const url = // biome-ignore lint/complexity/useLiteralKeys: accessing private method for testing
        command["buildUrl"]({
          name: "test",
          path: "/modules/:module/controllers/:id",
          method: "GET",
          description: "test",
          params: { module: "user", id: "42" },
        });
      expect(url).toBe("/modules/user/controllers/42");
    });

    test("should encode special characters in path params", () => {
      const url = // biome-ignore lint/complexity/useLiteralKeys: accessing private method for testing
        command["buildUrl"]({
          name: "test",
          path: "/items/:id",
          method: "GET",
          description: "test",
          params: { id: "hello world" },
        });
      expect(url).toBe("/items/hello%20world");
    });

    test("should append query parameters", () => {
      // biome-ignore lint/complexity/useLiteralKeys: accessing private method for testing
      const url = command["buildUrl"](benchConfigGet);
      expect(url).toContain("/statuses?");
      expect(url).toContain("page=1");
      expect(url).toContain("limit=10");
      expect(url).toContain("q=active");
    });

    test("should encode special characters in query values", () => {
      const url = // biome-ignore lint/complexity/useLiteralKeys: accessing private method for testing
        command["buildUrl"]({
          name: "test",
          path: "/search",
          method: "GET",
          description: "test",
          queries: { q: "hello world" },
        });
      expect(url).toBe("/search?q=hello%20world");
    });

    test("should skip empty string and zero query values", () => {
      const url = // biome-ignore lint/complexity/useLiteralKeys: accessing private method for testing
        command["buildUrl"]({
          name: "test",
          path: "/test",
          method: "GET",
          description: "test",
          queries: { page: 0, q: "", name: "foo" },
        });
      expect(url).toBe("/test?name=foo");
    });

    test("should return path without query string when all values are empty or zero", () => {
      const url = // biome-ignore lint/complexity/useLiteralKeys: accessing private method for testing
        command["buildUrl"]({
          name: "test",
          path: "/test",
          method: "GET",
          description: "test",
          queries: { page: 0, q: "" },
        });
      expect(url).toBe("/test");
    });

    test("should return path without query string when no queries", () => {
      const url = // biome-ignore lint/complexity/useLiteralKeys: accessing private method for testing
        command["buildUrl"]({
          name: "test",
          path: "/items",
          method: "GET",
          description: "test",
        });
      expect(url).toBe("/items");
    });

    test("should return path without query string when no params", () => {
      const url = // biome-ignore lint/complexity/useLiteralKeys: accessing private method for testing
        command["buildUrl"]({
          name: "test",
          path: "/items",
          method: "GET",
          description: "test",
        });
      expect(url).toBe("/items");
    });

    test("should handle both params and queries together", () => {
      const url = // biome-ignore lint/complexity/useLiteralKeys: accessing private method for testing
        command["buildUrl"]({
          name: "test",
          path: "/users/:id/posts",
          method: "GET",
          description: "test",
          params: { id: "99" },
          queries: { page: 1 },
        });
      expect(url).toBe("/users/99/posts?page=1");
    });
  });

  describe("run()", () => {
    beforeEach(async () => {
      await Bun.write(join(testDir, "src", "controllers", ".gitkeep"), "");
      await Bun.write(join(testDir, "package.json"), JSON.stringify({ name: "test" }, null, 2));
      process.chdir(testDir);
    });

    test("should error when target is not provided", async () => {
      await command.run({});
      expect(capturedOpts).toEqual({});
    });

    test("should error when no bench.json files found", async () => {
      await command.run({ target: "NonExistent" });
      expect(capturedOpts).toEqual({});
    });

    test("should pass correct options to autocannon", async () => {
      const controllersDir = join(testDir, "src", "controllers");
      await Bun.write(join(controllersDir, "UpdateStatus.bench.json"), JSON.stringify(benchConfig, null, 2));

      await command.run({ target: "UpdateStatus" });

      expect(capturedOpts.url).toBe("http://localhost:80/statuses/abc-123");
      expect(capturedOpts.connections).toBe(5);
      expect(capturedOpts.duration).toBe(3);
      expect(capturedOpts.method).toBe("PATCH");
    });

    test("should use Bun.env.PORT for url port", async () => {
      Bun.env.PORT = "4000";
      const controllersDir = join(testDir, "src", "controllers");
      await Bun.write(join(controllersDir, "UpdateStatus.bench.json"), JSON.stringify(benchConfig, null, 2));

      await command.run({ target: "UpdateStatus" });

      expect(capturedOpts.url).toBe("http://localhost:4000/statuses/abc-123");
    });

    test("should default to port 80 when PORT env is not set", async () => {
      delete Bun.env.PORT;
      const controllersDir = join(testDir, "src", "controllers");
      const config = {
        name: "test",
        path: "/test",
        method: "GET",
        description: "test",
      };
      await Bun.write(join(controllersDir, "Test.bench.json"), JSON.stringify(config, null, 2));

      await command.run({ target: "Test" });

      expect(capturedOpts.url).toBe("http://localhost:80/test");
    });

    test("should include payload as body and content-type header", async () => {
      const controllersDir = join(testDir, "src", "controllers");
      await Bun.write(join(controllersDir, "UpdateStatus.bench.json"), JSON.stringify(benchConfig, null, 2));

      await command.run({ target: "UpdateStatus" });

      expect(capturedOpts.body).toBe(JSON.stringify(benchConfig.payload));
      expect(capturedOpts.headers).toEqual({ "Content-Type": "application/json" });
    });

    test("should not include body for GET requests without payload", async () => {
      const controllersDir = join(testDir, "src", "controllers");
      await Bun.write(join(controllersDir, "ListStatuses.bench.json"), JSON.stringify(benchConfigGet, null, 2));

      await command.run({ target: "ListStatuses" });

      expect(capturedOpts.body).toBeUndefined();
      expect(capturedOpts.headers).toBeUndefined();
    });

    test("should not include body when payload is empty object", async () => {
      const controllersDir = join(testDir, "src", "controllers");
      const config = {
        name: "test",
        path: "/test",
        method: "POST",
        description: "test",
        payload: {},
      };
      await Bun.write(join(controllersDir, "Test.bench.json"), JSON.stringify(config, null, 2));

      await command.run({ target: "Test" });

      expect(capturedOpts.body).toBeUndefined();
      expect(capturedOpts.headers).toBeUndefined();
    });

    test("should find bench.json in module directory", async () => {
      const moduleControllersDir = join(testDir, "modules", "status", "src", "controllers");
      await Bun.write(join(moduleControllersDir, "UpdateStatus.bench.json"), JSON.stringify(benchConfig, null, 2));
      await Bun.write(join(testDir, "modules", "status", "package.json"), JSON.stringify({ name: "status" }, null, 2));

      await command.run({ module: "status", target: "UpdateStatus" });

      expect(capturedOpts.url).toBe("http://localhost:80/statuses/abc-123");
    });

    test("should use default connections and duration when not specified", async () => {
      const controllersDir = join(testDir, "src", "controllers");
      const minimalConfig = {
        name: "test",
        path: "/test",
        method: "GET",
        description: "test",
      };
      await Bun.write(join(controllersDir, "Test.bench.json"), JSON.stringify(minimalConfig, null, 2));

      await command.run({ target: "Test" });

      expect(capturedOpts.connections).toBe(10);
      expect(capturedOpts.duration).toBe(10);
    });

    test("should default method to GET when not specified", async () => {
      const controllersDir = join(testDir, "src", "controllers");
      const config = {
        name: "test",
        path: "/test",
        description: "test",
      };
      await Bun.write(join(controllersDir, "Test.bench.json"), JSON.stringify(config, null, 2));

      await command.run({ target: "Test" });

      expect(capturedOpts.method).toBe("GET");
    });

    test("should handle DELETE method", async () => {
      const controllersDir = join(testDir, "src", "controllers");
      const config = {
        name: "test.delete",
        path: "/items/:id",
        method: "DELETE",
        description: "Delete an item",
        params: { id: "1" },
      };
      await Bun.write(join(controllersDir, "DeleteItem.bench.json"), JSON.stringify(config, null, 2));

      await command.run({ target: "DeleteItem" });

      expect(capturedOpts.method).toBe("DELETE");
      expect(capturedOpts.url).toBe("http://localhost:80/items/1");
    });

    test("should build correct url with queries from config", async () => {
      const controllersDir = join(testDir, "src", "controllers");
      await Bun.write(join(controllersDir, "ListStatuses.bench.json"), JSON.stringify(benchConfigGet, null, 2));

      await command.run({ target: "ListStatuses" });

      const url = capturedOpts.url as string;
      expect(url).toContain("http://localhost:80/statuses?");
      expect(url).toContain("page=1");
      expect(url).toContain("limit=10");
      expect(url).toContain("q=active");
    });
  });
});
