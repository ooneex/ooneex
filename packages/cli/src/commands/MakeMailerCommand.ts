import { join } from "node:path";
import { TerminalLogger } from "@ooneex/logger";
import { toPascalCase } from "@ooneex/utils";
import { decorator } from "../decorators";
import { askName } from "../prompts/askName";
import mailerTemplate from "../templates/mailer/mailer.txt";
import mailerTemplateTemplate from "../templates/mailer/mailer-template.txt";
import type { ICommand } from "../types";

type CommandOptionsType = {
  name?: string;
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
    let { name } = options;

    if (!name) {
      name = await askName({ message: "Enter mailer name" });
    }

    name = toPascalCase(name).replace(/Mailer$/, "");

    const mailerContent = mailerTemplate.replace(/{{NAME}}/g, name);
    const templateContent = mailerTemplateTemplate.replace(/{{NAME}}/g, name);

    const mailerLocalDir = join("src", "mailers");
    const mailerDir = join(process.cwd(), mailerLocalDir);
    const mailerFilePath = join(mailerDir, `${name}Mailer.ts`);
    const templateFilePath = join(mailerDir, `${name}MailerTemplate.tsx`);

    await Bun.write(mailerFilePath, mailerContent);
    await Bun.write(templateFilePath, templateContent);

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
  }
}
