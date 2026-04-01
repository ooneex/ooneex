import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { rmSync } from "node:fs";
import { join } from "node:path";
import entityTemplate from "@/templates/resources/category/CategoryEntity.txt";
import repositoryTemplate from "@/templates/resources/category/CategoryRepository.txt";
import createCategoryControllerTemplate from "@/templates/resources/category/controllers/CreateCategoryController.txt";
import deleteCategoryControllerTemplate from "@/templates/resources/category/controllers/DeleteCategoryController.txt";
import getCategoryControllerTemplate from "@/templates/resources/category/controllers/GetCategoryController.txt";
import listCategoriesControllerTemplate from "@/templates/resources/category/controllers/ListCategoriesController.txt";
import updateCategoryControllerTemplate from "@/templates/resources/category/controllers/UpdateCategoryController.txt";
import createCategoryServiceTemplate from "@/templates/resources/category/services/CreateCategoryService.txt";
import deleteCategoryServiceTemplate from "@/templates/resources/category/services/DeleteCategoryService.txt";
import getCategoryServiceTemplate from "@/templates/resources/category/services/GetCategoryService.txt";
import listCategoriesServiceTemplate from "@/templates/resources/category/services/ListCategoriesService.txt";
import updateCategoryServiceTemplate from "@/templates/resources/category/services/UpdateCategoryService.txt";

// Mock enquirer before importing commands
mock.module("enquirer", () => ({
  prompt: mock(() => Promise.resolve({ name: "Test" })),
}));

const { MakeResourceCategoryCommand } = await import("@/commands/MakeResourceCategoryCommand");

const exists = (path: string) => Bun.file(path).exists();

describe("MakeResourceCategoryCommand", () => {
  let command: InstanceType<typeof MakeResourceCategoryCommand>;
  let testDir: string;
  let originalCwd: string;
  let originalSpawn: typeof Bun.spawn;

  beforeEach(() => {
    command = new MakeResourceCategoryCommand();
    originalCwd = process.cwd();
    testDir = join(originalCwd, ".temp", `resource-category-${Date.now()}`);

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
      expect(command.getName()).toBe("make:resource:category");
    });

    test("should return correct description", () => {
      expect(command.getDescription()).toBe("Generate category resource (entity, migration, repository)");
    });
  });

  describe("run()", () => {
    beforeEach(async () => {
      await Bun.write(join(testDir, ".gitkeep"), "");
      await Bun.write(join(testDir, "package.json"), JSON.stringify({ name: "test", dependencies: {} }));
      process.chdir(testDir);
    });

    test("should create category module directory structure", async () => {
      await command.run();

      const moduleDir = join(testDir, "modules", "category");
      expect(await exists(join(moduleDir, "src", "CategoryModule.ts"))).toBe(true);
    });

    test("should generate entity file with category template content", async () => {
      await command.run();

      const entityPath = join(testDir, "modules", "category", "src", "entities", "CategoryEntity.ts");
      expect(await exists(entityPath)).toBe(true);

      const content = await Bun.file(entityPath).text();
      expect(content).toBe(entityTemplate);
    });

    test("should generate repository file with category template content", async () => {
      await command.run();

      const repoPath = join(testDir, "modules", "category", "src", "repositories", "CategoryRepository.ts");
      expect(await exists(repoPath)).toBe(true);

      const content = await Bun.file(repoPath).text();
      expect(content).toBe(repositoryTemplate);
    });

    test("should generate migration file with category template content", async () => {
      await command.run();

      const migrationsDir = join(testDir, "modules", "category", "src", "migrations");
      const glob = new Bun.Glob("Migration*.ts");
      let migrationFound = false;

      for await (const file of glob.scan(migrationsDir)) {
        if (file === "migrations.ts") continue;
        migrationFound = true;
        const content = await Bun.file(join(migrationsDir, file)).text();
        expect(content).toContain("CREATE TABLE IF NOT EXISTS categories");
        expect(content).toContain("idx_categories_name");
        expect(content).not.toContain("{{ name }}");
        expect(content).not.toContain("{{ version }}");
      }

      expect(migrationFound).toBe(true);
    });

    describe("Controllers", () => {
      test("should generate all five controller files", async () => {
        await command.run();

        const controllersDir = join(testDir, "modules", "category", "src", "controllers");
        expect(await exists(join(controllersDir, "CreateCategoryController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "GetCategoryController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "ListCategoriesController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "UpdateCategoryController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "DeleteCategoryController.ts"))).toBe(true);
      });

      test("should replace controller contents with category templates", async () => {
        await command.run();

        const controllersDir = join(testDir, "modules", "category", "src", "controllers");

        const createContent = await Bun.file(join(controllersDir, "CreateCategoryController.ts")).text();
        expect(createContent).toBe(createCategoryControllerTemplate);

        const getContent = await Bun.file(join(controllersDir, "GetCategoryController.ts")).text();
        expect(getContent).toBe(getCategoryControllerTemplate);

        const listContent = await Bun.file(join(controllersDir, "ListCategoriesController.ts")).text();
        expect(listContent).toBe(listCategoriesControllerTemplate);

        const updateContent = await Bun.file(join(controllersDir, "UpdateCategoryController.ts")).text();
        expect(updateContent).toBe(updateCategoryControllerTemplate);

        const deleteContent = await Bun.file(join(controllersDir, "DeleteCategoryController.ts")).text();
        expect(deleteContent).toBe(deleteCategoryControllerTemplate);
      });
    });

    describe("Services", () => {
      test("should generate all five service files", async () => {
        await command.run();

        const servicesDir = join(testDir, "modules", "category", "src", "services");
        expect(await exists(join(servicesDir, "CreateCategoryService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "GetCategoryService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "ListCategoriesService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "UpdateCategoryService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "DeleteCategoryService.ts"))).toBe(true);
      });

      test("should replace service contents with category templates", async () => {
        await command.run();

        const servicesDir = join(testDir, "modules", "category", "src", "services");

        const createContent = await Bun.file(join(servicesDir, "CreateCategoryService.ts")).text();
        expect(createContent).toBe(createCategoryServiceTemplate);

        const getContent = await Bun.file(join(servicesDir, "GetCategoryService.ts")).text();
        expect(getContent).toBe(getCategoryServiceTemplate);

        const listContent = await Bun.file(join(servicesDir, "ListCategoriesService.ts")).text();
        expect(listContent).toBe(listCategoriesServiceTemplate);

        const updateContent = await Bun.file(join(servicesDir, "UpdateCategoryService.ts")).text();
        expect(updateContent).toBe(updateCategoryServiceTemplate);

        const deleteContent = await Bun.file(join(servicesDir, "DeleteCategoryService.ts")).text();
        expect(deleteContent).toBe(deleteCategoryServiceTemplate);
      });
    });

    test("should generate entity content with CategoryEntity class", async () => {
      await command.run();

      const entityPath = join(testDir, "modules", "category", "src", "entities", "CategoryEntity.ts");
      const content = await Bun.file(entityPath).text();
      expect(content).toContain("export class CategoryEntity");
      expect(content).toContain('name: "categories"');
    });

    test("should generate repository content with CategoryRepository class", async () => {
      await command.run();

      const repoPath = join(testDir, "modules", "category", "src", "repositories", "CategoryRepository.ts");
      const content = await Bun.file(repoPath).text();
      expect(content).toContain("export class CategoryRepository");
      expect(content).toContain("CategoryEntity");
    });
  });
});
