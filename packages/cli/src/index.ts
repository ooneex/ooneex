import { parseArgs } from "node:util";
import type { IException } from "@ooneex/exception";
import { TerminalLogger } from "@ooneex/logger";
import { getCommand } from "./getCommand";
import "./commands";

const { values, positionals } = parseArgs({
  args: Bun.argv,
  options: {
    name: {
      type: "string",
    },
  },
  strict: true,
  allowPositionals: true,
});

const logger = new TerminalLogger();

const commandName = positionals[2];

if (!commandName) {
  logger.error("Command name is required\n");
  process.exit(1);
}

const command = getCommand(commandName);

if (!command) {
  logger.info("No commands found\n");
  process.exit(1);
}

try {
  await command.run(values);
} catch (error) {
  logger.error(error as IException);
  process.exit(1);
}
