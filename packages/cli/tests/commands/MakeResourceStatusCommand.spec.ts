import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { rmSync } from "node:fs";
import { join } from "node:path";
import createStatusControllerTemplate from "@/templates/resources/status/controllers/CreateStatusController.txt";
import deleteStatusControllerTemplate from "@/templates/resources/status/controllers/DeleteStatusController.txt";
import getStatusControllerTemplate from "@/templates/resources/status/controllers/GetStatusController.txt";
import listStatusesControllerTemplate from "@/templates/resources/status/controllers/ListStatusesController.txt";
import updateStatusControllerTemplate from "@/templates/resources/status/controllers/UpdateStatusController.txt";
import entityTemplate from "@/templates/resources/status/StatusEntity.txt";
import repositoryTemplate from "@/templates/resources/status/StatusRepository.txt";
import statusSeedTemplate from "@/templates/resources/status/seeds/StatusSeed.txt";
import createStatusServiceTemplate from "@/templates/resources/status/services/CreateStatusService.txt";
import deleteStatusServiceTemplate from "@/templates/resources/status/services/DeleteStatusService.txt";
import getStatusServiceTemplate from "@/templates/resources/status/services/GetStatusService.txt";
import listStatusesServiceTemplate from "@/templates/resources/status/services/ListStatusesService.txt";
import updateStatusServiceTemplate from "@/templates/resources/status/services/UpdateStatusService.txt";

// Mock enquirer before importing commands
mock.module("enquirer", () => ({
  prompt: mock(() => Promise.resolve({ name: "Test" })),
}));

const { MakeResourceStatusCommand } = await import("@/commands/MakeResourceStatusCommand");

const exists = (path: string) => Bun.file(path).exists();

