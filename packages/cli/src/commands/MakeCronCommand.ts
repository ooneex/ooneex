import { basename, join } from "node:path";
import { TerminalLogger } from "@ooneex/logger";
import { toPascalCase } from "@ooneex/utils";
import { decorator } from "../decorators";
import { askName } from "../prompts/askName";
import testTemplate from "../templates/cron.test.txt";
import template from "../templates/cron.txt";
import type { ICommand } from "../types";

type CommandOptionsType = {
  name?: string;
  module?: string;
};

@decorator.command()
export class MakeCronCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "make:cron";
  }

  public getDescription(): string {
    return "Generate a new cron class";
  }

  private async addToModule(modulePath: string, cronName: string): Promise<void> {
    let content = await Bun.file(modulePath).text();
    const className = `${cronName}Cron`;
    const importLine = `import { ${className} } from "./cron/${className}";\n`;

    const lastImportIndex = content.lastIndexOf("import ");
    const lineEnd = content.indexOf("\n", lastImportIndex);
    content = `${content.slice(0, lineEnd + 1)}${importLine}${content.slice(lineEnd + 1)}`;

    const regex = /(cronJobs:\s*\[)([^\]]*)/s;
    const match = content.match(regex);
    if (match) {
      const existing = match[2]?.trim();
      const newValue = existing ? `${existing}, ${className}` : className;
      content = content.replace(regex, `$1${newValue}`);
    }

    await Bun.write(modulePath, content);
  }

  public async run(options: T): Promise<void> {
    let { name, module } = options;

    if (!name) {
      name = await askName({ message: "Enter cron name" });
    }

    name = toPascalCase(name).replace(/Cron$/, "");

    const content = template.replace(/{{NAME}}/g, name);

    const base = module ? join("modules", module) : ".";
    const cronLocalDir = join(base, "src", "cron");
    const cronDir = join(process.cwd(), cronLocalDir);
    const filePath = join(cronDir, `${name}Cron.ts`);
    await Bun.write(filePath, content);

    // Generate test file
    const testContent = testTemplate.replace(/{{NAME}}/g, name);
    const testsLocalDir = join(base, "tests", "cron");
    const testsDir = join(process.cwd(), testsLocalDir);
    const testFilePath = join(testsDir, `${name}Cron.spec.ts`);
    await Bun.write(testFilePath, testContent);

    // Import cron in its module
    const modulePascalName = module ? toPascalCase(module) : toPascalCase(basename(process.cwd()));
    const modulePath = join(process.cwd(), base, "src", `${modulePascalName}Module.ts`);
    if (await Bun.file(modulePath).exists()) {
      await this.addToModule(modulePath, name);
    }

    const logger = new TerminalLogger();

    logger.success(`${join(cronLocalDir, name)}Cron.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    logger.success(`${join(testsLocalDir, name)}Cron.spec.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    // Install @ooneex/cron dependency
    const install = Bun.spawn(["bun", "add", "@ooneex/cron"], {
      cwd: process.cwd(),
      stdout: "ignore",
      stderr: "inherit",
    });
    await install.exited;
  }
}
