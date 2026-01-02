import { join } from "node:path";
import { TerminalLogger } from "@ooneex/logger";
import { toKebabCase, toPascalCase } from "@ooneex/utils";
import { decorator } from "../decorators";
import { askName } from "../prompts/askName";
import testTemplate from "../templates/pubsub.test.txt";
import template from "../templates/pubsub.txt";
import type { ICommand } from "../types";

type CommandOptionsType = {
  name?: string;
  channel?: string;
};

@decorator.command()
export class MakePubSubCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "make:pubsub";
  }

  public getDescription(): string {
    return "Generate a new PubSub class";
  }

  public async run(options: T): Promise<void> {
    let { name, channel } = options;

    if (!name) {
      name = await askName({ message: "Enter name" });
    }

    name = toPascalCase(name).replace(/PubSub$/, "");

    if (!channel) {
      channel = toKebabCase(name);
    }

    const content = template.replace(/{{NAME}}/g, name).replace(/{{CHANNEL}}/g, channel);

    const pubSubLocalDir = join("src", "pubsub");
    const pubSubDir = join(process.cwd(), pubSubLocalDir);
    const filePath = join(pubSubDir, `${name}PubSub.ts`);
    await Bun.write(filePath, content);

    // Generate test file
    const testContent = testTemplate.replace(/{{NAME}}/g, name);
    const testsLocalDir = join("tests", "pubsub");
    const testsDir = join(process.cwd(), testsLocalDir);
    const testFilePath = join(testsDir, `${name}PubSub.spec.ts`);
    await Bun.write(testFilePath, testContent);

    const logger = new TerminalLogger();

    logger.success(`${join(pubSubLocalDir, name)}PubSub.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    logger.success(`${join(testsLocalDir, name)}PubSub.spec.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });
  }
}
