import { describe, expect, test } from "bun:test";
import { existsSync } from "node:fs";
import { join } from "node:path";

const templatesDir = join(import.meta.dir, "../../../src/templates");

describe("env.txt", () => {
  const templatePath = join(templatesDir, "app", "env.txt");

  test("should exist", () => {
    expect(existsSync(templatePath)).toBe(true);
  });

  test("should contain App section", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("# App");
    expect(content).toContain("APP_ENV=");
    expect(content).toContain("PORT=3000");
    expect(content).toContain("HOST_NAME=");
  });

  test("should contain API section", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("# API");
    expect(content).toContain("INTERNAL_API_URLS=");
    expect(content).toContain("EXTERNAL_API_URLS=");
  });

  test("should contain Logs section", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("# Logs");
    expect(content).toContain("LOGS_DATABASE_URL=");
    expect(content).toContain("BETTERSTACK_LOGGER_SOURCE_TOKEN=");
    expect(content).toContain("BETTERSTACK_LOGGER_INGESTING_HOST=");
    expect(content).toContain("BETTERSTACK_EXCEPTION_LOGGER_APPLICATION_TOKEN=");
    expect(content).toContain("BETTERSTACK_EXCEPTION_LOGGER_INGESTING_HOST=");
  });

  test("should contain Analytics section", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("# Analytics");
    expect(content).toContain("ANALYTICS_POSTHOG_PROJECT_TOKEN=");
    expect(content).toContain("ANALYTICS_POSTHOG_HOST=");
  });

  test("should contain Cache section", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("# Cache");
    expect(content).toContain("CACHE_REDIS_URL=");
    expect(content).toContain("CACHE_UPSTASH_REDIS_REST_URL=");
    expect(content).toContain("CACHE_UPSTASH_REDIS_REST_TOKEN=");
  });

  test("should contain Pub/Sub section", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("# Pub/Sub");
    expect(content).toContain("PUBSUB_REDIS_URL=");
  });

  test("should contain Rate limit section", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("# Rate limit");
    expect(content).toContain("RATE_LIMIT_REDIS_URL=");
    expect(content).toContain("RATE_LIMIT_UPSTASH_REDIS_URL=");
    expect(content).toContain("RATE_LIMIT_UPSTASH_REDIS_TOKEN=");
  });

  test("should contain CORS section", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("# CORS");
    expect(content).toContain("CORS_ORIGINS=");
    expect(content).toContain("CORS_METHODS=");
    expect(content).toContain("CORS_HEADERS=");
    expect(content).toContain("CORS_EXPOSED_HEADERS=");
    expect(content).toContain("CORS_CREDENTIALS=");
    expect(content).toContain("CORS_MAX_AGE=");
  });

  test("should contain Storage section", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("# Storage");
    expect(content).toContain("STORAGE_CLOUDFLARE_ACCESS_KEY=");
    expect(content).toContain("STORAGE_CLOUDFLARE_SECRET_KEY=");
    expect(content).toContain("STORAGE_CLOUDFLARE_ENDPOINT=");
    expect(content).toContain("STORAGE_CLOUDFLARE_REGION=");
    expect(content).toContain("STORAGE_BUNNY_ACCESS_KEY=");
    expect(content).toContain("STORAGE_BUNNY_STORAGE_ZONE=");
    expect(content).toContain("STORAGE_BUNNY_REGION=");
    expect(content).toContain("FILESYSTEM_STORAGE_PATH=");
  });

  test("should contain Database section", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("# Database");
    expect(content).toContain("DATABASE_URL=");
    expect(content).toContain("DATABASE_REDIS_URL=");
    expect(content).toContain("SQLITE_DATABASE_PATH=");
  });

  test("should contain Mailer section", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("# Mailer");
    expect(content).toContain("MAILER_SENDER_NAME=");
    expect(content).toContain("MAILER_SENDER_ADDRESS=");
    expect(content).toContain("RESEND_API_KEY=");
  });

  test("should contain JWT section", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("# JWT");
    expect(content).toContain("JWT_SECRET=");
  });

  test("should contain AI section", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("# AI");
    expect(content).toContain("OPENAI_API_KEY=");
    expect(content).toContain("ANTHROPIC_API_KEY=");
    expect(content).toContain("GEMINI_API_KEY=");
    expect(content).toContain("GROQ_API_KEY=");
    expect(content).toContain("OLLAMA_HOST=");
  });

  test("should contain YouTube section", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("# YouTube");
    expect(content).toContain("YOUTUBE_TRANSCRIPT_API_KEY=");
  });

  test("should contain Payment section", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("# Payment");
    expect(content).toContain("POLAR_ACCESS_TOKEN=");
    expect(content).toContain("POLAR_ENVIRONMENT=");
  });

  test("should contain Authentication section", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("# Authentication");
    expect(content).toContain("CLERK_SECRET_KEY=");
  });

  test("should contain Allowed Users section", async () => {
    const content = await Bun.file(templatePath).text();
    expect(content).toContain("# Allowed Users");
    expect(content).toContain("DEVELOPMENT_ALLOWED_USERS=");
    expect(content).toContain("STAGING_ALLOWED_USERS=");
    expect(content).toContain("TESTING_ALLOWED_USERS=");
    expect(content).toContain("TEST_ALLOWED_USERS=");
    expect(content).toContain("QA_ALLOWED_USERS=");
    expect(content).toContain("UAT_ALLOWED_USERS=");
    expect(content).toContain("INTEGRATION_ALLOWED_USERS=");
    expect(content).toContain("PREVIEW_ALLOWED_USERS=");
    expect(content).toContain("DEMO_ALLOWED_USERS=");
    expect(content).toContain("SANDBOX_ALLOWED_USERS=");
    expect(content).toContain("BETA_ALLOWED_USERS=");
    expect(content).toContain("CANARY_ALLOWED_USERS=");
    expect(content).toContain("HOTFIX_ALLOWED_USERS=");
    expect(content).toContain("SYSTEM_USERS=");
    expect(content).toContain("SUPER_ADMIN_USERS=");
    expect(content).toContain("ADMIN_USERS=");
  });
});
