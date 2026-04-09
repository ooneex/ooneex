import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { rmSync } from "node:fs";
import { join } from "node:path";
import entityTemplate from "@/templates/resources/color/ColorEntity.txt";
import repositoryTemplate from "@/templates/resources/color/ColorRepository.txt";
import createColorControllerTemplate from "@/templates/resources/color/controllers/CreateColorController.txt";
import deleteColorControllerTemplate from "@/templates/resources/color/controllers/DeleteColorController.txt";
import getColorControllerTemplate from "@/templates/resources/color/controllers/GetColorController.txt";
import listColorsControllerTemplate from "@/templates/resources/color/controllers/ListColorsController.txt";
import updateColorControllerTemplate from "@/templates/resources/color/controllers/UpdateColorController.txt";
import colorSeedTemplate from "@/templates/resources/color/seeds/ColorSeed.txt";
import createColorServiceTemplate from "@/templates/resources/color/services/CreateColorService.txt";
import deleteColorServiceTemplate from "@/templates/resources/color/services/DeleteColorService.txt";
import getColorServiceTemplate from "@/templates/resources/color/services/GetColorService.txt";
import listColorsServiceTemplate from "@/templates/resources/color/services/ListColorsService.txt";
import updateColorServiceTemplate from "@/templates/resources/color/services/UpdateColorService.txt";

// Mock enquirer before importing commands
mock.module("enquirer", () => ({
  prompt: mock(() => Promise.resolve({ name: "Test" })),
}));

const { MakeResourceColorCommand } = await import("@/commands/MakeResourceColorCommand");

const exists = (path: string) => Bun.file(path).exists();

