import { join } from "node:path";
import { TerminalLogger } from "@ooneex/logger";
import { toPascalCase } from "@ooneex/utils";
import { decorator } from "../decorators";
import { askName } from "../prompts/askName";
import mailerTestTemplate from "../templates/mailer/mailer.test.txt";
import mailerTemplate from "../templates/mailer/mailer.txt";
import mailerTemplateTestTemplate from "../templates/mailer/mailer-template.test.txt";
import mailerTemplateTemplate from "../templates/mailer/mailer-template.txt";
import type { ICommand } from "../types";

type CommandOptionsType = {
  name?: string;
  module?: string;
};

@decorator.command()
export class MakeMailerCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "make:mailer";
  }

  public getDescription(): string {
    return "Generate a new mailer class";
  }

  public async run(options: T): Promise<void> {
    let { name, module } = options;

    if (!name) {
      name = await askName({ message: "Enter mailer name" });
    }

    name = toPascalCase(name).replace(/Mailer$/, "");

    const mailerContent = mailerTemplate.replace(/{{NAME}}/g, name);
    const templateContent = mailerTemplateTemplate.replace(/{{NAME}}/g, name);

    const base = module ? join("modules", module) : ".";
    const mailerLocalDir = join(base, "src", "mailers");
    const mailerDir = join(process.cwd(), mailerLocalDir);
    const mailerFilePath = join(mailerDir, `${name}Mailer.ts`);
    const templateFilePath = join(mailerDir, `${name}MailerTemplate.tsx`);

    await Bun.write(mailerFilePath, mailerContent);
    await Bun.write(templateFilePath, templateContent);

    // Generate test files
    const mailerTestContent = mailerTestTemplate.replace(/{{NAME}}/g, name);
    const templateTestContent = mailerTemplateTestTemplate.replace(/{{NAME}}/g, name);
    const testsLocalDir = join(base, "tests", "mailers");
    const testsDir = join(process.cwd(), testsLocalDir);
    const mailerTestFilePath = join(testsDir, `${name}Mailer.spec.ts`);
    const templateTestFilePath = join(testsDir, `${name}MailerTemplate.spec.ts`);
    await Bun.write(mailerTestFilePath, mailerTestContent);
    await Bun.write(templateTestFilePath, templateTestContent);

    const logger = new TerminalLogger();

    logger.success(`${join(mailerLocalDir, name)}Mailer.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    logger.success(`${join(mailerLocalDir, name)}MailerTemplate.tsx created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    logger.success(`${join(testsLocalDir, name)}Mailer.spec.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    logger.success(`${join(testsLocalDir, name)}MailerTemplate.spec.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });
  }
}
