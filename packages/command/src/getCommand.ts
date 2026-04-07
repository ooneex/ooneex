import { container } from "@ooneex/container";
import { COMMANDS_CONTAINER } from "./container";
import type { ICommand } from "./types";

export const getCommand = (name: string): ICommand | null => {
  let command: ICommand | null = null;

  COMMANDS_CONTAINER.find((CommandClass) => {
    command = container.get(CommandClass);

    return command.getName() === name;
  });

  return command;
};
