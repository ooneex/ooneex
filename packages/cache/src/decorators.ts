import { container, EContainerScope, injectable } from "@ooneex/container";
import type { CacheClassType } from "./types";

export const decorator = {
  cache: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: CacheClassType): void => {
      injectable()(target);
      container.add(target, scope);
    };
  },
};
