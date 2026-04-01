import { join } from "node:path";
import { Glob } from "bun";
import { decorator } from "../decorators";
import createTopicControllerTemplate from "../templates/resources/topic/controllers/CreateTopicController.txt";
import deleteTopicControllerTemplate from "../templates/resources/topic/controllers/DeleteTopicController.txt";
import getTopicControllerTemplate from "../templates/resources/topic/controllers/GetTopicController.txt";
import listTopicsControllerTemplate from "../templates/resources/topic/controllers/ListTopicsController.txt";
import updateTopicControllerTemplate from "../templates/resources/topic/controllers/UpdateTopicController.txt";
import createTopicServiceTemplate from "../templates/resources/topic/services/CreateTopicService.txt";
import deleteTopicServiceTemplate from "../templates/resources/topic/services/DeleteTopicService.txt";
import getTopicServiceTemplate from "../templates/resources/topic/services/GetTopicService.txt";
import listTopicsServiceTemplate from "../templates/resources/topic/services/ListTopicsService.txt";
import updateTopicServiceTemplate from "../templates/resources/topic/services/UpdateTopicService.txt";
import entityTemplate from "../templates/resources/topic/TopicEntity.txt";
import migrationTemplate from "../templates/resources/topic/TopicMigration.txt";
import repositoryTemplate from "../templates/resources/topic/TopicRepository.txt";
import type { ICommand } from "../types";
import { MakeControllerCommand } from "./MakeControllerCommand";
import { MakeEntityCommand } from "./MakeEntityCommand";
import { MakeMigrationCommand } from "./MakeMigrationCommand";
import { MakeModuleCommand } from "./MakeModuleCommand";
import { MakeRepositoryCommand } from "./MakeRepositoryCommand";
import { MakeServiceCommand } from "./MakeServiceCommand";

@decorator.command()
export class MakeResourceTopicCommand implements ICommand {
  public getName(): string {
    return "make:resource:topic";
  }

  public getDescription(): string {
    return "Generate topic resource (entity, migration, repository)";
  }

  public async run(): Promise<void> {
    const module = "topic";
    const base = join("modules", module);

    // Create module first
    const makeModuleCommand = new MakeModuleCommand();
    await makeModuleCommand.run({ name: module, silent: true, skipMigrations: false, skipSeeds: true });

    const makeEntityCommand = new MakeEntityCommand();
    await makeEntityCommand.run({ name: "Topic", module, tableName: "topics" });

    const makeMigrationCommand = new MakeMigrationCommand();
    await makeMigrationCommand.run({ module });

    const makeRepositoryCommand = new MakeRepositoryCommand();
    await makeRepositoryCommand.run({ name: "Topic", module });

    // Create controllers
    const makeControllerCommand = new MakeControllerCommand();
    const controllers = [
      {
        name: "CreateTopic",
        route: { name: "topic.create", path: "/topics" as const, method: "POST" as const },
      },
      {
        name: "GetTopic",
        route: { name: "topic.get", path: "/topics/:id" as const, method: "GET" as const },
      },
      {
        name: "ListTopics",
        route: { name: "topic.list", path: "/topics" as const, method: "GET" as const },
      },
      {
        name: "UpdateTopic",
        route: { name: "topic.update", path: "/topics/:id" as const, method: "PATCH" as const },
      },
      {
        name: "DeleteTopic",
        route: { name: "topic.delete", path: "/topics/:id" as const, method: "DELETE" as const },
      },
    ];

    for (const controller of controllers) {
      await makeControllerCommand.run({ ...controller, module, isSocket: false });
    }

    // Replace controller contents with topic templates
    const controllersDir = join(process.cwd(), base, "src", "controllers");
    await Bun.write(join(controllersDir, "CreateTopicController.ts"), createTopicControllerTemplate);
    await Bun.write(join(controllersDir, "GetTopicController.ts"), getTopicControllerTemplate);
    await Bun.write(join(controllersDir, "ListTopicsController.ts"), listTopicsControllerTemplate);
    await Bun.write(join(controllersDir, "UpdateTopicController.ts"), updateTopicControllerTemplate);
    await Bun.write(join(controllersDir, "DeleteTopicController.ts"), deleteTopicControllerTemplate);

    // Create services
    const makeServiceCommand = new MakeServiceCommand();
    const services = ["CreateTopic", "GetTopic", "ListTopics", "UpdateTopic", "DeleteTopic"];

    for (const name of services) {
      await makeServiceCommand.run({ name, module });
    }

    // Replace service contents with topic templates
    const servicesDir = join(process.cwd(), base, "src", "services");
    await Bun.write(join(servicesDir, "CreateTopicService.ts"), createTopicServiceTemplate);
    await Bun.write(join(servicesDir, "GetTopicService.ts"), getTopicServiceTemplate);
    await Bun.write(join(servicesDir, "ListTopicsService.ts"), listTopicsServiceTemplate);
    await Bun.write(join(servicesDir, "UpdateTopicService.ts"), updateTopicServiceTemplate);
    await Bun.write(join(servicesDir, "DeleteTopicService.ts"), deleteTopicServiceTemplate);

    // Replace entity content with topic template
    const entityPath = join(process.cwd(), base, "src", "entities", "TopicEntity.ts");
    await Bun.write(entityPath, entityTemplate);

    // Replace migration content with topic template
    const migrationsDir = join(process.cwd(), base, "src", "migrations");
    const glob = new Glob("Migration*.ts");
    for await (const file of glob.scan(migrationsDir)) {
      if (file === "migrations.ts") continue;
      const name = file.replace(/\.ts$/, "");
      const version = name.replace("Migration", "");
      const content = migrationTemplate.replaceAll("{{ name }}", name).replaceAll("{{ version }}", version);
      await Bun.write(join(migrationsDir, file), content);
    }

    // Replace repository content with topic template
    const repositoryPath = join(process.cwd(), base, "src", "repositories", "TopicRepository.ts");
    await Bun.write(repositoryPath, repositoryTemplate);
  }
}
