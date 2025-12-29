import { ContainerException, container, EContainerScope } from "@ooneex/container";
import { MIGRATIONS_CONTAINER } from "./container";
import type { MigrationClassType } from "./types";

export const decorator = {
  migration: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: MigrationClassType): void => {
      if (!target.name.startsWith("Migration")) {
        throw new ContainerException(`Class name "${target.name}" must start with "Migration"`);
      }
      container.add(target, scope);
      MIGRATIONS_CONTAINER.push(target);
    };
  },
};
