import { join } from "node:path";
import { TerminalLogger } from "@ooneex/logger";
import type { RouteNameType } from "@ooneex/routing";
import type { HttpMethodType } from "@ooneex/types";
import { toKebabCase, toPascalCase, trim } from "@ooneex/utils";
import { decorator } from "../decorators";
import { askConfirm } from "../prompts/askConfirm";
import { askName } from "../prompts/askName";
import { askRouteMethod } from "../prompts/askRouteMethod";
import { askRouteNamespace } from "../prompts/askRouteNamespace";
import { askRoutePath } from "../prompts/askRoutePath";
import socketTemplate from "../templates/controller.socket.txt";
import testTemplate from "../templates/controller.test.txt";
import template from "../templates/controller.txt";
import routeTypeTemplate from "../templates/route.type.txt";
import type { ICommand } from "../types";

type CommandOptionsType = {
  name?: string;
  isSocket?: boolean;
  route?: {
    name?: RouteNameType;
    path?: `/${string}`;
    method?: HttpMethodType;
  };
};

@decorator.command()
export class MakeControllerCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "make:controller";
  }

  public getDescription(): string {
    return "Generate a new controller class";
  }

  public async run(options: T): Promise<void> {
    let { name, isSocket } = options;

    if (!name) {
      name = await askName({ message: "Enter controller name" });
    }

    if (isSocket === undefined) {
      isSocket = await askConfirm({ message: "Is this a socket controller?" });
    }

    name = toPascalCase(name).replace(/Controller$/, "");

    const { route = {} } = options;
    const selectedTemplate = isSocket ? socketTemplate : template;
    let content: string = selectedTemplate.replaceAll("{{NAME}}", name);

    let routeTypeName = "";
    let routeTypeFileName = "";

    if (!route.name) {
      const routeNamespace = await askRouteNamespace({ message: "Enter route namespace", initial: "api" });
      const routeResource = await askName({ message: "Enter resource name" });
      const routeAction = await askName({ message: "Enter route action" });
      // Construct route name as plain string to avoid excessive type complexity
      const routeName = `${routeNamespace}.${toKebabCase(routeResource)}.${routeAction}`;
      route.name = routeName as RouteNameType;

      routeTypeName = toPascalCase(routeName);
      routeTypeFileName = routeName;

      content = content
        .replaceAll("{{ROUTE_NAME}}", routeName)
        .replaceAll("{{TYPE_NAME}}", routeTypeName)
        .replaceAll("{{TYPE_NAME_FILE}}", routeTypeFileName);
    }

    if (!route.path) {
      route.path = (await askRoutePath({ message: "Enter route path", initial: "/" })) as `/${string}`;
      const routePath = `/${toKebabCase(trim(route.path, "/"))}`;
      content = content.replaceAll("{{ROUTE_PATH}}", routePath);
    }

    if (!isSocket && !route.method) {
      route.method = (await askRouteMethod({ message: "Enter route method" })) as HttpMethodType;
      content = content.replaceAll("{{ROUTE_METHOD}}", route.method.toLowerCase());
    }

    const controllersLocalDir = join("src", "controllers");
    const controllersDir = join(process.cwd(), controllersLocalDir);
    const filePath = join(controllersDir, `${name}Controller.ts`);
    await Bun.write(filePath, content);

    // Create route type file
    const routeTypesLocalDir = join("src", "types", "routes");
    const routeTypesDir = join(process.cwd(), routeTypesLocalDir);
    const routeTypeFilePath = join(routeTypesDir, `${routeTypeFileName}.ts`);
    const routeTypeContent = routeTypeTemplate.replaceAll("{{TYPE_NAME}}", routeTypeName);
    await Bun.write(routeTypeFilePath, routeTypeContent);

    // Generate test file
    const testContent = testTemplate.replace(/{{NAME}}/g, name);
    const testsLocalDir = join("tests", "controllers");
    const testsDir = join(process.cwd(), testsLocalDir);
    const testFilePath = join(testsDir, `${name}Controller.spec.ts`);
    await Bun.write(testFilePath, testContent);

    const logger = new TerminalLogger();

    logger.success(`${join(controllersLocalDir, name)}Controller.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    logger.success(`${join(routeTypesLocalDir, routeTypeFileName)}.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    logger.success(`${join(testsLocalDir, name)}Controller.spec.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });
  }
}
