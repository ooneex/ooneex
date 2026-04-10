import { join } from "node:path";
import type { ICommand } from "@ooneex/command";
import { decorator } from "@ooneex/command";
import { TerminalLogger } from "@ooneex/logger";
import { toPascalCase } from "@ooneex/utils";
import { askName } from "../prompts/askName";
import mailerTestTemplate from "../templates/mailer/mailer.test.txt";
import mailerTemplate from "../templates/mailer/mailer.txt";
import mailerTemplateTestTemplate from "../templates/mailer/mailer-template.test.txt";
import mailerTemplateTemplate from "../templates/mailer/mailer-template.txt";
import { ensureModule } from "../utils";

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

    if (module) {
      await ensureModule(module);
    }

    const base = module ? join("modules", module) : ".";
    const mailerLocalDir = join(base, "src", "mailers");
    const mailerDir = join(process.cwd(), mailerLocalDir);
    const mailerFilePath = join(mailerDir, `${name}Mailer.ts`);
    const templateFilePath = join(mailerDir, `${name}MailerTemplate.tsx`);

    await Bun.write(mailerFilePath, mailerContent);
    await Bun.write(templateFilePath, templateContent);

    // Generate test files
    const mailerTestContent = mailerTestTemplate.replace(/{{NAME}}/g, name).replace(/{{MODULE}}/g, module ?? "");
    const templateTestContent = mailerTemplateTestTemplate.replace(/{{NAME}}/g, name).replace(/{{MODULE}}/g, module ?? "");
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

    // Install @ooneex/mailer dependency if not already installed
    const packageJsonPath = join(process.cwd(), "package.json");
    const packageJson = await Bun.file(packageJsonPath).json();
    const deps = packageJson.dependencies ?? {};
    const devDeps = packageJson.devDependencies ?? {};

    if (!deps["@ooneex/mailer"] && !devDeps["@ooneex/mailer"]) {
      const install = Bun.spawn(["bun", "add", "@ooneex/mailer"], {
        cwd: process.cwd(),
        stdout: "ignore",
        stderr: "inherit",
      });
      await install.exited;
    }
  }
}
