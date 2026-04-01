import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { rmSync } from "node:fs";
import { join } from "node:path";
import entityTemplate from "@/templates/resources/calendar-event/CalendarEventEntity.txt";
import repositoryTemplate from "@/templates/resources/calendar-event/CalendarEventRepository.txt";
import createCalendarEventControllerTemplate from "@/templates/resources/calendar-event/controllers/CreateCalendarEventController.txt";
import deleteCalendarEventControllerTemplate from "@/templates/resources/calendar-event/controllers/DeleteCalendarEventController.txt";
import getCalendarEventControllerTemplate from "@/templates/resources/calendar-event/controllers/GetCalendarEventController.txt";
import listCalendarEventsControllerTemplate from "@/templates/resources/calendar-event/controllers/ListCalendarEventsController.txt";
import updateCalendarEventControllerTemplate from "@/templates/resources/calendar-event/controllers/UpdateCalendarEventController.txt";
import createCalendarEventServiceTemplate from "@/templates/resources/calendar-event/services/CreateCalendarEventService.txt";
import deleteCalendarEventServiceTemplate from "@/templates/resources/calendar-event/services/DeleteCalendarEventService.txt";
import getCalendarEventServiceTemplate from "@/templates/resources/calendar-event/services/GetCalendarEventService.txt";
import listCalendarEventsServiceTemplate from "@/templates/resources/calendar-event/services/ListCalendarEventsService.txt";
import updateCalendarEventServiceTemplate from "@/templates/resources/calendar-event/services/UpdateCalendarEventService.txt";

// Mock enquirer before importing commands
mock.module("enquirer", () => ({
  prompt: mock(() => Promise.resolve({ name: "Test" })),
}));

const { MakeResourceCalendarEventCommand } = await import("@/commands/MakeResourceCalendarEventCommand");

const exists = (path: string) => Bun.file(path).exists();

