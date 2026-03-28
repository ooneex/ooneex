import { injectable } from "@ooneex/container";
import type { EnvironmentNameType, IAppEnv } from "./types";

@injectable()
export class AppEnv implements IAppEnv {
  public readonly env: EnvironmentNameType;
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

  public constructor() {
    const env = (Bun.env.APP_ENV || "local") as EnvironmentNameType;

    this.env = env;
    this.isLocal = this.env === "local";
    this.isDevelopment = this.env === "development";
    this.isStaging = this.env === "staging";
    this.isTesting = this.env === "testing";
    this.isTest = this.env === "test";
    this.isQa = this.env === "qa";
    this.isUat = this.env === "uat";
    this.isIntegration = this.env === "integration";
    this.isPreview = this.env === "preview";
    this.isDemo = this.env === "demo";
    this.isSandbox = this.env === "sandbox";
    this.isBeta = this.env === "beta";
    this.isCanary = this.env === "canary";
    this.isHotfix = this.env === "hotfix";
    this.isProduction = this.env === "production";

    // App
    this.APP_ENV = env;
    this.PORT = Bun.env.PORT ? Number.parseInt(Bun.env.PORT, 10) : 80;
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
  }
}
