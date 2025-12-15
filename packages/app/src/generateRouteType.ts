import { join } from "node:path";
import type { RouteConfigType } from "@ooneex/routing";
import { routeConfigToTypeString } from "@ooneex/routing";
import { toPascalCase } from "@ooneex/utils";

export const generateRouteType = async (config: RouteConfigType): Promise<void> => {
  const outputDir = "src/types/routes";
  const typeString = routeConfigToTypeString(config);
  const fileName = `${config.name}.ts`;
  const filePath = join(process.cwd(), outputDir, fileName);

  const typeName = toPascalCase(config.name);

  const fileContent = `export type ${typeName}RouteType = ${typeString};
`;

  await Bun.write(filePath, fileContent);
};
