#!/usr/bin/env bun

import { parseArgs } from "node:util";
import type { IException } from "@ooneex/exception";
import { Exception } from "@ooneex/exception";
import { TerminalLogger } from "@ooneex/logger";
import type { HttpMethodType } from "@ooneex/types";
import { getCommand } from "./getCommand";
import "./commands";

const { values, positionals } = parseArgs({
  args: Bun.argv,
  options: {
    name: {
      type: "string",
    },
    "route-name": {
      type: "string",
    },
    "route-path": {
      type: "string",
    },
    "route-method": {
      type: "string",
    },
    "is-socket": {
      type: "boolean",
    },
    dir: {
      type: "string",
    },
    channel: {
      type: "string",
    },
    "table-name": {
      type: "string",
    },
    module: {
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

const parsedValues = {
  name: values.name,
  dir: values.dir,
  channel: values.channel,
  isSocket: values["is-socket"],
  tableName: values["table-name"],
  module: values.module,
  route: {
    name: values["route-name"],
    path: values["route-path"] as `/${string}` | undefined,
    method: values["route-method"] as HttpMethodType | undefined,
  },
};

try {
  await command.run(parsedValues);
} catch (error) {
  const exception: IException =
    error instanceof Exception ? error : new Exception(error instanceof Error ? error : String(error));
  logger.error(exception, undefined, {
    showArrow: false,
    showTimestamp: false,
    showLevel: false,
  });
  process.exit(1);
}
