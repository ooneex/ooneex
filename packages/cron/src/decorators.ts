import { ContainerException, container, EContainerScope } from "@ooneex/container";
import type { CronClassType } from "./types";

export const decorator = {
  cron: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: CronClassType): void => {
      if (!target.name.endsWith("Cron")) {
        throw new ContainerException(`Class name "${target.name}" must end with "Cron"`);
      }
      container.add(target, scope);
    };
  },
};
