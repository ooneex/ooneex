import { join } from "node:path";
import type { ICommand } from "@ooneex/command";
import { decorator } from "@ooneex/command";
import { TerminalLogger } from "@ooneex/logger";
import autocannon from "autocannon";
import { ensureModule } from "../utils";

type CommandOptionsType = {
  module?: string;
  target?: string;
};

type BenchmarkConfigType = {
  name: string;
  path: string;
  method: string;
  description: string;
  params?: Record<string, string>;
  queries?: Record<string, string | number>;
  payload?: Record<string, string | number>;
  connections?: number;
  duration?: number;
};

@decorator.command()
export class BenchmarkRunCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "benchmark:run";
  }

  public getDescription(): string {
    return "Run a benchmark using autocannon";
  }

  private buildUrl(config: BenchmarkConfigType): string {
    let path = config.path;

    if (config.params) {
      for (const [key, value] of Object.entries(config.params)) {
        path = path.replace(`:${key}`, encodeURIComponent(String(value)));
      }
    }

    if (config.queries) {
      const entries = Object.entries(config.queries).filter(([, v]) => v !== "" && v !== 0);
      if (entries.length > 0) {
        const queryString = entries
          .map(([k, v]) => `${encodeURIComponent(k)}=${encodeURIComponent(String(v))}`)
          .join("&");
        path = `${path}?${queryString}`;
      }
    }

    return path;
  }

  public async run(options: T): Promise<void> {
    const { module, target } = options;
    const logger = new TerminalLogger();

    if (!target) {
      logger.error("Target is required. Use --target to specify the benchmark target.", undefined, {
        showTimestamp: false,
        showArrow: false,
        useSymbol: false,
      });
      return;
    }

    if (module) {
      await ensureModule(module);
    }

    const base = module ? join("modules", module) : ".";
    const controllersLocalDir = join(base, "src", "controllers");
    const controllersDir = join(process.cwd(), controllersLocalDir);

    const glob = new Bun.Glob(`${target}*.bench.json`);
    const benchFiles: string[] = [];

    for await (const match of glob.scan({ cwd: controllersDir, onlyFiles: true })) {
      benchFiles.push(match);
    }

    if (benchFiles.length === 0) {
      logger.error(`No benchmark configuration found for target "${target}" in ${controllersLocalDir}`, undefined, {
        showTimestamp: false,
        showArrow: false,
        useSymbol: false,
      });
      return;
    }

    for (const benchFile of benchFiles) {
      const filePath = join(controllersDir, benchFile);
      const file = Bun.file(filePath);

      if (!(await file.exists())) {
        continue;
      }

      const config: BenchmarkConfigType = await file.json();
      const urlPath = this.buildUrl(config);
      const port = Bun.env.PORT ?? "80";
      const url = `http://localhost:${port}${urlPath}`;

      logger.info(`Running benchmark: ${config.name || benchFile}`, undefined, {
        showTimestamp: false,
        showArrow: false,
        useSymbol: false,
      });

      if (config.description) {
        logger.info(`Description: ${config.description}`, undefined, {
          showTimestamp: false,
          showArrow: false,
          useSymbol: false,
        });
      }

      const opts: autocannon.Options = {
        url,
        connections: config.connections ?? 10,
        duration: config.duration ?? 10,
        method: (config.method ?? "GET") as autocannon.Options["method"],
      };

      if (config.payload && Object.keys(config.payload).length > 0) {
        opts.body = JSON.stringify(config.payload);
        opts.headers = { "Content-Type": "application/json" };
      }

      const result = await autocannon(opts);

      logger.success(`Benchmark completed: ${config.name || benchFile}`, undefined, {
        showTimestamp: false,
        showArrow: false,
        useSymbol: false,
      });

      process.stdout.write(`${autocannon.printResult(result)}\n`);
    }
  }
}
