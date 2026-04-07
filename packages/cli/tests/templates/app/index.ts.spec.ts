import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";

const templatesDir = join(import.meta.dir, "../../../src/templates");

describe("index.ts.txt", () => {
  const templatePath = join(templatesDir, "app", "index.ts.txt");

  test("should exist", () => {
    expect(existsSync(templatePath)).toBe(true);
  });

  test("should import App from @ooneex/app", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("@ooneex/app");
    expect(content).toContain("App");
  });

  test("should import PostHogAnalytics from @ooneex/analytics", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain('import { PostHogAnalytics } from "@ooneex/analytics"');
  });

  test("should import UpstashRedisCache from @ooneex/cache", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain('import { UpstashRedisCache } from "@ooneex/cache"');
  });

  test("should import loggers from @ooneex/logger", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("BetterstackLogger");
    expect(content).toContain("BetterstackExceptionLogger");
    expect(content).toContain("TerminalLogger");
    expect(content).toContain("@ooneex/logger");
  });

  test("should import ResendMailer from @ooneex/mailer", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain('import { ResendMailer } from "@ooneex/mailer"');
  });

  test("should import CorsMiddleware from @ooneex/middleware", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain('import { CorsMiddleware } from "@ooneex/middleware"');
  });

  test("should import UpstashRedisRateLimiter from @ooneex/rate-limit", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain('import { UpstashRedisRateLimiter } from "@ooneex/rate-limit"');
  });

  test("should import BunnyStorage from @ooneex/storage", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain('import { BunnyStorage } from "@ooneex/storage"');
  });

  test("should import AppModule", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain('import { AppModule } from "./AppModule"');
  });

  test("should import AppDatabase", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain('import { AppDatabase } from "./databases/AppDatabase"');
  });

  test("should create new App instance", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("new App");
  });

  test("should configure app with required options", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("routing: {");
    expect(content).toContain('prefix: "api"');
    expect(content).toContain("loggers: [BetterstackLogger, TerminalLogger]");
    expect(content).toContain("onException: BetterstackExceptionLogger");
    expect(content).toContain("analytics: PostHogAnalytics");
    expect(content).toContain("cache: UpstashRedisCache");
    expect(content).toContain("storage: BunnyStorage");
    expect(content).toContain("mailer: ResendMailer");
    expect(content).toContain("rateLimiter: UpstashRedisRateLimiter");
    expect(content).toContain("middlewares: AppModule.middlewares");
    expect(content).toContain("cors: CorsMiddleware");
    expect(content).not.toContain("permissions");
    expect(content).toContain("cronJobs: AppModule.cronJobs");
    expect(content).toContain("events: AppModule.events");
    expect(content).toContain("database: AppDatabase");
    expect(content).toContain("check: {");
    expect(content).toContain('health: "/api/v1/health-check"');
    expect(content).not.toContain("healthcheckPath");
    expect(content).not.toContain("generateRouteDoc");
  });

  test("should call app.run()", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("await app.run()");
  });

  test("should not contain directories configuration", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).not.toContain("directories");
  });

  test("should not import join from node:path", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).not.toContain('import { join } from "node:path"');
  });
});