describe("MakeResourceStatusCommand", () => {
  let command: InstanceType<typeof MakeResourceStatusCommand>;
  let testDir: string;
  let originalCwd: string;
  let originalSpawn: typeof Bun.spawn;

  beforeEach(() => {
    command = new MakeResourceStatusCommand();
    originalCwd = process.cwd();
    testDir = join(originalCwd, ".temp", `resource-status-${Date.now()}`);

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
      expect(command.getName()).toBe("make:resource:status");
    });

    test("should return correct description", () => {
      expect(command.getDescription()).toBe("Generate status resource (entity, migration, repository)");
    });
  });

  describe("run()", () => {
    beforeEach(async () => {
      await Bun.write(join(testDir, ".gitkeep"), "");
      await Bun.write(join(testDir, "package.json"), JSON.stringify({ name: "test", dependencies: {} }));
      process.chdir(testDir);
    });

    test("should create status module directory structure", async () => {
      await command.run();

      const moduleDir = join(testDir, "modules", "status");
      expect(await exists(join(moduleDir, "src", "StatusModule.ts"))).toBe(true);
    });

    test("should generate entity file with status template content", async () => {
      await command.run();

      const entityPath = join(testDir, "modules", "status", "src", "entities", "StatusEntity.ts");
      expect(await exists(entityPath)).toBe(true);

      const content = await Bun.file(entityPath).text();
      expect(content).toBe(entityTemplate);
    });

    test("should generate repository file with status template content", async () => {
      await command.run();

      const repoPath = join(testDir, "modules", "status", "src", "repositories", "StatusRepository.ts");
      expect(await exists(repoPath)).toBe(true);

      const content = await Bun.file(repoPath).text();
      expect(content).toBe(repositoryTemplate);
    });

    test("should generate migration file with status template content", async () => {
      await command.run();

      const migrationsDir = join(testDir, "modules", "status", "src", "migrations");
      const glob = new Bun.Glob("Migration*.ts");
      let migrationFound = false;

      for await (const file of glob.scan(migrationsDir)) {
        if (file === "migrations.ts") continue;
        migrationFound = true;
        const content = await Bun.file(join(migrationsDir, file)).text();
        expect(content).toContain("CREATE TABLE IF NOT EXISTS statuses");
        expect(content).toContain("idx_statuses_name");
        expect(content).not.toContain("{{ name }}");
        expect(content).not.toContain("{{ version }}");
      }

      expect(migrationFound).toBe(true);
    });

    describe("Controllers", () => {
      test("should generate all five controller files", async () => {
        await command.run();

        const controllersDir = join(testDir, "modules", "status", "src", "controllers");
        expect(await exists(join(controllersDir, "CreateStatusController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "GetStatusController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "ListStatusesController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "UpdateStatusController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "DeleteStatusController.ts"))).toBe(true);
      });

      test("should replace controller contents with status templates", async () => {
        await command.run();

        const controllersDir = join(testDir, "modules", "status", "src", "controllers");

        const createContent = await Bun.file(join(controllersDir, "CreateStatusController.ts")).text();
        expect(createContent).toBe(createStatusControllerTemplate);

        const getContent = await Bun.file(join(controllersDir, "GetStatusController.ts")).text();
        expect(getContent).toBe(getStatusControllerTemplate);

        const listContent = await Bun.file(join(controllersDir, "ListStatusesController.ts")).text();
        expect(listContent).toBe(listStatusesControllerTemplate);

        const updateContent = await Bun.file(join(controllersDir, "UpdateStatusController.ts")).text();
        expect(updateContent).toBe(updateStatusControllerTemplate);

        const deleteContent = await Bun.file(join(controllersDir, "DeleteStatusController.ts")).text();
        expect(deleteContent).toBe(deleteStatusControllerTemplate);
      });
    });

    describe("Services", () => {
      test("should generate all five service files", async () => {
        await command.run();

        const servicesDir = join(testDir, "modules", "status", "src", "services");
        expect(await exists(join(servicesDir, "CreateStatusService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "GetStatusService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "ListStatusesService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "UpdateStatusService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "DeleteStatusService.ts"))).toBe(true);
      });

      test("should replace service contents with status templates", async () => {
        await command.run();

        const servicesDir = join(testDir, "modules", "status", "src", "services");

        const createContent = await Bun.file(join(servicesDir, "CreateStatusService.ts")).text();
        expect(createContent).toBe(createStatusServiceTemplate);

        const getContent = await Bun.file(join(servicesDir, "GetStatusService.ts")).text();
        expect(getContent).toBe(getStatusServiceTemplate);

        const listContent = await Bun.file(join(servicesDir, "ListStatusesService.ts")).text();
        expect(listContent).toBe(listStatusesServiceTemplate);

        const updateContent = await Bun.file(join(servicesDir, "UpdateStatusService.ts")).text();
        expect(updateContent).toBe(updateStatusServiceTemplate);

        const deleteContent = await Bun.file(join(servicesDir, "DeleteStatusService.ts")).text();
        expect(deleteContent).toBe(deleteStatusServiceTemplate);
      });
    });

    describe("Seeds", () => {
      test("should generate seed file with status template content", async () => {
        await command.run();

        const seedPath = join(testDir, "modules", "status", "src", "seeds", "StatusSeed.ts");
        expect(await exists(seedPath)).toBe(true);

        const content = await Bun.file(seedPath).text();
        expect(content).toBe(statusSeedTemplate);
      });

      test("should generate seed data.yml file", async () => {
        await command.run();

        const dataPath = join(testDir, "modules", "status", "src", "seeds", "data.yml");
        expect(await exists(dataPath)).toBe(true);

        const content = await Bun.file(dataPath).text();
        expect(content).toContain("name:");
      });
    });

    test("should generate entity content with StatusEntity class", async () => {
      await command.run();

      const entityPath = join(testDir, "modules", "status", "src", "entities", "StatusEntity.ts");
      const content = await Bun.file(entityPath).text();
      expect(content).toContain("export class StatusEntity");
      expect(content).toContain('name: "statuses"');
    });

    test("should generate repository content with StatusRepository class", async () => {
      await command.run();

      const repoPath = join(testDir, "modules", "status", "src", "repositories", "StatusRepository.ts");
      const content = await Bun.file(repoPath).text();
      expect(content).toContain("export class StatusRepository");
      expect(content).toContain("StatusEntity");
    });
  });
});
