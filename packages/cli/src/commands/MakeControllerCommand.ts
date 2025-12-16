import { join } from "node:path";
import type { RouteAction, RouteNameSegment, RouteNamespace, RouteNameType } from "@ooneex/routing";
import type { HttpMethodType } from "@ooneex/types";
import { toPascalCase } from "@ooneex/utils";
import { askRouteMethod } from "@/prompts/askRouteMethod";
import { askRoutePath } from "@/prompts/askRoutePath";
import { command } from "../decorator";
import { askName } from "../prompts/askName";
import { askRouteNamespace } from "../prompts/askRouteNamespace";
import template from "../templates/controller.txt";
import type { ICommand } from "../types";

type CommandOptionsType = {
  name?: string;
  route?: {
    name?: RouteNameType;
    path?: `/${string}`;
    method?: HttpMethodType;
  };
};

@command()
export class MakeControllerCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "make:controller";
  }

  public getDescription(): string {
    return "Generate a new controller class";
  }

  public async run(options: T): Promise<void> {
    let { name } = options;

    if (!name) {
      name = await askName({ message: "Enter controller name" });
    }

    name = toPascalCase(name).replace(/Controller$/, "");

    const { route = {} } = options;

    if (!route.name) {
      const routeNamespace = await askRouteNamespace({ message: "Enter route namespace", initial: "api" });
      const routeResource = await askName({ message: "Enter resource name" });
      const routeAction = await askName({ message: "Enter route action" });
      route.name = `${routeNamespace as RouteNamespace}.${routeResource as RouteNameSegment}.${routeAction as RouteAction}`;
    }

    if (!route.path) {
      route.path = (await askRoutePath({ message: "Enter route path", initial: "/" })) as `/${string}`;
    }

    if (!route.method) {
      route.method = (await askRouteMethod({ message: "Enter route method" })) as HttpMethodType;
    }

    const content = template
      .replace(/{{NAME}}/g, name)
      .replace(/{{ROUTE_NAME}}/g, route.name)
      .replace(/{{TYPE_NAME}}/g, toPascalCase(route.name))
      .replace(/{{TYPE_NAME_FILE}}/g, route.name)
      .replace(/{{ROUTE_PATH}}/g, route.path)
      .replace(/{{ROUTE_METHOD}}/g, route.method.toLowerCase());

    const controllersDir = join(process.cwd(), "src", "controllers");
    const filePath = join(controllersDir, `${name}Controller.ts`);
    await Bun.write(filePath, content);
  }
}
