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

const dim = (s: string) => `\x1b[2m${s}\x1b[22m`;
const bold = (s: string) => `\x1b[1m${s}\x1b[22m`;
const cyan = (s: string) => `\x1b[36m${s}\x1b[39m`;
const green = (s: string) => `\x1b[32m${s}\x1b[39m`;
const yellow = (s: string) => `\x1b[33m${s}\x1b[39m`;
const red = (s: string) => `\x1b[31m${s}\x1b[39m`;
const magenta = (s: string) => `\x1b[35m${s}\x1b[39m`;

function formatBytes(bytes: number): string {
  if (bytes >= 1_073_741_824) return `${(bytes / 1_073_741_824).toFixed(2)} GB`;
  if (bytes >= 1_048_576) return `${(bytes / 1_048_576).toFixed(2)} MB`;
  if (bytes >= 1024) return `${(bytes / 1024).toFixed(2)} KB`;
  return `${bytes} B`;
}

function formatNumber(n: number): string {
  return n.toLocaleString("en-US");
}

function formatLatency(ms: number): string {
  if (ms >= 1000) return `${(ms / 1000).toFixed(2)} s`;
  return `${ms.toFixed(2)} ms`;
}

function printHeader(config: BenchmarkConfigType, url: string, connections: number, duration: number): void {
  const method = (config.method ?? "GET").toUpperCase();
  const title = config.name || "Benchmark";

  process.stdout.write("\n");
  process.stdout.write(`  ${bold(cyan(title))}\n`);
  if (config.description) {
    process.stdout.write(`  ${dim(config.description)}\n`);
  }
  process.stdout.write(`  ${bold(method)} ${cyan(url)}\n`);
  process.stdout.write(`  ${dim(`${connections} connections`)} ${dim("|")} ${dim(`${duration}s duration`)}\n`);
  process.stdout.write("\n");
}

function printResults(result: autocannon.Result): void {
  const w = process.stdout.write.bind(process.stdout);
  const line = dim("  ─────────────────────────────────────────────────────");

  // Latency section
  w(`  ${bold(magenta("Latency"))}\n`);
  w(`${line}\n`);
  w(`  ${dim("Avg")}       ${bold(formatLatency(result.latency.average))}\n`);
  w(`  ${dim("p50")}       ${formatLatency(result.latency.p50)}\n`);
  w(`  ${dim("p90")}       ${formatLatency(result.latency.p90)}\n`);
  w(`  ${dim("p97.5")}     ${yellow(formatLatency(result.latency.p97_5))}\n`);
  w(`  ${dim("p99")}       ${yellow(formatLatency(result.latency.p99))}\n`);
  w(`  ${dim("Max")}       ${red(formatLatency(result.latency.max))}\n`);
  w(`  ${dim("StdDev")}    ${formatLatency(result.latency.stddev)}\n`);
  w("\n");

  // Throughput section
  w(`  ${bold(magenta("Throughput"))}\n`);
  w(`${line}\n`);
  w(`  ${dim("Req/Sec")}   ${bold(formatNumber(Math.round(result.requests.average)))} avg`);
  w(`  ${dim("(")}${formatNumber(result.requests.min)} ${dim("—")} ${formatNumber(result.requests.max)}${dim(")")}\n`);
  w(`  ${dim("Bytes/Sec")} ${bold(formatBytes(result.throughput.average))} avg`);
  w(
    `  ${dim("(")}${formatBytes(result.throughput.min)} ${dim("—")} ${formatBytes(result.throughput.max)}${dim(")")}\n`,
  );
  w("\n");

  // Summary section
  w(`  ${bold(magenta("Summary"))}\n`);
  w(`${line}\n`);

  const totalRequests = result.requests.sent;
  const totalData = result.throughput.total;
  const dur = result.duration;

  w(`  ${dim("URL")}              ${cyan(result.url)}\n`);
  const successCount = result["2xx"] ?? 0;
  w(`  ${dim("Total Requests")}   ${bold(green(formatNumber(totalRequests)))}\n`);
  w(`  ${dim("Success (2xx)")}    ${successCount > 0 ? green(formatNumber(successCount)) : red("0")}\n`);
  w(`  ${dim("Total Data")}       ${formatBytes(totalData)}\n`);
  w(`  ${dim("Duration")}         ${dur.toFixed(2)}s\n`);

  if (result.errors > 0) {
    w(`  ${dim("Errors")}           ${red(String(result.errors))}\n`);
  } else {
    w(`  ${dim("Errors")}           ${green("0")}\n`);
  }

  if (result.timeouts > 0) {
    w(`  ${dim("Timeouts")}         ${red(String(result.timeouts))}\n`);
  } else {
    w(`  ${dim("Timeouts")}         ${green("0")}\n`);
  }

  if (result.non2xx > 0) {
    w(`  ${dim("Non-2xx")}          ${red(formatNumber(result.non2xx))}\n`);
  } else {
    w(`  ${dim("Non-2xx")}          ${green("0")}\n`);
  }

  if (result.mismatches > 0) {
    w(`  ${dim("Mismatches")}       ${red(String(result.mismatches))}\n`);
  }

  w("\n");

  // Performance analysis section
  printPerformanceAnalysis(result);
}

