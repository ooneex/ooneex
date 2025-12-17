import { join } from "node:path";
import { toPascalCase } from "@ooneex/utils";
import { command } from "../decorator";
import { askName } from "../prompts/askName";
import template from "../templates/service.txt";
import type { ICommand } from "../types";

type CommandOptionsType = {
  name?: string;
};

@command()
export class MakeServiceCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "make:service";
  }

  public getDescription(): string {
    return "Generate a new service class";
  }

  public async run(options: T): Promise<void> {
    let { name } = options;

    if (!name) {
      name = await askName({ message: "Enter service name" });
    }

    name = toPascalCase(name).replace(/Service$/, "");

    const content = template.replace(/{{NAME}}/g, name);

    const serviceDir = join(process.cwd(), "src", "services");
    const filePath = join(serviceDir, `${name}Service.ts`);
    await Bun.write(filePath, content);
  }
}
