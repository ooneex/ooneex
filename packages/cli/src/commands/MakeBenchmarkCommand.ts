import { join } from "node:path";
import type { ICommand } from "@ooneex/command";
import { decorator } from "@ooneex/command";
import { TerminalLogger } from "@ooneex/logger";
import { askName } from "../prompts/askName";
import { ensureModule } from "../utils";

type CommandOptionsType = {
  name?: string;
  module?: string;
  target?: string;
};

@decorator.command()
export class MakeBenchmarkCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "make:benchmark";
  }

  public getDescription(): string {
    return "Generate a new benchmark file";
  }

  private parseController(content: string): {
    name: string;
    path: string;
    method: string;
    description: string;
    params: Record<string, string>;
    queries: Record<string, string | number>;
    payload: Record<string, string | number>;
  } {
    const methodMatch = content.match(/@Route\.(get|post|patch|put|delete|options|head)\(/);
    const method = methodMatch?.[1]?.toUpperCase() ?? "GET";

    const pathMatch = content.match(/@Route\.\w+\("([^"]+)"/);
    const path = pathMatch?.[1] ?? "/";

    const nameMatch = content.match(/name:\s*"([^"]+)"/);
    const name = nameMatch?.[1] ?? "";

    const descriptionMatch = content.match(/description:\s*"([^"]+)"/);
    const description = descriptionMatch?.[1] ?? "";

    const params = this.parseParams(content);
    const queries = this.parseAssertBlock(content, "queries");
    const payload = this.parseAssertBlock(content, "payload");

    return { name, path, method, description, params, queries, payload };
  }

  private parseParams(content: string): Record<string, string> {
    const params: Record<string, string> = {};
    const paramsMatch = content.match(/params:\s*\{([^}]*Assert[^}]+)\}/);
    if (paramsMatch?.[1]) {
      const keys = paramsMatch[1].matchAll(/(\w+):\s*Assert\(/g);
      for (const match of keys) {
        if (match[1]) {
          params[match[1]] = "";
        }
      }
    }
    return params;
  }

  private parseAssertBlock(content: string, block: string): Record<string, string | number> {
    const result: Record<string, string | number> = {};
    const regex = new RegExp(`${block}:\\s*Assert\\(\\{([^}]+)\\}\\)`);
    const match = content.match(regex);
    if (match?.[1]) {
      const fields = match[1].matchAll(/(\w+):\s*"(\w+\??(?:\[\])?)"/g);
      for (const field of fields) {
        if (field[1] && field[2]) {
          const type = field[2].replace("?", "").replace("[]", "");
          result[field[1]] = type === "number" ? 0 : "";
        }
      }
    }
    return result;
  }

  public async run(options: T): Promise<void> {
    let { name, module, target } = options;

    if (!name) {
      name = await askName({ message: "Enter benchmark name" });
    }

    if (!target) {
      target = await askName({ message: "Enter target controller name (e.g., UpdateStatusController)" });
    }

    const targetName = target.replace(/Controller$/, "");

    if (module) {
      await ensureModule(module);
    }

    const base = module ? join("modules", module) : ".";
    const controllersLocalDir = join(base, "src", "controllers");
    const controllersDir = join(process.cwd(), controllersLocalDir);
    const controllerFilePath = join(controllersDir, `${targetName}Controller.ts`);

    const controllerFile = Bun.file(controllerFilePath);
    if (!(await controllerFile.exists())) {
      const logger = new TerminalLogger();
      logger.error(`Controller not found: ${controllerFilePath}`, undefined, {
        showTimestamp: false,
        showArrow: false,
        useSymbol: false,
      });
      return;
    }

    const controllerContent = await controllerFile.text();
    const routeInfo = this.parseController(controllerContent);

    const benchmark: Record<string, unknown> = {
      name: routeInfo.name,
      path: routeInfo.path,
      method: routeInfo.method,
      description: routeInfo.description,
    };

    if (Object.keys(routeInfo.params).length > 0) {
      benchmark.params = routeInfo.params;
    }

    if (Object.keys(routeInfo.queries).length > 0) {
      benchmark.queries = routeInfo.queries;
    }

    if (Object.keys(routeInfo.payload).length > 0) {
      benchmark.payload = routeInfo.payload;
    }

    benchmark.connections = 10;
    benchmark.duration = 10;

    const jsonContent = JSON.stringify(benchmark, null, 2);
    const benchmarkFileName = `${name}.bench.json`;
    const filePath = join(controllersDir, benchmarkFileName);
    await Bun.write(filePath, `${jsonContent}\n`);

    const logger = new TerminalLogger();

    logger.success(`${join(controllersLocalDir, benchmarkFileName)} created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: false,
    });
  }
}
