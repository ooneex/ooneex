import { join } from "node:path";
import { toPascalCase } from "@ooneex/utils";
import { command } from "../decorator";
import { askName } from "../prompts/askName";
import template from "../templates/permission.txt";
import type { ICommand } from "../types";

type CommandOptionsType = {
  name?: string;
};

@command()
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

    const permissionDir = join(process.cwd(), "src", "permissions");
    const filePath = join(permissionDir, `${name}Permission.ts`);
    await Bun.write(filePath, content);
  }
}
