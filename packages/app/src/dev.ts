import { container } from "@ooneex/container";
import { SqliteLogger, TerminalLogger } from "@ooneex/logger";
import { App } from "./App";

new App({
  container,
  logger: [SqliteLogger, TerminalLogger],
});
