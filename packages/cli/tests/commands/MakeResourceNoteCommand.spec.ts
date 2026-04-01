import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { rmSync } from "node:fs";
import { join } from "node:path";
import createNoteControllerTemplate from "@/templates/resources/note/controllers/CreateNoteController.txt";
import deleteNoteControllerTemplate from "@/templates/resources/note/controllers/DeleteNoteController.txt";
import getNoteControllerTemplate from "@/templates/resources/note/controllers/GetNoteController.txt";
import listNotesControllerTemplate from "@/templates/resources/note/controllers/ListNotesController.txt";
import updateNoteControllerTemplate from "@/templates/resources/note/controllers/UpdateNoteController.txt";
import entityTemplate from "@/templates/resources/note/NoteEntity.txt";
import repositoryTemplate from "@/templates/resources/note/NoteRepository.txt";
import createNoteServiceTemplate from "@/templates/resources/note/services/CreateNoteService.txt";
import deleteNoteServiceTemplate from "@/templates/resources/note/services/DeleteNoteService.txt";
import getNoteServiceTemplate from "@/templates/resources/note/services/GetNoteService.txt";
import listNotesServiceTemplate from "@/templates/resources/note/services/ListNotesService.txt";
import updateNoteServiceTemplate from "@/templates/resources/note/services/UpdateNoteService.txt";

// Mock enquirer before importing commands
mock.module("enquirer", () => ({
  prompt: mock(() => Promise.resolve({ name: "Test" })),
}));

const { MakeResourceNoteCommand } = await import("@/commands/MakeResourceNoteCommand");

const exists = (path: string) => Bun.file(path).exists();

describe("MakeResourceNoteCommand", () => {
  let command: InstanceType<typeof MakeResourceNoteCommand>;
  let testDir: string;
  let originalCwd: string;
  let originalSpawn: typeof Bun.spawn;

  beforeEach(() => {
    command = new MakeResourceNoteCommand();
    originalCwd = process.cwd();
    testDir = join(originalCwd, ".temp", `resource-note-${Date.now()}`);

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
      expect(command.getName()).toBe("make:resource:note");
    });

    test("should return correct description", () => {
      expect(command.getDescription()).toBe("Generate note resource (entity, migration, repository)");
    });
  });

  describe("run()", () => {
    beforeEach(async () => {
      await Bun.write(join(testDir, ".gitkeep"), "");
      await Bun.write(join(testDir, "package.json"), JSON.stringify({ name: "test", dependencies: {} }));
      process.chdir(testDir);
    });

    test("should create note module directory structure", async () => {
      await command.run();

      const moduleDir = join(testDir, "modules", "note");
      expect(await exists(join(moduleDir, "src", "NoteModule.ts"))).toBe(true);
    });

    test("should generate entity file with note template content", async () => {
      await command.run();

      const entityPath = join(testDir, "modules", "note", "src", "entities", "NoteEntity.ts");
      expect(await exists(entityPath)).toBe(true);

      const content = await Bun.file(entityPath).text();
      expect(content).toBe(entityTemplate);
    });

    test("should generate repository file with note template content", async () => {
      await command.run();

      const repoPath = join(testDir, "modules", "note", "src", "repositories", "NoteRepository.ts");
      expect(await exists(repoPath)).toBe(true);

      const content = await Bun.file(repoPath).text();
      expect(content).toBe(repositoryTemplate);
    });

    test("should generate migration file with note template content", async () => {
      await command.run();

      const migrationsDir = join(testDir, "modules", "note", "src", "migrations");
      const glob = new Bun.Glob("Migration*.ts");
      let migrationFound = false;

      for await (const file of glob.scan(migrationsDir)) {
        if (file === "migrations.ts") continue;
        migrationFound = true;
        const content = await Bun.file(join(migrationsDir, file)).text();
        expect(content).toContain("CREATE TABLE IF NOT EXISTS notes");
        expect(content).toContain("idx_notes_title");
        expect(content).not.toContain("{{ name }}");
        expect(content).not.toContain("{{ version }}");
      }

      expect(migrationFound).toBe(true);
    });

    describe("Controllers", () => {
      test("should generate all five controller files", async () => {
        await command.run();

        const controllersDir = join(testDir, "modules", "note", "src", "controllers");
        expect(await exists(join(controllersDir, "CreateNoteController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "GetNoteController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "ListNotesController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "UpdateNoteController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "DeleteNoteController.ts"))).toBe(true);
      });

      test("should replace controller contents with note templates", async () => {
        await command.run();

        const controllersDir = join(testDir, "modules", "note", "src", "controllers");

        const createContent = await Bun.file(join(controllersDir, "CreateNoteController.ts")).text();
        expect(createContent).toBe(createNoteControllerTemplate);

        const getContent = await Bun.file(join(controllersDir, "GetNoteController.ts")).text();
        expect(getContent).toBe(getNoteControllerTemplate);

        const listContent = await Bun.file(join(controllersDir, "ListNotesController.ts")).text();
        expect(listContent).toBe(listNotesControllerTemplate);

        const updateContent = await Bun.file(join(controllersDir, "UpdateNoteController.ts")).text();
        expect(updateContent).toBe(updateNoteControllerTemplate);

        const deleteContent = await Bun.file(join(controllersDir, "DeleteNoteController.ts")).text();
        expect(deleteContent).toBe(deleteNoteControllerTemplate);
      });
    });

    describe("Services", () => {
      test("should generate all five service files", async () => {
        await command.run();

        const servicesDir = join(testDir, "modules", "note", "src", "services");
        expect(await exists(join(servicesDir, "CreateNoteService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "GetNoteService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "ListNotesService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "UpdateNoteService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "DeleteNoteService.ts"))).toBe(true);
      });

      test("should replace service contents with note templates", async () => {
        await command.run();

        const servicesDir = join(testDir, "modules", "note", "src", "services");

        const createContent = await Bun.file(join(servicesDir, "CreateNoteService.ts")).text();
        expect(createContent).toBe(createNoteServiceTemplate);

        const getContent = await Bun.file(join(servicesDir, "GetNoteService.ts")).text();
        expect(getContent).toBe(getNoteServiceTemplate);

        const listContent = await Bun.file(join(servicesDir, "ListNotesService.ts")).text();
        expect(listContent).toBe(listNotesServiceTemplate);

        const updateContent = await Bun.file(join(servicesDir, "UpdateNoteService.ts")).text();
        expect(updateContent).toBe(updateNoteServiceTemplate);

        const deleteContent = await Bun.file(join(servicesDir, "DeleteNoteService.ts")).text();
        expect(deleteContent).toBe(deleteNoteServiceTemplate);
      });
    });

    test("should generate entity content with NoteEntity class", async () => {
      await command.run();

      const entityPath = join(testDir, "modules", "note", "src", "entities", "NoteEntity.ts");
      const content = await Bun.file(entityPath).text();
      expect(content).toContain("export class NoteEntity");
      expect(content).toContain('name: "notes"');
    });

    test("should generate repository content with NoteRepository class", async () => {
      await command.run();

      const repoPath = join(testDir, "modules", "note", "src", "repositories", "NoteRepository.ts");
      const content = await Bun.file(repoPath).text();
      expect(content).toContain("export class NoteRepository");
      expect(content).toContain("NoteEntity");
    });
  });
});
