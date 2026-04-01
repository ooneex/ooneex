import { container, EContainerScope } from "@ooneex/container";
import type { LoggerClassType } from "./types";

export const decorator = {
  logger: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: LoggerClassType): void => {
      container.add(target, scope);
    };
  },
};
