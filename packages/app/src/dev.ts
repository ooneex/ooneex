import { PostHogAdapter } from "@ooneex/analytics";
import { RedisCacheAdapter } from "@ooneex/cache";
import { container } from "@ooneex/container";
import { TypeormPgDatabaseAdapter } from "@ooneex/database";
import { SqliteLogger, TerminalLogger } from "@ooneex/logger";
import { CloudflareStorageAdapter } from "@ooneex/storage";
import { App } from "./App";

const database = new TypeormPgDatabaseAdapter({
  entities: [],
});

new App({
  container,
  logger: [SqliteLogger, TerminalLogger],
  analytics: PostHogAdapter,
  cache: RedisCacheAdapter,
  storage: CloudflareStorageAdapter,
  database,
});
