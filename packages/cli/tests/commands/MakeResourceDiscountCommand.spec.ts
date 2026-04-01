import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { rmSync } from "node:fs";
import { join } from "node:path";
import createDiscountControllerTemplate from "@/templates/resources/discount/controllers/CreateDiscountController.txt";
import deleteDiscountControllerTemplate from "@/templates/resources/discount/controllers/DeleteDiscountController.txt";
import getDiscountControllerTemplate from "@/templates/resources/discount/controllers/GetDiscountController.txt";
import listDiscountsControllerTemplate from "@/templates/resources/discount/controllers/ListDiscountsController.txt";
import updateDiscountControllerTemplate from "@/templates/resources/discount/controllers/UpdateDiscountController.txt";
import entityTemplate from "@/templates/resources/discount/DiscountEntity.txt";
import repositoryTemplate from "@/templates/resources/discount/DiscountRepository.txt";
import createDiscountServiceTemplate from "@/templates/resources/discount/services/CreateDiscountService.txt";
import deleteDiscountServiceTemplate from "@/templates/resources/discount/services/DeleteDiscountService.txt";
import getDiscountServiceTemplate from "@/templates/resources/discount/services/GetDiscountService.txt";
import listDiscountsServiceTemplate from "@/templates/resources/discount/services/ListDiscountsService.txt";
import updateDiscountServiceTemplate from "@/templates/resources/discount/services/UpdateDiscountService.txt";

// Mock enquirer before importing commands
mock.module("enquirer", () => ({
  prompt: mock(() => Promise.resolve({ name: "Test" })),
}));

const { MakeResourceDiscountCommand } = await import("@/commands/MakeResourceDiscountCommand");

const exists = (path: string) => Bun.file(path).exists();

describe("MakeResourceDiscountCommand", () => {
  let command: InstanceType<typeof MakeResourceDiscountCommand>;
  let testDir: string;
  let originalCwd: string;
  let originalSpawn: typeof Bun.spawn;

  beforeEach(() => {
    command = new MakeResourceDiscountCommand();
    originalCwd = process.cwd();
    testDir = join(originalCwd, ".temp", `resource-discount-${Date.now()}`);

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
      expect(command.getName()).toBe("make:resource:discount");
    });

    test("should return correct description", () => {
      expect(command.getDescription()).toBe("Generate discount resource (entity, migration, repository)");
    });
  });

  describe("run()", () => {
    beforeEach(async () => {
      await Bun.write(join(testDir, ".gitkeep"), "");
      await Bun.write(join(testDir, "package.json"), JSON.stringify({ name: "test", dependencies: {} }));
      process.chdir(testDir);
    });

    test("should create discount module directory structure", async () => {
      await command.run();

      const moduleDir = join(testDir, "modules", "discount");
      expect(await exists(join(moduleDir, "src", "DiscountModule.ts"))).toBe(true);
    });

    test("should generate entity file with discount template content", async () => {
      await command.run();

      const entityPath = join(testDir, "modules", "discount", "src", "entities", "DiscountEntity.ts");
      expect(await exists(entityPath)).toBe(true);

      const content = await Bun.file(entityPath).text();
      expect(content).toBe(entityTemplate);
    });

    test("should generate repository file with discount template content", async () => {
      await command.run();

      const repoPath = join(testDir, "modules", "discount", "src", "repositories", "DiscountRepository.ts");
      expect(await exists(repoPath)).toBe(true);

      const content = await Bun.file(repoPath).text();
      expect(content).toBe(repositoryTemplate);
    });

    test("should generate migration file with discount template content", async () => {
      await command.run();

      const migrationsDir = join(testDir, "modules", "discount", "src", "migrations");
      const glob = new Bun.Glob("Migration*.ts");
      let migrationFound = false;

      for await (const file of glob.scan(migrationsDir)) {
        if (file === "migrations.ts") continue;
        migrationFound = true;
        const content = await Bun.file(join(migrationsDir, file)).text();
        expect(content).toContain("CREATE TABLE IF NOT EXISTS discounts");
        expect(content).toContain("idx_discounts_code");
        expect(content).not.toContain("{{ name }}");
        expect(content).not.toContain("{{ version }}");
      }

      expect(migrationFound).toBe(true);
    });

    describe("Controllers", () => {
      test("should generate all five controller files", async () => {
        await command.run();

        const controllersDir = join(testDir, "modules", "discount", "src", "controllers");
        expect(await exists(join(controllersDir, "CreateDiscountController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "GetDiscountController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "ListDiscountsController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "UpdateDiscountController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "DeleteDiscountController.ts"))).toBe(true);
      });

      test("should replace controller contents with discount templates", async () => {
        await command.run();

        const controllersDir = join(testDir, "modules", "discount", "src", "controllers");

        const createContent = await Bun.file(join(controllersDir, "CreateDiscountController.ts")).text();
        expect(createContent).toBe(createDiscountControllerTemplate);

        const getContent = await Bun.file(join(controllersDir, "GetDiscountController.ts")).text();
        expect(getContent).toBe(getDiscountControllerTemplate);

        const listContent = await Bun.file(join(controllersDir, "ListDiscountsController.ts")).text();
        expect(listContent).toBe(listDiscountsControllerTemplate);

        const updateContent = await Bun.file(join(controllersDir, "UpdateDiscountController.ts")).text();
        expect(updateContent).toBe(updateDiscountControllerTemplate);

        const deleteContent = await Bun.file(join(controllersDir, "DeleteDiscountController.ts")).text();
        expect(deleteContent).toBe(deleteDiscountControllerTemplate);
      });
    });

    describe("Services", () => {
      test("should generate all five service files", async () => {
        await command.run();

        const servicesDir = join(testDir, "modules", "discount", "src", "services");
        expect(await exists(join(servicesDir, "CreateDiscountService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "GetDiscountService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "ListDiscountsService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "UpdateDiscountService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "DeleteDiscountService.ts"))).toBe(true);
      });

      test("should replace service contents with discount templates", async () => {
        await command.run();

        const servicesDir = join(testDir, "modules", "discount", "src", "services");

        const createContent = await Bun.file(join(servicesDir, "CreateDiscountService.ts")).text();
        expect(createContent).toBe(createDiscountServiceTemplate);

        const getContent = await Bun.file(join(servicesDir, "GetDiscountService.ts")).text();
        expect(getContent).toBe(getDiscountServiceTemplate);

        const listContent = await Bun.file(join(servicesDir, "ListDiscountsService.ts")).text();
        expect(listContent).toBe(listDiscountsServiceTemplate);

        const updateContent = await Bun.file(join(servicesDir, "UpdateDiscountService.ts")).text();
        expect(updateContent).toBe(updateDiscountServiceTemplate);

        const deleteContent = await Bun.file(join(servicesDir, "DeleteDiscountService.ts")).text();
        expect(deleteContent).toBe(deleteDiscountServiceTemplate);
      });
    });

    test("should generate entity content with DiscountEntity class", async () => {
      await command.run();

      const entityPath = join(testDir, "modules", "discount", "src", "entities", "DiscountEntity.ts");
      const content = await Bun.file(entityPath).text();
      expect(content).toContain("export class DiscountEntity");
      expect(content).toContain('name: "discounts"');
    });

    test("should generate repository content with DiscountRepository class", async () => {
      await command.run();

      const repoPath = join(testDir, "modules", "discount", "src", "repositories", "DiscountRepository.ts");
      const content = await Bun.file(repoPath).text();
      expect(content).toContain("export class DiscountRepository");
      expect(content).toContain("DiscountEntity");
    });
  });
});
