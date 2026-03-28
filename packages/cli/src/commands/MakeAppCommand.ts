import { join } from "node:path";
import { TerminalLogger } from "@ooneex/logger";
import { toKebabCase, toSnakeCase } from "@ooneex/utils";
import { decorator } from "../decorators";
import { askDestination } from "../prompts/askDestination";
import { askName } from "../prompts/askName";
import commitlintTemplate from "../templates/app/.commitlintrc.ts.txt";
import gitignoreTemplate from "../templates/app/.gitignore.txt";
import databaseTemplate from "../templates/app/app-database.txt";
import dockerComposeTemplate from "../templates/app/docker-compose.yml.txt";
import dockerfileTemplate from "../templates/app/Dockerfile.txt";
import biomeTemplate from "../templates/app/biome.jsonc.txt";
import bunfigTemplate from "../templates/app/bunfig.toml.txt";
import envTemplate from "../templates/app/env.txt";
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
    await Bun.write(join(destination, ".husky", "commit-msg"), `bunx commitlint --edit "$1"`);
    await Bun.write(join(destination, ".husky", "pre-commit"), "lint-staged");

    // Create app module
    const makeModuleCommand = new MakeModuleCommand();
    await makeModuleCommand.run({
      name: "app",
      cwd: destination,
      silent: true,
      skipBin: true,
      skipMigrations: true,
      skipSeeds: true,
    });

    const appModulePackagePath = join(destination, "modules", "app", "package.json");
    const appModulePackageJson = await Bun.file(appModulePackagePath).json();
    appModulePackageJson.scripts.dev = "docker compose up -d && bun --hot run ./src/index.ts";
    appModulePackageJson.scripts.build = "bun build ./src/index.ts --outdir ./dist --target bun";
    await Bun.write(appModulePackagePath, JSON.stringify(appModulePackageJson, null, 2));

    const envContent = envTemplate
      .replace("DATABASE_URL=", "DATABASE_URL=\"postgresql://ooneex:ooneex@localhost:5432/ooneex\"")
      .replace("CACHE_REDIS_URL=", "CACHE_REDIS_URL=\"redis://localhost:6379\"")
      .replace("PUBSUB_REDIS_URL=", "PUBSUB_REDIS_URL=\"redis://localhost:6379\"")
      .replace("RATE_LIMIT_REDIS_URL=", "RATE_LIMIT_REDIS_URL=\"redis://localhost:6379\"")
      .replace("DATABASE_REDIS_URL=", "DATABASE_REDIS_URL=\"redis://localhost:6379\"");
    await Bun.write(join(destination, "modules", "app", ".env"), envContent);
    await Bun.write(join(destination, "modules", "app", ".env.example"), envTemplate);
    await Bun.write(join(destination, "modules", "app", "src", "databases", "AppDatabase.ts"), databaseTemplate);
    await Bun.write(join(destination, "modules", "app", "src", "index.ts"), indexTemplate);
    const snakeName = toSnakeCase(name);
    const dockerComposeContent = dockerComposeTemplate.replace(/{{NAME}}/g, snakeName);
    await Bun.write(join(destination, "modules", "app", "docker-compose.yml"), dockerComposeContent);
    const dockerfileContent = dockerfileTemplate.replace(/{{NAME}}/g, snakeName);
    await Bun.write(join(destination, "modules", "app", "Dockerfile"), dockerfileContent);
    await Bun.write(join(destination, "modules", "app", "var", ".gitkeep"), "");

    const logger = new TerminalLogger();

    logger.success(`${kebabName} created successfully at ${destination}`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });
  }
}
