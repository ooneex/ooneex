import { join } from "node:path";
import type { ICommand } from "@ooneex/command";
import { decorator } from "@ooneex/command";
import { Glob } from "bun";
import createStatusControllerTemplate from "../templates/resources/status/controllers/CreateStatusController.txt";
import deleteStatusControllerTemplate from "../templates/resources/status/controllers/DeleteStatusController.txt";
import getStatusControllerTemplate from "../templates/resources/status/controllers/GetStatusController.txt";
import listStatusesControllerTemplate from "../templates/resources/status/controllers/ListStatusesController.txt";
import updateStatusControllerTemplate from "../templates/resources/status/controllers/UpdateStatusController.txt";
import entityTemplate from "../templates/resources/status/StatusEntity.txt";
import migrationTemplate from "../templates/resources/status/StatusMigration.txt";
import repositoryTemplate from "../templates/resources/status/StatusRepository.txt";
import statusSeedDataPath from "../templates/resources/status/seeds/data.yml" with { type: "file" };
import statusSeedTemplate from "../templates/resources/status/seeds/StatusSeed.txt";
import createStatusServiceTemplate from "../templates/resources/status/services/CreateStatusService.txt";
import deleteStatusServiceTemplate from "../templates/resources/status/services/DeleteStatusService.txt";
import getStatusServiceTemplate from "../templates/resources/status/services/GetStatusService.txt";
import listStatusesServiceTemplate from "../templates/resources/status/services/ListStatusesService.txt";
import updateStatusServiceTemplate from "../templates/resources/status/services/UpdateStatusService.txt";
import { MakeControllerCommand } from "./MakeControllerCommand";
import { MakeEntityCommand } from "./MakeEntityCommand";
import { MakeMigrationCommand } from "./MakeMigrationCommand";
import { MakeModuleCommand } from "./MakeModuleCommand";
import { MakeRepositoryCommand } from "./MakeRepositoryCommand";
import { MakeSeedCommand } from "./MakeSeedCommand";
import { MakeServiceCommand } from "./MakeServiceCommand";

@decorator.command()
export class MakeResourceStatusCommand implements ICommand {
  public getName(): string {
    return "make:resource:status";
  }

  public getDescription(): string {
    return "Generate status resource (entity, migration, repository)";
  }

  public async run(): Promise<void> {
    const module = "status";
    const base = join("modules", module);

    // Create module first
    const makeModuleCommand = new MakeModuleCommand();
    await makeModuleCommand.run({ name: module, silent: true, skipMigrations: false, skipSeeds: true });

    const makeEntityCommand = new MakeEntityCommand();
    await makeEntityCommand.run({ name: "Status", module, tableName: "statuses" });

    const makeMigrationCommand = new MakeMigrationCommand();
    await makeMigrationCommand.run({ module });

    const makeRepositoryCommand = new MakeRepositoryCommand();
    await makeRepositoryCommand.run({ name: "Status", module });

    // Create controllers
    const makeControllerCommand = new MakeControllerCommand();
    const controllers = [
      {
        name: "CreateStatus",
        route: { name: "status.create", path: "/statuses" as const, method: "POST" as const },
      },
      {
        name: "GetStatus",
        route: { name: "status.get", path: "/statuses/:id" as const, method: "GET" as const },
      },
      {
        name: "ListStatuses",
        route: { name: "status.list", path: "/statuses" as const, method: "GET" as const },
      },
      {
        name: "UpdateStatus",
        route: { name: "status.update", path: "/statuses/:id" as const, method: "PATCH" as const },
      },
      {
        name: "DeleteStatus",
        route: { name: "status.delete", path: "/statuses/:id" as const, method: "DELETE" as const },
      },
    ];

    for (const controller of controllers) {
      await makeControllerCommand.run({ ...controller, module, isSocket: false });
    }

    // Replace controller contents with status templates
    const controllersDir = join(process.cwd(), base, "src", "controllers");
    await Bun.write(join(controllersDir, "CreateStatusController.ts"), createStatusControllerTemplate);
    await Bun.write(join(controllersDir, "GetStatusController.ts"), getStatusControllerTemplate);
    await Bun.write(join(controllersDir, "ListStatusesController.ts"), listStatusesControllerTemplate);
    await Bun.write(join(controllersDir, "UpdateStatusController.ts"), updateStatusControllerTemplate);
    await Bun.write(join(controllersDir, "DeleteStatusController.ts"), deleteStatusControllerTemplate);

    // Create services
    const makeServiceCommand = new MakeServiceCommand();
    const services = ["CreateStatus", "GetStatus", "ListStatuses", "UpdateStatus", "DeleteStatus"];

    for (const name of services) {
      await makeServiceCommand.run({ name, module });
    }

    // Replace service contents with status templates
    const servicesDir = join(process.cwd(), base, "src", "services");
    await Bun.write(join(servicesDir, "CreateStatusService.ts"), createStatusServiceTemplate);
    await Bun.write(join(servicesDir, "GetStatusService.ts"), getStatusServiceTemplate);
    await Bun.write(join(servicesDir, "ListStatusesService.ts"), listStatusesServiceTemplate);
    await Bun.write(join(servicesDir, "UpdateStatusService.ts"), updateStatusServiceTemplate);
    await Bun.write(join(servicesDir, "DeleteStatusService.ts"), deleteStatusServiceTemplate);

    // Replace entity content with status template
    const entityPath = join(process.cwd(), base, "src", "entities", "StatusEntity.ts");
    await Bun.write(entityPath, entityTemplate);

    // Replace migration content with status template
    const migrationsDir = join(process.cwd(), base, "src", "migrations");
    const glob = new Glob("Migration*.ts");
    for await (const file of glob.scan(migrationsDir)) {
      if (file === "migrations.ts") continue;
      const name = file.replace(/\.ts$/, "");
      const version = name.replace("Migration", "");
      const content = migrationTemplate.replaceAll("{{ name }}", name).replaceAll("{{ version }}", version);
      await Bun.write(join(migrationsDir, file), content);
    }

    // Replace repository content with status template
    const repositoryPath = join(process.cwd(), base, "src", "repositories", "StatusRepository.ts");
    await Bun.write(repositoryPath, repositoryTemplate);

    // Create seed
    const makeSeedCommand = new MakeSeedCommand();
    await makeSeedCommand.run({ name: "Status", module });

    // Replace seed content with status template
    const seedsDir = join(process.cwd(), base, "src", "seeds");
    await Bun.write(join(seedsDir, "StatusSeed.ts"), statusSeedTemplate);
    await Bun.write(join(seedsDir, "data.yml"), Bun.file(statusSeedDataPath));
  }
}
