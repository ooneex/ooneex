import { join } from "node:path";
import { toPascalCase } from "@ooneex/utils";
import { command } from "../decorator";
import { askName } from "../prompts/askName";
import mailerTemplate from "../templates/mailer/mailer.txt";
import mailerTemplateTemplate from "../templates/mailer/mailer-template.txt";
import type { ICommand } from "../types";

type CommandOptionsType = {
  name?: string;
};

@command()
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

    const mailerDir = join(process.cwd(), "src", "mailers");
    const mailerFilePath = join(mailerDir, `${name}Mailer.ts`);
    const templateFilePath = join(mailerDir, `${name}MailerTemplate.tsx`);

    await Bun.write(mailerFilePath, mailerContent);
    await Bun.write(templateFilePath, templateContent);
  }
}
