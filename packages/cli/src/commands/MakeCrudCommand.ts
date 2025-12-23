import { join } from "node:path";
import { TerminalLogger } from "@ooneex/logger";
import type { RouteNameSegment, RouteNamespace } from "@ooneex/routing";
import { toKebabCase, toPascalCase } from "@ooneex/utils";
import pluralize from "pluralize";
import { command } from "../decorator";
import { askName } from "../prompts/askName";
import createTemplate from "../templates/crud/controller.create.txt";
import deleteTemplate from "../templates/crud/controller.delete.txt";
import filterTemplate from "../templates/crud/controller.filter.txt";
import getTemplate from "../templates/crud/controller.get.txt";
import updateTemplate from "../templates/crud/controller.update.txt";
import routeTypeCreateTemplate from "../templates/crud/route.type.create.txt";
import routeTypeDeleteTemplate from "../templates/crud/route.type.delete.txt";
import routeTypeFilterTemplate from "../templates/crud/route.type.filter.txt";
import routeTypeGetTemplate from "../templates/crud/route.type.get.txt";
import routeTypeUpdateTemplate from "../templates/crud/route.type.update.txt";
import type { ICommand } from "../types";
import { MakeEntityCommand } from "./MakeEntityCommand";
import { MakeRepositoryCommand } from "./MakeRepositoryCommand";

type CommandOptionsType = {
  name?: string;
};

type ControllerConfig = {
  template: string;
  suffix: string;
  routeName: string;
  routePath: string;
  routeMethod: string;
  routeDescription: string;
};

type RouteTypeConfig = {
  template: string;
  suffix: string;
  routeName: string;
};

@command()
export class MakeCrudCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "make:crud";
  }

  public getDescription(): string {
    return "Generate a new resource";
  }

  public async run(options: T): Promise<void> {
    let { name } = options;

    if (!name) {
      name = await askName({ message: "Enter resource name" });
    }

    name = toPascalCase(name)
      .replace(/Entity$/, "")
      .replace(/Repository$/, "");

    const entityCommand = new MakeEntityCommand();
    await entityCommand.run({ name });

    const repositoryCommand = new MakeRepositoryCommand();
    await repositoryCommand.run({ name });

    await this.generateRouteTypes(name);
    await this.generateControllers(name);
  }

  private async generateRouteTypes(name: string): Promise<void> {
    const resourceName = toKebabCase(name);
    const namespace = "api" as RouteNamespace;

    const routeTypes: RouteTypeConfig[] = [
      {
        template: routeTypeCreateTemplate,
        suffix: "Create",
        routeName: `${namespace}.${resourceName as RouteNameSegment}.create`,
      },
      {
        template: routeTypeGetTemplate,
        suffix: "Get",
        routeName: `${namespace}.${resourceName as RouteNameSegment}.get`,
      },
      {
        template: routeTypeUpdateTemplate,
        suffix: "Update",
        routeName: `${namespace}.${resourceName as RouteNameSegment}.update`,
      },
      {
        template: routeTypeDeleteTemplate,
        suffix: "Delete",
        routeName: `${namespace}.${resourceName as RouteNameSegment}.delete`,
      },
      {
        template: routeTypeFilterTemplate,
        suffix: "Filter",
        routeName: `${namespace}.${resourceName as RouteNameSegment}.filter`,
      },
    ];

    const routeTypesDir = join(process.cwd(), "src", "types", "routes");

    for (const config of routeTypes) {
      const content = config.template.replace(/{{TYPE_NAME}}/g, toPascalCase(config.routeName));

      const routeTypeLocalDir = join("src", "types", "routes");
      const filePath = join(routeTypesDir, `${config.routeName}.ts`);
      await Bun.write(filePath, content);

      const logger = new TerminalLogger();
      logger.success(`${join(routeTypeLocalDir, config.routeName)}.ts created successfully`, undefined, {
        showTimestamp: false,
        showArrow: false,
        useSymbol: true,
      });
    }
  }

  private async generateControllers(name: string): Promise<void> {
    const resourceName = toKebabCase(name);
    const namespace = "api" as RouteNamespace;

    const controllers: ControllerConfig[] = [
      {
        template: createTemplate,
        suffix: "Create",
        routeName: `${namespace}.${resourceName as RouteNameSegment}.create`,
        routePath: `/${pluralize(resourceName)}`,
        routeMethod: "post",
        routeDescription: `Create a new ${name}`,
      },
      {
        template: getTemplate,
        suffix: "Get",
        routeName: `${namespace}.${resourceName as RouteNameSegment}.get`,
        routePath: `/${pluralize(resourceName)}/:id`,
        routeMethod: "get",
        routeDescription: `Get a ${name} by ID`,
      },
      {
        template: updateTemplate,
        suffix: "Update",
        routeName: `${namespace}.${resourceName as RouteNameSegment}.update`,
        routePath: `/${pluralize(resourceName)}/:id`,
        routeMethod: "put",
        routeDescription: `Update a ${name} by ID`,
      },
      {
        template: deleteTemplate,
        suffix: "Delete",
        routeName: `${namespace}.${resourceName as RouteNameSegment}.delete`,
        routePath: `/${pluralize(resourceName)}/:id`,
        routeMethod: "delete",
        routeDescription: `Delete a ${name} by ID`,
      },
      {
        template: filterTemplate,
        suffix: "Filter",
        routeName: `${namespace}.${resourceName as RouteNameSegment}.filter`,
        routePath: `/${pluralize(resourceName)}`,
        routeMethod: "get",
        routeDescription: `Filter ${name} resources`,
      },
    ];

    const controllersDir = join(process.cwd(), "src", "controllers");

    for (const config of controllers) {
      const content = config.template
        .replace(/{{NAME}}/g, name)
        .replace(/{{CONTROLLER_NAME}}/g, `${name}${config.suffix}`)
        .replace(/{{ROUTE_NAME}}/g, config.routeName)
        .replace(/{{TYPE_NAME}}/g, toPascalCase(config.routeName))
        .replace(/{{TYPE_NAME_FILE}}/g, config.routeName)
        .replace(/{{ROUTE_PATH}}/g, config.routePath)
        .replace(/{{ROUTE_METHOD}}/g, config.routeMethod)
        .replace(/{{ROUTE_DESCRIPTION}}/g, config.routeDescription);

      const controllerLocalDir = join("src", "controllers");
      const filePath = join(controllersDir, `${name}${config.suffix}Controller.ts`);
      await Bun.write(filePath, content);

      const logger = new TerminalLogger();
      logger.success(`${join(controllerLocalDir, name)}${config.suffix}Controller.ts created successfully`, undefined, {
        showTimestamp: false,
        showArrow: false,
        useSymbol: true,
      });
    }
  }
}
