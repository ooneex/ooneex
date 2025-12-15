import { join } from "node:path";
import type { RouteConfigType } from "@ooneex/routing";
import { routeConfigToFetcherString } from "@ooneex/routing";
import { toPascalCase } from "@ooneex/utils";

export const generateRouteFetcher = async (config: RouteConfigType): Promise<void> => {
  const outputDir = "src/fetchers";
  const fetcherString = routeConfigToFetcherString(config);
  const fileName = `${toPascalCase(config.name)}Fetcher.ts`;
  const filePath = join(process.cwd(), outputDir, fileName);

  await Bun.write(filePath, fetcherString);
};
