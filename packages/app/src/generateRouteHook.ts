import { join } from "node:path";
import type { RouteConfigType } from "@ooneex/routing";
import { routeConfigToHookString } from "@ooneex/routing";
import { toPascalCase } from "@ooneex/utils";

export const generateRouteHook = async (config: RouteConfigType): Promise<void> => {
  const outputDir = join("src", "hooks", "routes");
  const hookString = routeConfigToHookString(config);
  const fileName = `use${toPascalCase(config.name)}.ts`;
  const filePath = join(process.cwd(), outputDir, fileName);

  await Bun.write(filePath, hookString);
};
