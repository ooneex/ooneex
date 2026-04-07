import { join } from "node:path";
import type { ICommand } from "@ooneex/command";
import { decorator } from "@ooneex/command";
import { TerminalLogger } from "@ooneex/logger";
import { migrationCreate } from "@ooneex/migrations";
import migrationUpTemplate from "../templates/module/migration.up.txt";
import { ensureModule } from "../utils";

type CommandOptionsType = {
  module?: string;
};

@decorator.command()
export class MakeMigrationCommand<T extends CommandOptionsType = CommandOptionsType> implements ICommand<T> {
  public getName(): string {
    return "make:migration";
  }

  public getDescription(): string {
    return "Generate a new migration file";
  }

  public async run(options: T): Promise<void> {
    const { module } = options;

    if (module) {
      await ensureModule(module);
    }

    const base = module ? join("modules", module) : ".";
    const { migrationPath: filePath } = await migrationCreate({
      migrationsDir: join(base, "src", "migrations"),
      testsDir: join(base, "tests", "migrations"),
    });

    // Create bin/migration/up.ts if it doesn't exist
    const binMigrationUpPath = join(process.cwd(), base, "bin", "migration", "up.ts");
    const binMigrationUpFile = Bun.file(binMigrationUpPath);
    if (!(await binMigrationUpFile.exists())) {
      await Bun.write(binMigrationUpPath, migrationUpTemplate);
    }

    // Update package.json with migration script
    const packageJsonPath = join(process.cwd(), "package.json");
    const packageJsonFile = Bun.file(packageJsonPath);
    if (await packageJsonFile.exists()) {
      const packageJson = await packageJsonFile.json();
      packageJson.scripts = packageJson.scripts || {};
      packageJson.scripts["migration:up"] = "bun ./bin/migration/up.ts";
      await Bun.write(packageJsonPath, JSON.stringify(packageJson, null, 2));
    }

    const logger = new TerminalLogger();

    logger.success(`${filePath} created successfully`, undefined, {
      showTimestamp: false,
      showArrow: false,
      useSymbol: true,
    });

    logger.info("Run 'bun run migration:up' to execute migrations", undefined, {
      showTimestamp: false,
      showArrow: true,
      showLevel: false,
    });

    // Install @ooneex/migrations dev dependency if not already installed
    const pkgJson = await Bun.file(packageJsonPath).json();
    const deps = pkgJson.dependencies ?? {};
    const devDeps = pkgJson.devDependencies ?? {};

    if (!deps["@ooneex/migrations"] && !devDeps["@ooneex/migrations"]) {
      const install = Bun.spawn(["bun", "add", "--dev", "@ooneex/migrations"], {
        cwd: process.cwd(),
        stdout: "ignore",
        stderr: "inherit",
      });
      await install.exited;
    }
  }
}