function printPerformanceAnalysis(result: autocannon.Result): void {
  const w = process.stdout.write.bind(process.stdout);
  const line = dim("  ─────────────────────────────────────────────────────");

  w(`  ${bold(magenta("Performance Analysis"))}\n`);
  w(`${line}\n`);

  const avgReqPerSec = result.requests.average;
  const connections = result.connections;
  const avgLatencyMs = result.latency.average;
  const p99LatencyMs = result.latency.p99;
  const errorRate = result.requests.sent > 0 ? ((result.errors + result.non2xx) / result.requests.sent) * 100 : 0;
  const successRate = 100 - errorRate;

  // Estimated max clients: based on how many connections were used and whether latency/errors are acceptable
  // If p99 latency < 100ms and error rate < 1%, server can likely handle more clients
  const latencyHeadroom = p99LatencyMs < 50 ? 4 : p99LatencyMs < 100 ? 3 : p99LatencyMs < 500 ? 2 : 1;
  const errorFactor = errorRate < 1 ? 1 : errorRate < 5 ? 0.5 : 0.2;
  const estimatedMaxClients = Math.round(connections * latencyHeadroom * errorFactor);

  // Estimated max requests per second the server can sustain
  const estimatedMaxReqPerSec = Math.round(result.requests.max * errorFactor);

  // Avg response time per request
  const avgResponseTime = avgLatencyMs;
  const reqPerConnection = avgReqPerSec / connections;

  w(`  ${dim("Success Rate")}     ${successRate >= 99 ? green(`${successRate.toFixed(1)}%`) : successRate >= 95 ? yellow(`${successRate.toFixed(1)}%`) : red(`${successRate.toFixed(1)}%`)}\n`);
  w(`  ${dim("Avg Resp Time")}    ${avgResponseTime < 10 ? green(formatLatency(avgResponseTime)) : avgResponseTime < 100 ? yellow(formatLatency(avgResponseTime)) : red(formatLatency(avgResponseTime))}\n`);
  w(`  ${dim("Req/Connection")}   ${formatNumber(Math.round(reqPerConnection))} req/sec\n`);
  w("\n");

  w(`  ${dim("Est. Max Clients")} ${bold(cyan(formatNumber(estimatedMaxClients)))} concurrent\n`);
  w(`  ${dim("Est. Max Req/Sec")} ${bold(cyan(formatNumber(estimatedMaxReqPerSec)))}\n`);
  w("\n");

  // Overall performance grade
  const grade = getPerformanceGrade(avgLatencyMs, p99LatencyMs, errorRate, avgReqPerSec);
  w(`  ${dim("Grade")}            ${grade.color(bold(grade.label))}\n`);
  w(`  ${grade.color(grade.message)}\n`);
  w("\n");
}

function getPerformanceGrade(
  avgLatency: number,
  p99Latency: number,
  errorRate: number,
  reqPerSec: number,
): { label: string; message: string; color: (s: string) => string } {
  // Score from 0-100 based on multiple factors
  let score = 100;

  // Latency scoring (avg)
  if (avgLatency > 500) score -= 40;
  else if (avgLatency > 100) score -= 25;
  else if (avgLatency > 50) score -= 15;
  else if (avgLatency > 10) score -= 5;

  // Latency scoring (p99)
  if (p99Latency > 1000) score -= 25;
  else if (p99Latency > 500) score -= 15;
  else if (p99Latency > 100) score -= 8;

  // Error rate scoring
  if (errorRate > 10) score -= 30;
  else if (errorRate > 5) score -= 20;
  else if (errorRate > 1) score -= 10;
  else if (errorRate > 0) score -= 3;

  // Throughput bonus (no penalty, just recognition)
  if (reqPerSec > 10000) score = Math.min(100, score + 5);

  if (score >= 90) {
    return { label: "A  Excellent", message: "  Server handles load with low latency and high reliability", color: green };
  }
  if (score >= 75) {
    return { label: "B  Good", message: "  Server performs well under load with acceptable latency", color: green };
  }
  if (score >= 60) {
    return { label: "C  Fair", message: "  Server shows moderate latency or occasional errors under load", color: yellow };
  }
  if (score >= 40) {
    return { label: "D  Poor", message: "  Server struggles with high latency or significant errors", color: red };
  }
  return { label: "F  Critical", message: "  Server cannot handle the load — consider scaling or optimization", color: red };
}

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
        useSymbol: true,
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
        useSymbol: true,
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

      const connections = config.connections ?? 10;
      const duration = config.duration ?? 10;

      printHeader(config, url, connections, duration);

      const opts: autocannon.Options = {
        url,
        connections,
        duration,
        method: (config.method ?? "GET") as autocannon.Options["method"],
      };

      if (config.payload && Object.keys(config.payload).length > 0) {
        opts.body = JSON.stringify(config.payload);
        opts.headers = { "Content-Type": "application/json" };
      }

      const result = await new Promise<autocannon.Result>((resolve, reject) => {
        const instance = autocannon(opts, (err: Error | null, result: autocannon.Result) => {
          if (err) {
            reject(err);
          } else {
            resolve(result);
          }
        });

        autocannon.track(instance, {
          renderProgressBar: true,
          renderResultsTable: false,
          renderLatencyTable: false,
          progressBarString: `  ${dim("Progress")}  [:bar] :percent  ${dim(":elapsed/:eta")}`,
        });

        process.once("SIGINT", () => {
          instance.stop();
        });
      });

      process.stdout.write("\n");
      printResults(result);
    }
  }
}
