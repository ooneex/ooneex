import { join } from "node:path";
import type { RouteConfigType } from "@ooneex/routing";
import { routeConfigToSocketString } from "@ooneex/routing";
import { toPascalCase } from "@ooneex/utils";

export const generateRouteSocket = async (config: RouteConfigType): Promise<void> => {
  const outputDir = join("src", "fetchers", "routes");
  const socketString = routeConfigToSocketString(config);
  const fileName = `${toPascalCase(config.name)}Socket.ts`;
  const filePath = join(process.cwd(), outputDir, fileName);

  await Bun.write(filePath, socketString);
};
