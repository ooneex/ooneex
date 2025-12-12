import { container } from "@ooneex/container";
import { SEEDS_CONTAINER } from "./container";
import type { ISeed } from "./types";

export const getSeeds = (): ISeed[] => {
  const seedInstances = SEEDS_CONTAINER.map((SeedClass) => {
    return container.get(SeedClass);
  });

  return seedInstances.filter((seed) => seed.isActive());
};
