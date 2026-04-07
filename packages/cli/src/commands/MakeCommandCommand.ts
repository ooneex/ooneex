import { join } from "node:path";
import type { ICommand } from "@ooneex/command";
import { decorator } from "@ooneex/command";
import { TerminalLogger } from "@ooneex/logger";
import { toKebabCase, toPascalCase } from "@ooneex/utils";
import { Glob } from "bun";
import { askName } from "../prompts/askName";
import testTemplate from "../templates/command.test.txt";
import template from "../templates/command.txt";
import commandRunTemplate from "../templates/module/command.run.txt";

type CommandOptionsType = {
  name?: string;
  module?: string;
};

@decorator.command()
export class MakeCommandCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "make:command";
  }

  public getDescription(): string {
    return "Generate a new command class";
  }

  public async run(options: T): Promise<void> {
    let { name, module } = options;

    if (!name) {
      name = await askName({ message: "Enter name" });
    }

    name = toPascalCase(name).replace(/Command$/, "");

    const commandName = toKebabCase(name).replace(/-/g, ":");
    const content = template
      .replace(/{{NAME}}/g, name)
      .replace(/{{COMMAND_NAME}}/g, commandName)
      .replace(/{{COMMAND_DESCRIPTION}}/g, `Execute ${commandName} command`);

    const base = module ? join("modules", module) : ".";
    const commandLocalDir = join(base, "src", "commands");
    const commandDir = join(process.cwd(), commandLocalDir);
    const filePath = join(commandDir, `${name}Command.ts`);
    await Bun.write(filePath, content);

    // Generate test file
    const testContent = testTemplate.replace(/{{NAME}}/g, name);
    const testsLocalDir = join(base, "tests", "commands");
    const testsDir = join(process.cwd(), testsLocalDir);
    const testFilePath = join(testsDir, `${name}Command.spec.ts`);
    await Bun.write(testFilePath, testContent);

    // Generate commands root export file
    const imports: string[] = [];
    const glob = new Glob("**/*Command.ts");
    for await (const file of glob.scan(commandDir)) {
      const commandClassName = file.replace(/\.ts$/, "");
      imports.push(`export { ${commandClassName} } from './${commandClassName}';`);
    }
    await Bun.write(join(commandDir, "commands.ts"), `${imports.sort().join("\n")}\n`);

    // Import commands root file in app root file
    if (module && module !== "app") {
      const appCommandsRootPath = join(process.cwd(), "modules", "app", "src", "commands", "commands.ts");
      const appCommandsRootFile = Bun.file(appCommandsRootPath);
      const importLine = `import "@${module}/commands/commands";`;

      if (await appCommandsRootFile.exists()) {
        const appCommandsContent = await appCommandsRootFile.text();
        if (!appCommandsContent.includes(importLine)) {
          await Bun.write(appCommandsRootPath, `${appCommandsContent.trimEnd()}\n${importLine}\n`);
        }
      } else {
        await Bun.write(appCommandsRootPath, `${importLine}\n`);
      }
    }

    // Create bin/command/run.ts if it doesn't exist
    const binCommandRunPath = join(process.cwd(), "modules", "app", "bin", "command", "run.ts");
    const binCommandRunFile = Bun.file(binCommandRunPath);
    if (!(await binCommandRunFile.exists())) {
      await Bun.write(binCommandRunPath, commandRunTemplate);
    }

    // Update package.json with command script
    const packageJsonPath = join(process.cwd(), "modules", "app", "package.json");
    const packageJsonFile = Bun.file(packageJsonPath);
    if (await packageJsonFile.exists()) {
      const packageJson = await packageJsonFile.json();
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts.command = "bun ./bin/command/run.ts";
      await Bun.write(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }

    const logger = new TerminalLogger();

    logger.success(`${join(commandLocalDir, name)}Command.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    logger.success(`${join(testsLocalDir, name)}Command.spec.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    logger.info("Run 'bun run command' to execute commands", undefined, {
      showTimestamp: false,
      showArrow: true,
      showLevel: false,
    });
  }
}
