import { PostHogAdapter } from "@ooneex/analytics";
import { RedisCacheAdapter } from "@ooneex/cache";
import { container } from "@ooneex/container";
import { SqliteLogger, TerminalLogger } from "@ooneex/logger";
import { App } from "./App";

new App({
  container,
  logger: [SqliteLogger, TerminalLogger],
  analytics: PostHogAdapter,
  cache: RedisCacheAdapter,
});
