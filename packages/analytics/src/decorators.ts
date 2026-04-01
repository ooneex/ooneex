import { container, EContainerScope, injectable } from "@ooneex/container";
import type { AnalyticsClassType } from "./types";

export const decorator = {
  analytics: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: AnalyticsClassType): void => {
      injectable()(target);
      container.add(target, scope);
    };
  },
};
