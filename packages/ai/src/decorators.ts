import { ContainerException, container, EContainerScope } from "@ooneex/container";
import type { AiClassType } from "./types";

export const decorator = {
  ai: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: AiClassType): void => {
      if (!target.name.endsWith("Ai")) {
        throw new ContainerException(`Class name "${target.name}" must end with "Ai"`);
      }
      container.add(target, scope);
    };
  },
};
