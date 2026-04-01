import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { rmSync } from "node:fs";
import { join } from "node:path";
import createTaskControllerTemplate from "@/templates/resources/task/controllers/CreateTaskController.txt";
import deleteTaskControllerTemplate from "@/templates/resources/task/controllers/DeleteTaskController.txt";
import getTaskControllerTemplate from "@/templates/resources/task/controllers/GetTaskController.txt";
import listTasksControllerTemplate from "@/templates/resources/task/controllers/ListTasksController.txt";
import updateTaskControllerTemplate from "@/templates/resources/task/controllers/UpdateTaskController.txt";
import createTaskServiceTemplate from "@/templates/resources/task/services/CreateTaskService.txt";
import deleteTaskServiceTemplate from "@/templates/resources/task/services/DeleteTaskService.txt";
import getTaskServiceTemplate from "@/templates/resources/task/services/GetTaskService.txt";
import listTasksServiceTemplate from "@/templates/resources/task/services/ListTasksService.txt";
import updateTaskServiceTemplate from "@/templates/resources/task/services/UpdateTaskService.txt";
import entityTemplate from "@/templates/resources/task/TaskEntity.txt";
import repositoryTemplate from "@/templates/resources/task/TaskRepository.txt";

// Mock enquirer before importing commands
mock.module("enquirer", () => ({
  prompt: mock(() => Promise.resolve({ name: "Test" })),
}));

const { MakeResourceTaskCommand } = await import("@/commands/MakeResourceTaskCommand");

const exists = (path: string) => Bun.file(path).exists();

describe("MakeResourceTaskCommand", () => {
  let command: InstanceType<typeof MakeResourceTaskCommand>;
  let testDir: string;
  let originalCwd: string;
  let originalSpawn: typeof Bun.spawn;

  beforeEach(() => {
    command = new MakeResourceTaskCommand();
    originalCwd = process.cwd();
    testDir = join(originalCwd, ".temp", `resource-task-${Date.now()}`);

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
      expect(command.getName()).toBe("make:resource:task");
    });

    test("should return correct description", () => {
      expect(command.getDescription()).toBe("Generate task resource (entity, migration, repository)");
    });
  });

  describe("run()", () => {
    beforeEach(async () => {
      await Bun.write(join(testDir, ".gitkeep"), "");
      await Bun.write(join(testDir, "package.json"), JSON.stringify({ name: "test", dependencies: {} }));
      process.chdir(testDir);
    });

    test("should create task module directory structure", async () => {
      await command.run();

      const moduleDir = join(testDir, "modules", "task");
      expect(await exists(join(moduleDir, "src", "TaskModule.ts"))).toBe(true);
    });

    test("should generate entity file with task template content", async () => {
      await command.run();

      const entityPath = join(testDir, "modules", "task", "src", "entities", "TaskEntity.ts");
      expect(await exists(entityPath)).toBe(true);

      const content = await Bun.file(entityPath).text();
      expect(content).toBe(entityTemplate);
    });

    test("should generate repository file with task template content", async () => {
      await command.run();

      const repoPath = join(testDir, "modules", "task", "src", "repositories", "TaskRepository.ts");
      expect(await exists(repoPath)).toBe(true);

      const content = await Bun.file(repoPath).text();
      expect(content).toBe(repositoryTemplate);
    });

    test("should generate migration file with task template content", async () => {
      await command.run();

      const migrationsDir = join(testDir, "modules", "task", "src", "migrations");
      const glob = new Bun.Glob("Migration*.ts");
      let migrationFound = false;

      for await (const file of glob.scan(migrationsDir)) {
        if (file === "migrations.ts") continue;
        migrationFound = true;
        const content = await Bun.file(join(migrationsDir, file)).text();
        expect(content).toContain("CREATE TABLE IF NOT EXISTS tasks");
        expect(content).toContain("idx_tasks_title");
        expect(content).not.toContain("{{ name }}");
        expect(content).not.toContain("{{ version }}");
      }

      expect(migrationFound).toBe(true);
    });

    describe("Controllers", () => {
      test("should generate all five controller files", async () => {
        await command.run();

        const controllersDir = join(testDir, "modules", "task", "src", "controllers");
        expect(await exists(join(controllersDir, "CreateTaskController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "GetTaskController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "ListTasksController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "UpdateTaskController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "DeleteTaskController.ts"))).toBe(true);
      });

      test("should replace controller contents with task templates", async () => {
        await command.run();

        const controllersDir = join(testDir, "modules", "task", "src", "controllers");

        const createContent = await Bun.file(join(controllersDir, "CreateTaskController.ts")).text();
        expect(createContent).toBe(createTaskControllerTemplate);

        const getContent = await Bun.file(join(controllersDir, "GetTaskController.ts")).text();
        expect(getContent).toBe(getTaskControllerTemplate);

        const listContent = await Bun.file(join(controllersDir, "ListTasksController.ts")).text();
        expect(listContent).toBe(listTasksControllerTemplate);

        const updateContent = await Bun.file(join(controllersDir, "UpdateTaskController.ts")).text();
        expect(updateContent).toBe(updateTaskControllerTemplate);

        const deleteContent = await Bun.file(join(controllersDir, "DeleteTaskController.ts")).text();
        expect(deleteContent).toBe(deleteTaskControllerTemplate);
      });
    });

    describe("Services", () => {
      test("should generate all five service files", async () => {
        await command.run();

        const servicesDir = join(testDir, "modules", "task", "src", "services");
        expect(await exists(join(servicesDir, "CreateTaskService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "GetTaskService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "ListTasksService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "UpdateTaskService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "DeleteTaskService.ts"))).toBe(true);
      });

      test("should replace service contents with task templates", async () => {
        await command.run();

        const servicesDir = join(testDir, "modules", "task", "src", "services");

        const createContent = await Bun.file(join(servicesDir, "CreateTaskService.ts")).text();
        expect(createContent).toBe(createTaskServiceTemplate);

        const getContent = await Bun.file(join(servicesDir, "GetTaskService.ts")).text();
        expect(getContent).toBe(getTaskServiceTemplate);

        const listContent = await Bun.file(join(servicesDir, "ListTasksService.ts")).text();
        expect(listContent).toBe(listTasksServiceTemplate);

        const updateContent = await Bun.file(join(servicesDir, "UpdateTaskService.ts")).text();
        expect(updateContent).toBe(updateTaskServiceTemplate);

        const deleteContent = await Bun.file(join(servicesDir, "DeleteTaskService.ts")).text();
        expect(deleteContent).toBe(deleteTaskServiceTemplate);
      });
    });

    test("should generate entity content with TaskEntity class", async () => {
      await command.run();

      const entityPath = join(testDir, "modules", "task", "src", "entities", "TaskEntity.ts");
      const content = await Bun.file(entityPath).text();
      expect(content).toContain("export class TaskEntity");
      expect(content).toContain('name: "tasks"');
    });

    test("should generate repository content with TaskRepository class", async () => {
      await command.run();

      const repoPath = join(testDir, "modules", "task", "src", "repositories", "TaskRepository.ts");
      const content = await Bun.file(repoPath).text();
      expect(content).toContain("export class TaskRepository");
      expect(content).toContain("TaskEntity");
    });
  });
});
