import { afterEach, beforeEach, describe, expect, mock, test } from "bun:test";
import { rmSync } from "node:fs";
import { join } from "node:path";
import createTopicControllerTemplate from "@/templates/resources/topic/controllers/CreateTopicController.txt";
import deleteTopicControllerTemplate from "@/templates/resources/topic/controllers/DeleteTopicController.txt";
import getTopicControllerTemplate from "@/templates/resources/topic/controllers/GetTopicController.txt";
import listTopicsControllerTemplate from "@/templates/resources/topic/controllers/ListTopicsController.txt";
import updateTopicControllerTemplate from "@/templates/resources/topic/controllers/UpdateTopicController.txt";
import createTopicServiceTemplate from "@/templates/resources/topic/services/CreateTopicService.txt";
import deleteTopicServiceTemplate from "@/templates/resources/topic/services/DeleteTopicService.txt";
import getTopicServiceTemplate from "@/templates/resources/topic/services/GetTopicService.txt";
import listTopicsServiceTemplate from "@/templates/resources/topic/services/ListTopicsService.txt";
import updateTopicServiceTemplate from "@/templates/resources/topic/services/UpdateTopicService.txt";
import entityTemplate from "@/templates/resources/topic/TopicEntity.txt";
import repositoryTemplate from "@/templates/resources/topic/TopicRepository.txt";

// Mock enquirer before importing commands
mock.module("enquirer", () => ({
  prompt: mock(() => Promise.resolve({ name: "Test" })),
}));

const { MakeResourceTopicCommand } = await import("@/commands/MakeResourceTopicCommand");

const exists = (path: string) => Bun.file(path).exists();

describe("MakeResourceTopicCommand", () => {
  let command: InstanceType<typeof MakeResourceTopicCommand>;
  let testDir: string;
  let originalCwd: string;
  let originalSpawn: typeof Bun.spawn;

  beforeEach(() => {
    command = new MakeResourceTopicCommand();
    originalCwd = process.cwd();
    testDir = join(originalCwd, ".temp", `resource-topic-${Date.now()}`);

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
      expect(command.getName()).toBe("make:resource:topic");
    });

    test("should return correct description", () => {
      expect(command.getDescription()).toBe("Generate topic resource (entity, migration, repository)");
    });
  });

  describe("run()", () => {
    beforeEach(async () => {
      await Bun.write(join(testDir, ".gitkeep"), "");
      await Bun.write(join(testDir, "package.json"), JSON.stringify({ name: "test", dependencies: {} }));
      process.chdir(testDir);
    });

    test("should create topic module directory structure", async () => {
      await command.run();

      const moduleDir = join(testDir, "modules", "topic");
      expect(await exists(join(moduleDir, "src", "TopicModule.ts"))).toBe(true);
    });

    test("should generate entity file with topic template content", async () => {
      await command.run();

      const entityPath = join(testDir, "modules", "topic", "src", "entities", "TopicEntity.ts");
      expect(await exists(entityPath)).toBe(true);

      const content = await Bun.file(entityPath).text();
      expect(content).toBe(entityTemplate);
    });

    test("should generate repository file with topic template content", async () => {
      await command.run();

      const repoPath = join(testDir, "modules", "topic", "src", "repositories", "TopicRepository.ts");
      expect(await exists(repoPath)).toBe(true);

      const content = await Bun.file(repoPath).text();
      expect(content).toBe(repositoryTemplate);
    });

    test("should generate migration file with topic template content", async () => {
      await command.run();

      const migrationsDir = join(testDir, "modules", "topic", "src", "migrations");
      const glob = new Bun.Glob("Migration*.ts");
      let migrationFound = false;

      for await (const file of glob.scan(migrationsDir)) {
        if (file === "migrations.ts") continue;
        migrationFound = true;
        const content = await Bun.file(join(migrationsDir, file)).text();
        expect(content).toContain("CREATE TABLE IF NOT EXISTS topics");
        expect(content).toContain("idx_topics_name");
        expect(content).not.toContain("{{ name }}");
        expect(content).not.toContain("{{ version }}");
      }

      expect(migrationFound).toBe(true);
    });

    describe("Controllers", () => {
      test("should generate all five controller files", async () => {
        await command.run();

        const controllersDir = join(testDir, "modules", "topic", "src", "controllers");
        expect(await exists(join(controllersDir, "CreateTopicController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "GetTopicController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "ListTopicsController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "UpdateTopicController.ts"))).toBe(true);
        expect(await exists(join(controllersDir, "DeleteTopicController.ts"))).toBe(true);
      });

      test("should replace controller contents with topic templates", async () => {
        await command.run();

        const controllersDir = join(testDir, "modules", "topic", "src", "controllers");

        const createContent = await Bun.file(join(controllersDir, "CreateTopicController.ts")).text();
        expect(createContent).toBe(createTopicControllerTemplate);

        const getContent = await Bun.file(join(controllersDir, "GetTopicController.ts")).text();
        expect(getContent).toBe(getTopicControllerTemplate);

        const listContent = await Bun.file(join(controllersDir, "ListTopicsController.ts")).text();
        expect(listContent).toBe(listTopicsControllerTemplate);

        const updateContent = await Bun.file(join(controllersDir, "UpdateTopicController.ts")).text();
        expect(updateContent).toBe(updateTopicControllerTemplate);

        const deleteContent = await Bun.file(join(controllersDir, "DeleteTopicController.ts")).text();
        expect(deleteContent).toBe(deleteTopicControllerTemplate);
      });
    });

    describe("Services", () => {
      test("should generate all five service files", async () => {
        await command.run();

        const servicesDir = join(testDir, "modules", "topic", "src", "services");
        expect(await exists(join(servicesDir, "CreateTopicService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "GetTopicService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "ListTopicsService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "UpdateTopicService.ts"))).toBe(true);
        expect(await exists(join(servicesDir, "DeleteTopicService.ts"))).toBe(true);
      });

      test("should replace service contents with topic templates", async () => {
        await command.run();

        const servicesDir = join(testDir, "modules", "topic", "src", "services");

        const createContent = await Bun.file(join(servicesDir, "CreateTopicService.ts")).text();
        expect(createContent).toBe(createTopicServiceTemplate);

        const getContent = await Bun.file(join(servicesDir, "GetTopicService.ts")).text();
        expect(getContent).toBe(getTopicServiceTemplate);

        const listContent = await Bun.file(join(servicesDir, "ListTopicsService.ts")).text();
        expect(listContent).toBe(listTopicsServiceTemplate);

        const updateContent = await Bun.file(join(servicesDir, "UpdateTopicService.ts")).text();
        expect(updateContent).toBe(updateTopicServiceTemplate);

        const deleteContent = await Bun.file(join(servicesDir, "DeleteTopicService.ts")).text();
        expect(deleteContent).toBe(deleteTopicServiceTemplate);
      });
    });

    test("should generate entity content with TopicEntity class", async () => {
      await command.run();

      const entityPath = join(testDir, "modules", "topic", "src", "entities", "TopicEntity.ts");
      const content = await Bun.file(entityPath).text();
      expect(content).toContain("export class TopicEntity");
      expect(content).toContain('name: "topics"');
    });

    test("should generate repository content with TopicRepository class", async () => {
      await command.run();

      const repoPath = join(testDir, "modules", "topic", "src", "repositories", "TopicRepository.ts");
      const content = await Bun.file(repoPath).text();
      expect(content).toContain("export class TopicRepository");
      expect(content).toContain("TopicEntity");
    });
  });
});
