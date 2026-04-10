import { join } from "node:path";
import type { ICommand } from "@ooneex/command";
import { decorator } from "@ooneex/command";
import { Glob } from "bun";
import entityTemplate from "../templates/resources/calendar-event/CalendarEventEntity.txt";
import migrationTemplate from "../templates/resources/calendar-event/CalendarEventMigration.txt";
import repositoryTemplate from "../templates/resources/calendar-event/CalendarEventRepository.txt";
import createCalendarEventControllerTemplate from "../templates/resources/calendar-event/controllers/CreateCalendarEventController.txt";
import deleteCalendarEventControllerTemplate from "../templates/resources/calendar-event/controllers/DeleteCalendarEventController.txt";
import getCalendarEventControllerTemplate from "../templates/resources/calendar-event/controllers/GetCalendarEventController.txt";
import listCalendarEventsControllerTemplate from "../templates/resources/calendar-event/controllers/ListCalendarEventsController.txt";
import updateCalendarEventControllerTemplate from "../templates/resources/calendar-event/controllers/UpdateCalendarEventController.txt";
import createCalendarEventServiceTemplate from "../templates/resources/calendar-event/services/CreateCalendarEventService.txt";
import deleteCalendarEventServiceTemplate from "../templates/resources/calendar-event/services/DeleteCalendarEventService.txt";
import getCalendarEventServiceTemplate from "../templates/resources/calendar-event/services/GetCalendarEventService.txt";
import listCalendarEventsServiceTemplate from "../templates/resources/calendar-event/services/ListCalendarEventsService.txt";
import updateCalendarEventServiceTemplate from "../templates/resources/calendar-event/services/UpdateCalendarEventService.txt";
import { MakeControllerCommand } from "./MakeControllerCommand";
import { MakeEntityCommand } from "./MakeEntityCommand";
import { MakeMigrationCommand } from "./MakeMigrationCommand";
import { MakeModuleCommand } from "./MakeModuleCommand";
import { MakeRepositoryCommand } from "./MakeRepositoryCommand";
import { MakeServiceCommand } from "./MakeServiceCommand";

@decorator.command()
export class MakeResourceCalendarEventCommand implements ICommand {
  public getName(): string {
    return "make:resource:calendar-event";
  }

  public getDescription(): string {
    return "Generate calendar event resource (entity, migration, repository)";
  }

  public async run(): Promise<void> {
    const module = "calendar-event";
    const base = join("modules", module);

    // Create module first
    const makeModuleCommand = new MakeModuleCommand();
    await makeModuleCommand.run({ name: module, silent: true });

    const makeEntityCommand = new MakeEntityCommand();
    await makeEntityCommand.run({ name: "CalendarEvent", module, tableName: "calendar_events" });

    const makeMigrationCommand = new MakeMigrationCommand();
    await makeMigrationCommand.run({ module });

    const makeRepositoryCommand = new MakeRepositoryCommand();
    await makeRepositoryCommand.run({ name: "CalendarEvent", module });

    // Create controllers
    const makeControllerCommand = new MakeControllerCommand();
    const controllers = [
      {
        name: "CreateCalendarEvent",
        route: { name: "calendar-event.create", path: "/calendar-events" as const, method: "POST" as const },
      },
      {
        name: "GetCalendarEvent",
        route: { name: "calendar-event.get", path: "/calendar-events/:id" as const, method: "GET" as const },
      },
      {
        name: "ListCalendarEvents",
        route: { name: "calendar-event.list", path: "/calendar-events" as const, method: "GET" as const },
      },
      {
        name: "UpdateCalendarEvent",
        route: { name: "calendar-event.update", path: "/calendar-events/:id" as const, method: "PATCH" as const },
      },
      {
        name: "DeleteCalendarEvent",
        route: { name: "calendar-event.delete", path: "/calendar-events/:id" as const, method: "DELETE" as const },
      },
    ];

    for (const controller of controllers) {
      await makeControllerCommand.run({ ...controller, module, isSocket: false });
    }

    // Replace controller contents with calendar event templates
    const controllersDir = join(process.cwd(), base, "src", "controllers");
    await Bun.write(join(controllersDir, "CreateCalendarEventController.ts"), createCalendarEventControllerTemplate);
    await Bun.write(join(controllersDir, "GetCalendarEventController.ts"), getCalendarEventControllerTemplate);
    await Bun.write(join(controllersDir, "ListCalendarEventsController.ts"), listCalendarEventsControllerTemplate);
    await Bun.write(join(controllersDir, "UpdateCalendarEventController.ts"), updateCalendarEventControllerTemplate);
    await Bun.write(join(controllersDir, "DeleteCalendarEventController.ts"), deleteCalendarEventControllerTemplate);

    // Create services
    const makeServiceCommand = new MakeServiceCommand();
    const services = [
      "CreateCalendarEvent",
      "GetCalendarEvent",
      "ListCalendarEvents",
      "UpdateCalendarEvent",
      "DeleteCalendarEvent",
    ];

    for (const name of services) {
      await makeServiceCommand.run({ name, module });
    }

    // Replace service contents with calendar event templates
    const servicesDir = join(process.cwd(), base, "src", "services");
    await Bun.write(join(servicesDir, "CreateCalendarEventService.ts"), createCalendarEventServiceTemplate);
    await Bun.write(join(servicesDir, "GetCalendarEventService.ts"), getCalendarEventServiceTemplate);
    await Bun.write(join(servicesDir, "ListCalendarEventsService.ts"), listCalendarEventsServiceTemplate);
    await Bun.write(join(servicesDir, "UpdateCalendarEventService.ts"), updateCalendarEventServiceTemplate);
    await Bun.write(join(servicesDir, "DeleteCalendarEventService.ts"), deleteCalendarEventServiceTemplate);

    // Replace entity content with calendar event template
    const entityPath = join(process.cwd(), base, "src", "entities", "CalendarEventEntity.ts");
    await Bun.write(entityPath, entityTemplate);

    // Replace migration content with calendar event template
    const migrationsDir = join(process.cwd(), base, "src", "migrations");
    const glob = new Glob("Migration*.ts");
    for await (const file of glob.scan(migrationsDir)) {
      if (file === "migrations.ts") continue;
      const name = file.replace(/\.ts$/, "");
      const version = name.replace("Migration", "");
      const content = migrationTemplate.replaceAll("{{ name }}", name).replaceAll("{{ version }}", version);
      await Bun.write(join(migrationsDir, file), content);
    }

    // Replace repository content with calendar event template
    const repositoryPath = join(process.cwd(), base, "src", "repositories", "CalendarEventRepository.ts");
    await Bun.write(repositoryPath, repositoryTemplate);
  }
}
