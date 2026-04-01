import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { rmSync } from "node:fs";
import { join } from "node:path";
import createTagControllerTemplate from "@/templates/resources/tag/controllers/CreateTagController.txt";
import deleteTagControllerTemplate from "@/templates/resources/tag/controllers/DeleteTagController.txt";
import getTagControllerTemplate from "@/templates/resources/tag/controllers/GetTagController.txt";
import listTagsControllerTemplate from "@/templates/resources/tag/controllers/ListTagsController.txt";
import updateTagControllerTemplate from "@/templates/resources/tag/controllers/UpdateTagController.txt";
import createTagServiceTemplate from "@/templates/resources/tag/services/CreateTagService.txt";
import deleteTagServiceTemplate from "@/templates/resources/tag/services/DeleteTagService.txt";
import getTagServiceTemplate from "@/templates/resources/tag/services/GetTagService.txt";
import listTagsServiceTemplate from "@/templates/resources/tag/services/ListTagsService.txt";
import updateTagServiceTemplate from "@/templates/resources/tag/services/UpdateTagService.txt";
import entityTemplate from "@/templates/resources/tag/TagEntity.txt";
import repositoryTemplate from "@/templates/resources/tag/TagRepository.txt";

// Mock enquirer before importing commands
mock.module("enquirer", () => ({
  prompt: mock(() => Promise.resolve({ name: "Test" })),
}));

const { MakeResourceTagCommand } = await import("@/commands/MakeResourceTagCommand");

const exists = (path: string) => Bun.file(path).exists();

describe("MakeResourceTagCommand", () => {
  let command: InstanceType<typeof MakeResourceTagCommand>;
  let testDir: string;
  let originalCwd: string;
  let originalSpawn: typeof Bun.spawn;

  beforeEach(() => {
    command = new MakeResourceTagCommand();
    originalCwd = process.cwd();
    testDir = join(originalCwd, ".temp", `resource-tag-${Date.now()}`);

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
      expect(command.getName()).toBe("make:resource:tag");
    });

    test("should return correct description", () => {
      expect(command.getDescription()).toBe("Generate tag resource (entity, migration, repository)");
    });
  });

  describe("run()", () => {
    beforeEach(async () => {
      await Bun.write(join(testDir, ".gitkeep"), "");
      await Bun.write(join(testDir, "package.json"), JSON.stringify({ name: "test", dependencies: {} }));
      process.chdir(testDir);
    });

    test("should create tag module directory structure", async () => {
      await command.run();

      const moduleDir = join(testDir, "modules", "tag");
      expect(await exists(join(moduleDir, "src", "TagModule.ts"))).toBe(true);
    });

    test("should generate entity file with tag template content", async () => {
      await command.run();

      const entityPath = join(testDir, "modules", "tag", "src", "entities", "TagEntity.ts");
      expect(await exists(entityPath)).toBe(true);

      const content = await Bun.file(entityPath).text();
      expect(content).toBe(entityTemplate);
    });

    test("should generate repository file with tag template content", async () => {
      await command.run();

      const repoPath = join(testDir, "modules", "tag", "src", "repositories", "TagRepository.ts");
      expect(await exists(repoPath)).toBe(true);

      const content = await Bun.file(repoPath).text();
      expect(content).toBe(repositoryTemplate);
    });

    test("should generate migration file with tag template content", async () => {
      await command.run();

      const migrationsDir = join(testDir, "modules", "tag", "src", "migrations");
      const glob = new Bun.Glob("Migration*.ts");
      let migrationFound = false;

      for await (const file of glob.scan(migrationsDir)) {
        if (file === "migrations.ts") continue;
        migrationFound = true;
        const content = await Bun.file(join(migrationsDir, file)).text();
        expect(content).toContain("CREATE TABLE IF NOT EXISTS tags");
        expect(content).toContain("idx_tags_name");
        expect(content).not.toContain("{{ name }}");
        expect(content).not.toContain("{{ version }}");
      }

      expect(migrationFound).toBe(true);
    });

    describe("Controllers", () => {
      test("should generate all five controller files", async () => {
        await command.run();

        const controllersDir = join(testDir, "modules", "tag", "src", "controllers");
        expect(await exists(join(controllersDir, "CreateTagController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "GetTagController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "ListTagsController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "UpdateTagController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "DeleteTagController.ts"))).toBe(true);
      });

      test("should replace controller contents with tag templates", async () => {
        await command.run();

        const controllersDir = join(testDir, "modules", "tag", "src", "controllers");

        const createContent = await Bun.file(join(controllersDir, "CreateTagController.ts")).text();
        expect(createContent).toBe(createTagControllerTemplate);

        const getContent = await Bun.file(join(controllersDir, "GetTagController.ts")).text();
        expect(getContent).toBe(getTagControllerTemplate);

        const listContent = await Bun.file(join(controllersDir, "ListTagsController.ts")).text();
        expect(listContent).toBe(listTagsControllerTemplate);

        const updateContent = await Bun.file(join(controllersDir, "UpdateTagController.ts")).text();
        expect(updateContent).toBe(updateTagControllerTemplate);

        const deleteContent = await Bun.file(join(controllersDir, "DeleteTagController.ts")).text();
        expect(deleteContent).toBe(deleteTagControllerTemplate);
      });
    });

    describe("Services", () => {
      test("should generate all five service files", async () => {
        await command.run();

        const servicesDir = join(testDir, "modules", "tag", "src", "services");
        expect(await exists(join(servicesDir, "CreateTagService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "GetTagService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "ListTagsService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "UpdateTagService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "DeleteTagService.ts"))).toBe(true);
      });

      test("should replace service contents with tag templates", async () => {
        await command.run();

        const servicesDir = join(testDir, "modules", "tag", "src", "services");

        const createContent = await Bun.file(join(servicesDir, "CreateTagService.ts")).text();
        expect(createContent).toBe(createTagServiceTemplate);

        const getContent = await Bun.file(join(servicesDir, "GetTagService.ts")).text();
        expect(getContent).toBe(getTagServiceTemplate);

        const listContent = await Bun.file(join(servicesDir, "ListTagsService.ts")).text();
        expect(listContent).toBe(listTagsServiceTemplate);

        const updateContent = await Bun.file(join(servicesDir, "UpdateTagService.ts")).text();
        expect(updateContent).toBe(updateTagServiceTemplate);

        const deleteContent = await Bun.file(join(servicesDir, "DeleteTagService.ts")).text();
        expect(deleteContent).toBe(deleteTagServiceTemplate);
      });
    });

    test("should generate entity content with TagEntity class", async () => {
      await command.run();

      const entityPath = join(testDir, "modules", "tag", "src", "entities", "TagEntity.ts");
      const content = await Bun.file(entityPath).text();
      expect(content).toContain("export class TagEntity");
      expect(content).toContain('name: "tags"');
    });

    test("should generate repository content with TagRepository class", async () => {
      await command.run();

      const repoPath = join(testDir, "modules", "tag", "src", "repositories", "TagRepository.ts");
      const content = await Bun.file(repoPath).text();
      expect(content).toContain("export class TagRepository");
      expect(content).toContain("TagEntity");
    });
  });
});
