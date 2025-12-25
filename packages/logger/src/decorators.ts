import { ContainerException, container, EContainerScope } from "@ooneex/container";
import type { LoggerClassType } from "./types";

export const decorator = {
  logger: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: LoggerClassType): void => {
      if (!target.name.endsWith("Logger")) {
        throw new ContainerException(`Class name "${target.name}" must end with "Logger"`);
      }
      container.add(target, scope);
    };
  },
};
