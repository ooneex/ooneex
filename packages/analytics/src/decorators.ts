import { ContainerException, container, EContainerScope } from "@ooneex/container";
import type { AnalyticsClassType } from "./types";

export const decorator = {
  analytics: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: AnalyticsClassType): void => {
      if (!target.name.endsWith("Analytics")) {
        throw new ContainerException(`Class name "${target.name}" must end with "Analytics"`);
      }
      container.add(target, scope);
    };
  },
};
