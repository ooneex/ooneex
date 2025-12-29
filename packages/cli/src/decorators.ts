import { ContainerException, container, EContainerScope } from "@ooneex/container";
import { COMMANDS_CONTAINER } from "./container";
import type { CommandClassType } from "./types";

export const decorator = {
  command: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (command: CommandClassType): void => {
      if (!command.name.endsWith("Command")) {
        throw new ContainerException(`Class name "${command.name}" must end with "Command"`);
      }
      container.add(command, scope);
      COMMANDS_CONTAINER.push(command);
    };
  },
};
