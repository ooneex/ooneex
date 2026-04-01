import { container, EContainerScope, injectable } from "@ooneex/container";
import type { LoggerClassType } from "./types";

export const decorator = {
  logger: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: LoggerClassType): void => {
      injectable()(target);
      container.add(target, scope);
    };
  },
};
