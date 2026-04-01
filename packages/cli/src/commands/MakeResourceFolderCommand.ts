import { join } from "node:path";
import { Glob } from "bun";
import { decorator } from "../decorators";
import createFolderControllerTemplate from "../templates/resources/folder/controllers/CreateFolderController.txt";
import deleteFolderControllerTemplate from "../templates/resources/folder/controllers/DeleteFolderController.txt";
import getFolderControllerTemplate from "../templates/resources/folder/controllers/GetFolderController.txt";
import listFoldersControllerTemplate from "../templates/resources/folder/controllers/ListFoldersController.txt";
import updateFolderControllerTemplate from "../templates/resources/folder/controllers/UpdateFolderController.txt";
import entityTemplate from "../templates/resources/folder/FolderEntity.txt";
import migrationTemplate from "../templates/resources/folder/FolderMigration.txt";
import repositoryTemplate from "../templates/resources/folder/FolderRepository.txt";
import createFolderServiceTemplate from "../templates/resources/folder/services/CreateFolderService.txt";
import deleteFolderServiceTemplate from "../templates/resources/folder/services/DeleteFolderService.txt";
import getFolderServiceTemplate from "../templates/resources/folder/services/GetFolderService.txt";
import listFoldersServiceTemplate from "../templates/resources/folder/services/ListFoldersService.txt";
import updateFolderServiceTemplate from "../templates/resources/folder/services/UpdateFolderService.txt";
import type { ICommand } from "../types";
import { MakeControllerCommand } from "./MakeControllerCommand";
import { MakeEntityCommand } from "./MakeEntityCommand";
import { MakeMigrationCommand } from "./MakeMigrationCommand";
import { MakeModuleCommand } from "./MakeModuleCommand";
import { MakeRepositoryCommand } from "./MakeRepositoryCommand";
import { MakeServiceCommand } from "./MakeServiceCommand";

@decorator.command()
export class MakeResourceFolderCommand implements ICommand {
  public getName(): string {
    return "make:resource:folder";
  }

  public getDescription(): string {
    return "Generate folder resource (entity, migration, repository)";
  }

  public async run(): Promise<void> {
    const module = "folder";
    const base = join("modules", module);

    // Create module first
    const makeModuleCommand = new MakeModuleCommand();
    await makeModuleCommand.run({ name: module, silent: true, skipMigrations: false, skipSeeds: true });

    const makeEntityCommand = new MakeEntityCommand();
    await makeEntityCommand.run({ name: "Folder", module, tableName: "folders" });

    const makeMigrationCommand = new MakeMigrationCommand();
    await makeMigrationCommand.run({ module });

    const makeRepositoryCommand = new MakeRepositoryCommand();
    await makeRepositoryCommand.run({ name: "Folder", module });

    // Create controllers
    const makeControllerCommand = new MakeControllerCommand();
    const controllers = [
      {
        name: "CreateFolder",
        route: { name: "folder.create", path: "/folders" as const, method: "POST" as const },
      },
      {
        name: "GetFolder",
        route: { name: "folder.get", path: "/folders/:id" as const, method: "GET" as const },
      },
      {
        name: "ListFolders",
        route: { name: "folder.list", path: "/folders" as const, method: "GET" as const },
      },
      {
        name: "UpdateFolder",
        route: { name: "folder.update", path: "/folders/:id" as const, method: "PATCH" as const },
      },
      {
        name: "DeleteFolder",
        route: { name: "folder.delete", path: "/folders/:id" as const, method: "DELETE" as const },
      },
    ];

    for (const controller of controllers) {
      await makeControllerCommand.run({ ...controller, module, isSocket: false });
    }

    // Replace controller contents with folder templates
    const controllersDir = join(process.cwd(), base, "src", "controllers");
    await Bun.write(join(controllersDir, "CreateFolderController.ts"), createFolderControllerTemplate);
    await Bun.write(join(controllersDir, "GetFolderController.ts"), getFolderControllerTemplate);
    await Bun.write(join(controllersDir, "ListFoldersController.ts"), listFoldersControllerTemplate);
    await Bun.write(join(controllersDir, "UpdateFolderController.ts"), updateFolderControllerTemplate);
    await Bun.write(join(controllersDir, "DeleteFolderController.ts"), deleteFolderControllerTemplate);

    // Create services
    const makeServiceCommand = new MakeServiceCommand();
    const services = ["CreateFolder", "GetFolder", "ListFolders", "UpdateFolder", "DeleteFolder"];

    for (const name of services) {
      await makeServiceCommand.run({ name, module });
    }

    // Replace service contents with folder templates
    const servicesDir = join(process.cwd(), base, "src", "services");
    await Bun.write(join(servicesDir, "CreateFolderService.ts"), createFolderServiceTemplate);
    await Bun.write(join(servicesDir, "GetFolderService.ts"), getFolderServiceTemplate);
    await Bun.write(join(servicesDir, "ListFoldersService.ts"), listFoldersServiceTemplate);
    await Bun.write(join(servicesDir, "UpdateFolderService.ts"), updateFolderServiceTemplate);
    await Bun.write(join(servicesDir, "DeleteFolderService.ts"), deleteFolderServiceTemplate);

    // Replace entity content with folder template
    const entityPath = join(process.cwd(), base, "src", "entities", "FolderEntity.ts");
    await Bun.write(entityPath, entityTemplate);

    // Replace migration content with folder template
    const migrationsDir = join(process.cwd(), base, "src", "migrations");
    const glob = new Glob("Migration*.ts");
    for await (const file of glob.scan(migrationsDir)) {
      if (file === "migrations.ts") continue;
      const name = file.replace(/\.ts$/, "");
      const version = name.replace("Migration", "");
      const content = migrationTemplate.replaceAll("{{ name }}", name).replaceAll("{{ version }}", version);
      await Bun.write(join(migrationsDir, file), content);
    }

    // Replace repository content with folder template
    const repositoryPath = join(process.cwd(), base, "src", "repositories", "FolderRepository.ts");
    await Bun.write(repositoryPath, repositoryTemplate);
  }
}
