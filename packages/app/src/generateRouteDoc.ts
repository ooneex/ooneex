import { join } from "node:path";
import type { RouteConfigType } from "@ooneex/routing";
import { routeConfigToJsonDoc } from "@ooneex/routing";

export const generateRouteDoc = async (config: RouteConfigType): Promise<void> => {
  const outputDir = "docs/routes";
  const jsonDoc = routeConfigToJsonDoc(config);
  const fileName = `${config.name}.json`;
  const filePath = join(process.cwd(), outputDir, fileName);

  await Bun.write(filePath, JSON.stringify(jsonDoc, null, 2));
};
