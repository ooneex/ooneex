import { container, EContainerScope, injectable } from "@ooneex/container";
import type { VectorDatabaseClassType } from "./types";

export const decorator = {
  vectorDatabase: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: VectorDatabaseClassType): void => {
      injectable()(target);
      container.add(target, scope);
    };
  },
};
