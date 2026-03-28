export type AppEnvClassType = new () => IAppEnv;

export enum Environment {
  LOCAL = "local",
  DEVELOPMENT = "development",
  STAGING = "staging",
  TESTING = "testing",
  TEST = "test",
  QA = "qa",
  UAT = "uat",
  INTEGRATION = "integration",
  PREVIEW = "preview",
  DEMO = "demo",
  SANDBOX = "sandbox",
  BETA = "beta",
  CANARY = "canary",
  HOTFIX = "hotfix",
  PRODUCTION = "production",
}

export type EnvironmentNameType = `${Environment}`;

export interface IAppEnv {
  readonly isLocal: boolean;
  readonly isDevelopment: boolean;
  readonly isStaging: boolean;
  readonly isTesting: boolean;
  readonly isTest: boolean;
  readonly isQa: boolean;
  readonly isUat: boolean;
  readonly isIntegration: boolean;
  readonly isPreview: boolean;
  readonly isDemo: boolean;
  readonly isSandbox: boolean;
  readonly isBeta: boolean;
  readonly isCanary: boolean;
  readonly isHotfix: boolean;
  readonly isProduction: boolean;

  // App
  readonly APP_ENV: EnvironmentNameType;
  readonly PORT: number;
  readonly HOST_NAME: string;

  // Logs
  readonly LOGS_DATABASE_URL: string | undefined;
  readonly LOGTAIL_SOURCE_TOKEN: string | undefined;
  readonly LOGTAIL_ENDPOINT: string | undefined;
  readonly BETTERSTACK_APPLICATION_TOKEN: string | undefined;
  readonly BETTERSTACK_INGESTING_HOST: string | undefined;

  // Analytics
  readonly ANALYTICS_POSTHOG_API_KEY: string | undefined;
  readonly ANALYTICS_POSTHOG_HOST: string | undefined;

  // Cache
  readonly CACHE_REDIS_URL: string | undefined;

  // Pub/Sub
  readonly PUBSUB_REDIS_URL: string | undefined;

  // Rate limit
  readonly RATE_LIMIT_REDIS_URL: string | undefined;

  // CORS
  readonly CORS_ORIGINS: string | undefined;
  readonly CORS_METHODS: string | undefined;
  readonly CORS_HEADERS: string | undefined;
  readonly CORS_EXPOSED_HEADERS: string | undefined;
  readonly CORS_CREDENTIALS: string | undefined;
  readonly CORS_MAX_AGE: string | undefined;

  // Storage
  readonly STORAGE_CLOUDFLARE_ACCESS_KEY: string | undefined;
  readonly STORAGE_CLOUDFLARE_SECRET_KEY: string | undefined;
  readonly STORAGE_CLOUDFLARE_ENDPOINT: string | undefined;
  readonly STORAGE_CLOUDFLARE_REGION: string | undefined;
  readonly STORAGE_BUNNY_ACCESS_KEY: string | undefined;
  readonly STORAGE_BUNNY_STORAGE_ZONE: string | undefined;
  readonly STORAGE_BUNNY_REGION: string | undefined;
  readonly FILESYSTEM_STORAGE_PATH: string | undefined;

  // Database
  readonly DATABASE_URL: string | undefined;
  readonly DATABASE_REDIS_URL: string | undefined;
  readonly SQLITE_DATABASE_PATH: string | undefined;

  // Mailer
  readonly MAILER_SENDER_NAME: string | undefined;
  readonly MAILER_SENDER_ADDRESS: string | undefined;
  readonly RESEND_API_KEY: string | undefined;

  // JWT
  readonly JWT_SECRET: string | undefined;

  // AI
  readonly OPENAI_API_KEY: string | undefined;
  readonly ANTHROPIC_API_KEY: string | undefined;
  readonly GEMINI_API_KEY: string | undefined;
  readonly GROQ_API_KEY: string | undefined;
  readonly OLLAMA_HOST: string | undefined;

  // Payment
  readonly POLAR_ACCESS_TOKEN: string | undefined;
  readonly POLAR_ENVIRONMENT: string | undefined;

  // Authentication
  readonly CLERK_SECRET_KEY: string | undefined;
}
