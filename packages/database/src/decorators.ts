import { ContainerException, container, EContainerScope } from "@ooneex/container";
import type { DatabaseClassType } from "./types";

export const decorator = {
  database: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: DatabaseClassType): void => {
      if (!target.name.endsWith("Database")) {
        throw new ContainerException(`Class name "${target.name}" must end with "Database"`);
      }
      container.add(target, scope);
    };
  },
};
