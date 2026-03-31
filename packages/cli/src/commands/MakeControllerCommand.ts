import { basename, join } from "node:path";
import { TerminalLogger } from "@ooneex/logger";
import type { HttpMethodType } from "@ooneex/types";
import { toKebabCase, toPascalCase, trim } from "@ooneex/utils";
import { decorator } from "../decorators";
import { askConfirm } from "../prompts/askConfirm";
import { askName } from "../prompts/askName";
import { askRouteMethod } from "../prompts/askRouteMethod";
import { askRouteName } from "../prompts/askRouteName";
import { askRoutePath } from "../prompts/askRoutePath";
import socketTemplate from "../templates/controller.socket.txt";
import testTemplate from "../templates/controller.test.txt";
import template from "../templates/controller.txt";
import routeTypeTemplate from "../templates/route.type.txt";
import type { ICommand } from "../types";

type CommandOptionsType = {
  name?: string;
  module?: string;
  isSocket?: boolean;
  route?: {
    name?: string;
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

  private async addToModule(modulePath: string, controllerName: string): Promise<void> {
    let content = await Bun.file(modulePath).text();
    const className = `${controllerName}Controller`;
    const importLine = `import { ${className} } from "./controllers/${className}";\n`;

    // Add import after the last import statement
    const lastImportIndex = content.lastIndexOf("import ");
    const lineEnd = content.indexOf("\n", lastImportIndex);
    content = `${content.slice(0, lineEnd + 1)}${importLine}${content.slice(lineEnd + 1)}`;

    // Add controller to the controllers array
    const regex = /(controllers:\s*\[)([^\]]*)/s;
    const match = content.match(regex);
    if (match) {
      const existing = match[2]?.trim();
      const newValue = existing ? `${existing}, ${className}` : className;
      content = content.replace(regex, `$1${newValue}`);
    }

    await Bun.write(modulePath, content);
  }

  public async run(options: T): Promise<void> {
    let { name, module, isSocket } = options;

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
      route.name = await askRouteName({ message: "Enter route name (e.g., api.user.create)" });
    }

    routeTypeName = toPascalCase(route.name);
    routeTypeFileName = route.name;

    content = content
      .replaceAll("{{ROUTE_NAME}}", route.name)
      .replaceAll("{{TYPE_NAME}}", routeTypeName)
      .replaceAll("{{TYPE_NAME_FILE}}", routeTypeFileName);

    if (!route.path) {
      route.path = (await askRoutePath({ message: "Enter route path", initial: "/" })) as `/${string}`;
    }

    const routePath = `/${toKebabCase(trim(route.path, "/"))}`;
    content = content.replaceAll("{{ROUTE_PATH}}", routePath);

    if (!isSocket && !route.method) {
      route.method = (await askRouteMethod({ message: "Enter route method" })) as HttpMethodType;
    }

    if (!isSocket && route.method) {
      content = content.replaceAll("{{ROUTE_METHOD}}", route.method.toLowerCase());
    }

    const base = module ? join("modules", module) : ".";
    const controllersLocalDir = join(base, "src", "controllers");
    const controllersDir = join(process.cwd(), controllersLocalDir);
    const filePath = join(controllersDir, `${name}Controller.ts`);
    await Bun.write(filePath, content);

    // Create route type file
    const routeTypesLocalDir = join(base, "src", "types", "routes");
    const routeTypesDir = join(process.cwd(), routeTypesLocalDir);
    const routeTypeFilePath = join(routeTypesDir, `${routeTypeFileName}.ts`);
    const routeTypeContent = routeTypeTemplate.replaceAll("{{TYPE_NAME}}", routeTypeName);
    await Bun.write(routeTypeFilePath, routeTypeContent);

    // Generate test file
    const testContent = testTemplate.replace(/{{NAME}}/g, name);
    const testsLocalDir = join(base, "tests", "controllers");
    const testsDir = join(process.cwd(), testsLocalDir);
    const testFilePath = join(testsDir, `${name}Controller.spec.ts`);
    await Bun.write(testFilePath, testContent);

    const modulePascalName = module ? toPascalCase(module) : toPascalCase(basename(process.cwd()));
    const modulePath = join(process.cwd(), base, "src", `${modulePascalName}Module.ts`);
    if (await Bun.file(modulePath).exists()) {
      await this.addToModule(modulePath, name);
    }

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

    // Install @ooneex/controller dependency
    const install = Bun.spawn(["bun", "add", "@ooneex/controller"], {
      cwd: process.cwd(),
      stdout: "ignore",
      stderr: "inherit",
    });
    await install.exited;
  }
}
