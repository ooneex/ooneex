import { injectable } from "@ooneex/container";
import { parseString } from "@ooneex/utils";
import type { EnvironmentNameType, IAppEnv } from "./types";

@injectable()
export class AppEnv implements IAppEnv {
  public readonly isLocal: boolean;
  public readonly isDevelopment: boolean;
  public readonly isStaging: boolean;
  public readonly isTesting: boolean;
  public readonly isTest: boolean;
  public readonly isQa: boolean;
  public readonly isUat: boolean;
  public readonly isIntegration: boolean;
  public readonly isPreview: boolean;
  public readonly isDemo: boolean;
  public readonly isSandbox: boolean;
  public readonly isBeta: boolean;
  public readonly isCanary: boolean;
  public readonly isHotfix: boolean;
  public readonly isProduction: boolean;

  // App
  public readonly APP_ENV: EnvironmentNameType;
  public readonly PORT: number;
  public readonly HOST_NAME: string;

  // Logs
  public readonly LOGS_DATABASE_URL: string | undefined;
  public readonly LOGTAIL_SOURCE_TOKEN: string | undefined;
  public readonly LOGTAIL_ENDPOINT: string | undefined;
  public readonly BETTERSTACK_APPLICATION_TOKEN: string | undefined;
  public readonly BETTERSTACK_INGESTING_HOST: string | undefined;

  // Analytics
  public readonly ANALYTICS_POSTHOG_API_KEY: string | undefined;
  public readonly ANALYTICS_POSTHOG_HOST: string | undefined;

  // Cache
  public readonly CACHE_REDIS_URL: string | undefined;

  // Pub/Sub
  public readonly PUBSUB_REDIS_URL: string | undefined;

  // Rate limit
  public readonly RATE_LIMIT_REDIS_URL: string | undefined;

  // CORS
  public readonly CORS_ORIGINS: string | undefined;
  public readonly CORS_METHODS: string | undefined;
  public readonly CORS_HEADERS: string | undefined;
  public readonly CORS_EXPOSED_HEADERS: string | undefined;
  public readonly CORS_CREDENTIALS: string | undefined;
  public readonly CORS_MAX_AGE: string | undefined;

  // Storage
  public readonly STORAGE_CLOUDFLARE_ACCESS_KEY: string | undefined;
  public readonly STORAGE_CLOUDFLARE_SECRET_KEY: string | undefined;
  public readonly STORAGE_CLOUDFLARE_ENDPOINT: string | undefined;
  public readonly STORAGE_CLOUDFLARE_REGION: string | undefined;
  public readonly STORAGE_BUNNY_ACCESS_KEY: string | undefined;
  public readonly STORAGE_BUNNY_STORAGE_ZONE: string | undefined;
  public readonly STORAGE_BUNNY_REGION: string | undefined;
  public readonly FILESYSTEM_STORAGE_PATH: string | undefined;

  // Database
  public readonly DATABASE_URL: string | undefined;
  public readonly DATABASE_REDIS_URL: string | undefined;
  public readonly SQLITE_DATABASE_PATH: string | undefined;

  // Mailer
  public readonly MAILER_SENDER_NAME: string | undefined;
  public readonly MAILER_SENDER_ADDRESS: string | undefined;
  public readonly RESEND_API_KEY: string | undefined;

  // JWT
  public readonly JWT_SECRET: string | undefined;

  // AI
  public readonly OPENAI_API_KEY: string | undefined;
  public readonly ANTHROPIC_API_KEY: string | undefined;
  public readonly GEMINI_API_KEY: string | undefined;
  public readonly GROQ_API_KEY: string | undefined;
  public readonly OLLAMA_HOST: string | undefined;

  // Payment
  public readonly POLAR_ACCESS_TOKEN: string | undefined;
  public readonly POLAR_ENVIRONMENT: string | undefined;

  // Authentication
  public readonly CLERK_SECRET_KEY: string | undefined;

