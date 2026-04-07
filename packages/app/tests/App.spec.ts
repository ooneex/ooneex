import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { AppEnv } from "@ooneex/app-env";
import { container } from "@ooneex/container";
import { Exception } from "@ooneex/exception";
import { HttpStatus } from "@ooneex/http-status";
import { App } from "@/App";
import type { AppConfigType } from "@/types";

class MockLogger {
  init = mock(() => {});
  info = mock(() => {});
  error = mock(() => {});
  warn = mock(() => {});
  debug = mock(() => {});
  log = mock(() => {});
  success = mock(() => {});
}

class MockAnalytics {
  track = mock(() => {});
}

class MockCache {
  get = mock(() => null);
  set = mock(() => {});
}

class MockStorage {
  read = mock(() => null);
  write = mock(() => {});
}

class MockMailer {
  send = mock(() => Promise.resolve());
}

class MockDatabase {
  connect = mock(() => Promise.resolve());
}

class MockRateLimiter {
  check = mock(() => true);
}

class MockOnException {
  init = mock(() => {});
  info = mock(() => {});
  error = mock(() => {});
  warn = mock(() => {});
  debug = mock(() => {});
  log = mock(() => {});
  success = mock(() => {});
}

class MockEvent {
  subscribe = mock(() => {});
}

// Register mock classes with the container before tests run
container.add(MockLogger);
container.add(MockAnalytics);
container.add(MockCache);
container.add(MockStorage);
container.add(MockMailer);
container.add(MockDatabase);
container.add(MockRateLimiter);
container.add(MockOnException);
container.add(MockEvent);

const createMockConfig = (overrides: Record<string, unknown> = {}): AppConfigType => {
  const base = {
    routing: { prefix: "/api/v1" },
    loggers: [MockLogger as unknown as AppConfigType["loggers"][0]],
    database: MockDatabase as unknown as AppConfigType["database"],
  };
  return { ...base, ...overrides } as unknown as AppConfigType;
};

