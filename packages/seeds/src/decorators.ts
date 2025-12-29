import { ContainerException, container, EContainerScope } from "@ooneex/container";
import { SEEDS_CONTAINER } from "./container";
import type { SeedClassType } from "./types";

export const decorator = {
  seed: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: SeedClassType): void => {
      if (!target.name.endsWith("Seed")) {
        throw new ContainerException(`Class name "${target.name}" must end with "Seed"`);
      }
      container.add(target, scope);
      SEEDS_CONTAINER.push(target);
    };
  },
};