  // Allowed Users
  public readonly DEVELOPMENT_ALLOWED_USERS: string[];
  public readonly STAGING_ALLOWED_USERS: string[];
  public readonly TESTING_ALLOWED_USERS: string[];
  public readonly TEST_ALLOWED_USERS: string[];
  public readonly QA_ALLOWED_USERS: string[];
  public readonly UAT_ALLOWED_USERS: string[];
  public readonly INTEGRATION_ALLOWED_USERS: string[];
  public readonly PREVIEW_ALLOWED_USERS: string[];
  public readonly DEMO_ALLOWED_USERS: string[];
  public readonly SANDBOX_ALLOWED_USERS: string[];
  public readonly BETA_ALLOWED_USERS: string[];
  public readonly CANARY_ALLOWED_USERS: string[];
  public readonly HOTFIX_ALLOWED_USERS: string[];

  public constructor() {
    // App
    this.APP_ENV = (Bun.env.APP_ENV || "production") as EnvironmentNameType;
    this.isLocal = this.APP_ENV === "local";
    this.isDevelopment = this.APP_ENV === "development";
    this.isStaging = this.APP_ENV === "staging";
    this.isTesting = this.APP_ENV === "testing";
    this.isTest = this.APP_ENV === "test";
    this.isQa = this.APP_ENV === "qa";
    this.isUat = this.APP_ENV === "uat";
    this.isIntegration = this.APP_ENV === "integration";
    this.isPreview = this.APP_ENV === "preview";
    this.isDemo = this.APP_ENV === "demo";
    this.isSandbox = this.APP_ENV === "sandbox";
    this.isBeta = this.APP_ENV === "beta";
    this.isCanary = this.APP_ENV === "canary";
    this.isHotfix = this.APP_ENV === "hotfix";
    this.isProduction = this.APP_ENV === "production";
    this.PORT = Bun.env.PORT ? parseString<number>(Bun.env.PORT) : 3000;
    this.HOST_NAME = Bun.env.HOST_NAME || "0.0.0.0";

    // Logs
    this.LOGS_DATABASE_URL = Bun.env.LOGS_DATABASE_URL;
    this.LOGTAIL_SOURCE_TOKEN = Bun.env.LOGTAIL_SOURCE_TOKEN;
    this.LOGTAIL_ENDPOINT = Bun.env.LOGTAIL_ENDPOINT;
    this.BETTERSTACK_APPLICATION_TOKEN = Bun.env.BETTERSTACK_APPLICATION_TOKEN;
    this.BETTERSTACK_INGESTING_HOST = Bun.env.BETTERSTACK_INGESTING_HOST;

    // Analytics
    this.ANALYTICS_POSTHOG_API_KEY = Bun.env.ANALYTICS_POSTHOG_API_KEY;
    this.ANALYTICS_POSTHOG_HOST = Bun.env.ANALYTICS_POSTHOG_HOST;

    // Cache
    this.CACHE_REDIS_URL = Bun.env.CACHE_REDIS_URL;

    // Pub/Sub
    this.PUBSUB_REDIS_URL = Bun.env.PUBSUB_REDIS_URL;

    // Rate limit
    this.RATE_LIMIT_REDIS_URL = Bun.env.RATE_LIMIT_REDIS_URL;

    // CORS
    this.CORS_ORIGINS = Bun.env.CORS_ORIGINS;
    this.CORS_METHODS = Bun.env.CORS_METHODS;
    this.CORS_HEADERS = Bun.env.CORS_HEADERS;
    this.CORS_EXPOSED_HEADERS = Bun.env.CORS_EXPOSED_HEADERS;
    this.CORS_CREDENTIALS = Bun.env.CORS_CREDENTIALS;
    this.CORS_MAX_AGE = Bun.env.CORS_MAX_AGE;

    // Storage
    this.STORAGE_CLOUDFLARE_ACCESS_KEY = Bun.env.STORAGE_CLOUDFLARE_ACCESS_KEY;
    this.STORAGE_CLOUDFLARE_SECRET_KEY = Bun.env.STORAGE_CLOUDFLARE_SECRET_KEY;
    this.STORAGE_CLOUDFLARE_ENDPOINT = Bun.env.STORAGE_CLOUDFLARE_ENDPOINT;
    this.STORAGE_CLOUDFLARE_REGION = Bun.env.STORAGE_CLOUDFLARE_REGION;
    this.STORAGE_BUNNY_ACCESS_KEY = Bun.env.STORAGE_BUNNY_ACCESS_KEY;
    this.STORAGE_BUNNY_STORAGE_ZONE = Bun.env.STORAGE_BUNNY_STORAGE_ZONE;
    this.STORAGE_BUNNY_REGION = Bun.env.STORAGE_BUNNY_REGION;
    this.FILESYSTEM_STORAGE_PATH = Bun.env.FILESYSTEM_STORAGE_PATH;

    // Database
    this.DATABASE_URL = Bun.env.DATABASE_URL;
    this.DATABASE_REDIS_URL = Bun.env.DATABASE_REDIS_URL;
    this.SQLITE_DATABASE_PATH = Bun.env.SQLITE_DATABASE_PATH;

    // Mailer
    this.MAILER_SENDER_NAME = Bun.env.MAILER_SENDER_NAME;
    this.MAILER_SENDER_ADDRESS = Bun.env.MAILER_SENDER_ADDRESS;
    this.RESEND_API_KEY = Bun.env.RESEND_API_KEY;

    // JWT
    this.JWT_SECRET = Bun.env.JWT_SECRET;

    // AI
    this.OPENAI_API_KEY = Bun.env.OPENAI_API_KEY;
    this.ANTHROPIC_API_KEY = Bun.env.ANTHROPIC_API_KEY;
    this.GEMINI_API_KEY = Bun.env.GEMINI_API_KEY;
    this.GROQ_API_KEY = Bun.env.GROQ_API_KEY;
    this.OLLAMA_HOST = Bun.env.OLLAMA_HOST;

    // Payment
    this.POLAR_ACCESS_TOKEN = Bun.env.POLAR_ACCESS_TOKEN;
    this.POLAR_ENVIRONMENT = Bun.env.POLAR_ENVIRONMENT;

    // Authentication
    this.CLERK_SECRET_KEY = Bun.env.CLERK_SECRET_KEY;

    // Allowed Users
    this.DEVELOPMENT_ALLOWED_USERS = (Bun.env.DEVELOPMENT_ALLOWED_USERS || "").split(",").map((s) => s.trim()).filter(Boolean);
    this.STAGING_ALLOWED_USERS = (Bun.env.STAGING_ALLOWED_USERS || "").split(",").map((s) => s.trim()).filter(Boolean);
    this.TESTING_ALLOWED_USERS = (Bun.env.TESTING_ALLOWED_USERS || "").split(",").map((s) => s.trim()).filter(Boolean);
    this.TEST_ALLOWED_USERS = (Bun.env.TEST_ALLOWED_USERS || "").split(",").map((s) => s.trim()).filter(Boolean);
    this.QA_ALLOWED_USERS = (Bun.env.QA_ALLOWED_USERS || "").split(",").map((s) => s.trim()).filter(Boolean);
    this.UAT_ALLOWED_USERS = (Bun.env.UAT_ALLOWED_USERS || "").split(",").map((s) => s.trim()).filter(Boolean);
    this.INTEGRATION_ALLOWED_USERS = (Bun.env.INTEGRATION_ALLOWED_USERS || "").split(",").map((s) => s.trim()).filter(Boolean);
    this.PREVIEW_ALLOWED_USERS = (Bun.env.PREVIEW_ALLOWED_USERS || "").split(",").map((s) => s.trim()).filter(Boolean);
    this.DEMO_ALLOWED_USERS = (Bun.env.DEMO_ALLOWED_USERS || "").split(",").map((s) => s.trim()).filter(Boolean);
    this.SANDBOX_ALLOWED_USERS = (Bun.env.SANDBOX_ALLOWED_USERS || "").split(",").map((s) => s.trim()).filter(Boolean);
    this.BETA_ALLOWED_USERS = (Bun.env.BETA_ALLOWED_USERS || "").split(",").map((s) => s.trim()).filter(Boolean);
    this.CANARY_ALLOWED_USERS = (Bun.env.CANARY_ALLOWED_USERS || "").split(",").map((s) => s.trim()).filter(Boolean);
    this.HOTFIX_ALLOWED_USERS = (Bun.env.HOTFIX_ALLOWED_USERS || "").split(",").map((s) => s.trim()).filter(Boolean);
  }
}
