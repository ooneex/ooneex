import { container, EContainerScope, injectable } from "@ooneex/container";
import { SEEDS_CONTAINER } from "./container";
import type { SeedClassType } from "./types";

export const decorator = {
  seed: (scope: EContainerScope = EContainerScope.Singleton) => {
    return (target: SeedClassType): void => {
      injectable()(target);
      container.add(target, scope);
      SEEDS_CONTAINER.push(target);
    };
  },
};
