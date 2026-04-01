import { container, EContainerScope, injectable } from "@ooneex/container";
import { MIGRATIONS_CONTAINER } from "./container";
import type { MigrationClassType } from "./types";

export const decorator = {
  migration: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: MigrationClassType): void => {
      injectable()(target);
      container.add(target, scope);
      MIGRATIONS_CONTAINER.push(target);
    };
  },
};
