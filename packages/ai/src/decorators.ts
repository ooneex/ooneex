import { container, EContainerScope, injectable } from "@ooneex/container";
import type { AiClassType } from "./types";

export const decorator = {
  ai: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: AiClassType): void => {
      injectable()(target);
      container.add(target, scope);
    };
  },
};
