import { container, EContainerScope } from "@ooneex/container";
import type { AiClassType } from "./types";

export const decorator = {
  ai: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: AiClassType): void => {
      container.add(target, scope);
    };
  },
};