describe("App", () => {
  const originalEnv = { ...Bun.env };

  beforeEach(() => {
    Bun.env.APP_ENV = "development";
    Bun.env.PORT = "3000";
    Bun.env.HOST_NAME = "localhost";
    container.add(AppEnv);
  });

  afterEach(() => {
    Bun.env.APP_ENV = originalEnv.APP_ENV;
    Bun.env.PORT = originalEnv.PORT;
    Bun.env.HOST_NAME = originalEnv.HOST_NAME;
  });

  describe("constructor", () => {
    test("initializes loggers and adds them to container", () => {
      const config = createMockConfig();

      new App(config);

      expect(container.has(MockLogger)).toBe(true);
    });

    test("calls init on each logger", () => {
      const config = createMockConfig();

      new App(config);

      const logger = container.get(MockLogger) as MockLogger;
      expect(logger.init).toHaveBeenCalled();
    });

    test("registers AppEnv in container if not already present", () => {
      container.remove(AppEnv);

      const config = createMockConfig();
      new App(config);

      expect(container.has(AppEnv)).toBe(true);
    });

    test("initializes and starts cron jobs when provided", () => {
      const startMock = mock(() => {});
      class TestCronJob {
        start = startMock;
        stop = mock(() => {});
      }

      // Register TestCronJob with the container before using it
      container.add(TestCronJob);

      const config = createMockConfig({
        cronJobs: [TestCronJob as unknown as AppConfigType["cronJobs"] extends (infer T)[] | undefined ? T : never],
      });

      new App(config);

      expect(container.has(TestCronJob)).toBe(true);
      expect(startMock).toHaveBeenCalled();
    });

    test("adds analytics to container and registers alias when provided", () => {
      const config = createMockConfig({
        analytics: MockAnalytics as unknown as AppConfigType["analytics"],
      });

      new App(config);

      expect(container.has(MockAnalytics)).toBe(true);
      expect(container.has("analytics")).toBe(true);
    });

    test("adds cache to container and registers alias when provided", () => {
      const config = createMockConfig({
        cache: MockCache as unknown as AppConfigType["cache"],
      });

      new App(config);

      expect(container.has(MockCache)).toBe(true);
      expect(container.has("cache")).toBe(true);
    });

    test("adds storage to container and registers alias when provided", () => {
      const config = createMockConfig({
        storage: MockStorage as unknown as AppConfigType["storage"],
      });

      new App(config);

      expect(container.has(MockStorage)).toBe(true);
      expect(container.has("storage")).toBe(true);
    });

    test("adds mailer to container and registers alias when provided", () => {
      const config = createMockConfig({
        mailer: MockMailer as unknown as AppConfigType["mailer"],
      });

      new App(config);

      expect(container.has(MockMailer)).toBe(true);
      expect(container.has("mailer")).toBe(true);
    });

    test("adds database to container and registers alias", () => {
      const config = createMockConfig();

      new App(config);

      expect(container.has(MockDatabase)).toBe(true);
      expect(container.has("database")).toBe(true);
    });

    test("adds rateLimiter to container and registers alias when provided", () => {
      const config = createMockConfig({
        rateLimiter: MockRateLimiter as unknown as AppConfigType["rateLimiter"],
      });

      new App(config);

      expect(container.has(MockRateLimiter)).toBe(true);
      expect(container.has("rateLimiter")).toBe(true);
    });

    test("adds onException to container and registers exception.logger constant when provided", () => {
      const config = createMockConfig({
        onException: MockOnException as unknown as AppConfigType["onException"],
      });

      new App(config);

      expect(container.has(MockOnException)).toBe(true);
      expect(container.hasConstant("exception.logger")).toBe(true);
    });

    test("registers logger constant", () => {
      const config = createMockConfig();

      new App(config);

      expect(container.hasConstant("logger")).toBe(true);
    });

    test("subscribes events when provided", () => {
      const config = createMockConfig({
        events: [MockEvent as unknown as AppConfigType["events"] extends (infer T)[] | undefined ? T : never],
      });

      new App(config);

      expect(container.has(MockEvent)).toBe(true);
      const event = container.get(MockEvent) as MockEvent;
      expect(event.subscribe).toHaveBeenCalled();
    });

    test("processes multiple events", () => {
      const subscribe1 = mock(() => {});
      const subscribe2 = mock(() => {});

      class Event1 {
        subscribe = subscribe1;
      }
      class Event2 {
        subscribe = subscribe2;
      }

      container.add(Event1);
      container.add(Event2);

      const config = createMockConfig({
        events: [
          Event1 as unknown as AppConfigType["events"] extends (infer T)[] | undefined ? T : never,
          Event2 as unknown as AppConfigType["events"] extends (infer T)[] | undefined ? T : never,
        ],
      });

      new App(config);

      expect(subscribe1).toHaveBeenCalled();
      expect(subscribe2).toHaveBeenCalled();
    });

    test("handles config without optional dependencies", () => {
      const config = createMockConfig();

      const app = new App(config);

      expect(app).toBeInstanceOf(App);
    });

    test("processes multiple loggers and calls init on each", () => {
      class Logger1 {
        init = mock(() => {});
        info = mock(() => {});
        error = mock(() => {});
        warn = mock(() => {});
        debug = mock(() => {});
        log = mock(() => {});
        success = mock(() => {});
      }
      class Logger2 {
        init = mock(() => {});
        info = mock(() => {});
        error = mock(() => {});
        warn = mock(() => {});
        debug = mock(() => {});
        log = mock(() => {});
        success = mock(() => {});
      }

      // Register loggers with the container before using them
      container.add(Logger1);
      container.add(Logger2);

      const config = createMockConfig({
        loggers: [Logger1 as unknown as AppConfigType["loggers"][0], Logger2 as unknown as AppConfigType["loggers"][0]],
      });

      new App(config);

      expect(container.has(Logger1)).toBe(true);
      expect(container.has(Logger2)).toBe(true);
      const logger1 = container.get(Logger1) as Logger1;
      const logger2 = container.get(Logger2) as Logger2;
      expect(logger1.init).toHaveBeenCalled();
      expect(logger2.init).toHaveBeenCalled();
    });

    test("processes multiple cron jobs", () => {
      const start1 = mock(() => {});
      const start2 = mock(() => {});

      class Cron1 {
        start = start1;
      }
      class Cron2 {
        start = start2;
      }

      // Register cron jobs with the container before using them
      container.add(Cron1);
      container.add(Cron2);

      const config = createMockConfig({
        cronJobs: [
          Cron1 as unknown as AppConfigType["cronJobs"] extends (infer T)[] | undefined ? T : never,
          Cron2 as unknown as AppConfigType["cronJobs"] extends (infer T)[] | undefined ? T : never,
        ],
      });

      new App(config);

      expect(start1).toHaveBeenCalled();
      expect(start2).toHaveBeenCalled();
    });
  });

  describe("init", () => {
    test("returns App instance when all validations pass", async () => {
      Bun.env.APP_ENV = "development";
      Bun.env.PORT = "3000";
      Bun.env.HOST_NAME = "localhost";

      const config = createMockConfig();
      const app = new App(config);

      const result = await app.init();

      expect(result).toBeInstanceOf(App);
    });

    test("throws Exception when APP_ENV is invalid", async () => {
      Bun.env.APP_ENV = "invalid_env";

      const config = createMockConfig();
      const app = new App(config);

      expect(app.init()).rejects.toThrow(Exception);
    });

    test("throws Exception with correct status when APP_ENV is invalid", async () => {
      Bun.env.APP_ENV = "invalid_env";

      const config = createMockConfig();
      const app = new App(config);

      try {
        await app.init();
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(Exception);
        expect((error as Exception).status).toBe(HttpStatus.Code.InternalServerError);
        expect((error as Exception).message).toContain("Invalid APP_ENV");
        expect((error as Exception).key).toBe("INVALID_APP_ENV");
      }
    });

    test("throws Exception when PORT is invalid", async () => {
      Bun.env.APP_ENV = "development";
      Bun.env.PORT = "-1";

      const config = createMockConfig();
      const app = new App(config);

      try {
        await app.init();
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(Exception);
        expect((error as Exception).message).toContain("Invalid PORT");
        expect((error as Exception).key).toBe("INVALID_PORT");
      }
    });

    test("throws Exception when PORT is not a number", async () => {
      Bun.env.APP_ENV = "development";
      Bun.env.PORT = "not_a_port";

      const config = createMockConfig();
      const app = new App(config);

      try {
        await app.init();
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(Exception);
        expect((error as Exception).message).toContain("Invalid PORT");
        expect((error as Exception).key).toBe("INVALID_PORT");
      }
    });

    test("throws Exception when HOST_NAME is invalid", async () => {
      Bun.env.APP_ENV = "development";
      Bun.env.PORT = "3000";
      Bun.env.HOST_NAME = "invalid host name with spaces";

      const config = createMockConfig();
      const app = new App(config);

      try {
        await app.init();
        expect(true).toBe(false);
      } catch (error) {
        expect(error).toBeInstanceOf(Exception);
        expect((error as Exception).message).toContain("Invalid HOST_NAME");
        expect((error as Exception).key).toBe("INVALID_HOST_NAME");
      }
    });

    test("uses default port 3000 when PORT is not set", async () => {
      Bun.env.APP_ENV = "development";
      Bun.env.PORT = undefined;
      Bun.env.HOST_NAME = "localhost";

      const config = createMockConfig();
      const app = new App(config);

      const result = await app.init();

      expect(result).toBeInstanceOf(App);
    });

    test("uses empty string for hostname when HOST_NAME is not set", async () => {
      Bun.env.APP_ENV = "development";
      Bun.env.PORT = "3000";
      Bun.env.HOST_NAME = undefined;

      const config = createMockConfig();
      const app = new App(config);

      const result = await app.init();

      expect(result).toBeInstanceOf(App);
    });

    test("validates with production environment", async () => {
      Bun.env.APP_ENV = "production";
      Bun.env.PORT = "8080";
      Bun.env.HOST_NAME = "api.example.com";

      const config = createMockConfig();
      const app = new App(config);

      const result = await app.init();

      expect(result).toBeInstanceOf(App);
    });

    test("validates with testing environment", async () => {
      Bun.env.APP_ENV = "testing";
      Bun.env.PORT = "4000";
      Bun.env.HOST_NAME = "test.localhost";

      const config = createMockConfig();
      const app = new App(config);

      const result = await app.init();

      expect(result).toBeInstanceOf(App);
    });

    test("validates with staging environment", async () => {
      Bun.env.APP_ENV = "staging";
      Bun.env.PORT = "5000";
      Bun.env.HOST_NAME = "staging.example.com";

      const config = createMockConfig();
      const app = new App(config);

      const result = await app.init();

      expect(result).toBeInstanceOf(App);
    });

    test("validates with local environment", async () => {
      Bun.env.APP_ENV = "local";
      Bun.env.PORT = "3000";
      Bun.env.HOST_NAME = "127.0.0.1";

      const config = createMockConfig();
      const app = new App(config);

      const result = await app.init();

      expect(result).toBeInstanceOf(App);
    });
  });
});
