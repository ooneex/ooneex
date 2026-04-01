import { container, EContainerScope, injectable } from "@ooneex/container";
import type { StorageClassType } from "./types";

export const decorator = {
  storage: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: StorageClassType): void => {
      injectable()(target);
      container.add(target, scope);
    };
  },
};
