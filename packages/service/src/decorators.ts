import { ContainerException, container, EContainerScope } from "@ooneex/container";
import type { ServiceClassType } from "./types";

export const decorator = {
  service: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: ServiceClassType): void => {
      if (!target.name.endsWith("Service")) {
        throw new ContainerException(`Class name "${target.name}" must end with "Service"`);
      }
      container.add(target, scope);
    };
  },
};
