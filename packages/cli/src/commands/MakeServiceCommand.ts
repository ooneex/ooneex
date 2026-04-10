import { join } from "node:path";
import type { ICommand } from "@ooneex/command";
import { decorator } from "@ooneex/command";
import { TerminalLogger } from "@ooneex/logger";
import { toPascalCase } from "@ooneex/utils";
import { askName } from "../prompts/askName";
import testTemplate from "../templates/service.test.txt";
import template from "../templates/service.txt";
import { ensureModule } from "../utils";

type CommandOptionsType = {
  name?: string;
  module?: string;
};

@decorator.command()
export class MakeServiceCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "make:service";
  }

  public getDescription(): string {
    return "Generate a new service class";
  }

  public async run(options: T): Promise<void> {
    let { name, module } = options;

    if (!name) {
      name = await askName({ message: "Enter service name" });
    }

    name = toPascalCase(name).replace(/Service$/, "");

    const content = template.replace(/{{NAME}}/g, name);

    if (module) {
      await ensureModule(module);
    }

    const base = module ? join("modules", module) : ".";
    const serviceLocalDir = join(base, "src", "services");
    const serviceDir = join(process.cwd(), serviceLocalDir);
    const filePath = join(serviceDir, `${name}Service.ts`);
    await Bun.write(filePath, content);

    // Generate test file
    const testContent = testTemplate.replace(/{{NAME}}/g, name).replace(/{{MODULE}}/g, module ?? "");
    const testsLocalDir = join(base, "tests", "services");
    const testsDir = join(process.cwd(), testsLocalDir);
    const testFilePath = join(testsDir, `${name}Service.spec.ts`);
    await Bun.write(testFilePath, testContent);

    const logger = new TerminalLogger();

    logger.success(`${join(serviceLocalDir, name)}Service.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    logger.success(`${join(testsLocalDir, name)}Service.spec.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    // Install @ooneex/service dependency if not already installed
    const packageJsonPath = join(process.cwd(), "package.json");
    const packageJson = await Bun.file(packageJsonPath).json();
    const deps = packageJson.dependencies ?? {};
    const devDeps = packageJson.devDependencies ?? {};

    if (!deps["@ooneex/service"] && !devDeps["@ooneex/service"]) {
      const install = Bun.spawn(["bun", "add", "@ooneex/service"], {
        cwd: process.cwd(),
        stdout: "ignore",
        stderr: "inherit",
      });
      await install.exited;
    }
  }
}
