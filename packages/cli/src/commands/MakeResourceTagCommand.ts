import { join } from "node:path";
import type { ICommand } from "@ooneex/command";
import { decorator } from "@ooneex/command";
import { Glob } from "bun";
import createTagControllerTemplate from "../templates/resources/tag/controllers/CreateTagController.txt";
import deleteTagControllerTemplate from "../templates/resources/tag/controllers/DeleteTagController.txt";
import getTagControllerTemplate from "../templates/resources/tag/controllers/GetTagController.txt";
import listTagsControllerTemplate from "../templates/resources/tag/controllers/ListTagsController.txt";
import updateTagControllerTemplate from "../templates/resources/tag/controllers/UpdateTagController.txt";
import createTagServiceTemplate from "../templates/resources/tag/services/CreateTagService.txt";
import deleteTagServiceTemplate from "../templates/resources/tag/services/DeleteTagService.txt";
import getTagServiceTemplate from "../templates/resources/tag/services/GetTagService.txt";
import listTagsServiceTemplate from "../templates/resources/tag/services/ListTagsService.txt";
import updateTagServiceTemplate from "../templates/resources/tag/services/UpdateTagService.txt";
import entityTemplate from "../templates/resources/tag/TagEntity.txt";
import migrationTemplate from "../templates/resources/tag/TagMigration.txt";
import repositoryTemplate from "../templates/resources/tag/TagRepository.txt";
import { MakeControllerCommand } from "./MakeControllerCommand";
import { MakeEntityCommand } from "./MakeEntityCommand";
import { MakeMigrationCommand } from "./MakeMigrationCommand";
import { MakeModuleCommand } from "./MakeModuleCommand";
import { MakeRepositoryCommand } from "./MakeRepositoryCommand";
import { MakeServiceCommand } from "./MakeServiceCommand";

@decorator.command()
export class MakeResourceTagCommand implements ICommand {
  public getName(): string {
    return "make:resource:tag";
  }

  public getDescription(): string {
    return "Generate tag resource (entity, migration, repository)";
  }

  public async run(): Promise<void> {
    const module = "tag";
    const base = join("modules", module);

    // Create module first
    const makeModuleCommand = new MakeModuleCommand();
    await makeModuleCommand.run({ name: module, silent: true });

    const makeEntityCommand = new MakeEntityCommand();
    await makeEntityCommand.run({ name: "Tag", module, tableName: "tags" });

    const makeMigrationCommand = new MakeMigrationCommand();
    await makeMigrationCommand.run({ module });

    const makeRepositoryCommand = new MakeRepositoryCommand();
    await makeRepositoryCommand.run({ name: "Tag", module });

    // Create controllers
    const makeControllerCommand = new MakeControllerCommand();
    const controllers = [
      {
        name: "CreateTag",
        route: { name: "tag.create", path: "/tags" as const, method: "POST" as const },
      },
      {
        name: "GetTag",
        route: { name: "tag.get", path: "/tags/:id" as const, method: "GET" as const },
      },
      {
        name: "ListTags",
        route: { name: "tag.list", path: "/tags" as const, method: "GET" as const },
      },
      {
        name: "UpdateTag",
        route: { name: "tag.update", path: "/tags/:id" as const, method: "PATCH" as const },
      },
      {
        name: "DeleteTag",
        route: { name: "tag.delete", path: "/tags/:id" as const, method: "DELETE" as const },
      },
    ];

    for (const controller of controllers) {
      await makeControllerCommand.run({ ...controller, module, isSocket: false });
    }

    // Replace controller contents with tag templates
    const controllersDir = join(process.cwd(), base, "src", "controllers");
    await Bun.write(join(controllersDir, "CreateTagController.ts"), createTagControllerTemplate);
    await Bun.write(join(controllersDir, "GetTagController.ts"), getTagControllerTemplate);
    await Bun.write(join(controllersDir, "ListTagsController.ts"), listTagsControllerTemplate);
    await Bun.write(join(controllersDir, "UpdateTagController.ts"), updateTagControllerTemplate);
    await Bun.write(join(controllersDir, "DeleteTagController.ts"), deleteTagControllerTemplate);

    // Create services
    const makeServiceCommand = new MakeServiceCommand();
    const services = ["CreateTag", "GetTag", "ListTags", "UpdateTag", "DeleteTag"];

    for (const name of services) {
      await makeServiceCommand.run({ name, module });
    }

    // Replace service contents with tag templates
    const servicesDir = join(process.cwd(), base, "src", "services");
    await Bun.write(join(servicesDir, "CreateTagService.ts"), createTagServiceTemplate);
    await Bun.write(join(servicesDir, "GetTagService.ts"), getTagServiceTemplate);
    await Bun.write(join(servicesDir, "ListTagsService.ts"), listTagsServiceTemplate);
    await Bun.write(join(servicesDir, "UpdateTagService.ts"), updateTagServiceTemplate);
    await Bun.write(join(servicesDir, "DeleteTagService.ts"), deleteTagServiceTemplate);

    // Replace entity content with tag template
    const entityPath = join(process.cwd(), base, "src", "entities", "TagEntity.ts");
    await Bun.write(entityPath, entityTemplate);

    // Replace migration content with tag template
    const migrationsDir = join(process.cwd(), base, "src", "migrations");
    const glob = new Glob("Migration*.ts");
    for await (const file of glob.scan(migrationsDir)) {
      if (file === "migrations.ts") continue;
      const name = file.replace(/\.ts$/, "");
      const version = name.replace("Migration", "");
      const content = migrationTemplate.replaceAll("{{ name }}", name).replaceAll("{{ version }}", version);
      await Bun.write(join(migrationsDir, file), content);
    }

    // Replace repository content with tag template
    const repositoryPath = join(process.cwd(), base, "src", "repositories", "TagRepository.ts");
    await Bun.write(repositoryPath, repositoryTemplate);
  }
}
