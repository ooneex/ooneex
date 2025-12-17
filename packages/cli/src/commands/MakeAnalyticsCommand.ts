import { join } from "node:path";
import { toPascalCase } from "@ooneex/utils";
import { command } from "../decorator";
import { askName } from "../prompts/askName";
import template from "../templates/analytics.txt";
import type { ICommand } from "../types";

type CommandOptionsType = {
  name?: string;
};

@command()
export class MakeAnalyticsCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "make:analytics";
  }

  public getDescription(): string {
    return "Generate a new analytics class";
  }

  public async run(options: T): Promise<void> {
    let { name } = options;

    if (!name) {
      name = await askName({ message: "Enter analytics name" });
    }

    name = toPascalCase(name).replace(/Analytics$/, "");

    const content = template.replace(/{{NAME}}/g, name);

    const analyticsDir = join(process.cwd(), "src", "analytics");
    const filePath = join(analyticsDir, `${name}Analytics.ts`);
    await Bun.write(filePath, content);
  }
}
