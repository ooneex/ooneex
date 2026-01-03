import { join } from "node:path";
import { TerminalLogger } from "@ooneex/logger";
import { toKebabCase } from "@ooneex/utils";
import { decorator } from "../decorators";
import { askDestination } from "../prompts/askDestination";
import { askName } from "../prompts/askName";
import commitlintTemplate from "../templates/app/.commitlintrc.ts.txt";
import gitignoreTemplate from "../templates/app/.gitignore.txt";
import biomeTemplate from "../templates/app/biome.jsonc.txt";
import bunfigTemplate from "../templates/app/bunfig.toml.txt";
import indexTemplate from "../templates/app/index.ts.txt";
import nxTemplate from "../templates/app/nx.json.txt";
import packageTemplate from "../templates/app/package.json.txt";
import tsconfigTemplate from "../templates/app/tsconfig.json.txt";
import type { ICommand } from "../types";
import { MakeModuleCommand } from "./MakeModuleCommand";

type CommandOptionsType = {
  name?: string;
  destination?: string;
};

@decorator.command()
export class MakeAppCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "make:app";
  }

  public getDescription(): string {
    return "Generate a new application";
  }

  public async run(options: T): Promise<void> {
    let { name, destination } = options;

    if (!name) {
      name = await askName({ message: "Enter application name" });
    }

    const kebabName = toKebabCase(name);

    if (!destination) {
      destination = await askDestination({ message: "Enter destination path", initial: kebabName });
    }

    const packageContent = packageTemplate.replace(/{{NAME}}/g, kebabName);

    await Bun.write(join(destination, ".commitlintrc.ts"), commitlintTemplate);
    await Bun.write(join(destination, ".gitignore"), gitignoreTemplate);
    await Bun.write(join(destination, "biome.jsonc"), biomeTemplate);
    await Bun.write(join(destination, "bunfig.toml"), bunfigTemplate);
    await Bun.write(join(destination, "nx.json"), nxTemplate);
    await Bun.write(join(destination, "package.json"), packageContent);
    await Bun.write(join(destination, "tsconfig.json"), tsconfigTemplate);

    // Create app module
    const makeModuleCommand = new MakeModuleCommand();
    await makeModuleCommand.run({
      name: "app",
      cwd: destination,
      silent: true,
      skipBin: true,
      skipMigrations: true,
      skipSeeds: true,
      bunupPackages: "bundle",
    });

    await Bun.write(join(destination, "modules", "app", "src", "index.ts"), indexTemplate);

    const logger = new TerminalLogger();

    logger.success(`${kebabName} created successfully at ${destination}`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });
  }
}
