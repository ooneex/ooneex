import { container } from "@ooneex/container";
import type { IException } from "@ooneex/exception";
import { TerminalLogger } from "@ooneex/logger";
import { getSeeds } from "./getSeeds";
import type { ISeed } from "./types";

const run = async (seed: ISeed): Promise<void> => {
  const data = [];

  const dependencies = await seed.getDependencies();

  for (const dependency of dependencies) {
    const dep = container.get(dependency);
    data.push(await run(dep));
  }

  await seed.run(data);
};

export const seedRun = async (): Promise<void> => {
  const seeds = getSeeds();
  const logger = new TerminalLogger();

  if (seeds.length === 0) {
    logger.info("No seeds found\n");
    return;
  }

  logger.info(`Running ${seeds.length} seed(s)...\n`);

  for (const seed of seeds) {
    const seedName = seed.constructor.name;

    if (!seed.isActive()) {
      logger.warn(`Seed ${seedName} is inactive\n`);
      continue;
    }

    try {
      await run(seed);
      logger.success(`Seed ${seedName} completed\n`);
    } catch (error) {
      logger.error(`Seed ${seedName} failed\n`);
      logger.error(error as IException);
      process.exit(1);
    }
  }

  logger.success("\nAll seeds completed successfully\n");
};
