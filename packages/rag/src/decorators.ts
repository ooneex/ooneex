import { container, EContainerScope } from "@ooneex/container";
import type { VectorDatabaseClassType } from "./types";

export const decorator = {
  vectorDatabase: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: VectorDatabaseClassType): void => {
      container.add(target, scope);
    };
  },
};
