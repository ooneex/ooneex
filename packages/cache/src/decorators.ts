import { ContainerException, container, EContainerScope } from "@ooneex/container";
import type { CacheClassType } from "./types";

export const decorator = {
  cache: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: CacheClassType): void => {
      if (!target.name.endsWith("Cache")) {
        throw new ContainerException(`Class name "${target.name}" must end with "Cache"`);
      }
      container.add(target, scope);
    };
  },
};
