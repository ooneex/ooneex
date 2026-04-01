import { container, EContainerScope } from "@ooneex/container";
import type { StorageClassType } from "./types";

export const decorator = {
  storage: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: StorageClassType): void => {
      container.add(target, scope);
    };
  },
};
