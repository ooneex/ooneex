import { container, EContainerScope, injectable } from "@ooneex/container";
import type { ServiceClassType } from "./types";

export const decorator = {
  service: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: ServiceClassType): void => {
      injectable()(target);
      container.add(target, scope);
    };
  },
};