describe("MakeResourceCalendarEventCommand", () => {
  let command: InstanceType<typeof MakeResourceCalendarEventCommand>;
  let testDir: string;
  let originalCwd: string;
  let originalSpawn: typeof Bun.spawn;

  beforeEach(() => {
    command = new MakeResourceCalendarEventCommand();
    originalCwd = process.cwd();
    testDir = join(originalCwd, ".temp", `resource-calendar-event-${Date.now()}`);

    // Mock Bun.spawn to avoid running bun add in tests
    originalSpawn = Bun.spawn;
    Bun.spawn = ((...args: unknown[]) => {
      const cmd = Array.isArray(args[0]) ? args[0] : (args[0] as { cmd?: string[] })?.cmd;
      if (Array.isArray(cmd) && cmd[0] === "bun" && cmd[1] === "add") {
        return { exited: Promise.resolve(0) } as unknown as ReturnType<typeof Bun.spawn>;
      }
      return originalSpawn.apply(Bun, args as Parameters<typeof Bun.spawn>);
    }) as typeof Bun.spawn;
  });

  afterEach(() => {
    Bun.spawn = originalSpawn;
    process.chdir(originalCwd);
    rmSync(testDir, { recursive: true, force: true });
  });

  describe("Command Metadata", () => {
    test("should return correct command name", () => {
      expect(command.getName()).toBe("make:resource:calendar-event");
    });

    test("should return correct description", () => {
      expect(command.getDescription()).toBe("Generate calendar event resource (entity, migration, repository)");
    });
  });

  describe("run()", () => {
    beforeEach(async () => {
      await Bun.write(join(testDir, ".gitkeep"), "");
      await Bun.write(join(testDir, "package.json"), JSON.stringify({ name: "test", dependencies: {} }));
      process.chdir(testDir);
    });

    test("should create calendar-event module directory structure", async () => {
      await command.run();

      const moduleDir = join(testDir, "modules", "calendar-event");
      expect(await exists(join(moduleDir, "src", "CalendarEventModule.ts"))).toBe(true);
    });

    test("should generate entity file with calendar event template content", async () => {
      await command.run();

      const entityPath = join(testDir, "modules", "calendar-event", "src", "entities", "CalendarEventEntity.ts");
      expect(await exists(entityPath)).toBe(true);

      const content = await Bun.file(entityPath).text();
      expect(content).toBe(entityTemplate);
    });

    test("should generate repository file with calendar event template content", async () => {
      await command.run();

      const repoPath = join(testDir, "modules", "calendar-event", "src", "repositories", "CalendarEventRepository.ts");
      expect(await exists(repoPath)).toBe(true);

      const content = await Bun.file(repoPath).text();
      expect(content).toBe(repositoryTemplate);
    });

    test("should generate migration file with calendar event template content", async () => {
      await command.run();

      const migrationsDir = join(testDir, "modules", "calendar-event", "src", "migrations");
      const glob = new Bun.Glob("Migration*.ts");
      let migrationFound = false;

      for await (const file of glob.scan(migrationsDir)) {
        if (file === "migrations.ts") continue;
        migrationFound = true;
        const content = await Bun.file(join(migrationsDir, file)).text();
        expect(content).toContain("CREATE TABLE IF NOT EXISTS calendar_events");
        expect(content).toContain("idx_calendar_events_title");
        expect(content).not.toContain("{{ name }}");
        expect(content).not.toContain("{{ version }}");
      }

      expect(migrationFound).toBe(true);
    });

    describe("Controllers", () => {
      test("should generate all five controller files", async () => {
        await command.run();

        const controllersDir = join(testDir, "modules", "calendar-event", "src", "controllers");
        expect(await exists(join(controllersDir, "CreateCalendarEventController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "GetCalendarEventController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "ListCalendarEventsController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "UpdateCalendarEventController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "DeleteCalendarEventController.ts"))).toBe(true);
      });

      test("should replace controller contents with calendar event templates", async () => {
        await command.run();

        const controllersDir = join(testDir, "modules", "calendar-event", "src", "controllers");

        const createContent = await Bun.file(join(controllersDir, "CreateCalendarEventController.ts")).text();
        expect(createContent).toBe(createCalendarEventControllerTemplate);

        const getContent = await Bun.file(join(controllersDir, "GetCalendarEventController.ts")).text();
        expect(getContent).toBe(getCalendarEventControllerTemplate);

        const listContent = await Bun.file(join(controllersDir, "ListCalendarEventsController.ts")).text();
        expect(listContent).toBe(listCalendarEventsControllerTemplate);

        const updateContent = await Bun.file(join(controllersDir, "UpdateCalendarEventController.ts")).text();
        expect(updateContent).toBe(updateCalendarEventControllerTemplate);

        const deleteContent = await Bun.file(join(controllersDir, "DeleteCalendarEventController.ts")).text();
        expect(deleteContent).toBe(deleteCalendarEventControllerTemplate);
      });
    });

    describe("Services", () => {
      test("should generate all five service files", async () => {
        await command.run();

        const servicesDir = join(testDir, "modules", "calendar-event", "src", "services");
        expect(await exists(join(servicesDir, "CreateCalendarEventService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "GetCalendarEventService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "ListCalendarEventsService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "UpdateCalendarEventService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "DeleteCalendarEventService.ts"))).toBe(true);
      });

      test("should replace service contents with calendar event templates", async () => {
        await command.run();

        const servicesDir = join(testDir, "modules", "calendar-event", "src", "services");

        const createContent = await Bun.file(join(servicesDir, "CreateCalendarEventService.ts")).text();
        expect(createContent).toBe(createCalendarEventServiceTemplate);

        const getContent = await Bun.file(join(servicesDir, "GetCalendarEventService.ts")).text();
        expect(getContent).toBe(getCalendarEventServiceTemplate);

        const listContent = await Bun.file(join(servicesDir, "ListCalendarEventsService.ts")).text();
        expect(listContent).toBe(listCalendarEventsServiceTemplate);

        const updateContent = await Bun.file(join(servicesDir, "UpdateCalendarEventService.ts")).text();
        expect(updateContent).toBe(updateCalendarEventServiceTemplate);

        const deleteContent = await Bun.file(join(servicesDir, "DeleteCalendarEventService.ts")).text();
        expect(deleteContent).toBe(deleteCalendarEventServiceTemplate);
      });
    });

    test("should generate entity content with CalendarEventEntity class", async () => {
      await command.run();

      const entityPath = join(testDir, "modules", "calendar-event", "src", "entities", "CalendarEventEntity.ts");
      const content = await Bun.file(entityPath).text();
      expect(content).toContain("export class CalendarEventEntity");
      expect(content).toContain('name: "calendar_events"');
    });

    test("should generate repository content with CalendarEventRepository class", async () => {
      await command.run();

      const repoPath = join(testDir, "modules", "calendar-event", "src", "repositories", "CalendarEventRepository.ts");
      const content = await Bun.file(repoPath).text();
      expect(content).toContain("export class CalendarEventRepository");
      expect(content).toContain("CalendarEventEntity");
    });
  });
});
