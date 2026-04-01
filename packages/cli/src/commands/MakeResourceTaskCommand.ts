import { join } from "node:path";
import { Glob } from "bun";
import { decorator } from "../decorators";
import entityTemplate from "../templates/resources/task/TaskEntity.txt";
import migrationTemplate from "../templates/resources/task/TaskMigration.txt";
import repositoryTemplate from "../templates/resources/task/TaskRepository.txt";
import createTaskControllerTemplate from "../templates/resources/task/controllers/CreateTaskController.txt";
import deleteTaskControllerTemplate from "../templates/resources/task/controllers/DeleteTaskController.txt";
import getTaskControllerTemplate from "../templates/resources/task/controllers/GetTaskController.txt";
import listTasksControllerTemplate from "../templates/resources/task/controllers/ListTasksController.txt";
import updateTaskControllerTemplate from "../templates/resources/task/controllers/UpdateTaskController.txt";
import createTaskServiceTemplate from "../templates/resources/task/services/CreateTaskService.txt";
import deleteTaskServiceTemplate from "../templates/resources/task/services/DeleteTaskService.txt";
import getTaskServiceTemplate from "../templates/resources/task/services/GetTaskService.txt";
import listTasksServiceTemplate from "../templates/resources/task/services/ListTasksService.txt";
import updateTaskServiceTemplate from "../templates/resources/task/services/UpdateTaskService.txt";
import type { ICommand } from "../types";
import { MakeControllerCommand } from "./MakeControllerCommand";
import { MakeEntityCommand } from "./MakeEntityCommand";
import { MakeMigrationCommand } from "./MakeMigrationCommand";
import { MakeModuleCommand } from "./MakeModuleCommand";
import { MakeRepositoryCommand } from "./MakeRepositoryCommand";
import { MakeServiceCommand } from "./MakeServiceCommand";

@decorator.command()
export class MakeResourceTaskCommand implements ICommand {
  public getName(): string {
    return "make:resource:task";
  }

  public getDescription(): string {
    return "Generate task resource (entity, migration, repository)";
  }

  public async run(): Promise<void> {
    const module = "task";
    const base = join("modules", module);

    // Create module first
    const makeModuleCommand = new MakeModuleCommand();
    await makeModuleCommand.run({ name: module, silent: true, skipMigrations: false, skipSeeds: true });

    const makeEntityCommand = new MakeEntityCommand();
    await makeEntityCommand.run({ name: "Task", module, tableName: "tasks" });

    const makeMigrationCommand = new MakeMigrationCommand();
    await makeMigrationCommand.run({ module });

    const makeRepositoryCommand = new MakeRepositoryCommand();
    await makeRepositoryCommand.run({ name: "Task", module });

    // Create controllers
    const makeControllerCommand = new MakeControllerCommand();
    const controllers = [
      {
        name: "CreateTask",
        route: { name: "task.create", path: "/tasks" as const, method: "POST" as const },
      },
      {
        name: "GetTask",
        route: { name: "task.get", path: "/tasks/:id" as const, method: "GET" as const },
      },
      {
        name: "ListTasks",
        route: { name: "task.list", path: "/tasks" as const, method: "GET" as const },
      },
      {
        name: "UpdateTask",
        route: { name: "task.update", path: "/tasks/:id" as const, method: "PATCH" as const },
      },
      {
        name: "DeleteTask",
        route: { name: "task.delete", path: "/tasks/:id" as const, method: "DELETE" as const },
      },
    ];

    for (const controller of controllers) {
      await makeControllerCommand.run({ ...controller, module, isSocket: false });
    }

    // Replace controller contents with task templates
    const controllersDir = join(process.cwd(), base, "src", "controllers");
    await Bun.write(join(controllersDir, "CreateTaskController.ts"), createTaskControllerTemplate);
    await Bun.write(join(controllersDir, "GetTaskController.ts"), getTaskControllerTemplate);
    await Bun.write(join(controllersDir, "ListTasksController.ts"), listTasksControllerTemplate);
    await Bun.write(join(controllersDir, "UpdateTaskController.ts"), updateTaskControllerTemplate);
    await Bun.write(join(controllersDir, "DeleteTaskController.ts"), deleteTaskControllerTemplate);

    // Create services
    const makeServiceCommand = new MakeServiceCommand();
    const services = ["CreateTask", "GetTask", "ListTasks", "UpdateTask", "DeleteTask"];

    for (const name of services) {
      await makeServiceCommand.run({ name, module });
    }

    // Replace service contents with task templates
    const servicesDir = join(process.cwd(), base, "src", "services");
    await Bun.write(join(servicesDir, "CreateTaskService.ts"), createTaskServiceTemplate);
    await Bun.write(join(servicesDir, "GetTaskService.ts"), getTaskServiceTemplate);
    await Bun.write(join(servicesDir, "ListTasksService.ts"), listTasksServiceTemplate);
    await Bun.write(join(servicesDir, "UpdateTaskService.ts"), updateTaskServiceTemplate);
    await Bun.write(join(servicesDir, "DeleteTaskService.ts"), deleteTaskServiceTemplate);

    // Replace entity content with task template
    const entityPath = join(process.cwd(), base, "src", "entities", "TaskEntity.ts");
    await Bun.write(entityPath, entityTemplate);

    // Replace migration content with task template
    const migrationsDir = join(process.cwd(), base, "src", "migrations");
    const glob = new Glob("Migration*.ts");
    for await (const file of glob.scan(migrationsDir)) {
      if (file === "migrations.ts") continue;
      const name = file.replace(/\.ts$/, "");
      const version = name.replace("Migration", "");
      const content = migrationTemplate.replaceAll("{{ name }}", name).replaceAll("{{ version }}", version);
      await Bun.write(join(migrationsDir, file), content);
    }

    // Replace repository content with task template
    const repositoryPath = join(process.cwd(), base, "src", "repositories", "TaskRepository.ts");
    await Bun.write(repositoryPath, repositoryTemplate);
  }
}
