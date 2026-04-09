import { join } from "node:path";
import type { ICommand } from "@ooneex/command";
import { decorator } from "@ooneex/command";
import { Glob } from "bun";
import entityTemplate from "../templates/resources/color/ColorEntity.txt";
import migrationTemplate from "../templates/resources/color/ColorMigration.txt";
import repositoryTemplate from "../templates/resources/color/ColorRepository.txt";
import createColorControllerTemplate from "../templates/resources/color/controllers/CreateColorController.txt";
import deleteColorControllerTemplate from "../templates/resources/color/controllers/DeleteColorController.txt";
import getColorControllerTemplate from "../templates/resources/color/controllers/GetColorController.txt";
import listColorsControllerTemplate from "../templates/resources/color/controllers/ListColorsController.txt";
import updateColorControllerTemplate from "../templates/resources/color/controllers/UpdateColorController.txt";
import colorSeedTemplate from "../templates/resources/color/seeds/ColorSeed.txt";
import colorSeedDataContent from "../templates/resources/color/seeds/color-seed.yml" with { type: "text" };
import createColorServiceTemplate from "../templates/resources/color/services/CreateColorService.txt";
import deleteColorServiceTemplate from "../templates/resources/color/services/DeleteColorService.txt";
import getColorServiceTemplate from "../templates/resources/color/services/GetColorService.txt";
import listColorsServiceTemplate from "../templates/resources/color/services/ListColorsService.txt";
import updateColorServiceTemplate from "../templates/resources/color/services/UpdateColorService.txt";
import { MakeControllerCommand } from "./MakeControllerCommand";
import { MakeEntityCommand } from "./MakeEntityCommand";
import { MakeMigrationCommand } from "./MakeMigrationCommand";
import { MakeModuleCommand } from "./MakeModuleCommand";
import { MakeRepositoryCommand } from "./MakeRepositoryCommand";
import { MakeSeedCommand } from "./MakeSeedCommand";
import { MakeServiceCommand } from "./MakeServiceCommand";

@decorator.command()
export class MakeResourceColorCommand implements ICommand {
  public getName(): string {
    return "make:resource:color";
  }

  public getDescription(): string {
    return "Generate color resource (entity, migration, repository)";
  }

  public async run(): Promise<void> {
    const module = "color";
    const base = join("modules", module);

    // Create module first
    const makeModuleCommand = new MakeModuleCommand();
    await makeModuleCommand.run({ name: module, silent: true, skipMigrations: false, skipSeeds: true });

    const makeEntityCommand = new MakeEntityCommand();
    await makeEntityCommand.run({ name: "Color", module, tableName: "colors" });

    const makeMigrationCommand = new MakeMigrationCommand();
    await makeMigrationCommand.run({ module });

    const makeRepositoryCommand = new MakeRepositoryCommand();
    await makeRepositoryCommand.run({ name: "Color", module });

    // Create controllers
    const makeControllerCommand = new MakeControllerCommand();
    const controllers = [
      { name: "CreateColor", route: { name: "color.create", path: "/colors" as const, method: "POST" as const } },
      { name: "GetColor", route: { name: "color.get", path: "/colors/:id" as const, method: "GET" as const } },
      { name: "ListColors", route: { name: "color.list", path: "/colors" as const, method: "GET" as const } },
      { name: "UpdateColor", route: { name: "color.update", path: "/colors/:id" as const, method: "PATCH" as const } },
      {
        name: "DeleteColor",
        route: { name: "color.delete", path: "/colors/:id" as const, method: "DELETE" as const },
      },
    ];

    for (const controller of controllers) {
      await makeControllerCommand.run({ ...controller, module, isSocket: false });
    }

    // Replace controller contents with color templates
    const controllersDir = join(process.cwd(), base, "src", "controllers");
    await Bun.write(join(controllersDir, "CreateColorController.ts"), createColorControllerTemplate);
    await Bun.write(join(controllersDir, "GetColorController.ts"), getColorControllerTemplate);
    await Bun.write(join(controllersDir, "ListColorsController.ts"), listColorsControllerTemplate);
    await Bun.write(join(controllersDir, "UpdateColorController.ts"), updateColorControllerTemplate);
    await Bun.write(join(controllersDir, "DeleteColorController.ts"), deleteColorControllerTemplate);

    // Create services
    const makeServiceCommand = new MakeServiceCommand();
    const services = ["CreateColor", "GetColor", "ListColors", "UpdateColor", "DeleteColor"];

    for (const name of services) {
      await makeServiceCommand.run({ name, module });
    }

    // Replace service contents with color templates
    const servicesDir = join(process.cwd(), base, "src", "services");
    await Bun.write(join(servicesDir, "CreateColorService.ts"), createColorServiceTemplate);
    await Bun.write(join(servicesDir, "GetColorService.ts"), getColorServiceTemplate);
    await Bun.write(join(servicesDir, "ListColorsService.ts"), listColorsServiceTemplate);
    await Bun.write(join(servicesDir, "UpdateColorService.ts"), updateColorServiceTemplate);
    await Bun.write(join(servicesDir, "DeleteColorService.ts"), deleteColorServiceTemplate);

    // Replace entity content with color template
    const entityPath = join(process.cwd(), base, "src", "entities", "ColorEntity.ts");
    await Bun.write(entityPath, entityTemplate);

    // Replace migration content with color template
    const migrationsDir = join(process.cwd(), base, "src", "migrations");
    const glob = new Glob("Migration*.ts");
    for await (const file of glob.scan(migrationsDir)) {
      if (file === "migrations.ts") continue;
      const name = file.replace(/\.ts$/, "");
      const version = name.replace("Migration", "");
      const content = migrationTemplate.replaceAll("{{ name }}", name).replaceAll("{{ version }}", version);
      await Bun.write(join(migrationsDir, file), content);
    }

    // Replace repository content with color template
    const repositoryPath = join(process.cwd(), base, "src", "repositories", "ColorRepository.ts");
    await Bun.write(repositoryPath, repositoryTemplate);

    // Create seed
    const makeSeedCommand = new MakeSeedCommand();
    await makeSeedCommand.run({ name: "Color", module });

    // Replace seed content with color template
    const seedsDir = join(process.cwd(), base, "src", "seeds");
    await Bun.write(join(seedsDir, "ColorSeed.ts"), colorSeedTemplate);
    await Bun.write(join(seedsDir, "color-seed.yml"), colorSeedDataContent);
  }
}
