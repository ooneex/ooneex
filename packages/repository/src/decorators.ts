import { container, EContainerScope, injectable } from "@ooneex/container";
import type { RepositoryClassType } from "./types";

export const decorator = {
  repository: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: RepositoryClassType): void => {
      injectable()(target);
      container.add(target, scope);
    };
  },
};
