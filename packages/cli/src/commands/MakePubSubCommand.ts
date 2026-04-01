import { basename, join } from "node:path";
import { TerminalLogger } from "@ooneex/logger";
import { toKebabCase, toPascalCase } from "@ooneex/utils";
import { decorator } from "../decorators";
import { askName } from "../prompts/askName";
import testTemplate from "../templates/pubsub.test.txt";
import template from "../templates/pubsub.txt";
import type { ICommand } from "../types";

type CommandOptionsType = {
  name?: string;
  module?: string;
  channel?: string;
};

@decorator.command()
export class MakePubSubCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "make:pubsub";
  }

  public getDescription(): string {
    return "Generate a new PubSub event class";
  }

  private async addToModule(modulePath: string, eventName: string): Promise<void> {
    let content = await Bun.file(modulePath).text();
    const className = `${eventName}Event`;
    const importLine = `import { ${className} } from "./events/${className}";\n`;

    const lastImportIndex = content.lastIndexOf("import ");
    const lineEnd = content.indexOf("\n", lastImportIndex);
    content = `${content.slice(0, lineEnd + 1)}${importLine}${content.slice(lineEnd + 1)}`;

    const regex = /(events:\s*\[)([^\]]*)/s;
    const match = content.match(regex);
    if (match) {
      const existing = match[2]?.trim();
      const newValue = existing ? `${existing}, ${className}` : className;
      content = content.replace(regex, `$1${newValue}`);
    }

    await Bun.write(modulePath, content);
  }

  public async run(options: T): Promise<void> {
    let { name, module, channel } = options;

    if (!name) {
      name = await askName({ message: "Enter name" });
    }

    name = toPascalCase(name).replace(/PubSub$/, "");

    if (!channel) {
      channel = toKebabCase(name);
    }

    const content = template.replace(/{{NAME}}/g, name).replace(/{{CHANNEL}}/g, channel);

    const base = module ? join("modules", module) : ".";
    const pubSubLocalDir = join(base, "src", "events");
    const pubSubDir = join(process.cwd(), pubSubLocalDir);
    const filePath = join(pubSubDir, `${name}Event.ts`);
    await Bun.write(filePath, content);

    // Generate test file
    const testContent = testTemplate.replace(/{{NAME}}/g, name);
    const testsLocalDir = join(base, "tests", "events");
    const testsDir = join(process.cwd(), testsLocalDir);
    const testFilePath = join(testsDir, `${name}Event.spec.ts`);
    await Bun.write(testFilePath, testContent);

    // Import event in its module
    const modulePascalName = module ? toPascalCase(module) : toPascalCase(basename(process.cwd()));
    const modulePath = join(process.cwd(), base, "src", `${modulePascalName}Module.ts`);
    if (await Bun.file(modulePath).exists()) {
      await this.addToModule(modulePath, name);
    }

    const logger = new TerminalLogger();

    logger.success(`${join(pubSubLocalDir, name)}Event.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    logger.success(`${join(testsLocalDir, name)}Event.spec.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    // Install @ooneex/pub-sub dependency if not already installed
    const packageJsonPath = join(process.cwd(), "package.json");
    const packageJson = await Bun.file(packageJsonPath).json();
    const deps = packageJson.dependencies ?? {};
    const devDeps = packageJson.devDependencies ?? {};

    if (!deps["@ooneex/pub-sub"] && !devDeps["@ooneex/pub-sub"]) {
      const install = Bun.spawn(["bun", "add", "@ooneex/pub-sub"], {
        cwd: process.cwd(),
        stdout: "ignore",
        stderr: "inherit",
      });
      await install.exited;
    }
  }
}