describe("MakeResourceColorCommand", () => {
  let command: InstanceType<typeof MakeResourceColorCommand>;
  let testDir: string;
  let originalCwd: string;
  let originalSpawn: typeof Bun.spawn;

  beforeEach(() => {
    command = new MakeResourceColorCommand();
    originalCwd = process.cwd();
    testDir = join(originalCwd, ".temp", `resource-color-${Date.now()}`);

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
      expect(command.getName()).toBe("make:resource:color");
    });

    test("should return correct description", () => {
      expect(command.getDescription()).toBe("Generate color resource (entity, migration, repository)");
    });
  });

  describe("run()", () => {
    beforeEach(async () => {
      await Bun.write(join(testDir, ".gitkeep"), "");
      await Bun.write(join(testDir, "package.json"), JSON.stringify({ name: "test", dependencies: {} }));
      process.chdir(testDir);
    });

    test("should create color module directory structure", async () => {
      await command.run();

      const moduleDir = join(testDir, "modules", "color");
      expect(await exists(join(moduleDir, "src", "ColorModule.ts"))).toBe(true);
    });

    test("should generate entity file with color template content", async () => {
      await command.run();

      const entityPath = join(testDir, "modules", "color", "src", "entities", "ColorEntity.ts");
      expect(await exists(entityPath)).toBe(true);

      const content = await Bun.file(entityPath).text();
      expect(content).toBe(entityTemplate);
    });

    test("should generate repository file with color template content", async () => {
      await command.run();

      const repoPath = join(testDir, "modules", "color", "src", "repositories", "ColorRepository.ts");
      expect(await exists(repoPath)).toBe(true);

      const content = await Bun.file(repoPath).text();
      expect(content).toBe(repositoryTemplate);
    });

    test("should generate migration file with color template content", async () => {
      await command.run();

      const migrationsDir = join(testDir, "modules", "color", "src", "migrations");
      const glob = new Bun.Glob("Migration*.ts");
      let migrationFound = false;

      for await (const file of glob.scan(migrationsDir)) {
        if (file === "migrations.ts") continue;
        migrationFound = true;
        const content = await Bun.file(join(migrationsDir, file)).text();
        expect(content).toContain("CREATE TABLE IF NOT EXISTS colors");
        expect(content).toContain("idx_colors_name");
        expect(content).not.toContain("{{ name }}");
        expect(content).not.toContain("{{ version }}");
      }

      expect(migrationFound).toBe(true);
    });

    describe("Controllers", () => {
      test("should generate all five controller files", async () => {
        await command.run();

        const controllersDir = join(testDir, "modules", "color", "src", "controllers");
        expect(await exists(join(controllersDir, "CreateColorController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "GetColorController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "ListColorsController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "UpdateColorController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "DeleteColorController.ts"))).toBe(true);
      });

      test("should replace controller contents with color templates", async () => {
        await command.run();

        const controllersDir = join(testDir, "modules", "color", "src", "controllers");

        const createContent = await Bun.file(join(controllersDir, "CreateColorController.ts")).text();
        expect(createContent).toBe(createColorControllerTemplate);

        const getContent = await Bun.file(join(controllersDir, "GetColorController.ts")).text();
        expect(getContent).toBe(getColorControllerTemplate);

        const listContent = await Bun.file(join(controllersDir, "ListColorsController.ts")).text();
        expect(listContent).toBe(listColorsControllerTemplate);

        const updateContent = await Bun.file(join(controllersDir, "UpdateColorController.ts")).text();
        expect(updateContent).toBe(updateColorControllerTemplate);

        const deleteContent = await Bun.file(join(controllersDir, "DeleteColorController.ts")).text();
        expect(deleteContent).toBe(deleteColorControllerTemplate);
      });
    });

    describe("Services", () => {
      test("should generate all five service files", async () => {
        await command.run();

        const servicesDir = join(testDir, "modules", "color", "src", "services");
        expect(await exists(join(servicesDir, "CreateColorService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "GetColorService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "ListColorsService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "UpdateColorService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "DeleteColorService.ts"))).toBe(true);
      });

      test("should replace service contents with color templates", async () => {
        await command.run();

        const servicesDir = join(testDir, "modules", "color", "src", "services");

        const createContent = await Bun.file(join(servicesDir, "CreateColorService.ts")).text();
        expect(createContent).toBe(createColorServiceTemplate);

        const getContent = await Bun.file(join(servicesDir, "GetColorService.ts")).text();
        expect(getContent).toBe(getColorServiceTemplate);

        const listContent = await Bun.file(join(servicesDir, "ListColorsService.ts")).text();
        expect(listContent).toBe(listColorsServiceTemplate);

        const updateContent = await Bun.file(join(servicesDir, "UpdateColorService.ts")).text();
        expect(updateContent).toBe(updateColorServiceTemplate);

        const deleteContent = await Bun.file(join(servicesDir, "DeleteColorService.ts")).text();
        expect(deleteContent).toBe(deleteColorServiceTemplate);
      });
    });

    describe("Seeds", () => {
      test("should generate seed file with color template content", async () => {
        await command.run();

        const seedPath = join(testDir, "modules", "color", "src", "seeds", "ColorSeed.ts");
        expect(await exists(seedPath)).toBe(true);

        const content = await Bun.file(seedPath).text();
        expect(content).toBe(colorSeedTemplate);
      });

      test("should generate seed color-seed.yml file", async () => {
        await command.run();

        const dataPath = join(testDir, "modules", "color", "src", "seeds", "color-seed.yml");
        expect(await exists(dataPath)).toBe(true);

        const content = await Bun.file(dataPath).text();
        expect(content).toContain("name: Blue");
        expect(content).toContain("hex:");
      });
    });

    test("should generate entity content with ColorEntity class", async () => {
      await command.run();

      const entityPath = join(testDir, "modules", "color", "src", "entities", "ColorEntity.ts");
      const content = await Bun.file(entityPath).text();
      expect(content).toContain("export class ColorEntity");
      expect(content).toContain('name: "colors"');
    });

    test("should generate repository content with ColorRepository class", async () => {
      await command.run();

      const repoPath = join(testDir, "modules", "color", "src", "repositories", "ColorRepository.ts");
      const content = await Bun.file(repoPath).text();
      expect(content).toContain("export class ColorRepository");
      expect(content).toContain("ColorEntity");
    });
  });
});
