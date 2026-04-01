import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { rmSync } from "node:fs";
import { join } from "node:path";
import entityTemplate from "@/templates/resources/folder/FolderEntity.txt";
import repositoryTemplate from "@/templates/resources/folder/FolderRepository.txt";
import createFolderControllerTemplate from "@/templates/resources/folder/controllers/CreateFolderController.txt";
import deleteFolderControllerTemplate from "@/templates/resources/folder/controllers/DeleteFolderController.txt";
import getFolderControllerTemplate from "@/templates/resources/folder/controllers/GetFolderController.txt";
import listFoldersControllerTemplate from "@/templates/resources/folder/controllers/ListFoldersController.txt";
import updateFolderControllerTemplate from "@/templates/resources/folder/controllers/UpdateFolderController.txt";
import createFolderServiceTemplate from "@/templates/resources/folder/services/CreateFolderService.txt";
import deleteFolderServiceTemplate from "@/templates/resources/folder/services/DeleteFolderService.txt";
import getFolderServiceTemplate from "@/templates/resources/folder/services/GetFolderService.txt";
import listFoldersServiceTemplate from "@/templates/resources/folder/services/ListFoldersService.txt";
import updateFolderServiceTemplate from "@/templates/resources/folder/services/UpdateFolderService.txt";

// Mock enquirer before importing commands
mock.module("enquirer", () => ({
  prompt: mock(() => Promise.resolve({ name: "Test" })),
}));

const { MakeResourceFolderCommand } = await import("@/commands/MakeResourceFolderCommand");

const exists = (path: string) => Bun.file(path).exists();

describe("MakeResourceFolderCommand", () => {
  let command: InstanceType<typeof MakeResourceFolderCommand>;
  let testDir: string;
  let originalCwd: string;
  let originalSpawn: typeof Bun.spawn;

  beforeEach(() => {
    command = new MakeResourceFolderCommand();
    originalCwd = process.cwd();
    testDir = join(originalCwd, ".temp", `resource-folder-${Date.now()}`);

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
      expect(command.getName()).toBe("make:resource:folder");
    });

    test("should return correct description", () => {
      expect(command.getDescription()).toBe("Generate folder resource (entity, migration, repository)");
    });
  });

  describe("run()", () => {
    beforeEach(async () => {
      await Bun.write(join(testDir, ".gitkeep"), "");
      await Bun.write(join(testDir, "package.json"), JSON.stringify({ name: "test", dependencies: {} }));
      process.chdir(testDir);
    });

    test("should create folder module directory structure", async () => {
      await command.run();

      const moduleDir = join(testDir, "modules", "folder");
      expect(await exists(join(moduleDir, "src", "FolderModule.ts"))).toBe(true);
    });

    test("should generate entity file with folder template content", async () => {
      await command.run();

      const entityPath = join(testDir, "modules", "folder", "src", "entities", "FolderEntity.ts");
      expect(await exists(entityPath)).toBe(true);

      const content = await Bun.file(entityPath).text();
      expect(content).toBe(entityTemplate);
    });

    test("should generate repository file with folder template content", async () => {
      await command.run();

      const repoPath = join(testDir, "modules", "folder", "src", "repositories", "FolderRepository.ts");
      expect(await exists(repoPath)).toBe(true);

      const content = await Bun.file(repoPath).text();
      expect(content).toBe(repositoryTemplate);
    });

    test("should generate migration file with folder template content", async () => {
      await command.run();

      const migrationsDir = join(testDir, "modules", "folder", "src", "migrations");
      const glob = new Bun.Glob("Migration*.ts");
      let migrationFound = false;

      for await (const file of glob.scan(migrationsDir)) {
        if (file === "migrations.ts") continue;
        migrationFound = true;
        const content = await Bun.file(join(migrationsDir, file)).text();
        expect(content).toContain("CREATE TABLE IF NOT EXISTS folders");
        expect(content).toContain("idx_folders_name");
        expect(content).not.toContain("{{ name }}");
        expect(content).not.toContain("{{ version }}");
      }

      expect(migrationFound).toBe(true);
    });

    describe("Controllers", () => {
      test("should generate all five controller files", async () => {
        await command.run();

        const controllersDir = join(testDir, "modules", "folder", "src", "controllers");
        expect(await exists(join(controllersDir, "CreateFolderController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "GetFolderController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "ListFoldersController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "UpdateFolderController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "DeleteFolderController.ts"))).toBe(true);
      });

      test("should replace controller contents with folder templates", async () => {
        await command.run();

        const controllersDir = join(testDir, "modules", "folder", "src", "controllers");

        const createContent = await Bun.file(join(controllersDir, "CreateFolderController.ts")).text();
        expect(createContent).toBe(createFolderControllerTemplate);

        const getContent = await Bun.file(join(controllersDir, "GetFolderController.ts")).text();
        expect(getContent).toBe(getFolderControllerTemplate);

        const listContent = await Bun.file(join(controllersDir, "ListFoldersController.ts")).text();
        expect(listContent).toBe(listFoldersControllerTemplate);

        const updateContent = await Bun.file(join(controllersDir, "UpdateFolderController.ts")).text();
        expect(updateContent).toBe(updateFolderControllerTemplate);

        const deleteContent = await Bun.file(join(controllersDir, "DeleteFolderController.ts")).text();
        expect(deleteContent).toBe(deleteFolderControllerTemplate);
      });
    });

    describe("Services", () => {
      test("should generate all five service files", async () => {
        await command.run();

        const servicesDir = join(testDir, "modules", "folder", "src", "services");
        expect(await exists(join(servicesDir, "CreateFolderService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "GetFolderService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "ListFoldersService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "UpdateFolderService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "DeleteFolderService.ts"))).toBe(true);
      });

      test("should replace service contents with folder templates", async () => {
        await command.run();

        const servicesDir = join(testDir, "modules", "folder", "src", "services");

        const createContent = await Bun.file(join(servicesDir, "CreateFolderService.ts")).text();
        expect(createContent).toBe(createFolderServiceTemplate);

        const getContent = await Bun.file(join(servicesDir, "GetFolderService.ts")).text();
        expect(getContent).toBe(getFolderServiceTemplate);

        const listContent = await Bun.file(join(servicesDir, "ListFoldersService.ts")).text();
        expect(listContent).toBe(listFoldersServiceTemplate);

        const updateContent = await Bun.file(join(servicesDir, "UpdateFolderService.ts")).text();
        expect(updateContent).toBe(updateFolderServiceTemplate);

        const deleteContent = await Bun.file(join(servicesDir, "DeleteFolderService.ts")).text();
        expect(deleteContent).toBe(deleteFolderServiceTemplate);
      });
    });

    test("should generate entity content with FolderEntity class", async () => {
      await command.run();

      const entityPath = join(testDir, "modules", "folder", "src", "entities", "FolderEntity.ts");
      const content = await Bun.file(entityPath).text();
      expect(content).toContain("export class FolderEntity");
      expect(content).toContain('name: "folders"');
    });

    test("should generate repository content with FolderRepository class", async () => {
      await command.run();

      const repoPath = join(testDir, "modules", "folder", "src", "repositories", "FolderRepository.ts");
      const content = await Bun.file(repoPath).text();
      expect(content).toContain("export class FolderRepository");
      expect(content).toContain("FolderEntity");
    });
  });
});
