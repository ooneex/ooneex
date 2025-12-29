import { join } from "node:path";
import { TerminalLogger } from "@ooneex/logger";
import { toPascalCase } from "@ooneex/utils";
import { decorator } from "../decorators";
import { askName } from "../prompts/askName";
import template from "../templates/permission.txt";
import type { ICommand } from "../types";

type CommandOptionsType = {
  name?: string;
};

@decorator.command()
export class MakePermissionCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "make:permission";
  }

  public getDescription(): string {
    return "Generate a new permission class";
  }

  public async run(options: T): Promise<void> {
    let { name } = options;

    if (!name) {
      name = await askName({ message: "Enter permission name" });
    }

    name = toPascalCase(name).replace(/Permission$/, "");

    const content = template.replace(/{{NAME}}/g, name);

    const permissionLocalDir = join("src", "permissions");
    const permissionDir = join(process.cwd(), permissionLocalDir);
    const filePath = join(permissionDir, `${name}Permission.ts`);
    await Bun.write(filePath, content);

    const logger = new TerminalLogger();

    logger.success(`${join(permissionLocalDir, name)}Permission.ts created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });
  }
}
