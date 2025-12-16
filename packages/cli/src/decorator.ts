import { container, EContainerScope } from "@ooneex/container";
import { COMMANDS_CONTAINER } from "./container";
import type { CommandClassType } from "./types";

export const command = (scope: EContainerScope = EContainerScope.Singleton) => {
  return (command: CommandClassType) => {
    container.add(command, scope);
    COMMANDS_CONTAINER.push(command);
  };
};
