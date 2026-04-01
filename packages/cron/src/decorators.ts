import { container, EContainerScope, injectable } from "@ooneex/container";
import type { CronClassType } from "./types";

export const decorator = {
  cron: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: CronClassType): void => {
      injectable()(target);
      container.add(target, scope);
    };
  },
};
