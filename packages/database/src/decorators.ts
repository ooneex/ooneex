import { container, EContainerScope, injectable } from "@ooneex/container";
import type { DatabaseClassType } from "./types";

export const decorator = {
  database: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: DatabaseClassType): void => {
      injectable()(target);
      container.add(target, scope);
    };
  },
};
