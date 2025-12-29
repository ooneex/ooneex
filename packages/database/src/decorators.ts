import { container, EContainerScope } from "@ooneex/container";
import type { DatabaseClassType } from "./types";

export const decorator = {
  database: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: DatabaseClassType): void => {
      container.add(target, scope);
    };
  },
};
