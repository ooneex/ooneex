import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { rmSync } from "node:fs";
import { join } from "node:path";
import entityTemplate from "@/templates/resources/book/BookEntity.txt";
import repositoryTemplate from "@/templates/resources/book/BookRepository.txt";
import createBookControllerTemplate from "@/templates/resources/book/controllers/CreateBookController.txt";
import deleteBookControllerTemplate from "@/templates/resources/book/controllers/DeleteBookController.txt";
import getBookControllerTemplate from "@/templates/resources/book/controllers/GetBookController.txt";
import listBooksControllerTemplate from "@/templates/resources/book/controllers/ListBooksController.txt";
import updateBookControllerTemplate from "@/templates/resources/book/controllers/UpdateBookController.txt";
import createBookServiceTemplate from "@/templates/resources/book/services/CreateBookService.txt";
import deleteBookServiceTemplate from "@/templates/resources/book/services/DeleteBookService.txt";
import getBookServiceTemplate from "@/templates/resources/book/services/GetBookService.txt";
import listBooksServiceTemplate from "@/templates/resources/book/services/ListBooksService.txt";
import updateBookServiceTemplate from "@/templates/resources/book/services/UpdateBookService.txt";

// Mock enquirer before importing commands
mock.module("enquirer", () => ({
  prompt: mock(() => Promise.resolve({ name: "Test" })),
}));

const { MakeResourceBookCommand } = await import("@/commands/MakeResourceBookCommand");

const exists = (path: string) => Bun.file(path).exists();

describe("MakeResourceBookCommand", () => {
  let command: InstanceType<typeof MakeResourceBookCommand>;
  let testDir: string;
  let originalCwd: string;
  let originalSpawn: typeof Bun.spawn;

  beforeEach(() => {
    command = new MakeResourceBookCommand();
    originalCwd = process.cwd();
    testDir = join(originalCwd, ".temp", `resource-book-${Date.now()}`);

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
      expect(command.getName()).toBe("make:resource:book");
    });

    test("should return correct description", () => {
      expect(command.getDescription()).toBe("Generate book resource (entity, migration, repository)");
    });
  });

  describe("run()", () => {
    beforeEach(async () => {
      await Bun.write(join(testDir, ".gitkeep"), "");
      await Bun.write(join(testDir, "package.json"), JSON.stringify({ name: "test", dependencies: {} }));
      process.chdir(testDir);
    });

    test("should create book module directory structure", async () => {
      await command.run();

      const moduleDir = join(testDir, "modules", "book");
      expect(await exists(join(moduleDir, "src", "BookModule.ts"))).toBe(true);
    });

    test("should generate entity file with book template content", async () => {
      await command.run();

      const entityPath = join(testDir, "modules", "book", "src", "entities", "BookEntity.ts");
      expect(await exists(entityPath)).toBe(true);

      const content = await Bun.file(entityPath).text();
      expect(content).toBe(entityTemplate);
    });

    test("should generate repository file with book template content", async () => {
      await command.run();

      const repoPath = join(testDir, "modules", "book", "src", "repositories", "BookRepository.ts");
      expect(await exists(repoPath)).toBe(true);

      const content = await Bun.file(repoPath).text();
      expect(content).toBe(repositoryTemplate);
    });

    test("should generate migration file with book template content", async () => {
      await command.run();

      const migrationsDir = join(testDir, "modules", "book", "src", "migrations");
      const glob = new Bun.Glob("Migration*.ts");
      let migrationFound = false;

      for await (const file of glob.scan(migrationsDir)) {
        if (file === "migrations.ts") continue;
        migrationFound = true;
        const content = await Bun.file(join(migrationsDir, file)).text();
        expect(content).toContain("CREATE TABLE IF NOT EXISTS books");
        expect(content).toContain("idx_books_title");
        expect(content).not.toContain("{{ name }}");
        expect(content).not.toContain("{{ version }}");
      }

      expect(migrationFound).toBe(true);
    });

    describe("Controllers", () => {
      test("should generate all five controller files", async () => {
        await command.run();

        const controllersDir = join(testDir, "modules", "book", "src", "controllers");
        expect(await exists(join(controllersDir, "CreateBookController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "GetBookController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "ListBooksController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "UpdateBookController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "DeleteBookController.ts"))).toBe(true);
      });

      test("should replace controller contents with book templates", async () => {
        await command.run();

        const controllersDir = join(testDir, "modules", "book", "src", "controllers");

        const createContent = await Bun.file(join(controllersDir, "CreateBookController.ts")).text();
        expect(createContent).toBe(createBookControllerTemplate);

        const getContent = await Bun.file(join(controllersDir, "GetBookController.ts")).text();
        expect(getContent).toBe(getBookControllerTemplate);

        const listContent = await Bun.file(join(controllersDir, "ListBooksController.ts")).text();
        expect(listContent).toBe(listBooksControllerTemplate);

        const updateContent = await Bun.file(join(controllersDir, "UpdateBookController.ts")).text();
        expect(updateContent).toBe(updateBookControllerTemplate);

        const deleteContent = await Bun.file(join(controllersDir, "DeleteBookController.ts")).text();
        expect(deleteContent).toBe(deleteBookControllerTemplate);
      });
    });

    describe("Services", () => {
      test("should generate all five service files", async () => {
        await command.run();

        const servicesDir = join(testDir, "modules", "book", "src", "services");
        expect(await exists(join(servicesDir, "CreateBookService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "GetBookService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "ListBooksService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "UpdateBookService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "DeleteBookService.ts"))).toBe(true);
      });

      test("should replace service contents with book templates", async () => {
        await command.run();

        const servicesDir = join(testDir, "modules", "book", "src", "services");

        const createContent = await Bun.file(join(servicesDir, "CreateBookService.ts")).text();
        expect(createContent).toBe(createBookServiceTemplate);

        const getContent = await Bun.file(join(servicesDir, "GetBookService.ts")).text();
        expect(getContent).toBe(getBookServiceTemplate);

        const listContent = await Bun.file(join(servicesDir, "ListBooksService.ts")).text();
        expect(listContent).toBe(listBooksServiceTemplate);

        const updateContent = await Bun.file(join(servicesDir, "UpdateBookService.ts")).text();
        expect(updateContent).toBe(updateBookServiceTemplate);

        const deleteContent = await Bun.file(join(servicesDir, "DeleteBookService.ts")).text();
        expect(deleteContent).toBe(deleteBookServiceTemplate);
      });
    });

    test("should generate entity content with BookEntity class", async () => {
      await command.run();

      const entityPath = join(testDir, "modules", "book", "src", "entities", "BookEntity.ts");
      const content = await Bun.file(entityPath).text();
      expect(content).toContain("export class BookEntity");
      expect(content).toContain('name: "books"');
    });

    test("should generate repository content with BookRepository class", async () => {
      await command.run();

      const repoPath = join(testDir, "modules", "book", "src", "repositories", "BookRepository.ts");
      const content = await Bun.file(repoPath).text();
      expect(content).toContain("export class BookRepository");
      expect(content).toContain("BookEntity");
    });
  });
});
